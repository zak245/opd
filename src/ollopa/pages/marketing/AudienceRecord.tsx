// The audience record (`R-audience`).
//
// Level one, above everything else: the total, the net size after suppressions, and the six counts on
// one line — the two that are always applied marked as such, the four the marketer chooses each saying
// whether it is on. Every count is a control that shows the names behind it, because "42 customers"
// that cannot be read as forty-two names is a number nobody checks before a send. The door beside them
// holds the rules, not the counts.
//
// The people are found inside the audience, whatever the count: one list with search, and the six
// counts filter it in place, directly above it, so a count and the names it stands for are never in
// two different places. A row opens the person beside this page; the page stays where it is.
import { Fragment, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { href, navigate, useRoute } from "@/app/router"
import { openBeside } from "../../beside"
import { follow, type Origin } from "../../chain"
import { useEdits } from "../../edits"
import { Actions } from "../../ui/Actions"
import { useDisclosure } from "../../ui/useDisclosure"
import { Chip, FamilyIcon } from "../../ui/Identity"
import { FAMILY, PERSON_FAMILY, RowGap, inUsageOrder } from "./look"
import { Separator } from "@/components/ui/separator"
import { RowNote, useTick } from "../engage/shared"
import { ActedNote, actOn, undoable } from "./acted"
import { toast } from "../../templates/TablePage"
import { RecordPage, type RecordDoor, type RecordField } from "../../templates/RecordPage"
import { Panel } from "../../ui/Panel"
import { EmptyState } from "../../ui/EmptyState"
import { businessById } from "../../data/businesses"
import { TODAY, seedFor, type Audience } from "../../data/seed"
import type { Session } from "../../session"
import { netSize, suppressedTotal, suppressionCounts, rulesApplied } from "./derive"
import { ago, day, num } from "./format"
import { patchRow, removeRow, useMarketing } from "./store"

/** How many of a big audience's people the workspace's own rows can actually name. */
const SHOWN = 40

export function AudienceRecord({ session, id }: { session: Session; id?: string }) {
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  const rows = useMarketing(session.business)
  const route = useRoute()
  const d = useDisclosure("campaigns")
  const admin = b.roles.find((r) => r.role === "admin")?.user ?? "your admin"
  const sdr = b.roles.find((r) => r.role === "sdr")?.user ?? admin

  // What actions took on these people and on the campaigns using this audience, from the one store
  // every page reads. Opening a pane writes nothing here, so it still does not re-render the page;
  // acting writes one record and the row it was caused on redraws at once (chain rule 8).
  const personEdits = useEdits("person")
  const campaignEdits = useEdits("campaign")
  useTick(Object.values({ ...personEdits, ...campaignEdits }).some(undoable))

  const a = rows.audiences.find((x) => x.id === id)
  const [records, setRecords] = useState<string | null>(route.query.get("records"))
  const [q, setQ] = useState("")
  const [handOff, setHandOff] = useState(false)
  const [listName, setListName] = useState("Marketing-qualified, September")
  const [cap, setCap] = useState("1")

  if (!a) {
    return (
      <div className="p-10">
        <EmptyState title="That audience is not here" body="It may have been deleted, or the link may be old." action={<Actions surface="card" items={[{ kind: "link", label: "Back to Campaigns", href: href("/ollopa/campaigns") }]} />} />
      </div>
    )
  }

  const counts = suppressionCounts(a)
  const net = netSize(a)
  const patch = (p: Partial<Audience>) => patchRow(session.business, "audiences", a.id, p)
  /**
   * Which campaigns use this audience *now*, read from the campaigns this session is looking at and
   * not from the seed's frozen list — so deleting the draft that used it frees the audience here, in
   * place, instead of leaving a page that still claims to be blocked by a campaign that is gone.
   */
  const usedBy = rows.campaigns.filter((c) => c.audienceId === a.id).map((c) => c.name)
  const builtFor = usedBy[0]
  const campaign = rows.campaigns.find((c) => c.name === builtFor)

  /* ------------------------------------------------------------------- the two ways off this page */

  /** Where this page is and the row being left, for the crumb and for the return cue. */
  const from = (anchor?: string): Origin => ({ route: route.raw, title: `${a.name} · Campaigns`, anchor })

  /** A campaign read beside the audience: the audience stays where it is and does not re-render. */
  const readCampaign = (campaignId: string, ids: string[], opener?: HTMLElement | null) => {
    const index = ids.indexOf(campaignId)
    openBeside({
      kind: "campaign", id: campaignId,
      list: ids.length > 1 ? { ids, index: index < 0 ? 0 : index } : undefined,
      opener: opener ?? (document.activeElement as HTMLElement | null),
    })
  }

  /** A person in this audience, read beside it, walking the list in the order it is shown. */
  const readPerson = (personId: string, ids: string[], opener?: HTMLElement | null) => {
    const index = ids.indexOf(personId)
    openBeside({
      kind: "person", id: personId,
      list: { ids, index: index < 0 ? 0 : index },
      opener: opener ?? (document.activeElement as HTMLElement | null),
    })
  }

  /* ---------------------------------------------------------------------- the people, and the six */

  /** The workspace's own rows behind one count, or the audience's own people when nothing is picked. */
  const namesFor = (key: string | null) => {
    if (key === "inSequence") return seed.contacts.filter((c) => c.inSequence)
    if (key === "unsubscribed") return seed.contacts.filter((c) => c.stage === "Not interested")
    if (key === "bounced") return seed.contacts.filter((c) => c.emailStatus === "Bounced")
    if (key === "customers") return seed.contacts.filter((c) => c.stage === "Meeting booked")
    return seed.contacts
  }

  const openCount = counts.find((s) => s.key === records) ?? null
  const pool = namesFor(openCount ? openCount.key : null).slice(0, SHOWN)
  const needle = q.trim().toLowerCase()
  const people = needle ? pool.filter((p) => `${p.name} ${p.company}`.toLowerCase().includes(needle)) : pool
  const peopleIds = people.map((p) => p.id)

  /* -------------------------------------------------------------------------------- the header */

  const usedByIds = usedBy.map((name) => rows.campaigns.find((x) => x.name === name)?.id ?? "").filter(Boolean)

  const fields: RecordField[] = [
    { key: "type", label: "Type", value: a.type },
    { key: "size", label: "Total size", value: <span className="tabular-nums">{num(a.size)}</span> },
    { key: "net", label: "After suppressions", value: <span className="font-medium tabular-nums">{num(net)}</span>, under: `${num(suppressedTotal(a))} suppressed` },
    { key: "rebuilt", label: "Last rebuilt", value: `${day(a.lastRebuilt)} · ${ago(a.lastRebuilt)}` },
    {
      key: "builtFor", label: "Built for",
      value: builtFor && campaign
        ? (
          <span data-item={campaign.id} data-item-label={campaign.name}>
            <button type="button" className="underline" onClick={(ev) => readCampaign(campaign.id, usedByIds, ev.currentTarget)}>{builtFor}</button>
            <ActedNote business={session.business} kind="campaign" id={campaign.id} edit={campaignEdits[campaign.id]} />
          </span>
        )
        : builtFor ?? "No campaign yet",
    },
  ]

  /* --------------------------------------------------------------------------------- the doors */

  const doors: RecordDoor[] = [
    {
      id: "audience.suppression-rules",
      label: `Suppression rules: customers, open deals, closed-lost, in sequence · ${rulesApplied(a)} applied`,
      content: (
        <div className="space-y-3">
          {counts.filter((s) => !s.always).map((s) => (
            <label key={s.key} className="flex items-center justify-between gap-3">
              <span className="text-sm">Remove {s.label} <span className="tabular-nums text-muted-foreground">({num(s.count)})</span></span>
              <Switch
                checked={s.on}
                aria-label={`Remove ${s.label}`}
                onCheckedChange={(v) => {
                  patch({ suppressionsOn: { ...a.suppressionsOn, [s.key]: v } })
                  toast(`${s.label} ${v ? "removed from" : "kept in"} ${a.name}.`)
                }}
              />
            </label>
          ))}
          <Separator />
          <Actions surface="card" items={[{ kind: "secondary", label: "Upload a suppression list", onClick: () => toast("Upload a CSV of addresses this audience never mails.") }]} />
        </div>
      ),
    },
    {
      id: "audience.sources", label: "Source lists and segment filters", count: a.sources.length + a.rules.length,
      content: (
        <div className="space-y-2 text-sm">
          <ul className="list-disc pl-4">{a.sources.map((s) => <li key={s}>{s}</li>)}</ul>
          <ul className="list-disc pl-4 text-muted-foreground">{a.rules.map((f, i) => <li key={i}>{f.field} {f.op} {f.value}</li>)}</ul>
          {a.mode === "live" && (
            <p className="text-xs text-muted-foreground">
              Fed by {a.sources[0]} · the switch that turns the feed off lives on that list.{" "}
              {/* A destination, so a real link; leaving keeps this audience and this door on the trail. */}
              <a
                className="underline" href={href("/ollopa/lists")}
                onClick={(ev) => { if (!ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); follow("/ollopa/lists", from("audience.sources")) } }}
              >
                Open Lists
              </a>
            </p>
          )}
        </div>
      ),
    },
    {
      id: "audience.frequency-cap", label: "Frequency cap per person",
      content: (
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <Label htmlFor="freq-cap" className="text-xs">Campaigns per person per week</Label>
            <Input id="freq-cap" type="number" min={1} className="mt-1 w-24" value={cap} onChange={(e) => setCap(e.target.value)} />
          </div>
          <Actions surface="card" items={[{ kind: "secondary", label: "Save", onClick: () => toast(`Saved · at most ${cap} campaign${cap === "1" ? "" : "s"} per person per week from this audience.`) }]} />
        </div>
      ),
    },
  ]

  /* ------------------------------------------------------------------------------- the sections */

  const sizeBlock = (
    <div className="space-y-2">
      <p className="text-sm">
        <span className="tabular-nums">{num(a.size)} total</span> · <span className="font-medium tabular-nums">{num(net)} after suppressions</span>
      </p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {counts.map((s) => (
          <li key={s.key}>
            {/* A count is a filter over the list below, so the number and the names it stands for
                are the same thing in the same place: the effect shows where it was caused. */}
            <button
              type="button"
              aria-pressed={records === s.key}
              className={cn("underline", s.on ? "" : "text-muted-foreground", records === s.key && "font-medium")}
              onClick={() => { setRecords(records === s.key ? null : s.key); setQ("") }}
            >
              <span className="tabular-nums">{num(s.count)}</span> {s.label}
            </button>
            <span className="text-xs text-muted-foreground">{s.always ? ", always applied" : s.on ? "" : ", off"}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm">
        {a.mode === "live"
          ? <>Mode: live · refreshes daily 06:00 · new matches are added to {builtFor ?? "no campaign yet"}</>
          : <>Frozen at {num(a.size)} on {day(a.frozenAt)}</>}
      </p>
      {/* A section body is a card surface, not the page's. */}
      <Actions className="justify-start" surface="card" items={[{
        kind: "secondary",
        label: a.mode === "live" ? "Freeze" : "Make live",
        onClick: () => {
          actOn(
            session.business, "audience", a.id,
            a.mode === "live" ? { mode: "frozen", frozenAt: TODAY, refreshAt: null } : { mode: "live", frozenAt: null, refreshAt: TODAY },
            { mode: a.mode, frozenAt: a.frozenAt, refreshAt: a.refreshAt },
            a.mode === "live" ? `frozen at ${num(a.size)} · no new match is added` : "live again · refreshes daily at 06:00",
          )
          toast(a.mode === "live" ? `${a.name} frozen at ${num(a.size)}. No new matches are added.` : `${a.name} is live again and refreshes daily at 06:00.`)
        },
      }]} />
    </div>
  )

  /** The list's toolbar lives in its container's header (DESIGN.md §5, containment). */
  const peopleTools = (
    <>
      {/* Search once the list is longer than a screenful of names (over ten). */}
      {pool.length > 10 && (
        <Input aria-label="Find a person in this audience" placeholder="Find a person" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-48 max-sm:w-28" />
      )}
      {openCount && <Actions surface="card" items={[{ kind: "secondary", label: "Show everybody", onClick: () => { setRecords(null); setQ("") } }]} />}
    </>
  )

  const peopleBlock = (
    <div className="space-y-2">
      <p className="t-body text-muted-foreground">
          {openCount
            ? <>The first {num(pool.length)} of {num(openCount.count)}.</>
            : <>The first {num(pool.length)} of {num(net)} after suppressions.</>}
      </p>
      <ul className="text-sm">
        {people.map((p, i) => (
          <Fragment key={p.id}>
          {i > 0 && <RowGap />}
          <li data-item={p.id} data-item-label={p.name} className="t-body flex flex-wrap items-baseline justify-between gap-2 py-1.5">
            <span className="min-w-0">
              <span className="inline-flex items-center gap-1.5">
                <FamilyIcon of={PERSON_FAMILY} />
                <button type="button" className="underline" onClick={(ev) => readPerson(p.id, peopleIds, ev.currentTarget)}>{p.name}</button>
              </span>
              {/* What an action from the pane beside this list did to this person, in place. */}
              {personEdits[p.id]?.note && <RowNote kind="person" id={p.id} note={String(personEdits[p.id].note)} at={personEdits[p.id].at} />}
            </span>
            <span className="t-small text-muted-foreground">
              {p.title} · {p.company}
              {personEdits[p.id]?.sequence !== undefined && (
                <span className="block">{String(personEdits[p.id].sequence) || "Not in a sequence"}</span>
              )}
            </span>
          </li>
          </Fragment>
        ))}
        {people.length === 0 && (
          <li className="py-4 text-sm text-muted-foreground">{needle ? <>Nobody here matches “{q}”.</> : <>Nobody is in this set.</>}</li>
        )}
      </ul>
    </div>
  )

  return (
    <>
      <RecordPage
        family={FAMILY}
        back={{ label: "Campaigns", href: href("/ollopa/campaigns") }}
        title={{ value: a.name, onRename: (v) => { patch({ name: v }); toast("Saved · Audience name") } }}
        chips={<Chip status={a.mode === "live" ? "live" : "paused"}>{a.mode === "live" ? "Live" : "Frozen"}</Chip>}
        fields={fields}
        actions={{ primary: [], secondary: [] }}
        headerActions={
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Actions surface="page" items={[
              { kind: "primary", label: "Rebuild now", onClick: () => { patch({ lastRebuilt: TODAY }); toast(`${a.name} rebuilt · ${num(net)} after suppressions.`) } },
              { kind: "secondary", label: "Hand to sales", onClick: () => setHandOff(true) },
              // A campaign using this audience is what stops it being deleted, and it is not
              // something this page can change — so there is no control at all, and the sentence
              // beside names the campaign to delete first (DESIGN.md §1).
              ...(usedBy.length === 0
                ? [{
                  kind: "destructive" as const,
                  label: "Delete audience",
                  onClick: () => { removeRow(session.business, a.id); toast(`${a.name} deleted.`); navigate("/ollopa/campaigns") },
                  irreversible: {
                    title: `Delete ${a.name}?`,
                    consequence: "Removes the audience and its suppression rules. The people stay; only the set goes.",
                    confirmLabel: "Delete the audience",
                  },
                }]
                : []),
            ]} />
            {usedBy.length > 0 && (
              <p className="text-xs text-muted-foreground">Used by {usedBy[0]}; delete that campaign first</p>
            )}
          </div>
        }
        main={{
          kind: "sections",
          label: "Audience",
          sections: [
            // In the order this seat reads them, from the usage model (LAYOUTS.md §7).
            ...inUsageOrder(d, [
              { item: "aud.suppressed", section: { id: "size", title: "Size and who is suppressed", children: sizeBlock } },
              {
                item: "aud.list",
                section: {
                  id: "people",
                  title: openCount ? `${num(openCount.count)} ${openCount.label}` : "People in this audience",
                  count: people.length,
                  action: peopleTools,
                  children: peopleBlock,
                },
              },
            ]),
          ],
        }}
        side={[{
          id: "used-by", title: "Campaigns using this audience", count: usedBy.length,
          children: usedBy.length === 0
            ? <p className="text-sm text-muted-foreground">No campaign uses it yet.</p>
            : (
              <ul className="space-y-1 text-sm">
                {usedBy.map((name) => {
                  const cc = rows.campaigns.find((x) => x.name === name)
                  if (!cc) return <li key={name}>{name}</li>
                  return (
                    <li key={name} data-item={cc.id} data-item-label={cc.name}>
                      <button type="button" className="underline" onClick={(ev) => readCampaign(cc.id, usedByIds, ev.currentTarget)}>{name}</button>
                      <span className="text-muted-foreground"> · {cc.status}</span>
                      <ActedNote business={session.business} kind="campaign" id={cc.id} edit={campaignEdits[cc.id]} />
                    </li>
                  )
                })}
              </ul>
            ),
        }]}
        doors={doors}
      />

      {/* Hand to sales states the consequence before the click, and names the seat that takes it on. */}
      <Panel id="audience-hand" title="Hand to sales" open={handOff} onOpenChange={setHandOff}
        footer={<Actions surface="dialog" layout="stack" items={[{ kind: "primary", label: `Add ${num(net)} people`, onClick: () => { setHandOff(false); toast(`${num(net)} people added to “${listName}”, owned by ${sdr}. Nothing was sent.`) } }]} />}
      >
        <div className="space-y-3">
          <div>
            <Label htmlFor="hand-list" className="text-xs">List name</Label>
            <Input id="hand-list" className="mt-1" value={listName} onChange={(e) => setListName(e.target.value)} />
          </div>
          <p className="text-sm">Adds {num(net)} people to “{listName}”, owned by {sdr}. Nothing is sent.</p>
        </div>
      </Panel>
    </>
  )
}
