// Templates and snippets (`P-templates`): copy written once and used in many places, so an object
// with a page rather than a paste buffer.
//
// No profile puts this page in a sidebar. It is reached from the step that uses it, from a campaign,
// from ⌘K and by deep link — a tenth sidebar entry for a weekly task is disclosure debt in the other
// direction (IA-MAP 6.4h). "Used by" is a column, not a hover, because it is what a person needs
// before they edit copy other people receive.
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { navigate } from "@/app/router"
import { follow } from "../../chain"
import { EmptyState } from "../../ui/EmptyState"
import { businessById } from "../../data/businesses"
import { seedFor } from "../../data/seed"
import type { Business } from "../../usage/model"
import type { Session } from "../../session"
import { Chip, FamilyIcon } from "../../ui/Identity"
import { Container } from "../../ui/Surface"
import { type Col, DataTable, RowOpen, ago, day, focusSearch, h1Of, moveRow, n, toast, useKeys, usePersisted } from "./shared"

/** One row of the page: a template or the snippet a template nests. Both are copy with users. */
export interface CopyRow {
  id: string
  kind: "Template" | "Snippet"
  name: string
  folder: string
  owner: string
  subject: string
  body: string
  variables: string[]
  snippetIds: string[]
  usedBySteps: { id: string; sequenceId: string; sequenceName: string; order: number }[]
  usedByCampaigns: { id: string; name: string }[]
  usedByTemplates: { id: string; name: string }[]
  lastUsed: string
  updated: string
}

export function copyRows(business: Business): CopyRow[] {
  const seed = seedFor(business)
  const steps = seed.sequenceSteps
  const seqName = (id: string) => seed.sequences.find((s) => s.id === id)?.name ?? id

  const templates: CopyRow[] = seed.templates.map((t) => {
    const usedBySteps = steps.filter((s) => s.templateId === t.id)
      .map((s) => ({ id: s.id, sequenceId: s.sequenceId, sequenceName: seqName(s.sequenceId), order: s.order }))
    // The seed has no `campaign.templateId` yet, so a campaign counts as a use when it sends this
    // subject line. The data owner has the field in the reply; this reads it when it lands.
    const usedByCampaigns = seed.campaigns.filter((c) => c.subject === t.subject).map((c) => ({ id: c.id, name: c.name }))
    const lastUsed = usedBySteps
      .map((s) => seed.sequences.find((x) => x.id === s.sequenceId)?.updatedAt ?? t.updatedAt)
      .sort()
      .reverse()[0] ?? t.updatedAt
    return {
      id: t.id, kind: "Template", name: t.name, folder: t.folder, owner: t.owner, subject: t.subject,
      body: t.body, variables: t.variables, snippetIds: t.snippets,
      usedBySteps, usedByCampaigns, usedByTemplates: [], lastUsed, updated: t.updatedAt,
    }
  })

  const snippets: CopyRow[] = seed.snippets.map((s) => ({
    id: s.id, kind: "Snippet", name: s.name, folder: s.folder, owner: s.owner, subject: "",
    body: s.body, variables: s.variables, snippetIds: [],
    usedBySteps: [], usedByCampaigns: [],
    usedByTemplates: seed.templates.filter((t) => t.snippets.includes(s.id)).map((t) => ({ id: t.id, name: t.name })),
    lastUsed: seed.templates.find((t) => t.snippets.includes(s.id))?.updatedAt ?? "",
    updated: seed.templates.find((t) => t.snippets.includes(s.id))?.updatedAt ?? "",
  }))

  return [...templates, ...snippets]
}

export function usedByLine(row: CopyRow): string {
  const parts: string[] = []
  if (row.usedBySteps.length) parts.push(`${n(row.usedBySteps.length)} ${row.usedBySteps.length === 1 ? "step" : "steps"}`)
  if (row.usedByCampaigns.length) parts.push(`${n(row.usedByCampaigns.length)} ${row.usedByCampaigns.length === 1 ? "campaign" : "campaigns"}`)
  if (row.usedByTemplates.length) parts.push(`${n(row.usedByTemplates.length)} ${row.usedByTemplates.length === 1 ? "template" : "templates"}`)
  return parts.length ? parts.join(" · ") : "Nothing yet"
}

export function TemplatesPage({ session }: { session: Session }) {
  const b = businessById(session.business)
  const rowsAll = useMemo(() => copyRows(session.business), [session.business])

  const key = (name: string) => `ollopa.templates.${name}.${session.user}`
  const [q, setQ] = useState("")
  const [folder, setFolder] = usePersisted(key("folder"), "all")
  const [owner, setOwner] = usePersisted(key("owner"), "all")
  const [sort, setSort] = usePersisted<{ key: string; dir: "asc" | "desc" }>(key("sort"), { key: "lastUsed", dir: "desc" })

  const folders = [...new Set(rowsAll.map((r) => r.folder))]

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rowsAll.filter((r) => {
      if (needle && !`${r.name} ${r.subject} ${r.body}`.toLowerCase().includes(needle)) return false
      if (folder !== "all" && r.folder !== folder) return false
      if (owner === "Mine" && r.owner !== session.user) return false
      if (owner !== "all" && owner !== "Mine" && r.owner !== owner) return false
      return true
    })
  }, [rowsAll, q, folder, owner, session.user])

  // A row opens its record along the trail, with the row as the anchor: the record's
  // "← Templates" and the crumb both come back to this row, lit.
  const open = (r: CopyRow) =>
    follow(`/ollopa/templates/${r.id}`, { route: "/ollopa/templates", title: h1Of("templates"), anchor: r.id })

  const columns: Col<CopyRow>[] = [
    {
      key: "name", header: "Template", primary: true, sort: (a, c) => a.name.localeCompare(c.name),
      cell: (r) => (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <RowOpen to={`/ollopa/templates/${r.id}`} onOpen={() => open(r)}>{r.name}</RowOpen>
            <Chip family="templates" icon={false}>{r.kind}</Chip>
          </div>
          <div className="t-small text-muted-foreground">{r.folder}</div>
        </div>
      ),
    },
    { key: "owner", header: "Owner", cell: (r) => r.owner, sort: (a, c) => a.owner.localeCompare(c.owner) },
    { key: "lastUsed", header: "Last used", className: "tabular-nums", phone: true, sort: (a, c) => a.lastUsed.localeCompare(c.lastUsed), cell: (r) => (r.lastUsed ? ago(r.lastUsed) : "Never") },
    { key: "usedBy", header: "Used by", phone: true, cell: (r) => usedByLine(r) },
    { key: "updated", header: "Updated", className: "tabular-nums", sort: (a, c) => a.updated.localeCompare(c.updated), cell: (r) => (r.updated ? day(r.updated) : "—") },
  ]

  useKeys(useMemo(() => [
    { keys: "/", label: "Search templates", run: focusSearch },
    { keys: "j", label: "Next template", run: () => moveRow(1) },
    { keys: "k", label: "Previous template", run: () => moveRow(-1) },
  ], []))

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-5 sm:px-6">
        <div>
          <h2 className="t-title flex items-center gap-2">
            <FamilyIcon of="templates" size="header" />
            Templates and snippets
          </h2>
        </div>
        <Button onClick={() => toast("New template · name it, then write the subject and body")}>New template</Button>
      </div>

      {/* The table lives in a container: its toolbar and its count in the header (DESIGN.md §5,
          containment). The phone cards are the same container's body at that width. */}
      <div className="mt-3 min-h-0 flex-1 overflow-auto px-4 pb-6 sm:px-6">
        <Container
          component="table"
          padded={false}
          heading="Templates and snippets"
          count={`${n(rows.length)} shown of ${n(rowsAll.length)}`}
          actions={<>
            <Input
              data-page-search aria-label="Search templates by name or body text" placeholder="Search name and body"
              value={q} onChange={(e) => setQ(e.target.value)} className="w-64"
            />
            <Select value={folder} onValueChange={setFolder}>
              <SelectTrigger className="w-40" aria-label="Folder"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Folder: all</SelectItem>
                {folders.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={owner} onValueChange={setOwner}>
              <SelectTrigger className="w-48" aria-label="Owner"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Mine">Owner: mine</SelectItem>
                <SelectItem value="all">Owner: everyone</SelectItem>
                {b.roles.map((r) => <SelectItem key={r.user} value={r.user}>{r.user}</SelectItem>)}
              </SelectContent>
            </Select>
          </>}
        >
        <DataTable<CopyRow>
          rows={rows}
          rowKey={(r) => r.id}
          columns={columns}
          sortKey={sort.key}
          sortDir={sort.dir}
          onSort={(k, dir) => setSort({ key: k, dir })}
          rowActions={[{ label: () => "Open", onClick: open }]}
          menu={(r) => [
            { label: "Duplicate", onClick: () => toast(`Duplicated ${r.name}`) },
            { label: "Rename", onClick: () => open(r) },
            { label: "Move to folder", onClick: () => toast(`${r.name}: choose a folder`) },
            {
              label: r.usedBySteps.length
                ? `Archive · used by ${n(r.usedBySteps.length)} steps`
                : "Archive",
              destructive: true,
              onClick: () => toast(`${r.name} archived · ${n(r.usedBySteps.length)} steps keep the text they have today`),
            },
          ]}
          menuLabel={(r) => r.name}
          onOpen={open}
          empty={<EmptyState title="No templates yet" body="Write one here, or save a step's copy as a template from the step that uses it." />}
        />
        </Container>
      </div>
    </div>
  )
}
