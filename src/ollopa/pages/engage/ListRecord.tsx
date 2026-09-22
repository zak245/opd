// The list or segment (`R-list`): the page a group is worked from.
//
// A list is bought or built as a number and worked as a calendar, so the count says what it means as
// work in the same line. Under it sit the standing arrangements — the auto-feed and the agent watch —
// each with its own running cost and its own off switch, because a thing that keeps spending without
// anyone touching it belongs in front of the person who owns it (rule 7). Lists owns those switches
// and nothing else in the product carries a second copy of them.
import { useMemo, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { href, navigate } from "@/app/router"
import { Door, DoorGroup, ExpandAll } from "../../ui/Door"
import { Panel } from "../../ui/Panel"
import { StatusLine } from "../../ui/Identity"
import { EmptyState } from "../../ui/EmptyState"
import { SectionHeader } from "../../ui/SectionHeader"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { CREDITS, seedFor, TODAY, type Company, type Contact, type List } from "../../data/seed"
import type { Session } from "../../session"
import { engage, useEngage } from "./store"
import { agentWatch, alreadyInASequence, companyMembersOf, enrolCredits, enrichCredits, membersOf, splitForEnrol, touchEstimate } from "./facts"
import { AddToSequencePanel } from "./AddToSequence"
import { openBeside } from "../../beside"
import { follow } from "../../chain"
import { useEdits } from "../../edits"
import { Actions, type Action } from "../../ui/Actions"
import { Chip, FamilyIcon } from "../../ui/Identity"
import { Container } from "../../ui/Section"
import { type Col, BesideLink, DataTable, FollowLink, RowNote, ago, day, h1Of, n, toast, undoable, usePersisted, useTick } from "./shared"

/** A related list stops needing a jump to find something once it has a search in it (rule 4). */
const SEARCH_OVER = 10

/** The seed stores a filter field as its column name; a person reads it in words. */
const FIELD_LABEL: Record<string, string> = {
  stage: "Stage", title: "Title", industry: "Industry", employees: "Employees",
  emailStatus: "Email status", inSequence: "In a sequence", lastActivity: "Last activity",
}
const fieldLabel = (f: string) => FIELD_LABEL[f] ?? f

export function ListRecord({ session, id }: { session: Session; id?: string }) {
  const d = useDisclosure("lists")
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  const { lists, sequences } = useEngage(session.business)
  const list = lists.find((l) => l.id === id) ?? lists[0]

  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(list?.name ?? "")
  const [editingFilters, setEditingFilters] = useState(false)
  const [adding, setAdding] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [status, setStatus] = useState<string | null>(null)
  // The members are found inside the list, whatever the count: over ten rows the search appears, and
  // it never becomes a reason to leave for People (rule 4).
  const [memberQ, setMemberQ] = useState("")
  // What actions took on these people this session, so a row shows the effect of a pane action at
  // once, where it was caused (chain rule 8). Opening a pane writes nothing here.
  const personEdits = useEdits("person")
  useTick(Object.values(personEdits).some(undoable))
  const [sort, setSort] = usePersisted<{ key: string; dir: "asc" | "desc" }>(
    `ollopa.list.members.sort.${session.user}`, { key: "added", dir: "desc" },
  )

  if (!list) {
    return (
      <div className="p-10">
        <EmptyState title="That list is gone" body="It may have been deleted. The people stay in People." action={<Button size="sm" onClick={() => navigate("/ollopa/lists")}>Back to Lists</Button>} />
      </div>
    )
  }

  const people = membersOf(list, session.business)
  const companies = companyMembersOf(list, session.business)
  const count = list.memberIds.length
  const needle = memberQ.trim().toLowerCase()
  const shownPeople = needle
    ? people.filter((c) => `${c.name} ${c.company} ${c.title} ${c.email}`.toLowerCase().includes(needle))
    : people
  const shownCompanies = needle
    ? companies.filter((c) => `${c.name} ${c.industry}`.toLowerCase().includes(needle))
    : companies
  /** Where the page and the crumb agree about what this page is called. */
  const origin = { route: `/ollopa/lists/${list.id}`, title: h1Of("lists", list.name) }
  // The same split the enrol panel will run, so the line on the page and the line in the panel agree.
  const enrolable = splitForEnrol(people).adding
  const credits = enrolCredits(enrolable)
  const doubled = alreadyInASequence(enrolable).length
  const watch = agentWatch(list, session.business)
  const hasCampaigns = b.counts.campaigns > 0
  const isOwner = list.owner === session.user || session.role === "admin"

  const say = (msg: string) => { setStatus(msg); toast(msg) }

  /* ------------------------------------------------------------------------------ the members */

  const peopleColumns: Col<Contact>[] = [
    {
      key: "name", header: "Name", primary: true, sort: (a, c) => a.name.localeCompare(c.name),
      cell: (c) => {
        const edit = personEdits[c.id]
        return (
          <div className="min-w-0">
            <BesideLink className="font-medium hover:underline" kind="person" id={c.id} list={walkPeople(c.id)}>{c.name}</BesideLink>
            <div className="t-small text-muted-foreground">{c.title}</div>
            {edit?.note && <RowNote kind="person" id={c.id} note={String(edit.note)} at={edit.at} />}
          </div>
        )
      },
    },
    { key: "company", header: "Company", phone: true, cell: (c) => c.company, sort: (a, c) => a.company.localeCompare(c.company) },
    {
      key: "email", header: "Email", cell: (c) => (
        <div className="min-w-0">
          <div className="truncate text-xs">{c.email}</div>
          <Chip status={c.emailStatus} />
        </div>
      ),
    },
    { key: "stage", header: "Stage", phone: true, cell: (c) => <Chip status={c.stage} /> },
    {
      key: "sequence", header: "Sequence", cell: (c) => {
        const now = personEdits[c.id]?.sequence
        const inSeq = now === undefined ? c.inSequence : String(now)
        return inSeq
          ? <span className="t-small">{inSeq} <Chip status="warning">already in a sequence</Chip></span>
          : <span className="text-muted-foreground">—</span>
      },
    },
    { key: "added", header: "Added", className: "tabular-nums", sort: (a, c) => a.addedOn.localeCompare(c.addedOn), cell: (c) => <div><div>{day(c.addedOn)}</div><div className="t-small text-muted-foreground">by {list.owner}</div></div> },
    { key: "activity", header: "Last activity", className: "tabular-nums", sort: (a, c) => a.lastActivity.localeCompare(c.lastActivity), cell: (c) => ago(c.lastActivity) },
  ]

  const companyColumns: Col<Company>[] = [
    { key: "name", header: "Company", primary: true, sort: (a, c) => a.name.localeCompare(c.name), cell: (c) => <BesideLink className="font-medium hover:underline" kind="company" id={c.id} list={walkCompanies(c.id)}>{c.name}</BesideLink> },
    { key: "industry", header: "Industry", phone: true, cell: (c) => c.industry },
    { key: "employees", header: "Employees", className: "tabular-nums", sort: (a, c) => a.employees - c.employees, cell: (c) => n(c.employees) },
    { key: "contacts", header: "Contacts", className: "tabular-nums", phone: true, sort: (a, c) => a.contacts - c.contacts, cell: (c) => n(c.contacts) },
    { key: "stage", header: "Stage", cell: (c) => <Chip status={c.stage} /> },
    { key: "added", header: "Added", className: "tabular-nums", sort: (a, c) => a.addedOn.localeCompare(c.addedOn), cell: (c) => day(c.addedOn) },
  ]

  // The order on screen, not the order in the data: `[` and `]` in the pane walk what the person is
  // looking at. `DataTable` sorts with the same comparator, so this changes no row's position.
  const inOrder = <T,>(rows: T[], columns: Col<T>[]) => {
    const by = columns.find((c) => c.key === sort.key)?.sort
    if (!by) return rows
    const out = [...rows].sort(by)
    return sort.dir === "desc" ? out.reverse() : out
  }
  const walkPeople = (id: string) => {
    const ids = inOrder(shownPeople, peopleColumns).map((c) => c.id)
    return { ids, index: Math.max(0, ids.indexOf(id)) }
  }
  const walkCompanies = (id: string) => {
    const ids = inOrder(shownCompanies, companyColumns).map((c) => c.id)
    return { ids, index: Math.max(0, ids.indexOf(id)) }
  }

  /** A look, beside the list. The list stays where it is. */
  const openPerson = (c: Contact, opener?: HTMLElement | null) =>
    openBeside({ kind: "person", id: c.id, list: walkPeople(c.id), opener: opener ?? (document.activeElement as HTMLElement | null) })
  const openCompany = (c: Company, opener?: HTMLElement | null) =>
    openBeside({ kind: "company", id: c.id, list: walkCompanies(c.id), opener: opener ?? (document.activeElement as HTMLElement | null) })

  /** The whole record, with this list and this row kept on the trail. */
  const openPersonPage = (c: Contact) => follow(`/ollopa/people/${c.id}`, { ...origin, anchor: c.id })
  const openCompanyPage = (c: Company) => follow(`/ollopa/companies/${c.id}`, { ...origin, anchor: c.id })

  const removeMember = (memberId: string, label: string) => {
    engage.patchList(session.business, list.id, { memberIds: list.memberIds.filter((m) => m !== memberId) })
    say(`${label} removed from ${list.name}`)
  }

  const memberMenu = (c: Contact) => [
    { label: "Open beside this list", onClick: () => openPerson(c) },
    { label: "Open the person's page", onClick: () => openPersonPage(c) },
    { label: "Add to a sequence", onClick: () => setEnrolling(true) },
    { label: "Call", onClick: () => say(`Call task created for ${c.name}`) },
    { label: `Enrich · ${CREDITS.enrich} credits`, onClick: () => say(`Enriched ${c.name} · ${CREDITS.enrich} credits`) },
    { label: "Set stage", onClick: () => say(`Stage for ${c.name}: choose one`) },
    { label: "Assign owner", onClick: () => say(`Owner for ${c.name}: choose one`) },
    { label: "Create a call task", onClick: () => say(`Call task created for ${c.name}`) },
    { label: `Remove from ${list.name} · ${c.name} stays in People`, destructive: true, onClick: () => removeMember(c.id, c.name) },
  ]

  /* ----------------------------------------------------------------------------------- render */

  return (
    <DoorGroup>
      <div className="flex min-h-full flex-col">
        <header className="border-b px-4 pt-4 sm:px-6">
          <a href={href("/ollopa/lists")} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline">
            <ArrowLeft className="size-3" aria-hidden="true" />Lists
          </a>

          <div className="mt-2 flex flex-wrap items-start gap-x-3 gap-y-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {renaming && isOwner ? (
                  <Input
                    autoFocus aria-label="List name" className="t-title h-9 w-72"
                    value={name} onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { engage.patchList(session.business, list.id, { name }); setRenaming(false); say(`Renamed to ${name}`) }
                      if (e.key === "Escape") { setName(list.name); setRenaming(false) }
                    }}
                    onBlur={() => { engage.patchList(session.business, list.id, { name }); setRenaming(false) }}
                  />
                ) : (
                  <h2 className="t-section flex min-w-0 items-center gap-2 truncate">
                    <FamilyIcon of={list.kind === "people" ? "people" : "companies"} size="header" />
                    {isOwner
                      ? <button type="button" className="rounded hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" onClick={() => { setName(list.name); setRenaming(true) }}>{list.name}<span className="sr-only"> — rename</span></button>
                      : list.name}
                  </h2>
                )}
                <Chip family={list.kind === "people" ? "people" : "companies"}>{list.kind === "people" ? "People" : "Companies"}</Chip>
                <Chip family="neutral" icon={false}>{list.mode === "segment" ? "Segment" : "Static"}</Chip>
                {list.archived && <Chip status="Archived" />}
              </div>
              {/* The count and what it means as work, in one line and as plain text. */}
              <p className="mt-1 text-sm">
                {n(count)} {list.kind === "people" ? "people" : "companies"} · {touchEstimate(count, session.business)}
                {list.newThisWeek > 0 && <> · +{n(list.newThisWeek)} this week</>}
              </p>
              <p className="t-small text-muted-foreground">
                {list.owner} · {list.visibility === "everyone" ? "Everyone can see it" : "Only you can see it"} ·{" "}
                {list.mode === "segment" && list.lastRefreshed ? `last refreshed ${ago(list.lastRefreshed)}` : `updated ${ago(list.updated)}`}
                {d.level("detail.new-since") === 1 && list.newThisWeek > 0 && <> · {n(list.newThisWeek)} new since your last visit</>}
              </p>
            </div>

            {/* One filled control: the act this list exists for. Everything else is a comparable
                act, and deleting the list is last with its own confirmation (DESIGN.md §1). */}
            <div className="ml-auto flex flex-wrap items-center gap-2" data-print-hide>
              <Actions
                surface="page"
                items={[
                  list.kind === "people"
                    ? { kind: "primary", label: "Add to sequence", onClick: () => setEnrolling(true) }
                    : { kind: "primary", label: "Find people at these companies", onClick: () => follow(`/ollopa/people?companies=${list.id}`, { ...origin, anchor: "list.find-people" }) },
                  ...(hasCampaigns ? [{ kind: "secondary" as const, label: "Add to campaign", onClick: () => say(`${list.name}: pick a campaign`) }] : []),
                  ...(list.mode === "static" && isOwner
                    ? [{ kind: "secondary" as const, label: list.kind === "people" ? "Add people" : "Add companies", onClick: () => setAdding(true) }]
                    : []),
                  ...(list.mode === "segment"
                    ? [{ kind: "secondary" as const, label: "Refresh now", onClick: () => { engage.patchList(session.business, list.id, { lastRefreshed: TODAY }); say(`${list.name} refreshed · ${n(count)} match now`) } }]
                    : []),
                  { kind: "secondary", label: "Export CSV", onClick: () => say(`Exported ${list.name} · ${n(count)} rows, in the order shown`) },
                  { kind: "secondary", label: "Copy link", onClick: () => say("Link to this list copied") },
                  ...(isOwner ? [{
                    kind: "destructive" as const,
                    label: "Delete list",
                    onClick: () => { engage.deleteList(session.business, list.id); navigate("/ollopa/lists") },
                    irreversible: {
                      title: `Delete ${list.name}?`,
                      consequence: `The ${n(count)} ${list.kind === "people" ? "people stay in People" : "companies stay in Companies"} and running sequences keep their contacts. The list itself goes.`,
                      confirmLabel: "Delete the list",
                    },
                  }] : []),
                ] as Action[]}
              />
            </div>
          </div>

          {/* Decision-critical, never behind a door: what the next click spends, and who it doubles. */}
          {list.kind === "people" && (
            <p className="mt-3 text-sm tabular-nums" role="status">
              {n(enrolable.length)} can be added · {n(credits)} net-new emails = {n(credits)} credits · balance {n(seed.credits.balance)}
              {doubled > 0 && <span className="font-medium" style={{ color: "var(--warning-ink)" }}> · {n(doubled)} already in another sequence</span>}
            </p>
          )}

          {/* The standing arrangements: one line each, each with its own cost and its own off switch. */}
          <div className="mt-2 space-y-1">
            {list.feeds.filter((f) => f.auto).map((f) => (
              <StatusLine key={f.name} status="Running" word="Standing arrangement">
                New matches added to {f.name} automatically
                <Actions
                  surface="card"
                  items={[{
                    kind: "secondary",
                    label: "Turn off",
                    onClick: () => {
                      engage.patchList(session.business, list.id, { feeds: list.feeds.map((x) => (x.name === f.name ? { ...x, auto: false } : x)) })
                      say(`New matches are no longer added to ${f.name}`)
                    },
                  }]}
                />
              </StatusLine>
            ))}
            {watch && (
              <StatusLine status="Running" word="Standing arrangement">
                {watch.agent} researches new matches · about {watch.creditsEach} credits each · about {n(watch.perWeek)} credits a week
                <Actions
                  surface="card"
                  items={[{
                    kind: "secondary",
                    label: "Turn off",
                    onClick: () => { engage.patchList(session.business, list.id, { source: "manual" }); say(`${watch.agent} no longer watches ${list.name}`) },
                  }]}
                />
              </StatusLine>
            )}
          </div>

          {/* A segment is its filters: they are the object, so they are on the page (rule 6). */}
          {list.mode === "segment" && (
            <div className="mt-3">
              {editingFilters ? (
                <div className="rounded-md border p-3">
                  <h3 className="t-body font-medium">Filters</h3>
                  <div className="mt-2 space-y-2">
                    {list.filters.map((f, i) => (
                      <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="rounded border px-2 py-1">{fieldLabel(f.field)}</span>
                        <span className="text-muted-foreground">{f.op}</span>
                        <Input
                          aria-label={`${fieldLabel(f.field)} ${f.op}`} className="h-8 w-48" defaultValue={f.value}
                          onBlur={(e) => engage.patchList(session.business, list.id, {
                            filters: list.filters.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)),
                          })}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-sm tabular-nums">{n(count)} match right now</p>
                  <div className="mt-2 flex gap-2">
                    <Actions
                      surface="card"
                      items={[
                        { kind: "primary", label: "Save filters", onClick: () => { setEditingFilters(false); say(`Filters saved · ${n(count)} match`) } },
                        { kind: "secondary", label: "Cancel", onClick: () => setEditingFilters(false) },
                      ]}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                  {list.filters.map((f, i) => <span key={i} className="rounded-full border px-2 py-0.5 text-xs">{fieldLabel(f.field)} {f.op} {f.value}</span>)}
                  {list.suppressions.map((s) => <span key={s} className="rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground">excludes {s}</span>)}
                  {isOwner && <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => setEditingFilters(true)}>Edit filters</Button>}
                </div>
              )}
              <div className="mt-2">
                <Door id="list.refresh" label="Refresh and alerts" defaultOpen={d.level("detail.refresh") === 1}>
                  <div className="grid gap-3 py-1 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="refresh-when" className="text-xs">Refreshes</Label>
                      <Select value={list.alert === "off" ? "daily" : list.alert} onValueChange={(v) => { engage.patchList(session.business, list.id, { alert: v as List["alert"] }); say(`${list.name} refreshes ${v}`) }}>
                        <SelectTrigger id="refresh-when" className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Every day</SelectItem>
                          <SelectItem value="weekly">Every week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="t-small text-muted-foreground">
                      <div className="text-xs text-foreground">Last refreshed</div>
                      {list.lastRefreshed ? `${day(list.lastRefreshed)} · ${ago(list.lastRefreshed)}` : "Never"}
                    </div>
                    <label className="flex items-end gap-2 pb-2 text-sm">
                      <Checkbox
                        checked={list.alert !== "off"}
                        onCheckedChange={(v) => { engage.patchList(session.business, list.id, { alert: v === true ? "weekly" : "off" }); say(v === true ? "You will be emailed when this segment gains matches" : "Alerts off") }}
                      />
                      Email me when it gains matches
                    </label>
                  </div>
                </Door>
              </div>
            </div>
          )}

          <p className="sr-only" role="status" aria-live="polite">{status}</p>
        </header>

        {/* --------------------------------------------------------------------------- members */}
        <div className="min-h-0 flex-1 space-y-3 px-4 pt-4 pb-6 sm:px-6">
          {/* The members are a table in a container, with the search that keeps them findable
              inside the record in its header (DESIGN.md §5, containment). */}
          <Container
            component="table"
            padded={false}
            heading={list.kind === "people" ? "People in this list" : "Companies in this list"}
            count={needle ? `${n(list.kind === "people" ? shownPeople.length : shownCompanies.length)} of ${n(count)} shown` : count}
            actions={<>
              {count > SEARCH_OVER && (
                <Input
                  data-page-search
                  aria-label={list.kind === "people" ? "Find a person in this list" : "Find a company in this list"}
                  placeholder={list.kind === "people" ? "Find a person" : "Find a company"}
                  className="h-9 w-48"
                  value={memberQ} onChange={(e) => setMemberQ(e.target.value)}
                />
              )}
              <ExpandAll />
            </>}
          >
          {list.kind === "people" ? (
            <DataTable<Contact>
              rows={shownPeople}
              rowKey={(c) => c.id}
              columns={peopleColumns}
              sortKey={sort.key}
              sortDir={sort.dir}
              onSort={(k, dir) => setSort({ key: k, dir })}
              rowActions={[{ label: () => "Add to sequence", onClick: () => setEnrolling(true) }]}
              menu={memberMenu}
              menuLabel={(c) => c.name}
              onOpen={(c) => openPerson(c)}
              selection={{
                selected, onChange: setSelected,
                bar: (ids) => (
                  <>
                    <Actions
                      surface="card"
                      items={[
                        { kind: "secondary", label: "Add to sequence", onClick: () => setEnrolling(true) },
                        { kind: "secondary", label: "Export CSV", onClick: () => say(`Exported ${n(ids.length)} rows`) },
                        { kind: "secondary", label: `Enrich ${n(ids.length)}`, cost: `${n(enrichCredits(ids.length))} credits`, onClick: () => say(`Enriched ${n(ids.length)} people · ${n(enrichCredits(ids.length))} credits`) },
                        { kind: "secondary", label: "Set stage", onClick: () => say(`Stage set for ${n(ids.length)} people`) },
                        { kind: "secondary", label: "Assign owner", onClick: () => say(`Owner assigned for ${n(ids.length)} people`) },
                        { kind: "secondary", label: "Create call tasks", onClick: () => say(`${n(ids.length)} call tasks created`) },
                        { kind: "secondary", label: "Set a custom field", onClick: () => say(`Custom field set for ${n(ids.length)} people`) },
                        { kind: "secondary", label: "Merge duplicates", onClick: () => say("No duplicates found in this list") },
                        {
                          kind: "destructive",
                          label: `Remove ${n(ids.length)}`,
                          onClick: () => {
                            engage.patchList(session.business, list.id, { memberIds: list.memberIds.filter((m) => !ids.includes(m)) })
                            setSelected([]); say(`${n(ids.length)} removed from ${list.name}`)
                          },
                          irreversible: {
                            title: `Remove ${n(ids.length)} from ${list.name}?`,
                            consequence: "They stay in People and in any sequence they are running. Only this list changes.",
                            confirmLabel: `Remove ${n(ids.length)}`,
                          },
                        },
                      ]}
                    />
                  </>
                ),
              }}
              empty={
                needle
                  ? <EmptyState title={`Nobody in this list matches "${memberQ}"`} body="Clear the search to see everyone in the list again." action={<Button size="sm" variant="outline" onClick={() => setMemberQ("")}>Clear the search</Button>} />
                : list.mode === "segment"
                  ? <EmptyState title="No one matches these filters right now" body="Widen a filter or wait for the next refresh." action={<Button size="sm" onClick={() => setEditingFilters(true)}>Edit filters</Button>} />
                  : <EmptyState title="Nobody in this list yet" body="Add people from People, from a search, or from a CSV." action={<Button size="sm" onClick={() => setAdding(true)}>Add people</Button>} />
              }
            />
          ) : (
            <DataTable<Company>
              rows={shownCompanies}
              rowKey={(c) => c.id}
              columns={companyColumns}
              sortKey={sort.key}
              sortDir={sort.dir}
              onSort={(k, dir) => setSort({ key: k, dir })}
              rowActions={[{ label: () => "Find people here", onClick: (c) => openCompany(c) }]}
              menu={(c) => [
                { label: "Open the company beside this list", onClick: () => openCompany(c) },
                { label: "Open the company page", onClick: () => openCompanyPage(c) },
                { label: `Remove from ${list.name} · ${c.name} stays in Companies`, destructive: true, onClick: () => removeMember(c.id, c.name) },
              ]}
              menuLabel={(c) => c.name}
              onOpen={(c) => openCompany(c)}
              selection={{
                selected, onChange: setSelected,
                bar: (ids) => (
                  <>
                    <Actions
                      surface="card"
                      items={[
                        { kind: "secondary", label: "Export CSV", onClick: () => say(`Exported ${n(ids.length)} rows`) },
                        {
                          kind: "destructive",
                          label: `Remove ${n(ids.length)}`,
                          onClick: () => {
                            engage.patchList(session.business, list.id, { memberIds: list.memberIds.filter((m) => !ids.includes(m)) })
                            setSelected([]); say(`${n(ids.length)} removed from ${list.name}`)
                          },
                          irreversible: {
                            title: `Remove ${n(ids.length)} from ${list.name}?`,
                            consequence: "They stay in Companies. Only this list changes.",
                            confirmLabel: `Remove ${n(ids.length)}`,
                          },
                        },
                      ]}
                    />
                  </>
                ),
              }}
              empty={needle
                ? <EmptyState title={`No company in this list matches "${memberQ}"`} body="Clear the search to see every company in the list again." action={<Button size="sm" variant="outline" onClick={() => setMemberQ("")}>Clear the search</Button>} />
                : <EmptyState title="No companies in this list yet" body="Add them from Companies or from a search." />}
            />
          )}
          </Container>

          <Container component="section" as="div" padded={false} bodyClassName="px-4 pb-3">
            <Door id="list.history" label="History" count={list.history.length} defaultOpen={d.level("detail.history") === 1}>
              <ul className="space-y-1 py-1">
                {list.history.map((h, i) => (
                  <li key={i} className="grid grid-cols-[6rem_8rem_1fr] gap-2 text-xs">
                    <span className="tabular-nums text-muted-foreground">{day(h.when)}</span>
                    <span className="text-muted-foreground">{h.who}</span>
                    <span>{h.what}</span>
                  </li>
                ))}
              </ul>
            </Door>
          </Container>
        </div>

        {/* ---------------------------------------------------------------------- the two panels */}
        <AddMembersPanel
          open={adding}
          onOpenChange={setAdding}
          list={list}
          session={session}
          onAdd={(ids, capPerCompany) => {
            engage.patchList(session.business, list.id, { memberIds: [...new Set([...list.memberIds, ...ids])] })
            say(`Added ${n(ids.length)} to ${list.name}${capPerCompany ? ` · at most ${capPerCompany} per company` : ""}`)
          }}
        />

        {enrolling && (
          <AddToSequencePanel
            open
            onOpenChange={setEnrolling}
            business={session.business}
            user={session.user}
            people={selected.length > 0 ? people.filter((c) => selected.includes(c.id)) : people}
            sequences={sequences.filter((s) => s.status !== "Draft")}
            from={list.name}
          />
        )}
      </div>
    </DoorGroup>
  )
}

/** `X-listadd`: the People table over the list, so the list it is filling stays in view. */
function AddMembersPanel({ open, onOpenChange, list, session, onAdd }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  list: List
  session: Session
  onAdd: (ids: string[], capPerCompany: number | null) => void
}) {
  const seed = seedFor(session.business)
  const [q, setQ] = useState("")
  const [stage, setStage] = useState("all")
  const [cap, setCap] = useState("all")
  const [picked, setPicked] = useState<string[]>([])

  const pool = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const rows = (list.kind === "people" ? seed.contacts : seed.companies)
      .filter((r) => !list.memberIds.includes(r.id))
      .filter((r) => (needle ? `${r.name} ${"company" in r ? r.company : r.industry}`.toLowerCase().includes(needle) : true))
      .filter((r) => (stage === "all" ? true : r.stage === stage))
    if (cap === "all" || list.kind !== "people") return rows.slice(0, 60)
    const perCompany = new Map<string, number>()
    const limit = Number(cap)
    return rows.filter((r) => {
      const key = "companyId" in r ? r.companyId : r.id
      const at = perCompany.get(key) ?? 0
      if (at >= limit) return false
      perCompany.set(key, at + 1)
      return true
    }).slice(0, 60)
  }, [seed, list, q, stage, cap])

  return (
    <Panel
      id="list-add"
      title={list.kind === "people" ? `Add people to ${list.name}` : `Add companies to ${list.name}`}
      open={open}
      onOpenChange={onOpenChange}
      footer={
        <Button className="w-full" disabled={picked.length === 0} onClick={() => { onAdd(picked, cap === "all" ? null : Number(cap)); setPicked([]); onOpenChange(false) }}>
          Add {n(picked.length)} to {list.name}
        </Button>
      }
    >
      <div className="flex flex-wrap gap-2">
        <Input aria-label="Search people" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} className="w-40" />
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-36" aria-label="Stage"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Stage: all</SelectItem>
            {[...new Set((list.kind === "people" ? seed.contacts : seed.companies).map((r) => r.stage))].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {list.kind === "people" && (
          <Select value={cap} onValueChange={setCap}>
            <SelectTrigger className="w-44" aria-label="Max people per company"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any number per company</SelectItem>
              <SelectItem value="1">1 per company</SelectItem>
              <SelectItem value="3">3 per company</SelectItem>
              <SelectItem value="5">5 per company</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <ul className="mt-3 divide-y border-t">
        {pool.map((r) => (
          <li key={r.id}>
            <label className="flex cursor-pointer items-center gap-2 py-2">
              <Checkbox
                checked={picked.includes(r.id)}
                onCheckedChange={() => setPicked((p) => (p.includes(r.id) ? p.filter((x) => x !== r.id) : [...p, r.id]))}
              />
              <span className="min-w-0">
                <span className="block text-sm">{r.name}</span>
                <span className="block text-xs text-muted-foreground">{"company" in r ? `${r.title} · ${r.company}` : `${r.industry} · ${n(r.employees)} people`}</span>
              </span>
            </label>
          </li>
        ))}
        {pool.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Nothing matches. Clear the search or a filter.</li>}
      </ul>
    </Panel>
  )
}
