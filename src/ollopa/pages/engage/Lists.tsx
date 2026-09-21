// Lists (`P-lists`): static lists and segments, the groups that are about to be acted on.
//
// Two kinds of group, one page. A static list holds exactly who was put in it; a segment is a saved
// set of filters whose members are whoever matches now — and which can keep enrolling people on its
// own. The row carries the mode, so the difference is read, never learned.
//
// What sits on the surface is asked of the usage model (`usage/lists.ts`), never hard-coded: the SDR
// gets Add to sequence on the row, the marketer gets Add to campaign, Halyard's agency seats also get
// Export and Duplicate, and the Meridian admin gets the row and the criticals and nothing else.
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { navigate } from "@/app/router"
import { Door, DoorGroup } from "../../ui/Door"
import { EmptyState } from "../../ui/EmptyState"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { seedFor, type List } from "../../data/seed"
import type { Session } from "../../session"
import { engage, useEngage } from "./store"
import { membersOf } from "./facts"
import { AddToSequencePanel } from "./AddToSequence"
import { follow } from "../../chain"
import { type Col, DataTable, Pill, RowOpen, day, focusSearch, h1Of, moveRow, n, toast, usePersisted, useKeys } from "./shared"

/** What "New list" opens: three choices, each with one sentence saying what it does. */
const KINDS_OF_LIST = [
  // The label is the whole of the choice: what each kind does is in its name, not under it.
  { id: "static", label: "Static list · frozen members" },
  { id: "segment", label: "Segment · keeps matching" },
  { id: "csv", label: "Import CSV" },
]

export function ListsPage({ session }: { session: Session }) {
  const d = useDisclosure("lists")
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  const { lists } = useEngage(session.business)
  const hasCampaigns = b.counts.campaigns > 0

  const key = (name: string) => `ollopa.lists.${name}.${session.user}`
  const [q, setQ] = useState("")
  const [kind, setKind] = usePersisted(key("kind"), "all")
  // The admin's week is the team's lists, so the owner filter starts on Team for that seat.
  const [owner, setOwner] = usePersisted(key("owner"), session.role === "admin" ? "Team" : "all")
  const [mode, setMode] = usePersisted(key("mode"), "all")
  const [source, setSource] = usePersisted(key("source"), "all")
  const [archived, setArchived] = usePersisted(key("archived"), false)
  const [sort, setSort] = usePersisted<{ key: string; dir: "asc" | "desc" }>(key("sort"), { key: "updated", dir: "desc" })
  const [cols, setCols] = usePersisted(key("cols"), {
    visibility: d.level("lists.col.visibility") === 1,
    source: d.level("lists.col.source") === 1,
    created: d.level("lists.col.created") === 1,
  })

  const [chooser, setChooser] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [enrolling, setEnrolling] = useState<List | null>(null)
  const [confirming, setConfirming] = useState<List | null>(null)
  const [undo, setUndo] = useState<{ id: string; name: string } | null>(null)

  const activeInDoor = [mode !== "all", source !== "all", archived].filter(Boolean).length

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return lists.filter((l) => {
      if (!archived && l.archived) return false
      if (needle && !`${l.name} ${l.owner}`.toLowerCase().includes(needle)) return false
      if (kind !== "all" && l.kind !== kind) return false
      if (owner === "Mine" && l.owner !== session.user) return false
      if (owner !== "all" && owner !== "Mine" && owner !== "Team" && l.owner !== owner) return false
      if (mode !== "all" && l.mode !== mode) return false
      if (source !== "all" && l.source !== source) return false
      return true
    })
  }, [lists, q, kind, owner, mode, source, archived, session.user])

  // A row opens its record along the trail, with the row as the anchor: the record's
  // "← Lists" and the crumb both come back to this row, lit.
  const open = (l: List) =>
    follow(`/ollopa/lists/${l.id}`, { route: "/ollopa/lists", title: h1Of("lists"), anchor: l.id })

  /* The row's visible actions come from the usage numbers, not from a list of names: the actions this
     seat touches often enough to be worth a click, most-used first. Everything stays in the menu. */
  const rowActionIds = [
    { id: "lists.row.add-to-sequence", label: (l: List) => (l.kind === "companies" ? "Find people at these companies" : "Add to sequence") },
    ...(hasCampaigns ? [{ id: "lists.row.add-to-campaign", label: () => "Add to campaign" }] : []),
    { id: "lists.row.export", label: () => "Export CSV" },
    { id: "lists.row.duplicate", label: () => "Duplicate" },
  ]
  const run = (id: string, l: List) => {
    switch (id) {
      case "lists.row.add-to-sequence":
        // Acting on the whole set is the one reason to leave a list, and the jump carries the
        // filter and the trail, so the crumb comes back to this row (rule 4).
        if (l.kind === "companies") follow(`/ollopa/people?companies=${l.id}`, { route: "/ollopa/lists", title: h1Of("lists"), anchor: l.id })
        else setEnrolling(l)
        return
      case "lists.row.add-to-campaign": return toast(`${l.name}: pick a campaign · ${n(l.memberIds.length)} records`)
      case "lists.row.export": return toast(`Exported ${l.name} · ${n(l.memberIds.length)} rows, in the order shown`)
      case "lists.row.duplicate": return toast(`Duplicated ${l.name}`)
    }
  }
  const visibleActions = rowActionIds
    .filter((a) => d.weekly(a.id) >= 15)
    .sort((a, b2) => d.weekly(b2.id) - d.weekly(a.id))
    .slice(0, 3)
    .map((a) => ({ label: a.label, onClick: (l: List) => run(a.id, l) }))

  const columns: Col<List>[] = [
    {
      key: "name", header: "List", primary: true, className: "min-w-[19rem]", sort: (a, b2) => a.name.localeCompare(b2.name),
      cell: (l) => (
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <RowOpen onOpen={() => open(l)}>{l.name}</RowOpen>
            <Pill tone="muted">{l.kind === "people" ? "People" : "Companies"}</Pill>
            <Pill tone={l.mode === "segment" ? "good" : "muted"}>{l.mode === "segment" ? "Segment" : "Static"}</Pill>
            {l.archived && <Pill tone="muted">Archived</Pill>}
          </div>
        </div>
      ),
    },
    {
      key: "records", header: "Records", className: "tabular-nums", phone: true,
      sort: (a, b2) => a.memberIds.length - b2.memberIds.length,
      phoneCell: (l) => <span>{n(l.memberIds.length)}{l.newThisWeek > 0 ? ` (+${n(l.newThisWeek)} this week)` : ""}</span>,
      cell: (l) => (
        <div>
          <div>{n(l.memberIds.length)}</div>
          {l.newThisWeek > 0 && <div className="text-xs text-muted-foreground">+{n(l.newThisWeek)} this week</div>}
        </div>
      ),
    },
    {
      key: "feeds", header: "Feeds", phone: true,
      cell: (l) => l.feeds.length === 0
        ? <span className="text-muted-foreground">—</span>
        : (
          <div className="space-y-0.5">
            {l.feeds.map((f) => (
              <div key={f.name} className="text-xs">
                {f.name}
                {f.auto && <span className="text-amber-700 dark:text-amber-400"> · new matches added automatically</span>}
              </div>
            ))}
          </div>
        ),
    },
    { key: "owner", header: "Owner", cell: (l) => l.owner, sort: (a, b2) => a.owner.localeCompare(b2.owner) },
    { key: "updated", header: "Updated", className: "tabular-nums", sort: (a, b2) => a.updated.localeCompare(b2.updated), cell: (l) => day(l.updated) },
    ...(cols.visibility ? [{ key: "visibility", header: "Who can see it", cell: (l: List) => (l.visibility === "everyone" ? "Everyone" : "Only me") } as Col<List>] : []),
    ...(cols.source ? [{ key: "source", header: "Source", cell: (l: List) => ({ search: "Search", csv: "CSV", agent: "Agent", manual: "By hand" }[l.source]) } as Col<List>] : []),
    ...(cols.created ? [{ key: "created", header: "Created", className: "tabular-nums", sort: (a: List, b2: List) => a.createdAt.localeCompare(b2.createdAt), cell: (l: List) => day(l.createdAt) } as Col<List>] : []),
  ]

  const menu = (l: List) => [
    { label: "Open", onClick: () => open(l) },
    ...(l.kind === "companies"
      ? [{ label: "Find people at these companies", onClick: () => run("lists.row.add-to-sequence", l) }]
      : [{ label: "Add to sequence", onClick: () => setEnrolling(l) }]),
    ...(hasCampaigns ? [{ label: "Add to campaign", onClick: () => run("lists.row.add-to-campaign", l) }] : []),
    { label: "Export CSV", onClick: () => run("lists.row.export", l) },
    { label: "Duplicate", onClick: () => run("lists.row.duplicate", l) },
    { label: "Rename", onClick: () => open(l) },
    { label: "Pin to top", onClick: () => toast(`${l.name} pinned to the top`) },
    { label: `Change who can see it · now ${l.visibility === "everyone" ? "everyone" : "only you"}`, onClick: () => {
      const next: List["visibility"] = l.visibility === "everyone" ? "me" : "everyone"
      engage.patchList(session.business, l.id, { visibility: next })
      toast(`${l.name} · ${next === "everyone" ? `everyone at ${b.name} can see it` : "only you can see it"}`)
    } },
    { label: l.mode === "segment" ? "Freeze as static · members stop changing" : "Convert to segment · members keep matching", onClick: () => {
      const next = l.mode === "segment" ? "static" : "segment"
      engage.patchList(session.business, l.id, { mode: next })
      toast(`${l.name} is now a ${next === "segment" ? "segment" : "static list"}`)
    } },
    { label: l.archived ? "Restore from the archive" : "Archive", onClick: () => {
      engage.patchList(session.business, l.id, { archived: !l.archived })
      toast(`${l.name} ${l.archived ? "restored" : "archived"}`)
    } },
    { label: `Delete list · the ${n(l.memberIds.length)} ${l.kind === "people" ? "people" : "companies"} stay in ${l.kind === "people" ? "People" : "Companies"}`, destructive: true, onClick: () => setConfirming(l) },
  ]

  useKeys(useMemo(() => [
    { keys: "/", label: "Search lists", run: focusSearch },
    { keys: "n", label: "New list", run: () => setChooser(true) },
    { keys: "j", label: "Next list", run: () => moveRow(1) },
    { keys: "k", label: "Previous list", run: () => moveRow(-1) },
    { keys: "s", label: "Add the focused list to a sequence", run: () => { const l = focused(rows); if (l) setEnrolling(l) } },
    { keys: "c", label: "Add the focused list to a campaign", run: () => { const l = focused(rows); if (l) run("lists.row.add-to-campaign", l) } },
    { keys: "e", label: "Export the focused list", run: () => { const l = focused(rows); if (l) run("lists.row.export", l) } },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [rows]))

  // Ten seconds of undo on a reversible action, as a real button on the page: a toast cannot be clicked.
  const del = (l: List) => {
    engage.deleteList(session.business, l.id)
    setConfirming(null)
    setUndo({ id: l.id, name: l.name })
    window.setTimeout(() => setUndo((u) => (u?.id === l.id ? null : u)), 10_000)
  }

  return (
    <DoorGroup>
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-end justify-between gap-3 px-4 pt-5 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold">Lists</h2>
          </div>
          <Button onClick={() => setChooser((v) => !v)} aria-expanded={chooser}>New list</Button>
        </div>

        {chooser && (
          <div className="mx-4 mt-3 rounded-lg border p-3 sm:mx-6">
            <h3 className="text-sm font-medium">New list</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {KINDS_OF_LIST.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  className="rounded-md border p-3 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={() => {
                    setChooser(false)
                    if (k.id === "csv") { navigate("/ollopa/import"); return }
                    toast(`New ${k.id === "static" ? "static list" : "segment"} · name it, then ${k.id === "static" ? "pick members" : "set filters"}`)
                  }}
                >
                  <div className="text-sm font-medium">{k.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------------- toolbar */}
        <div className="px-4 pt-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              data-page-search
              aria-label="Search lists by name or owner"
              placeholder="Search lists"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-56"
            />
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger className="w-40" aria-label="Kind"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Kind: all</SelectItem>
                <SelectItem value="people">People</SelectItem>
                <SelectItem value="companies">Companies</SelectItem>
              </SelectContent>
            </Select>
            <Select value={owner} onValueChange={setOwner}>
              <SelectTrigger className="w-48" aria-label="Owner"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Mine">Owner: mine</SelectItem>
                <SelectItem value="Team">Owner: the team</SelectItem>
                <SelectItem value="all">Owner: all</SelectItem>
                {b.roles.map((r) => <SelectItem key={r.user} value={r.user}>{r.user}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="ml-auto text-xs tabular-nums text-muted-foreground">
              {n(rows.length)} shown of {n(lists.length)}
            </span>
          </div>

          <div className="mt-2 grid gap-2 rounded-lg border sm:grid-cols-2">
            <Door id="lists.filters" label="Mode, source, archived" count={activeInDoor || undefined}>
              <div className="grid gap-3 py-1 sm:grid-cols-3">
                <div>
                  <Label htmlFor="f-mode" className="text-xs">Mode</Label>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger id="f-mode" className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="static">Static</SelectItem>
                      <SelectItem value="segment">Segment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="f-source" className="text-xs">Source</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger id="f-source" className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="search">Search</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="manual">By hand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-end gap-2 pb-2 text-sm">
                  <Checkbox checked={archived} onCheckedChange={(v) => setArchived(v === true)} />
                  Show archived lists
                </label>
              </div>
            </Door>
            <Door id="lists.columns" label="Columns: visibility, source, created">
              <div className="flex flex-wrap gap-4 py-1 text-sm">
                {([["visibility", "Who can see it"], ["source", "Source"], ["created", "Created"]] as const).map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2">
                    <Checkbox checked={cols[k]} onCheckedChange={(v) => setCols({ ...cols, [k]: v === true })} />
                    {label}
                  </label>
                ))}
              </div>
            </Door>
          </div>
        </div>

        {/* ----------------------------------------------------------------------------- table */}
        <div className="mt-3 min-h-0 flex-1 overflow-auto">
          <DataTable<List>
            rows={rows}
            rowKey={(l) => l.id}
            columns={columns}
            sortKey={sort.key}
            sortDir={sort.dir}
            onSort={(k, dir) => setSort({ key: k, dir })}
            rowActions={visibleActions}
            menu={menu}
            menuLabel={(l) => l.name}
            onOpen={open}
            selection={{
              selected,
              onChange: setSelected,
              bar: (ids) => (
                <>
                  <Button size="sm" variant="outline" onClick={() => { const first = lists.find((l) => l.id === ids[0]); if (first) setEnrolling(first) }}>
                    Add to sequence
                  </Button>
                  {hasCampaigns && <Button size="sm" variant="outline" onClick={() => toast(`${n(ids.length)} lists · pick a campaign`)}>Add to campaign</Button>}
                  <Button size="sm" variant="outline" onClick={() => toast(`Exported ${n(ids.length)} lists`)}>Export CSV</Button>
                  <Button size="sm" variant="outline" onClick={() => { ids.forEach((id) => engage.patchList(session.business, id, { archived: true })); setSelected([]); toast(`Archived ${n(ids.length)} lists`) }}>Archive</Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { ids.forEach((id) => engage.deleteList(session.business, id)); setSelected([]); toast(`Deleted ${n(ids.length)} lists · the people stay in People`) }}>
                    Delete {n(ids.length)} lists · the people stay in People
                  </Button>
                </>
              ),
            }}
            empty={
              lists.length === 0
                ? <EmptyState title="No lists yet" body="Make one from People, Companies, or here." action={<Button size="sm" onClick={() => setChooser(true)}>New list</Button>} />
                : undefined
            }
          />
        </div>

        {/* ------------------------------------------------------------- delete, with its words */}
        {confirming && (
          <div role="alertdialog" aria-label={`Delete ${confirming.name}`} className="sticky bottom-0 z-30 flex flex-wrap items-center gap-3 border-t border-destructive/40 bg-background px-4 py-3 sm:px-6">
            <p className="text-sm">
              Delete <span className="font-medium">{confirming.name}</span>. The {n(confirming.memberIds.length)}{" "}
              {confirming.kind === "people" ? "people stay in People" : "companies stay in Companies"}. Running sequences keep their contacts.
            </p>
            <Button size="sm" variant="destructive" onClick={() => del(confirming)}>Delete list</Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>Keep it</Button>
          </div>
        )}

        {undo && (
          <div role="status" className="sticky bottom-0 z-30 flex flex-wrap items-center gap-3 border-t bg-background px-4 py-2 sm:px-6">
            <span className="text-sm">{undo.name} deleted. The people stay in People.</span>
            <Button size="sm" variant="outline" onClick={() => { engage.undeleteList(session.business, undo.id); setUndo(null) }}>Undo</Button>
          </div>
        )}

        {enrolling && (
          <AddToSequencePanel
            open
            onOpenChange={(o) => { if (!o) setEnrolling(null) }}
            business={session.business}
            user={session.user}
            people={membersOf(enrolling, session.business)}
            sequences={seed.sequences.filter((s) => s.status !== "Draft")}
            from={enrolling.name}
          />
        )}
      </div>
    </DoorGroup>
  )
}

/** The list the keyboard is on, for `s`, `c` and `e`. */
function focused(rows: List[]): List | null {
  const el = document.activeElement?.closest?.("tr[data-row-key]") as HTMLElement | null
  const id = el?.dataset.rowKey
  return rows.find((l) => l.id === id) ?? null
}
