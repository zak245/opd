// R-person: the contact record, built on the shared record template (spec 02 §3; spec 09 owns RecordPage).
//
// The timeline is the record. A person opens a contact to read what has happened, so the activity is
// at level one with its filter chips as object state — there is no "All activity" door, and the only
// doors are the two long, rarely-needed things: what was enriched and where it came from, and the full
// history with custom fields and files. A call item in the timeline opens X-calllog, which anyone who
// can see the record may read and its owner may correct.
//
// The header's fields are the quick look's fields, in the same order with the same labels, from one
// list in person.ts — so the drawer beside the table and the top of this page can never drift apart.
import { useMemo, useState } from "react"
import { Bot, CalendarClock, CheckSquare, Mail, MessageSquare, Phone, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { href, navigate, useRoute } from "@/app/router"
import { RecordPage, CardRow, type RecordDoor, type RecordField } from "../../templates/RecordPage"
import { Actions, type Action } from "../../ui/Actions"
import { openBeside } from "../../beside"
import { follow } from "../../chain"
import { useEdits } from "../../edits"
import { toast } from "../../templates/TablePage"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { CREDITS, STAGES, seedFor, type Call, type ContactStage } from "../../data/seed"
import type { Session } from "../../session"
import { STAGE_TONE } from "./columns"
import { ago, day, glanceSplit, rowsFor, type PersonRow } from "./person"
import { CallLog } from "./CallLog"
import { EnrichPanel } from "./EnrichPanel"
import type { PersonEdit } from "./edits"
import { SectionFilter } from "../../layouts/SectionFilter"

type Kind = "email" | "call" | "meeting" | "note" | "sequence" | "agent" | "task"

interface Item {
  id: string
  kind: Kind
  at: string
  by: string
  summary: string
  detail?: string
  call?: Call
}

const ICON: Record<Kind, typeof Mail> = {
  email: Mail, call: Phone, meeting: CalendarClock, note: MessageSquare, sequence: Send, agent: Bot, task: CheckSquare,
}

const FILTERS: { key: string; label: string; kinds: Kind[] | null }[] = [
  { key: "all", label: "All", kinds: null },
  { key: "email", label: "Emails", kinds: ["email"] },
  { key: "call", label: "Calls", kinds: ["call"] },
  { key: "meeting", label: "Meetings", kinds: ["meeting"] },
  { key: "note", label: "Notes", kinds: ["note"] },
  { key: "sequence", label: "Sequence steps", kinds: ["sequence", "task", "agent"] },
]

export function ContactRecord({ session, id }: { session: Session; id?: string }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const d = useDisclosure("people")
  const route = useRoute()
  // What the pane's actions did to a colleague in this session, from the one store every page
  // reads. The card behind the pane reads it, so acting in the pane shows its effect on the row
  // that opened it, at once — and only this kind re-renders.
  const edits = useEdits("person") as Record<string, PersonEdit>

  const rows = useMemo(() => rowsFor(seed), [seed])
  const person: PersonRow | undefined = useMemo(
    () => rows.find((p) => p.id === id) ?? rows.find((p) => p.owner === session.user) ?? rows[0],
    [rows, id, session.user],
  )

  const [stage, setStage] = useState<ContactStage | null>(null)
  const [filter, setFilter] = useState("all")
  const [note, setNote] = useState("")
  const [written, setWritten] = useState<Item[]>([])
  const [call, setCall] = useState<Call | null>(null)
  const [enrich, setEnrich] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [shown, setShown] = useState(12)

  if (!person) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <h2 className="t-section">This contact was removed or merged.</h2>
        <p className="mt-2"><a className="text-sm underline" href={href("/ollopa/people")}>Back to People</a></p>
      </div>
    )
  }

  const p = person
  const currentStage = stage ?? p.stage
  const owned = p.owner === session.user
  const canEdit = owned || session.role === "admin"
  // Who a seat that cannot act should ask. Never the owner: an escalation that points back at the
  // person you are already blocked by names nobody. The seat is named by its title, not by a second
  // person, so the sentence reads the same whoever holds it.
  const admin = b.roles.find((r) => r.role === "admin" && r.user !== person?.owner) ?? b.roles.find((r) => r.role === "admin")
  /**
   * The admin seat as a thing you can go and ask, in this workspace's own words. A title that ends
   * in a person ("RevOps admin", "Agency ops lead") takes an article; a team's name ("Revenue
   * operations") does not, because "a Revenue operations" is not English.
   */
  const escalation = (() => {
    const title = admin && admin.user !== person?.owner ? admin.title : null
    if (!title) return null
    const last = title.split(" ").pop()!.toLowerCase()
    const isAPerson = ["admin", "lead", "manager", "founder", "owner", "head", "director"].includes(last)
    return isAPerson ? `${/^[aeiou]/i.test(title) ? "an" : "a"} ${title}` : title
  })()
  const company = p.co
  const colleagues = rows.filter((x) => x.companyId === p.companyId && x.id !== p.id)
  const deals = seed.deals.filter((dl) => dl.companyId === p.companyId && !dl.archivedAt)
  const tasks = seed.tasks.filter((t) => t.contactId === p.id && t.status === "Open")
  const calls = seed.calls.filter((c) => c.contactId === p.id)
  const meetings = seed.meetings.filter((m) => m.contactId === p.id)
  const notes = seed.notes.filter((n) => n.about.kind === "person" && n.about.id === p.id)
  const replies = seed.replies.filter((r) => r.contactId === p.id)
  const agentEvents = seed.agentEvents.filter((e) => e.contactId === p.id)
  const enrolment = seed.enrollments.find((e) => e.contactId === p.id)
  const job = seed.enrichmentJobs.find((j) => j.unmatchedIds.includes(p.id)) ?? seed.enrichmentJobs[0]
  const balance = seed.credits.balance
  /** The colleagues the card actually shows, which is the list `[` and `]` walk in the pane. */
  const shownColleagues = colleagues.slice(0, 5)
  const colleagueIds = shownColleagues.map((c) => c.id)
  const dealIds = deals.slice(0, 4).map((dl) => dl.id)

  /* ------------------------------------------------- the three ways out, none of which leave */

  /** Where this page is, for the trail, exactly as the header reads it. */
  const origin = (anchor: string) => ({ route: route.raw, title: `${p.name} · People`, anchor })

  /** The company beside this record: the contact stays on screen, scrolled and open as it was. */
  const openCompany = (opener: HTMLElement | null) => {
    if (!company) return
    openBeside({ kind: "company", id: company.id, opener })
  }

  /** A colleague beside this record, with the card's own order so `[` and `]` walk it. */
  const openColleague = (contactId: string, opener: HTMLElement | null) => {
    const index = colleagueIds.indexOf(contactId)
    openBeside({ kind: "person", id: contactId, list: index >= 0 ? { ids: colleagueIds, index } : undefined, opener })
  }

  /** A deal at this company beside this record. */
  const openDeal = (dealId: string, opener: HTMLElement | null) => {
    const index = dealIds.indexOf(dealId)
    openBeside({ kind: "deal", id: dealId, list: index >= 0 ? { ids: dealIds, index } : undefined, opener })
  }

  /** The one reason to leave: every person at this company, as a page, with the filter and the trail. */
  const openAllAtCompany = () => {
    follow(`/ollopa/people?company=${encodeURIComponent(p.company)}`, origin("people.at-company"))
  }

  /* ------------------------------------------------------------------------------ the timeline */

  const items: Item[] = [
    ...replies.flatMap((r) => r.messages.map((m, i) => ({
      id: `${r.id}-m${i}`, kind: "email" as const, at: m.sent, by: m.from === "us" ? r.contact && session.user : r.contact,
      summary: m.from === "us" ? `Email sent · ${m.subject}` : `Reply · ${m.subject}`, detail: m.body,
    }))),
    ...calls.map((c) => ({
      id: c.id, kind: "call" as const, at: c.startedAt, by: c.loggedBy,
      summary: `Call · ${c.disposition}`, detail: c.notes, call: c,
    })),
    ...meetings.map((m) => ({
      id: m.id, kind: "meeting" as const, at: m.at, by: m.host,
      summary: `Meeting · ${m.state}`, detail: m.summary ?? undefined,
    })),
    ...notes.map((n) => ({
      id: n.id, kind: "note" as const, at: n.at, by: n.author, summary: n.to ? `Note for ${n.to}` : "Note", detail: n.body,
    })),
    ...tasks.map((t) => ({
      id: t.id, kind: "task" as const, at: t.due, by: t.owner, summary: `${t.kind} task · ${t.title}`,
    })),
    ...agentEvents.map((e) => ({
      // `when` is the day the run happened; `at` is the clock time inside it.
      id: e.id, kind: "agent" as const, at: e.when, by: e.agent, summary: e.summary, detail: e.detail,
    })),
    ...(enrolment ? [{
      id: enrolment.id, kind: "sequence" as const, at: enrolment.addedAt, by: enrolment.addedBy,
      summary: `Added to ${p.inSequence} · step ${enrolment.stepOrder}`,
    }] : []),
    ...written,
  ].sort((x, y) => (x.at < y.at ? 1 : -1))

  const kinds = FILTERS.find((f) => f.key === filter)?.kinds
  const visible = kinds ? items.filter((i) => kinds.includes(i.kind)) : items

  /**
   * What the person typed on the form is all anybody knows about them, and the first email is written
   * from it — so while the stage is still pre-first-touch it sits here, not behind the history door.
   */
  const preFirstTouch = currentStage === "Cold" || currentStage === "Approaching"
  const formNote = p.source === "Form" && preFirstTouch ? (
    <article className="mb-3 pb-3">
      <div className="text-xs font-medium text-muted-foreground">Form: Book a demo, {day(p.addedOn)}</div>
      <dl className="mt-1 grid grid-cols-[9rem_1fr] gap-x-3 gap-y-0.5 text-sm">
        <dt className="text-muted-foreground">What they wrote</dt>
        <dd>“We are two weeks from renewing our current tool and the data is stale.”</dd>
        <dt className="text-muted-foreground">Asked on the form</dt>
        <dd>Name, work email, company</dd>
        <dt className="text-muted-foreground">Added by enrichment</dt>
        <dd>Title, company size, industry</dd>
      </dl>
      <Separator className="mt-3" />
    </article>
  ) : undefined

  /* --------------------------------------------------------------------------------- the fields */

  // The first level is the seat's own: `d.level` comes from the usage model, so the header, the
  // quick look and the pane beside another page all show the same fields for this seat, and the
  // ones this seat does not read weekly move behind the history door rather than disappearing.
  const split = glanceSplit(p, seed, d.level)
  const belowTheLine = split.rest
  const glance = split.first.map((f) =>
    f.label === "Stage" ? { ...f, value: currentStage }
    : f.label === "Phone" && revealed ? { ...f, value: p.phoneNumber ?? "On file" }
    : f)

  const fields: RecordField[] = glance.map((f) => ({
    key: f.label,
    label: f.label,
    value: f.label === "Stage"
      ? <Badge variant="secondary" className={STAGE_TONE[currentStage]}>{currentStage}</Badge>
      : f.label === "Phone" && p.phone && !p.phoneRevealed && !revealed
        ? (
          <Actions surface="card" items={[{
            kind: "secondary",
            label: "Reveal the phone",
            cost: `${CREDITS.revealPhone} credits`,
            consequence: "Charged once",
            onClick: () => {
              setRevealed(true)
              toast(`Phone revealed · ${CREDITS.revealPhone} credits · ${(balance - CREDITS.revealPhone).toLocaleString()} left`)
            },
          }]} />
        )
        // An email is one long word: it wraps inside its own column rather than running under the
        // field beside it, which at 400 is the only place there is room for it.
        : <span className="break-words">{f.value}</span>,
    editor: f.label === "Stage" ? "select" : "readonly",
    tone: f.label === "Do not contact" && (p.doNotContact || p.doNotCall) ? "warning" : undefined,
    edit: f.label === "Stage" && canEdit
      ? { value: currentStage, options: [...STAGES], onSave: (v) => { setStage(v as ContactStage); toast(`${p.name} · ${currentStage} → ${v}`) } }
      : undefined,
  }))

  /* ---------------------------------------------------------------------------------- the doors */

  const doors: RecordDoor[] = [
    {
      id: "person.enrich",
      label: "Enrichment data and sources",
      count: p.lastEnrichedFields.length,
      content: (
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Last enriched {p.enrichedOn ? `${day(p.enrichedOn)} · ${ago(p.enrichedOn)}` : "never"}.
          </p>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Field</TableHead><TableHead>Source</TableHead><TableHead className="text-right">Credits</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {/* What the last enrichment filled in on this person, and what each field cost. */}
              {p.lastEnrichedFields.map((field) => (
                <TableRow key={field}>
                  <TableCell>{field}</TableCell>
                  <TableCell>{job?.providers[0] ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{job?.byField.find((f) => f.field === field)?.cost ?? (field === "Mobile" ? CREDITS.revealPhone : field === "Email" ? CREDITS.enrich : 1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Actions surface="card" items={[
            { kind: "primary", label: "Enrich again", onClick: () => setEnrich(true), cost: `${CREDITS.enrich} credits`, consequence: "Charged once" },
          ]} />
        </div>
      ),
    },
    {
      id: "person.history",
      label: "Full history, custom fields and files",
      count: Object.keys(p.custom).length + belowTheLine.length + 4,
      content: (
        <div className="space-y-3">
          {belowTheLine.length > 0 && (
            <section>
              <h4 className="pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">The rest of the record</h4>
              {/* What this seat does not read weekly. Demoted by the usage model, never dropped. */}
              <dl className="grid grid-cols-[9rem_1fr] gap-x-3 gap-y-0.5">
                {belowTheLine.map((f) => (
                  <div key={f.label} className="contents"><dt className="text-muted-foreground">{f.label}</dt><dd>{f.value}</dd></div>
                ))}
              </dl>
            </section>
          )}
          <section>
            <h4 className="pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Custom fields</h4>
            {Object.keys(p.custom).length === 0
              ? <p className="text-muted-foreground">This workspace defines none.</p>
              : (
                <dl className="grid grid-cols-[9rem_1fr] gap-x-3 gap-y-0.5">
                  {Object.entries(p.custom).map(([k, v]) => (
                    <div key={k} className="contents"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
              )}
          </section>
          <section>
            <h4 className="pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">History</h4>
            <ul className="space-y-1">
              <li className="flex justify-between gap-2"><span>Added from {p.source}</span><span className="tabular-nums text-muted-foreground">{day(p.addedOn)}</span></li>
              <li className="flex justify-between gap-2"><span>Scored {p.score} ({p.scoreReasons.join("; ")})</span><span className="tabular-nums text-muted-foreground">{day(p.scoredAt)}</span></li>
              {p.crmId && <li className="flex justify-between gap-2"><span>{b.crm} record {p.crmId}</span><span className="tabular-nums text-muted-foreground">{day(p.crmSyncedAt)}</span></li>}
              {p.dncCheckedOn && <li className="flex justify-between gap-2"><span>Do-not-call list checked</span><span className="tabular-nums text-muted-foreground">{day(p.dncCheckedOn)}</span></li>}
            </ul>
          </section>
          <section>
            <h4 className="pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Files</h4>
            <p className="text-muted-foreground">No files on this contact.</p>
          </section>
        </div>
      ),
    },
  ]

  /* -------------------------------------------------------------------------------- the ribbon */

  const ribbon = p.doNotContact
    ? { tone: "warning" as const, text: `Do not contact, since ${day(p.lastActivity)}. Outreach from every sequence and campaign is blocked.` }
    : p.jobChange
      ? {
        tone: "info" as const,
        text: `${p.name} started at ${company?.name ?? "a new employer"} · ${day(p.jobChange.firedOn)} · found by the ${p.jobChange.source}. Was ${p.jobChange.previousCompany}.`,
        // Two comparable acts on one strip, so neither is filled (DESIGN.md §1).
        action: (
          <Actions surface="card" items={[
            { kind: "secondary", label: "Update this record", onClick: () => toast("Record updated. History, notes and owner kept; taken out of sequences aimed at the old employer.") },
            { kind: "secondary", label: "Create a new contact", onClick: () => toast("A new contact was started at the new employer. This record stays as it was.") },
          ]} />
        ),
      }
      : undefined

  /* ------------------------------------------------------------------- the header's controls */

  const outreachBlocked = p.doNotContact

  /**
   * Every act in the header, each named by its usage item, and none of them drawn by hand: the
   * kind decides (DESIGN.md §1) and `ui/Actions` draws it.
   *
   * Which one is filled is the model's answer, not a guess: the act this seat runs most at this
   * business is the primary, so an SDR opens on the sequence and an AE on the call task. Everything
   * else is secondary, because two comparable acts are both secondary. Removing the contact is the
   * only irreversible act here, so it is the only one that asks first, in its own confirmation.
   */
  const acts: { item: string; action: Action }[] = canEdit && !outreachBlocked ? [
    {
      item: "people.row.sequence",
      action: { kind: "secondary", label: p.inSequence ? "Move sequence" : "Add to sequence", onClick: () => toast(p.inSequence ? `${p.name} is in ${p.inSequence}. Choose where to move them.` : `${p.name} added to a sequence.`), keys: "S" },
    },
    {
      item: "people.row.call",
      action: { kind: "secondary", label: "Create a call task", onClick: () => toast(`Call task due today for ${p.name}.`), keys: "C" },
    },
    {
      item: "people.row.email",
      action: { kind: "secondary", label: "One-off email", onClick: () => toast(`Writing to ${p.email}.`), keys: "E" },
    },
    {
      item: "people.row.enrich",
      action: { kind: "secondary", label: "Enrich", onClick: () => setEnrich(true), cost: `${CREDITS.enrich} credits`, consequence: "Charged once" },
    },
    {
      item: "people.row.research-agent",
      action: {
        kind: "secondary",
        label: "Ask the research agent",
        onClick: () => toast(`Research queued for ${p.name} · ${CREDITS.research} credits · ${(balance - CREDITS.research).toLocaleString()} left`),
        cost: `${CREDITS.research} credits`,
        consequence: "Charged once",
      },
    },
    { item: "people.row.list", action: { kind: "secondary", label: "Add to list", onClick: () => toast(`${p.name} added to a list.`) } },
  ] : canEdit ? [
    // Outreach is blocked, so the acts that reach out are not offered; the rest still are.
    { item: "people.row.enrich", action: { kind: "secondary", label: "Enrich", onClick: () => setEnrich(true), cost: `${CREDITS.enrich} credits` } },
    { item: "people.row.list", action: { kind: "secondary", label: "Add to list", onClick: () => toast(`${p.name} added to a list.`) } },
  ] : []

  const mostUsed = acts.reduce<string | null>((best, a) => (best === null || d.weekly(a.item) > d.weekly(best) ? a.item : best), null)
  const headerItems: Action[] = [
    ...acts.map((a) => (a.item === mostUsed ? { ...a.action, kind: "primary" as const } : a.action)),
    ...(canEdit ? [{
      kind: "destructive" as const,
      label: "Remove from the workspace",
      // The one act here that cannot be undone, so it is the one that asks — and the whole of what
      // it does sits above the affirmative, not on the page (DESIGN.md §2).
      irreversible: {
        title: `Remove ${p.name} from ${seed.workspace.name}?`,
        consequence: `${p.name} and their ${items.length} activities leave this workspace. ${b.crm ? `The ${b.crm} record stays.` : "Nothing is deleted anywhere else."} Undo for 10 seconds.`,
        confirmLabel: "Remove from the workspace",
      },
      onClick: () => { toast(`${p.name} removed. Undo is in the notification for 10 seconds.`); navigate("/ollopa/people") },
    }] : []),
  ]

  return (
    <>
      <RecordPage
        back={{ label: "People", href: href("/ollopa/people") }}
        family="people"
        title={{ value: p.name }}
        // A destination is a real link — it copies and opens in a new tab — and a plain click on it
        // opens the company beside this page instead of leaving (DESIGN.md §1, "links are links").
        subtitle={company
          ? { label: `${p.title} · ${p.company}`, href: href(`/ollopa/companies/${company.id}`), onOpen: (el) => openCompany(el) }
          : undefined}
        chips={
          <span className="flex flex-wrap items-center gap-2">
            {p.signals.map((s) => <Badge key={s.kind} variant="outline" title={s.detail}>{s.kind}</Badge>)}
            {/* A seat that cannot act gets no control and one sentence naming who can (DESIGN.md §1). */}
            {!canEdit && (
              <span className="text-xs text-muted-foreground">
                Owned by {p.owner}; only the owner{escalation ? ` or ${escalation}` : ""} can change or remove it
              </span>
            )}
          </span>
        }
        ribbon={ribbon}
        fields={fields}
        // The header's controls are `ui/Actions` now: the page says what each one is, the primitive
        // draws it. The template's own three buckets stay empty (DESIGN.md §1).
        actions={{ primary: [], secondary: [] }}
        headerActions={<Actions surface="page" items={headerItems} />}
        /**
         * The activity is one container with its heading, its count and its filter chips in the
         * header, and dividers between the events — never a card per event (DESIGN.md §5). The
         * composer is the one container-low band the container may hold; everything else inside it
         * is separated by a divider, because a second box would read as a second group.
         */
        main={{
          kind: "sections",
          label: "Activity",
          sections: [{
            id: "person.activity",
            title: "Activity",
            count: visible.length,
            action: (
              // Tabs where there is room, one Select where there is not — the shared part, so every
              // record's section filter behaves the same way.
              <SectionFilter
                label="Activity filters"
                options={FILTERS.map((f) => ({ key: f.key, label: f.label }))}
                value={filter}
                onChange={setFilter}
              />
            ),
            children: (
              <div className="space-y-3">
          {canEdit ? (
            <div className="pb-3">
              <Textarea aria-label="Add a note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={`Anything the next person reading ${p.name.split(" ")[0]} should know`} />
              <div className="mt-2">
                <Actions surface="card" items={[{
                  kind: "primary",
                  label: "Add a note",
                  disabledBecause: note.trim() ? undefined : "Write the note first",
                  onClick: () => {
                    if (!note.trim()) return
                    setWritten((w) => [...w, { id: `local-${w.length + 1}`, kind: "note", at: seed.workspace.declaredAt, by: session.user, summary: "Note", detail: note.trim() }])
                    setNote("")
                    toast("Note added.")
                  },
                }]} />
              </div>
              <Separator className="mt-3" />
            </div>
          ) : null}
          {formNote}
          {visible.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No {filter === "all" ? "activity" : FILTERS.find((f) => f.key === filter)!.label.toLowerCase()} on {p.name} yet.
            </p>
          ) : (
            <ol>
              {visible.slice(0, shown).map((it, i) => {
                const Icon = ICON[it.kind]
                return (
                  <li key={it.id} className="py-2 first:pt-0">
                    {i > 0 && <Separator className="mb-2" />}
                    <div className="flex gap-2.5">
                    <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        {it.call ? (
                          <button type="button" className="text-sm font-medium underline-offset-4 hover:underline" onClick={() => setCall(it.call!)}>
                            {it.summary}
                          </button>
                        ) : <span className="text-sm font-medium">{it.summary}</span>}
                        <span className="text-xs text-muted-foreground">{it.by} · {day(it.at)}</span>
                      </div>
                      {it.detail && <p className="text-sm text-muted-foreground">{it.detail}</p>}
                    </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
          {visible.length > shown && (
            <>
            <Separator />
            <div className="flex justify-center pt-3">
              <Actions surface="card" items={[{ kind: "secondary", label: "Load older", onClick: () => setShown((n) => n + 12) }]} />
            </div>
            </>
          )}
              </div>
            ),
          }],
        }}
        /**
         * The side rail: the related things, in the order they belong to the contact. LAYOUTS §7
         * puts the *sections* in the usage order — the rail is related things, and ranking it by
         * the model's column numbers put the score above the people at the company, which is not
         * what a person opens a contact for.
         */
        side={[
          {
            id: "colleagues",
            title: `People at ${p.company}`,
            count: colleagues.length,
            // Leaving is only for acting on the whole set, and it carries the company and the trail.
            action: colleagues.length > shownColleagues.length
              ? (
                // The span carries the anchor a chain returns to; the link inside it is what the
                // shell scrolls to, lights and focuses.
                <span data-item="people.at-company" data-item-label={`All ${colleagues.length} in People`}>
                  <Actions surface="card" items={[{
                    kind: "link",
                    label: `All ${colleagues.length} in People`,
                    href: href(`/ollopa/people?company=${encodeURIComponent(p.company)}`),
                    onClick: openAllAtCompany,
                  }]} />
                </span>
              )
              : undefined,
            children: colleagues.length === 0
              ? <p className="text-sm text-muted-foreground">Nobody else here yet.</p>
              : <>{shownColleagues.map((c) => {
                  const done = edits[c.id]
                  return (
                    <div key={c.id} data-item={c.id} data-item-label={c.name}>
                      <CardRow
                        title={
                          <button type="button" className="text-left underline-offset-4 hover:underline" onClick={(e) => openColleague(c.id, e.currentTarget)}>
                            {c.name}
                          </button>
                        }
                        meta={`${c.title} · ${done?.sequence ?? c.inSequence ?? c.stage}`}
                        actions={[{ label: "Open beside", onClick: () => openColleague(c.id, document.activeElement as HTMLElement | null) }]}
                      >
                        {/* What an action in the pane did to this person, on the row that opened it. */}
                        {done?.note && <p role="status" className="pt-0.5 text-xs text-muted-foreground">{done.note}</p>}
                      </CardRow>
                    </div>
                  )
                })}</>,
          },
          {
            id: "deals",
            title: "Deals",
            count: deals.length,
            children: deals.length === 0
              ? <p className="text-sm text-muted-foreground">No open deals at {p.company}.</p>
              : <>{deals.slice(0, 4).map((dl) => (
                  <div key={dl.id} data-item={dl.id} data-item-label={dl.name}>
                    <CardRow
                      title={
                        <button type="button" className="text-left underline-offset-4 hover:underline" onClick={(e) => openDeal(dl.id, e.currentTarget)}>
                          {dl.name}
                        </button>
                      }
                      meta={`${dl.stage} · ${dl.owner}`}
                      actions={[{ label: "Open beside", onClick: () => openDeal(dl.id, document.activeElement as HTMLElement | null) }]}
                    />
                  </div>
                ))}</>,
          },
          {
            id: "tasks",
            title: "Open tasks",
            count: tasks.length,
            tone: tasks.length > 0 ? ("attention" as const) : undefined,
            children: tasks.length === 0
              ? <p className="text-sm text-muted-foreground">Nothing due.</p>
              : <>{tasks.slice(0, 4).map((t) => (
                  <CardRow key={t.id} title={t.title} meta={`${t.kind} · due ${day(t.due)} · ${t.owner}`} actions={[{ label: "Done", onClick: () => toast(`${t.title} marked done.`) }]} />
                ))}</>,
          },
          ...(d.level("people.col.score") === 1 ? [{
            id: "score",
            title: "Score",
            subtitle: `${p.score} · stamped ${day(p.scoredAt)}`,
            children: <ul className="space-y-1 text-sm text-muted-foreground">{p.scoreReasons.map((rn) => <li key={rn}>{rn}</li>)}</ul>,
          }] : []),
        ]}
        doors={doors}
        quickLook={{
          fields: glance,
          editable: canEdit && glance.some((f) => f.label === "Stage")
            ? { label: "Stage", value: currentStage, options: [...STAGES], onChange: (v) => setStage(v as ContactStage) }
            : undefined,
        }}
        shortcuts={[
          { keys: "S", label: "Add to sequence", run: () => toast(`${p.name} added to a sequence.`) },
          { keys: "C", label: "Create a call task", run: () => toast(`Call task due today for ${p.name}.`) },
          { keys: "E", label: "One-off email", run: () => toast(`Writing to ${p.email}.`) },
          { keys: "N", label: "Add a note", run: () => (document.querySelector("textarea[aria-label='Add a note']") as HTMLTextAreaElement | null)?.focus() },
        ]}
      />

      <CallLog call={call} seed={seed} session={session} onOpenChange={(o) => { if (!o) setCall(null) }} />

      <EnrichPanel open={enrich} onOpenChange={setEnrich} rows={[p]} session={session} seed={seed} onSpend={(s) => toast(s)} />

    </>
  )
}
