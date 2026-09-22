// The people at a company, read inside the company.
//
// A company's contacts are a real list here whatever the count: a search, the three filters this
// seat uses, paging inside the section, and rows that open beside the record instead of replacing
// it. There is no "Show all" jump and no separate People tab — the count is not a reason to send
// somebody somewhere else.
//
// The one way out is the "Open in People" link in the section's heading, and it exists for one job:
// acting on the whole set at once. It carries this company as the filter and puts the record on the
// trail, so the way back is one crumb and lands on the row that was left.
import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { openBeside, useBeside } from "../../beside"
import { Actions } from "../../ui/Actions"
import { FamilyIcon } from "../../ui/Identity"
import { clearEdit, recordEdit, useEdits } from "../../edits"
import { EmptyState } from "../../ui/EmptyState"
import { toast } from "../../templates/TablePage"
import type { Contact } from "../../data/seed"
import { ago } from "./format"

/** How many rows a page of the list holds. Paging happens here, inside the section. */
const PAGE = 10

/** How long an action taken on a row can still be taken back, in place, on that row. */
const UNDO_MS = 10_000

/**
 * Development only, never in a build a person sees: how many times this list has rendered. It is
 * here so "the record does not re-render when a person opens beside it" can be checked rather than
 * claimed — open a contact beside the company and these numbers must not move.
 */
function useRenderCount() {
  const count = useRef(0)
  count.current += 1
  return count.current
}

function RenderCount({ label, count }: { label: string; count: number }) {
  if (!import.meta.env.DEV) return null
  return (
    <span data-renders={label} className="shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
      {label} renders: {count}
    </span>
  )
}

/**
 * Follows the pane without re-rendering the list.
 *
 * `[` and `]` walk the whole filtered list, which runs past the ten rows on screen. This renders
 * nothing and subscribes to the pane store on its own, so opening a pane still does not re-render
 * a single row; when the walk reaches somebody on another page it turns the page under them, and
 * marks the row once it is there — the frame marked the row it opened, not the one that arrived.
 */
function PaneFollower({ onTarget }: { onTarget: RefObject<(id: string) => void> }) {
  const target = useBeside()
  const id = target?.kind === "person" ? target.id : null
  useEffect(() => {
    if (!id) return
    onTarget.current?.(id)
    // The row may be one page turn away, so look for it on the next frame and once more after it:
    // whichever finds it marks it, and the other does nothing.
    let marked: HTMLElement | null = null
    const mark = () => {
      if (marked?.isConnected) return
      marked = document.querySelector<HTMLElement>(`[data-page-active="true"] [data-item="${CSS.escape(id)}"]`)
      marked?.classList.add("ollopa-beside-open")
    }
    const frame = requestAnimationFrame(mark)
    const later = window.setTimeout(mark, 80)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(later)
      marked?.classList.remove("ollopa-beside-open")
    }
  }, [id, onTarget])
  return null
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort()
}

/** What the person was looking at inside one company: the search, the three chips and the page. */
interface ListView { q: string; stage: string; inSeq: string; title: string; page: number }

const EMPTY: ListView = { q: "", stage: "all", inSeq: "all", title: "all", page: 0 }

/**
 * What each company's list was showing, for as long as this tab lives.
 *
 * A half-typed search inside a company is a thing a person is in the middle of, so it survives
 * leaving the record and coming back to it — including the case where the shell has had to rebuild
 * the page rather than keep it mounted. In memory only: never a storage key, and gone on a reload.
 */
const views = new Map<string, ListView>()

export function CompanyContacts({ companyId, contacts, companyName, sequenceName, pageRenders }: {
  /** Which company's list this is: what the remembered search and page are keyed by. */
  companyId: string
  contacts: Contact[]
  companyName: string
  /** The sequence "Add to a sequence" puts somebody in: the workspace's own first one. */
  sequenceName: string
  /** Development only: the record's render count, shown here where the rows are, for the same check. */
  pageRenders: number
}) {
  const [view, setView] = useState<ListView>(() => views.get(companyId) ?? EMPTY)
  const { q, stage, inSeq, title, page } = view
  const listRenders = useRenderCount()

  /** Every change to the list writes what is on screen, so coming back lands on the same view. */
  const show = (patch: Partial<ListView>) => {
    const next = { ...view, ...patch }
    views.set(companyId, next)
    setView(next)
  }

  // What was done to these people in this session — from this list, or from the pane reading one of
  // them beside it. One store, read by both, so the row and the pane can never say two different
  // things about the same contact. Opening the pane writes nothing here and re-renders nothing;
  // acting writes, and the row changes in the same paint.
  const edits = useEdits("person")
  // The undo window closing is a thing that happens without anybody clicking, so the list has to be
  // told the time has passed.
  const [, setTick] = useState(0)

  const stages = useMemo(() => unique(contacts.map((c) => c.stage)), [contacts])
  const titles = useMemo(() => unique(contacts.map((c) => c.title)), [contacts])

  const sequenceOf = (c: Contact) => {
    const edited = edits[c.id]?.sequence
    if (edited === undefined) return c.inSequence
    return (edited as string) || null
  }

  const matching = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return contacts.filter((c) => {
      if (needle && !`${c.name} ${c.title} ${c.email} ${c.department}`.toLowerCase().includes(needle)) return false
      if (stage !== "all" && c.stage !== stage) return false
      if (title !== "all" && c.title !== title) return false
      if (inSeq === "yes" && !sequenceOf(c)) return false
      if (inSeq === "no" && sequenceOf(c)) return false
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts, q, stage, title, inSeq, edits])

  const pages = Math.max(1, Math.ceil(matching.length / PAGE))
  const at = Math.min(page, pages - 1)
  const shown = matching.slice(at * PAGE, at * PAGE + PAGE)
  // Next and previous walk the list the heading counts — every row that matches the search and the
  // filters, in the order they are in — not the ten of them that happen to be on screen. The page
  // turns to follow the walk, so the row the pane is reading is always one of the rows behind it.
  const ids = matching.map((c) => c.id)
  const filtered = matching.length !== contacts.length

  const reset = () => show(EMPTY)

  /** Turn the page to whoever the pane is reading, when the walk has left the page on screen. */
  const followPane = useRef<(id: string) => void>(() => {})
  followPane.current = (id: string) => {
    const i = ids.indexOf(id)
    if (i < 0) return
    const wanted = Math.floor(i / PAGE)
    if (wanted !== at) show({ page: wanted })
  }

  /** A row opens beside the company. The record stays where it is and does not re-render. */
  const openPerson = (c: Contact, opener?: HTMLElement | null) => {
    openBeside({
      kind: "person",
      id: c.id,
      list: { ids, index: Math.max(0, ids.indexOf(c.id)) },
      opener: opener ?? (document.activeElement as HTMLElement | null),
    })
  }

  // The newest undo window on a row that is on screen, and the timer that closes it.
  const undoUntil = shown.reduce((max, c) => {
    const at2 = edits[c.id]?.at
    return typeof at2 === "number" ? Math.max(max, at2 + UNDO_MS) : max
  }, 0)
  useEffect(() => {
    const ms = undoUntil - Date.now()
    if (ms <= 0) return
    const t = window.setTimeout(() => setTick((n) => n + 1), ms + 50)
    return () => window.clearTimeout(t)
  }, [undoUntil])

  const chip = (label: string, value: string, key: keyof ListView, options: { value: string; label: string }[]) => (
    <Select value={value} onValueChange={(v) => show({ [key]: v, page: 0 })}>
      <SelectTrigger className="h-8 w-auto min-w-32 t-small" aria-label={label}><SelectValue /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
    </Select>
  )

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <Input
          className="h-8 w-56"
          aria-label={`Find a person at ${companyName}`}
          placeholder="Find a person here"
          value={q}
          onChange={(e) => show({ q: e.target.value, page: 0 })}
        />
        {chip("Stage", stage, "stage", [{ value: "all", label: "Stage: all" }, ...stages.map((s) => ({ value: s, label: s }))])}
        {chip("In a sequence", inSeq, "inSeq", [
          { value: "all", label: "In a sequence: all" },
          { value: "yes", label: "In a sequence" },
          { value: "no", label: "Not in a sequence" },
        ])}
        {chip("Title", title, "title", [{ value: "all", label: "Title: all" }, ...titles.map((t) => ({ value: t, label: t }))])}
        <RenderCount label="record" count={pageRenders} />
        <RenderCount label="contacts" count={listRenders} />
      </div>

      {/* Renders nothing: it turns the page under a walk that has left the rows on screen. */}
      <PaneFollower onTarget={followPane} />

      {matching.length === 0 ? (
        <EmptyState
          title="Nobody here matches"
          body={`${contacts.length} people are held at ${companyName}. Clear the search and the filters to see them all.`}
          action={<Actions surface="card" items={[{ kind: "secondary", label: "Clear the search and filters", onClick: reset }]} />}
        />
      ) : (
        <div>
          {shown.map((c) => {
            const seq = sequenceOf(c)
            const edit = edits[c.id]
            const fresh = typeof edit?.at === "number" && Date.now() - edit.at < UNDO_MS
            // "Done · what happened · Undo", for ten seconds, where the act was caused — and then
            // nothing: a row carries values, never a standing note about them (DESIGN.md §2, §3).
            const note = fresh && typeof edit?.note === "string" ? edit.note : null
            return (
              <div key={c.id} data-item={c.id} data-item-label={c.name} className="border-t py-2 first:border-t-0 first:pt-0">
                {/* The name and the row's actions share the top line and wrap on their own; the
                    line that describes the person has the width to itself, so a narrow column —
                    a phone, or the page shrunk to make room for the pane — never overlaps them. */}
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <FamilyIcon of="person" />
                    <button
                      type="button"
                      className="min-w-0 font-medium break-words hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      onClick={(e) => openPerson(c, e.currentTarget)}
                    >
                      {c.name}
                    </button>
                  </span>
                  {/* Two comparable acts and, when they are in one, the act that takes them out of
                      it — drawn by kind, never by a variant picked here. Both can be undone, so
                      neither carries a line: what happened is said afterwards, on the row. */}
                  <Actions
                    surface="card"
                    items={[
                      { kind: "secondary", label: "Create a call task", onClick: () => { recordEdit("person", c.id, { note: "Call task created · due today" }); toast(`Call task created for ${c.name}, due today.`) } },
                      seq
                        ? { kind: "destructive" as const, label: "Stop the sequence", onClick: () => { recordEdit("person", c.id, { sequence: "", note: `Taken out of ${seq}` }); toast(`${c.name} taken out of ${seq}. Nothing further is sent to them.`) } }
                        : { kind: "secondary" as const, label: `Add to ${sequenceName}`, onClick: () => { recordEdit("person", c.id, { sequence: sequenceName, note: `Added to ${sequenceName} · step 1` }); toast(`${c.name} starts at step 1 of ${sequenceName} in the next sending window.`) } },
                    ]}
                  />
                </div>
                <div className="t-small text-muted-foreground">
                  {c.title} · {c.stage} · {seq ? `in ${seq}` : "not in a sequence"} · {ago(c.lastActivity)}
                </div>
                {note && (
                  <div role="status" className="flex flex-wrap items-center gap-2 t-small">
                    <span>Done · {note}</span>
                    <button
                      type="button"
                      className="underline underline-offset-4 hover:no-underline"
                      onClick={() => { clearEdit("person", c.id); toast(`Undone · ${c.name} is back as they were`) }}
                    >
                      Undo
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          <div className="flex flex-wrap items-center gap-2 border-t pt-2">
            <span className="t-small tabular-nums text-muted-foreground">
              {at * PAGE + 1}–{at * PAGE + shown.length} of {matching.length}
              {filtered ? ` · ${contacts.length} held here` : ""}
            </span>
            <Button size="sm" variant="ghost" className="h-7 t-small" disabled={at === 0} onClick={() => show({ page: at - 1 })}>Previous</Button>
            <Button size="sm" variant="ghost" className="h-7 t-small" disabled={at >= pages - 1} onClick={() => show({ page: at + 1 })}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
