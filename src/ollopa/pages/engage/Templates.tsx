// Templates and snippets (`P-templates`): copy written once and used in many places, so an object
// with a page rather than a paste buffer.
//
// No profile puts this page in a sidebar. It is reached from the step that uses it, from a campaign,
// from ⌘K and by deep link — a tenth sidebar entry for a weekly task is disclosure debt in the other
// direction (IA-MAP 6.4h). "Used by" is a column, not a hover, because it is what a person needs
// before they edit copy other people receive.
import { useMemo, useState } from "react"
import { navigate } from "@/app/router"
import { follow } from "../../chain"
import { EmptyState } from "../../ui/EmptyState"
import { businessById } from "../../data/businesses"
import { seedFor } from "../../data/seed"
import type { Business } from "../../usage/model"
import type { Session } from "../../session"
import { IndexPage, type FilterBarProps, type IndexColumn } from "../../layouts"
import { Chip } from "../../ui/Identity"
import { RowMenuButton, RowOpen, ago, day, focusSearch, h1Of, moveRow, n, toast, useKeys, usePersisted } from "./shared"

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
  const [cols, setCols] = usePersisted(key("cols"), { owner: true, lastUsed: true, usedBy: true, updated: true })

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

  // The name, its kind and its folder are the template's first cell; these sit beside them.
  const columns: IndexColumn<CopyRow>[] = ([
    { key: "owner", header: "Owner", priority: 2, cell: (r) => r.owner, sort: (a, c) => a.owner.localeCompare(c.owner) },
    { key: "lastUsed", header: "Last used", numeric: true, priority: 1, sort: (a, c) => a.lastUsed.localeCompare(c.lastUsed), cell: (r) => (r.lastUsed ? ago(r.lastUsed) : "Never") },
    { key: "usedBy", header: "Used by", priority: 1, cell: (r) => usedByLine(r) },
    { key: "updated", header: "Updated", numeric: true, priority: 3, sort: (a, c) => a.updated.localeCompare(c.updated), cell: (r) => (r.updated ? day(r.updated) : "—") },
  ] as IndexColumn<CopyRow>[]).filter((c) => cols[c.key as keyof typeof cols])

  useKeys(useMemo(() => [
    { keys: "/", label: "Search templates", run: focusSearch },
    { keys: "j", label: "Next template", run: () => moveRow(1) },
    { keys: "k", label: "Previous template", run: () => moveRow(-1) },
  ], []))

  /** The filtering pattern (LAYOUTS.md §2). Data only: the pattern draws every control. */
  const filters: FilterBarProps = {
    search: { value: q, onChange: setQ },
    filters: [
      { kind: "one", name: "Folder", value: folder, onChange: setFolder, options: folders.map((f) => ({ value: f, label: f })) },
      {
        kind: "one", name: "Owner", value: owner, onChange: setOwner,
        options: [{ value: "Mine", label: "mine" }, ...b.roles.map((r) => ({ value: r.user, label: r.user }))],
      },
    ],
    display: {
      columns: ([["owner", "Owner"], ["lastUsed", "Last used"], ["usedBy", "Used by"], ["updated", "Updated"]] as const)
        .map(([id, label]) => ({ id, label, on: cols[id] })),
      onColumns: (ids) => setCols({
        owner: ids.includes("owner"), lastUsed: ids.includes("lastUsed"),
        usedBy: ids.includes("usedBy"), updated: ids.includes("updated"),
      }),
    },
    count: { shown: rows.length, total: rowsAll.length, noun: "templates" },
    doorId: "templates",
  }

  return (
    <IndexPage<CopyRow>
      family="templates"
      title="Templates and snippets"
      count={rowsAll.length}
      actions={[{ kind: "primary", label: "New template", onClick: () => toast("New template · name it, then write the subject and body") }]}
      filters={filters}
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      // Clicking the name opens the template beside the page; the page itself is on the "…".
      beside={(r) => ({ kind: "template", id: r.id })}
      nameHeader="Template"
      nameSort={(a, c) => a.name.localeCompare(c.name)}
      sort={sort}
      onSort={(k, dir) => setSort({ key: k, dir })}
      name={(r) => (
        <>
          <RowOpen to={`/ollopa/templates/${r.id}`} onOpen={() => open(r)}>{r.name}</RowOpen>
          <Chip family="templates" icon={false}>{r.kind}</Chip>
          <span className="t-small text-muted-foreground">{r.folder}</span>
        </>
      )}
      menu={(r) => (
        <RowMenuButton
          label={r.name}
          actions={[{ label: "Open the page", onClick: () => open(r) }]}
          items={[
            { label: "Duplicate", onClick: () => toast(`Duplicated ${r.name}`) },
            { label: "Rename", onClick: () => open(r) },
            { label: "Move to folder", onClick: () => toast(`${r.name}: choose a folder`) },
            {
              label: r.usedBySteps.length ? `Archive · used by ${n(r.usedBySteps.length)} steps` : "Archive",
              destructive: true,
              onClick: () => toast(`${r.name} archived · ${n(r.usedBySteps.length)} steps keep the text they have today`),
            },
          ]}
        />
      )}
      rowProps={(r) => ({ "data-item": r.id, "data-item-label": r.name, "data-row-key": r.id })}
      empty={rowsAll.length === 0 ? (
        <EmptyState title="No templates yet" body="Write one here, or save a step's copy as a template from the step that uses it." />
      ) : undefined}
    />
  )
}
