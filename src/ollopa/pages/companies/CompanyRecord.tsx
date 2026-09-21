// `R-company`: one record for one object, which switches its header, its sections and its doors on
// the customer state (specs/03 §6, specs/11 §3, specs/09 §6.8).
//
// A company and an account are one object with a customer state, so there is one record and two
// entry tables. When `Company.stage` is Current client or Churned the header gains health, renewal,
// contract value, open risks, last touch and next step, and the sections gain the customer-state
// block — health drivers first, directly under the health field, because a score and the four
// numbers that sum to it never sit on opposite sides of a door (rule 5). When the stage changes
// back, all of it goes again.
//
// `/ollopa/accounts/:id` redirects here. There is no second record.
import { useMemo, useRef, useState, type ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { href, navigate } from "@/app/router"
import { openBeside } from "../../beside"
import { Actions, type Action } from "../../ui/Actions"
import { follow, routeKey, useTrail } from "../../chain"
import { toast } from "../../templates/TablePage"
import { CardRow, RecordPage, type RecordCard, type RecordDoor, type RecordField, type RecordSection } from "../../templates/RecordPage"
import { EmptyState } from "../../ui/EmptyState"
import { Panel } from "../../ui/Panel"
import { useDoorState } from "../../ui/Door"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { ACCOUNT_STAGES, CREDITS, TODAY, seedFor, type AccountStage } from "../../data/seed"
import type { Session } from "../../session"
import { activityOf, isCustomer, viewOf } from "./data"
import { companyFields, healthLine, quickLookFields, riskLine } from "./quickLook"
import { ago, day, money, renewalText } from "./format"
import { applyChange, changeFor, useChanges } from "./changes"
import { PlayPanel } from "./PlayPanel"
import { CompanyContacts } from "./CompanyContacts"

export function CompanyRecord({ session, id }: { session: Session; id?: string }) {
  // Development only: counted so the "the page behind the pane does not re-render" claim is checked.
  const renders = useRef(0)
  renders.current += 1
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const d = useDisclosure("companies")
  const changes = useChanges()
  const trail = useTrail()

  // A link may name the company or the account; both are the same object, so both resolve here.
  const company = useMemo(() => {
    const byCompany = seed.companies.find((c) => c.id === id)
    if (byCompany) return byCompany
    const account = seed.accounts.find((a) => a.id === id)
    return (account && seed.companies.find((c) => c.id === account.companyId)) ?? seed.companies[0]
  }, [seed, id])

  const [playOpen, setPlayOpen] = useState(false)
  const [flagOpen, setFlagOpen] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [listName, setListName] = useState("")
  const [listOpen, setListOpen] = useState(false)
  const [, openCrmDoor] = useDoorState("company.crm")

  if (!company) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h2 className="text-lg font-semibold">This company was removed or merged.</h2>
        <p className="mt-2"><a className="text-sm underline" href={href("/ollopa/companies")}>Back to Companies</a></p>
      </div>
    )
  }

  /* ------------------------------------------------------------------ the object and its state */

  void changes
  const change = changeFor(company.id)
  const merged = {
    ...company,
    ...(change.stage ? { stage: change.stage } : {}),
    ...(change.owner ? { owner: change.owner } : {}),
    ...(change.name ? { name: change.name } : {}),
    ...(change.industry ? { industry: change.industry } : {}),
    ...(change.employees !== undefined ? { employees: change.employees } : {}),
  }
  const base = viewOf(seed, merged)
  const account = base.account
    ? {
        ...base.account,
        ...(change.owner ? { owner: change.owner } : {}),
        ...(change.nextStep ? { nextStep: change.nextStep } : {}),
        risks: [...(change.risks ?? []), ...base.account.risks].filter((r) => !(change.resolvedRisks ?? []).includes(r.id)),
        signals: base.account.signals.filter((s) => !(change.dismissedSignals ?? []).includes(s.id)),
      }
    : null
  const v = { ...base, account }
  const customer = isCustomer(merged) && Boolean(account)

  const seat = b.roles.find((r) => r.user === session.user)
  const admin = b.roles.find((r) => r.role === "admin")
  const crmName = (b.crm ?? "").replace(/\s*\(.*\)$/, "")
  const hasCrm = Boolean(b.crm) && Boolean(merged.crm)
  const canEdit = merged.owner === session.user || session.role === "admin" || session.role === "cs"
  const used = (item: string) => d.weekly(item) > 0
  const localTouches = change.touches ?? []
  const localRuns = change.researchRuns ?? []
  const runs = [
    ...localRuns,
    ...v.research.map((e) => ({ id: e.id, agent: e.agent, at: e.when, sources: e.sources.length || 14, credits: e.credits })),
  ]
  const brief = seed.briefs.find((n) => n.about.kind === "company" && n.about.id === merged.id)
  const briefHref = runs[0] ? `/ollopa/briefs/${brief?.id ?? runs[0].id}` : null
  const holdsAccounts = ["cs", "ae", "admin"].includes(session.role)

  // This record is a Company — that is what the h1 says and what the sidebar highlights. The back
  // link is not a second opinion about that: it is the index the person actually came from, which
  // the trail knows, and Companies when they came from nowhere. An account and a company are one
  // object, and the page says so once.
  const from = [...trail].reverse().find((o) => ["/ollopa/accounts", "/ollopa/companies"].includes(routeKey(o.route)))
  const backTo = from && routeKey(from.route) === "/ollopa/accounts"
    ? { label: "Accounts", href: href("/ollopa/accounts") }
    : { label: "Companies", href: href("/ollopa/companies") }

  /* -------------------------------------------------------- leaving, and looking beside */

  // Where a move that leaves this page says it came from: the route, the h1 as it reads at the
  // moment of leaving, and the thing that was left. Every jump out of this record uses it, so the
  // crumb always lands back on the row, the section or the door the person was in.
  const origin = (anchor?: string) => ({ route: `/ollopa/companies/${company.id}`, title: merged.name, anchor })

  /** People filtered to this company: the one jump out of the contacts list, for the whole set. */
  const openPeopleAtCompany = () => {
    follow(`/ollopa/people?company=${company.id}`, origin("contacts"))
    toast(`People · at ${merged.name}`)
  }

  /** A deal or another company here, read beside this record rather than instead of it. */
  const lookBeside = (kind: string, id: string, ids: string[], opener?: HTMLElement | null) =>
    openBeside({ kind, id, list: ids.length > 1 ? { ids, index: Math.max(0, ids.indexOf(id)) } : undefined, opener: opener ?? null })

  /* ------------------------------------------------------------------------------- the fields */

  // The header is `companyFields` — one list, in this order, shared with the quick look and with
  // the pane a company reads in beside another page. Which of them sit on the page and which sit
  // inside the All fields door is not decided here either: `useDisclosure` answers, item by item,
  // for the seat and the business signed in. The record's affordances — the editable stage, the
  // editable next step — are attached by key, because a drawer cannot edit and a page can.
  const changeStage = (to: AccountStage) => {
    applyChange(merged.id, { stage: to })
    toast(to === "Do not prospect"
      ? `${merged.name} · Do not prospect. Sequences stopped for ${v.inSequence.length} contacts here.`
      : `${merged.name} · stage ${to}`)
  }

  const editorOf: Record<string, RecordField["editor"]> = { stage: "select", owner: "user", "next-step": "text" }
  const editOf: Record<string, RecordField["edit"]> = canEdit
    ? {
        stage: { value: merged.stage, options: [...ACCOUNT_STAGES], onSave: (to) => changeStage(to as AccountStage) },
        ...(customer && account
          ? { "next-step": { value: account.nextStep.text, onSave: (text: string) => { applyChange(merged.id, { nextStep: { text, due: account.nextStep.due } }); toast(`Next step · ${text}`) } } }
          : {}),
      }
    : {}

  const fields: RecordField[] = [
    ...companyFields(v, b.currency, session.user)
      // The drivers are a section directly under the score on this page, never a header field.
      .filter((f) => !f.asSection)
      .map((f) => ({
        key: f.key, label: f.label, value: f.value, under: f.under, tone: f.tone, span: f.span, wide: f.wide,
        level: d.level(f.usage),
        editor: editorOf[f.key] ?? "readonly",
        edit: editOf[f.key],
      }) as RecordField),

    // The tail every record accumulates: the template puts these inside the All fields door.
    ...([
      { key: "domain", label: "Domain", value: merged.domain },
      { key: "phone", label: "Phone", value: merged.phone },
      { key: "revenue", label: "Revenue", value: merged.revenue },
      { key: "source", label: "Source", value: merged.source },
      { key: "added", label: "Added on", value: day(merged.addedOn) },
      { key: "enriched", label: "Enriched on", value: merged.enrichedOn ? day(merged.enrichedOn) : "never" },
      { key: "fit", label: "Fit score", value: merged.fitScore ?? "not scored" },
      { key: "parent", label: "Parent company", value: merged.parent ?? "—" },
      { key: "technologies", label: "Technology", value: merged.technologies.join(", ") || "—" },
      { key: "funding", label: "Funding", value: merged.funding ?? "—" },
      ...(customer && account ? [
        { key: "plan", label: "Plan", value: account.plan },
        { key: "seats", label: "Seats", value: `${account.seatsActive} of ${account.seatsBought} active` },
        { key: "forecast", label: "Renewal forecast", value: account.forecast },
        { key: "terms", label: "Notice period", value: `${account.noticeDays} days · ${account.autoRenew ? "auto-renews" : "does not auto-renew"}` },
        { key: "ae", label: "Account executive of record", value: account.ae },
      ] : []),
      ...Object.entries(merged.custom).map(([k, val]) => ({ key: `custom-${k}`, label: k, value: val })),
    ].map((f) => ({ ...f, level: 2 }) as RecordField)),
  ]

  /* ----------------------------------------------------------------------------- the sections */

  const sections: RecordSection[] = []

  // Thirteen weeks of use, as the account recorded them: seats active each week, scaled against the
  // seats bought so the bars and the seat line are the same fact.
  const usageSeries = account
    ? account.usage90.map((w) => Math.round((w.activeSeats / Math.max(1, account.seatsBought)) * 100))
    : []

  const usageSection = (): RecordSection => ({
    id: "usage", title: "Usage over 90 days",
    children: (
      <div>
        <div className="flex h-24 items-end gap-1" role="img" aria-label={`Usage index ${account!.usage30}, ${account!.usageDelta30 >= 0 ? "up" : "down"} ${Math.abs(account!.usageDelta30)}% over 30 days`}>
          {usageSeries.map((n, i) => (
            <span key={i} className="min-w-0 flex-1 rounded-t bg-foreground/70" style={{ height: `${Math.max(4, n)}%` }} />
          ))}
        </div>
        <p className="pt-2 text-sm">
          Index <span className="tabular-nums font-medium">{account!.usage30}</span> · {account!.usageDelta30 >= 0 ? "up" : "down"} {Math.abs(account!.usageDelta30)}% over 30 days
        </p>
      </div>
    ),
  })

  const seatsSection = (): RecordSection => ({
    id: "seats", title: "Seats and last sign-in", count: account!.seats.length,
    children: (
      <div>
        <p className="pb-2 text-sm">
          <span className="tabular-nums font-medium">{account!.seatsActive}</span> of {account!.seatsBought} seats active
          <span className="text-muted-foreground"> · {Math.round((account!.seatsActive / account!.seatsBought) * 100)}% utilisation</span>
        </p>
        {account!.seats.slice(0, 6).map((s) => (
          <CardRow key={s.name} title={s.name} meta={`last sign-in ${ago(s.lastSignIn)}`} />
        ))}
      </div>
    ),
  })

  if (customer && account) {
    // 1. The drivers, directly under the health field. Never a door.
    if (used("rec.health-drivers")) sections.push({
      id: "health-drivers", title: "What makes up the score",
      children: (
        <div>
          <p className="pb-2 text-sm">{healthLine(account.health, account.band, account.healthDelta30)}</p>
          <ul className="space-y-1 text-sm">
            {account.drivers.map((x) => (
              <li key={x.label} className="flex justify-between gap-3 border-t py-1 first:border-t-0">
                <span className="min-w-0">{x.label}</span>
                <span className="shrink-0 tabular-nums">{x.points > 0 ? "+" : ""}{x.points}</span>
              </li>
            ))}
          </ul>
          <Actions
            className="pt-2"
            items={[
              { kind: "secondary", label: "This flag was wrong", onClick: () => setFlagOpen(true) },
              { kind: "link", label: "Settings › Signals, scoring and personas", href: href("/ollopa/settings/scoring"), onClick: () => follow("/ollopa/settings/scoring", origin("health-drivers")) },
            ]}
          />
        </div>
      ),
    })

    // Ridgeline is product-led: usage and the seat list are read before anything else.
    const usageFirst = session.business === "ridgeline"
    if (usageFirst && used("rec.usage-90")) sections.push(usageSection())
    if (usageFirst && used("rec.seats")) sections.push(seatsSection())

    if (used("rec.renewal")) sections.push({
      id: "renewal", title: "Renewal terms",
      action: <Actions surface="card" items={[{ kind: "secondary", label: "Create renewal deal", onClick: () => { toast(`Renewal deal created on ${account.name} · ${money(account.value, b.currency)}`); follow("/ollopa/deals", origin("renewal")) } }]} />,
      children: (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          {[
            ["Renewal date", renewalText(account.renewal)],
            ["Contract value", `${money(account.value, b.currency)} a year`],
            ["Billing", account.billing],
            ["Notice period", `${account.noticeDays} days`],
            ["Auto-renew", account.autoRenew ? "Yes" : "No"],
            ["Forecast", account.forecast],
          ].map(([label, value]) => (
            <div key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
      ),
    })

    if (used("rec.first-value")) sections.push({
      id: "first-value", title: "First value, and the goals agreed at the start",
      children: (
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">{account.firstValue.definition}</span>
            <span className="text-muted-foreground"> · {account.firstValue.target}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {account.firstValue.confirmedOn
              ? `Confirmed ${day(account.firstValue.confirmedOn)} by ${account.firstValue.confirmedBy}`
              : "Not confirmed yet. Ninety days without it raises an Onboarding stalled risk."}
          </p>
          <ul className="space-y-1">
            {account.goals.map((g) => (
              <li key={g.text} className="border-t pt-1">
                {g.text}
                <span className="block text-xs text-muted-foreground">Agreed {day(g.agreedOn)} · {g.source}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    })

    if (used("rec.risks")) sections.push({
      id: "risks", title: "Open risks", count: account.risks.filter((r) => !r.resolved).length,
      children: account.risks.filter((r) => !r.resolved).length === 0
        ? <EmptyState title="No open risks" body="Add one from the Accounts row when something changes." />
        : (
          <div>
            {account.risks.filter((r) => !r.resolved).map((r) => (
              <CardRow
                key={r.id}
                title={<span className={cn(r.type === "Churn notice" && "font-medium text-destructive")}>{r.type}</span>}
                meta={`${r.owner} · opened ${day(r.opened)}`}
                actions={canEdit ? [{
                  label: "Resolve",
                  onClick: () => {
                    applyChange(merged.id, { resolvedRisks: [...(change.resolvedRisks ?? []), r.id] })
                    toast(`${r.type} resolved. The health score gains ${r.type === "Churn notice" ? 37 : 12}.`)
                  },
                }] : undefined}
              >
                <p className="pt-1 text-xs text-muted-foreground">{r.note}</p>
              </CardRow>
            ))}
          </div>
        ),
    })

    if (used("rec.expansion")) sections.push({
      id: "expansion", title: "Expansion signals", count: account.signals.length,
      children: account.signals.length === 0
        ? <EmptyState title="Nothing has fired here" body="Which signals fire is set in Settings › Signals, scoring and personas." />
        : (
          <div>
            {account.signals.map((s) => (
              <CardRow
                key={s.id}
                title={s.kind}
                meta={`${s.source} · fired ${day(s.fired)} · routed to ${s.routedTo} · due ${day(s.dueBy)}${s.outcome ? ` · ${s.outcome}` : " · no outcome yet"}`}
                actions={[
                  { label: "Route it", onClick: () => { toast(`Expansion deal and a task created from “${s.kind}”, with the brief attached`); follow("/ollopa/deals", origin("expansion")) } },
                  { label: "Dismiss", onClick: () => { applyChange(merged.id, { dismissedSignals: [...(change.dismissedSignals ?? []), s.id] }); toast(`“${s.kind}” dismissed`) } },
                ]}
              >
                <p className="pt-1 text-xs text-muted-foreground">{s.detail}</p>
              </CardRow>
            ))}
          </div>
        ),
    })

    if (used("rec.handoff") && account.handoff) {
      const h = account.handoff
      const wrote = (name: string) => h.writtenBy.find((w) => w.section === name)?.by
      const parts: [string, ReactNode][] = [
        ["Why they bought", h.whyTheyBought],
        ["What was promised", <ul key="p" className="list-disc pl-4">{h.promised.map((x) => <li key={x}>{x}</li>)}</ul>],
        ["Who signed", h.signer],
        ["Who will use it", h.users],
        ["The risks the AE already knows about", <ul key="r" className="list-disc pl-4">{h.risks.map((x) => <li key={x}>{x}</li>)}</ul>],
        ["Who was against it", h.dissenters.join(", ") || "Nobody recorded"],
        ["The deadline and why it matters", `${day(h.deadline)} — ${h.deadlineWhy}`],
      ]
      sections.push({
        id: "handoff", title: "The hand-off brief",
        action: h.accepted ? undefined : (
          <Actions surface="card" items={[{
            kind: "secondary", label: "Accept the hand-off",
            onClick: () => { applyChange(merged.id, { owner: session.user }); toast(`${account.name} is yours. The baseline is taken today and ${h.from} is told.`) },
            irreversible: {
              title: `Accept ${account.name} from ${h.from}?`,
              consequence: `You become the owner. The account joins your book, the health baseline is taken today, and ${h.from} is told.`,
              confirmLabel: "Accept the hand-off",
            },
          }]} />
        ),
        children: (
          <div className="space-y-2 text-sm">
            <p className="text-xs text-muted-foreground">
              From {h.from} · sent {day(h.sent)} · {h.accepted ? `accepted ${day(h.accepted)}` : "not accepted yet"}
            </p>
            {parts.map(([label, value]) => (
              <div key={label} className="border-t pt-2">
                <div className="text-xs font-medium">{label}
                  {wrote(label) && <span className="pl-1 font-normal text-muted-foreground">· {wrote(label)}</span>}
                </div>
                <div>{value}</div>
              </div>
            ))}
            <div className="border-t pt-2">
              <div className="text-xs font-medium">Checklist</div>
              <ul>{h.checklist.map((c) => <li key={c.item}>{c.done ? "Done" : "Not done"} · {c.item}</li>)}</ul>
            </div>
          </div>
        ),
      })
    }

    if (used("rec.touches")) sections.push({
      id: "touches", title: "Touches", count: localTouches.length + v.contacts.filter((c) => c.lastContacted).length,
      children: (
        <div>
          {localTouches.map((t, i) => <CardRow key={`local-${i}`} title={`${t.kind} · ${t.by}`} meta={day(t.at)}><p className="pt-1 text-xs text-muted-foreground">{t.note}</p></CardRow>)}
          {v.contacts.filter((c) => c.lastContacted).slice(0, 6).map((c) => (
            <CardRow key={c.id} title={`Contacted ${c.name}`} meta={`${c.owner} · ${day(c.lastContacted!)}`} />
          ))}
        </div>
      ),
    })

    if (!usageFirst && used("rec.usage-90")) sections.push(usageSection())
    if (!usageFirst && used("rec.seats")) sections.push(seatsSection())
  }

  // The related lists every company record carries, read side by side rather than behind tabs.
  //
  // The contacts are a real list in here whatever the count: search, filters, paging and rows that
  // open beside. There is no "Show all" jump and no People tab, because a big number is not a
  // reason to make somebody leave the company to read one person at it.
  if (used("rec.contacts")) sections.push({
    id: "contacts", title: "Contacts at this company", count: v.contacts.length,
    action: v.contacts.length > 0
      ? <Actions surface="card" items={[{ kind: "link", label: "Open in People", href: href(`/ollopa/people?company=${company.id}`), onClick: openPeopleAtCompany }]} />
      : undefined,
    children: v.contacts.length === 0
      ? <EmptyState title="No contacts here yet" body="Find people at this company and they appear on this list." action={<Actions surface="card" items={[{ kind: "link", label: "Find people in People", href: href(`/ollopa/people?company=${company.id}`), onClick: openPeopleAtCompany }]} />} />
      : (
        <CompanyContacts
          companyId={company.id}
          contacts={v.contacts}
          companyName={merged.name}
          sequenceName={seed.sequences[0]?.name ?? "Outbound"}
          pageRenders={renders.current}
        />
      ),
  })

  if (used("rec.deals")) sections.push({
    id: "deals", title: "Open deals", count: v.openDeals.length,
    children: v.openDeals.length === 0
      ? <EmptyState title="No open deals" body="A deal here appears as soon as one is created." />
      : <div>{v.openDeals.map((deal) => (
          <div key={deal.id} data-item={deal.id} data-item-label={deal.name}>
            <CardRow
              title={
                <button type="button" className="font-medium hover:underline"
                        onClick={(e) => lookBeside("deal", deal.id, v.openDeals.map((x) => x.id), e.currentTarget)}>
                  {deal.name}
                </button>
              }
              meta={`${money(deal.amount, deal.currency)} · ${deal.stage} · closes ${day(deal.closeDate)} · ${deal.owner}`} />
          </div>
        ))}</div>,
  })

  const activity = activityOf(seed, v)
  if (used("rec.activity")) sections.push({
    id: "activity", title: "Recent activity", count: activity.length,
    children: activity.length === 0
      ? <EmptyState title="Nothing logged here yet" body="Calls, replies, meetings and agent runs land here." />
      : <div>{activity.slice(0, 5).map((a) => <CardRow key={a.id} title={`${a.kind} · ${a.text}`} meta={`${a.who} · ${day(a.at)}`} />)}</div>,
  })

  const notes = [...(change.notes ?? []), ...merged.notes]
  if (used("rec.notes")) sections.push({
    id: "notes", title: "Notes", count: notes.length,
    children: (
      <div>
        {notes.map((n, i) => <CardRow key={i} title={n.text} meta={`${n.by} · ${day(n.on)}`} />)}
        {canEdit && (
          <div className="pt-2">
            <Label htmlFor="company-note" className="text-xs text-muted-foreground">Add a note</Label>
            <Textarea id="company-note" rows={2} className="mt-1" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Anything the next person reading this company should know" />
            <Actions
              className="mt-2"
              surface="card"
              items={[{
                kind: "secondary", label: "Add the note",
                disabledBecause: noteText.trim() ? undefined : "Type the note above",
                onClick: () => {
                  applyChange(merged.id, { notes: [{ by: session.user, on: TODAY, text: noteText }, ...(change.notes ?? [])] })
                  setNoteText("")
                  toast("Note added")
                },
              }]}
            />
          </div>
        )}
      </div>
    ),
  })

  if (used("rec.tasks")) sections.push({
    id: "tasks", title: "Open tasks here", count: v.openTasks.length,
    children: v.openTasks.length === 0
      ? <EmptyState title="No open tasks" body="Create one and it appears on Tasks too." action={<Actions surface="card" items={[{ kind: "secondary", label: "Create a task", onClick: () => toast(`Task created on ${merged.name}, assigned to ${merged.owner}`) }]} />} />
      : <div>{v.openTasks.slice(0, 8).map((t) => (
          <CardRow key={t.id} title={`${t.kind}: ${t.contact}`} meta={`due ${day(t.due)} · ${t.owner}`}
            actions={[{ label: "Mark done", onClick: () => toast(`${t.kind} for ${t.contact} done`) }]} />
        ))}</div>,
  })

  if (used("rec.in-sequence")) sections.push({
    id: "in-sequence", title: "Contacts in sequences here", count: v.inSequence.length,
    children: v.inSequence.length === 0
      ? <EmptyState title="Nobody here is in a sequence" body="Add someone from the contacts above and they show up here." />
      : <div>{v.inSequence.map((c) => (
          <CardRow key={c.id} title={c.name} meta={`${c.inSequence} · ${c.stage} · ${ago(c.lastActivity)}`}
            actions={[{ label: "Stop the sequence", destructive: true, onClick: () => toast(`${c.name} removed from ${c.inSequence}. Nothing further is sent.`) }]} />
        ))}</div>,
  })

  /* -------------------------------------------------------------------------------- side cards */

  const cards: RecordCard[] = []
  if (customer && account) {
    cards.push({
      id: "champion", title: "Champion",
      children: (
        <div className="space-y-2 text-sm">
          <div className="font-medium">{account.champion}</div>
          <div className="text-xs text-muted-foreground">Last touch {ago(localTouches[0]?.at ?? account.lastTouch)}</div>
          {/* Two comparable acts on this card, so neither is filled. */}
          <Actions
            surface="card"
            items={[
              { kind: "secondary", label: `Email ${account.champion.split(" ")[0]}`, onClick: () => toast(`Composer open to ${account.champion}`) },
              { kind: "secondary", label: "Book a review", onClick: () => toast(`Calendar open with ${account.champion} prefilled`) },
            ]}
          />
        </div>
      ),
    })
  }

  /* ------------------------------------------------------------------------------- the doors */

  const doorDefs: (RecordDoor & { usage: string })[] = []

  doorDefs.push({
    usage: "rec.all-activity", id: "company.activity", label: "All activity", count: activity.length,
    content: activity.length === 0
      ? <p className="text-muted-foreground">Nothing has been logged against {merged.name}.</p>
      : <ul className="space-y-1">{activity.map((a) => (
          <li key={a.id} className="flex justify-between gap-3 border-t py-1 first:border-t-0">
            <span className="min-w-0">{a.kind} · {a.text}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">{day(a.at)}</span>
          </li>
        ))}</ul>,
  })

  doorDefs.push({
    usage: "rec.research", id: "company.research",
    label: runs.length ? `Agent research · ${runs.length} run${runs.length === 1 ? "" : "s"}, last ${day(runs[0].at)}, ${CREDITS.research} credits a run` : "Agent research",
    count: runs.length,
    content: runs.length === 0
      ? (
        <div className="space-y-2">
          <p className="text-muted-foreground">No agent has researched {merged.name} yet.</p>
          <Actions surface="card" items={[{ kind: "secondary", label: "Research", onClick: () => runResearch(), cost: `${CREDITS.research} credits`, consequence: "Charged once" }]} />
        </div>
      )
      : (
        <ul className="space-y-2">
          {runs.map((run, i) => (
            <li key={run.id} className="border-t pt-2 first:border-t-0 first:pt-0">
              {/* Provenance in words, not an icon: which agent, when, how many sources, how much. */}
              <div className="text-xs text-muted-foreground">{run.agent} · {day(run.at)} · {run.sources} sources · {run.credits} credits</div>
              {i === 0 && briefHref && (
                <Actions
                  className="pt-1"
                  surface="card"
                  items={[
                    { kind: "secondary", label: "Research again", onClick: () => runResearch(), cost: `${CREDITS.research} credits`, consequence: "Charged once" },
                    { kind: "link", label: "Open the brief", href: href(briefHref), onClick: () => follow(briefHref, origin("company.research")) },
                  ]}
                />
              )}
            </li>
          ))}
        </ul>
      ),
  })

  const signalNames = [...merged.signals, ...(account?.signals.map((s) => s.kind) ?? [])]
  if (signalNames.length > 0) doorDefs.push({
    usage: "rec.signals", id: "company.signals", label: "Signals and news", count: signalNames.length,
    content: (
        <ul className="space-y-1">
          {merged.signals.map((s) => <li key={s} className="border-t py-1 first:border-t-0">{s}</li>)}
          {(account?.signals ?? []).map((s) => (
            <li key={s.id} className="border-t py-1">
              <div>{s.kind}</div>
              <div className="text-xs text-muted-foreground">{s.detail} · {s.source} · {day(s.fired)} · routed to {s.routedTo}</div>
            </li>
          ))}
        </ul>
    ),
  })

  if (hasCrm) {
    const synced = change.pushedToCrmAt ?? (merged.crm?.synced ? merged.enrichedOn ?? TODAY : null)
    doorDefs.push({
      usage: "rec.crm", id: "company.crm",
      label: `CRM sync · ${merged.crm?.lastError ? "last run failed" : `synced ${day(synced)}`}`,
      content: (
        <div className="space-y-2">
          <p>{crmName} · {merged.crm?.synced ? "in sync" : "not in sync"}{synced ? ` · last ${day(synced)}` : ""}</p>
          {merged.crm?.lastError && <p className="text-destructive">{merged.crm.lastError}</p>}
          <Actions surface="card" items={[{
            kind: "secondary", label: `Push to ${crmName}`,
            onClick: () => { applyChange(merged.id, { pushedToCrmAt: TODAY }); toast(`${merged.name} pushed to ${crmName} · 3 fields updated, nothing deleted`) },
            irreversible: {
              title: `Push ${merged.name} to ${crmName}?`,
              consequence: `Three fields are overwritten in ${crmName} and nothing is deleted. The push cannot be undone from here.`,
              confirmLabel: `Push to ${crmName}`,
            },
          }]} />
          <ul className="space-y-1 text-xs">
            {seed.syncRuns.slice(0, 5).map((s) => (
              <li key={s.id} className="flex justify-between gap-2 text-muted-foreground">
                <span>{s.object} · {s.direction} · {s.pulled + s.pushed} records{s.failed ? `, ${s.failed} failed` : ""}</span>
                <span className="tabular-nums">{day(s.started)}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    })
  }

  const children = seed.companies.filter((c) => c.parent === merged.name)
  if (merged.parent || children.length > 0) doorDefs.push({
    usage: "rec.hierarchy", id: "company.hierarchy", label: "Parent and subsidiaries", count: children.length + (merged.parent ? 1 : 0),
    content: !merged.parent && children.length === 0
      ? <p className="text-muted-foreground">{merged.name} has no parent and no subsidiaries on file.</p>
      : (
        <ul className="space-y-1">
          {merged.parent && <li>Parent · {merged.parent}</li>}
          {children.map((c) => (
            <li key={c.id} data-item={c.id} data-item-label={c.name}>
              Subsidiary · <button type="button" className="underline"
                onClick={(e) => lookBeside("company", c.id, children.map((x) => x.id), e.currentTarget)}>{c.name}</button>
            </li>
          ))}
        </ul>
      ),
  })

  const fieldDefs = seed.fields.filter((f) => f.object === "company" && !f.retired)
  doorDefs.push({
    usage: "rec.fields", id: "company.history", label: "Full history, custom fields and files",
    count: Object.keys(merged.custom).length + merged.lists.length + notes.length,
    content: (
      <div className="space-y-3">
        <div>
          <div className="pb-1 text-xs font-medium">Custom fields</div>
          <dl className="grid grid-cols-[10rem_1fr] gap-x-4 gap-y-1">
            {Object.entries(merged.custom).map(([k, val]) => (
              <div key={k} className="contents"><dt className="text-xs text-muted-foreground">{k}</dt><dd>{val}</dd></div>
            ))}
            {fieldDefs.filter((f) => !(f.label in merged.custom)).map((f) => (
              <div key={f.id} className="contents"><dt className="text-xs text-muted-foreground">{f.label}</dt><dd className="text-muted-foreground">—</dd></div>
            ))}
            {Object.keys(merged.custom).length === 0 && fieldDefs.length === 0 && (
              <div className="contents"><dt className="text-xs text-muted-foreground">None</dt><dd className="text-muted-foreground">This workspace keeps no custom fields on a company.</dd></div>
            )}
          </dl>
        </div>
        <div>
          <div className="pb-1 text-xs font-medium">Lists this company is in</div>
          {[...(change.lists ?? merged.lists)].length === 0
            ? <p className="text-muted-foreground">None.</p>
            : <ul>{[...(change.lists ?? merged.lists)].map((l) => <li key={l}>{l}</li>)}</ul>}
        </div>
        <div>
          <div className="pb-1 text-xs font-medium">History</div>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>Added {day(merged.addedOn)} · {merged.source}</li>
            {merged.enrichedOn && <li>Enriched {day(merged.enrichedOn)}</li>}
            {notes.map((n, i) => <li key={i}>Note by {n.by} · {day(n.on)}</li>)}
            {change.stage && <li>Stage changed to {change.stage} by {session.user} · {day(TODAY)}</li>}
          </ul>
        </div>
        <div>
          <div className="pb-1 text-xs font-medium">Files</div>
          <p className="text-muted-foreground">No files yet.</p>
          <Actions className="mt-1" surface="card" items={[{ kind: "secondary", label: "Upload a file", onClick: () => toast("Files stay with the company and are visible to everyone who can open it.") }]} />
        </div>
      </div>
    ),
  })

  doorDefs.push({
    usage: "rec.enrich", id: "company.enrich", label: "Enrichment data and sources", container: "drawer",
    count: 6,
    content: (
      <div className="space-y-3">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-muted-foreground"><th className="py-1">Field</th><th>Value</th><th>Where it came from</th><th>When</th></tr></thead>
          <tbody>
            {[
              ["Industry", merged.industry],
              ["Employees", merged.employees.toLocaleString()],
              ["Location", `${merged.location.city}, ${merged.location.country}`],
              ["Founded", String(merged.founded)],
              ["Revenue", merged.revenue],
              ["Technology", merged.technologies.join(", ") || "—"],
            ].map(([label, value]) => (
              <tr key={label} className="border-t">
                <td className="py-1 text-xs text-muted-foreground">{label}</td>
                <td>{value}</td>
                <td className="text-xs text-muted-foreground">{merged.source === "CRM" ? crmName || "the CRM" : merged.source === "Imported" ? "A CSV import" : "The enrichment provider"}</td>
                <td className="text-xs tabular-nums text-muted-foreground">{merged.enrichedOn ? day(merged.enrichedOn) : day(merged.addedOn)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Actions surface="card" items={[{
          kind: "secondary", label: "Re-enrich this company",
          onClick: () => toast(`Re-enriching ${merged.name} · about ${CREDITS.enrich} credits`),
          cost: `about ${CREDITS.enrich} credits`, consequence: "Charged once",
        }]} />
      </div>
    ),
  })

  const doors: RecordDoor[] = doorDefs
    .filter((x) => used(x.usage))
    .sort((x, y) => d.weekly(y.usage) - d.weekly(x.usage))
    .map(({ usage, ...door }) => { void usage; return door })

  /* ------------------------------------------------------------------------------- the actions */

  function runResearch() {
    const before = changeFor(merged.id).researchRuns ?? []
    applyChange(merged.id, { researchRuns: [{ id: `run-${before.length + 1}`, agent: "Research agent", at: TODAY, sources: 14, credits: CREDITS.research }, ...before] })
    toast(`Research agent ran on ${merged.name} · ${CREDITS.research} credits`)
  }

  const removeConsequence =
    `Removes ${merged.name}: it leaves ${merged.lists.length} list${merged.lists.length === 1 ? "" : "s"}, stops sequences for ${v.inSequence.length} contact${v.inSequence.length === 1 ? "" : "s"}, and keeps the ${v.contacts.length} contacts on People.`

  // One filled control on this header (DESIGN.md §1): the act the page exists for, which spends and
  // therefore prices itself in its own label. Finding the people at this company is a destination,
  // not a state change, so it is the link in the contacts section — where the people are — and the
  // F shortcut still runs it from anywhere on the page.
  const primary = [
    { label: `Research · ${CREDITS.research} credits`, onClick: runResearch, shortcut: "R", confirm: `Run the research agent on ${merged.name} for ${CREDITS.research} credits? Balance ${seed.credits.balance.toLocaleString()}.` },
  ]

  const secondary = [
    { label: "Add to list", onClick: () => setListOpen(true), shortcut: "L" },
    ...(customer && holdsAccounts ? [{ label: "Run a play", onClick: () => setPlayOpen(true), shortcut: "P" }] : []),
    // Stopping every sequence at a company is not a thing to do by accident, and nothing puts the
    // people back where they were, so it asks once with what it stops (DESIGN.md §2). Turning it
    // back on is reversible and acts at once.
    ...(canEdit
      ? [merged.stage === "Do not prospect"
          ? { label: "Allow prospecting again", onClick: () => changeStage("Cold") }
          : {
              label: "Mark do not prospect",
              onClick: () => changeStage("Do not prospect"),
              confirm: `Stops sequences for the ${v.inSequence.length} contact${v.inSequence.length === 1 ? "" : "s"} at ${merged.name}. The ${v.contacts.length} people stay on People.`,
            }]
      : []),
  ]

  // The header drawn by the Actions primitive (DESIGN.md §1 and §2): Research is the one filled act
  // and prices itself on one line rather than asking; stopping prospecting confirms because nothing
  // puts the people back; removal is destructive and confirms with the verb.
  const headerItems: Action[] = [
    { kind: "primary", label: "Research", onClick: runResearch, cost: `${CREDITS.research} credits`, consequence: "Charged once", keys: "R" },
    { kind: "secondary", label: "Add to list", onClick: () => setListOpen(true), keys: "L" },
    ...(customer && holdsAccounts ? [{ kind: "secondary" as const, label: "Run a play", onClick: () => setPlayOpen(true), keys: "P" }] : []),
    ...(canEdit
      ? [merged.stage === "Do not prospect"
          ? { kind: "secondary" as const, label: "Allow prospecting again", onClick: () => changeStage("Cold") }
          : {
              kind: "secondary" as const,
              label: "Mark do not prospect",
              onClick: () => changeStage("Do not prospect"),
              irreversible: {
                title: `Stop prospecting ${merged.name}?`,
                consequence: `Stops sequences for the ${v.inSequence.length} contact${v.inSequence.length === 1 ? "" : "s"} at ${merged.name}. The ${v.contacts.length} people stay on People.`,
                confirmLabel: "Stop prospecting",
              },
            },
          {
            kind: "destructive" as const,
            label: "Remove company",
            onClick: () => { applyChange(merged.id, { removed: true }); toast(`${merged.name} removed. Undo is on the table for ten seconds.`) },
            irreversible: { title: `Remove ${merged.name}?`, consequence: removeConsequence, confirmLabel: "Remove company" },
          }]
      : []),
  ]

  /* -------------------------------------------------------------------------------- the ribbon */

  const churnNotice = account?.risks.find((r) => r.type === "Churn notice" && !r.resolved)
  const ribbon =
    churnNotice ? { tone: "error" as const, text: `Churn notice · opened ${day(churnNotice.opened)} by ${churnNotice.owner}. ${churnNotice.note}` }
    : merged.stage === "Churned" ? { tone: "warning" as const, text: `Churned. The account is out of the default Accounts view and sequences exclude it.` }
    : merged.stage === "Do not prospect" ? { tone: "warning" as const, text: `Do not prospect. Sequences are stopped for the ${v.inSequence.length} contacts here.` }
    : merged.crm?.lastError ? { tone: "error" as const, text: `Not synced to ${crmName}: ${merged.crm.lastError}`, action: <Actions surface="card" items={[{ kind: "secondary", label: "Open CRM sync", onClick: () => openCrmDoor(true) }]} /> }
    : undefined

  /* --------------------------------------------------------------------------------- render */

  return (
    <>
      <RecordPage
        back={backTo}
        title={{ value: merged.name, onRename: canEdit ? (value) => { applyChange(merged.id, { name: value }); toast(`Saved · ${value}`) } : undefined }}
        subtitle={{ label: merged.domain, href: `https://${merged.domain}` }}
        chips={
          <span className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{merged.stage}</Badge>
            {!canEdit && (
              <span className="text-xs text-muted-foreground">{merged.owner} owns this company — you can read it</span>
            )}
          </span>
        }
        ribbon={ribbon}
        fields={fields}
        headerActions={<Actions surface="page" items={headerItems} />}
        actions={{
          primary,
          secondary,
          destructive: canEdit ? {
            label: "Remove company",
            consequence: removeConsequence,
            onConfirm: () => {
              applyChange(merged.id, { removed: true })
              toast(`${merged.name} removed. Undo is on the table for ten seconds.`)
              navigate("/ollopa/companies")
            },
          } : undefined,
        }}
        main={{ kind: "sections", label: "Overview", sections }}
        side={cards}
        doors={doors}
        quickLook={{
          fields: quickLookFields(v, b.currency, d.level),
          editable: customer && account
            ? { label: "Next step", value: account.nextStep.text, onChange: (text) => applyChange(merged.id, { nextStep: { text, due: account.nextStep.due } }) }
            : { label: "Stage", value: merged.stage, options: [...ACCOUNT_STAGES], onChange: (to) => changeStage(to as AccountStage) },
        }}
        shortcuts={[
          { keys: "F", label: "Find people at this company", run: openPeopleAtCompany },
          { keys: "L", label: "Add to a list", run: () => setListOpen(true) },
          { keys: "R", label: `Research · ${CREDITS.research} credits`, run: runResearch },
          ...(customer && holdsAccounts ? [{ keys: "P", label: "Run a play", run: () => setPlayOpen(true) }] : []),
          ...(briefHref ? [{ keys: "B", label: "Open the brief", run: () => follow(briefHref, origin()) }] : []),
        ]}
        noAccess={seat ? undefined : { message: "Companies is not part of your seat.", who: ["SDR", "Account executive", "Customer success", "RevOps admin"] }}
      />

      <PlayPanel
        open={playOpen}
        onOpenChange={setPlayOpen}
        view={v}
        user={session.user}
        currency={b.currency}
        onRun={(summary) => {
          applyChange(merged.id, { notes: [{ by: session.user, on: TODAY, text: `Play run · ${summary}` }, ...(change.notes ?? [])] })
          toast(`Play run · ${summary}`)
        }}
      />

      <Panel id="flag-the-score" title="This flag was wrong" open={flagOpen} onOpenChange={setFlagOpen}
        footer={<Actions surface="dialog" layout="stack" items={[{ kind: "primary", label: "Send the request", onClick: () => { setFlagOpen(false); toast(`Request sent. ${admin?.user ?? "Your admin"} sees it on Requests with the account, the input and your reason.`) } }]} />}>
        <div className="space-y-3">
          <div>
            <Label htmlFor="flag-input" className="text-xs">The input</Label>
            <Select defaultValue={account?.drivers[1]?.label ?? "Base"}>
              <SelectTrigger id="flag-input" className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{(account?.drivers ?? []).map((x) => <SelectItem key={x.label} value={x.label}>{x.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="flag-why" className="text-xs">Why it is wrong</Label>
            <Textarea id="flag-why" rows={3} className="mt-1" placeholder="What the number should be, and how you know" />
          </div>
        </div>
      </Panel>

      <Panel id="company-add-list" title={`Add ${merged.name} to a list`} open={listOpen} onOpenChange={setListOpen}
        footer={
          <Actions surface="dialog" layout="stack" items={[{
            kind: "primary",
            label: `Add to ${listName || "a list"}`,
            disabledBecause: listName ? undefined : "Pick a list or type a name",
            onClick: () => {
              applyChange(merged.id, { lists: [...(change.lists ?? merged.lists), listName] })
              setListOpen(false)
              toast(`Added to ${listName}`)
            },
          }]} />
        }>
        <div className="space-y-3">
          <div>
            <Label htmlFor="pick-list" className="text-xs">Pick a list</Label>
            <Select value={listName} onValueChange={setListName}>
              <SelectTrigger id="pick-list" className="mt-1"><SelectValue placeholder="A list of companies" /></SelectTrigger>
              <SelectContent>{seed.lists.filter((l) => l.kind === "companies").map((l) => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="new-list" className="text-xs">Or type a new name</Label>
            <Input id="new-list" className="mt-1" value={listName} onChange={(e) => setListName(e.target.value)} />
          </div>
        </div>
      </Panel>
    </>
  )
}
