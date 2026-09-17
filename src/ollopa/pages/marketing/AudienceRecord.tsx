// The audience record (`R-audience`).
//
// Level one, above everything else: the total, the net size after suppressions, and the six counts on
// one line — the two that are always applied marked as such, the four the marketer chooses each saying
// whether it is on. Every count is a link that opens the names behind it, because "42 customers" that
// cannot be read as forty-two names is a number nobody checks before a send. The door beside them
// holds the rules, not the counts.
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { href, navigate, useRoute } from "@/app/router"
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

export function AudienceRecord({ session, id }: { session: Session; id?: string }) {
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  const rows = useMarketing(session.business)
  const route = useRoute()
  const admin = b.roles.find((r) => r.role === "admin")?.user ?? "your admin"
  const sdr = b.roles.find((r) => r.role === "sdr")?.user ?? admin

  const a = rows.audiences.find((x) => x.id === id)
  const [records, setRecords] = useState<string | null>(route.query.get("records"))
  const [handOff, setHandOff] = useState(false)
  const [listName, setListName] = useState("Marketing-qualified, September")
  const [cap, setCap] = useState("1")

  if (!a) {
    return (
      <div className="p-10">
        <EmptyState title="That audience is not here" body="It may have been deleted, or the link may be old." action={<Button size="sm" onClick={() => navigate("/ollopa/campaigns")}>Back to Campaigns</Button>} />
      </div>
    )
  }

  const counts = suppressionCounts(a)
  const net = netSize(a)
  const patch = (p: Partial<Audience>) => patchRow(session.business, "audiences", a.id, p)
  const builtFor = a.usedBy[0]
  const campaign = rows.campaigns.find((c) => c.name === builtFor)

  /** The names behind one count, from the workspace's own rows. */
  const namesFor = (key: string) => {
    const pool = key === "inSequence" ? seed.contacts.filter((c) => c.inSequence)
      : key === "unsubscribed" ? seed.contacts.filter((c) => c.stage === "Not interested")
        : key === "bounced" ? seed.contacts.filter((c) => c.emailStatus === "Bounced")
          : key === "customers" ? seed.contacts.filter((c) => c.stage === "Meeting booked")
            : seed.contacts
    return pool.slice(0, 40)
  }
  const openCount = counts.find((s) => s.key === records)

  const fields: RecordField[] = [
    { key: "type", label: "Type", value: a.type },
    { key: "size", label: "Total size", value: <span className="tabular-nums">{num(a.size)}</span> },
    { key: "net", label: "After suppressions", value: <span className="font-medium tabular-nums">{num(net)}</span>, under: `${num(suppressedTotal(a))} suppressed` },
    { key: "rebuilt", label: "Last rebuilt", value: `${day(a.lastRebuilt)} · ${ago(a.lastRebuilt)}` },
    { key: "builtFor", label: "Built for", value: builtFor ? <a className="underline" href={href(`/ollopa/campaigns/${campaign?.id ?? ""}`)}>{builtFor}</a> : "No campaign yet" },
  ]

  const doors: RecordDoor[] = [
    {
      id: "audience.suppression-rules",
      label: `Suppression rules: customers, open deals, closed-lost, in sequence · ${rulesApplied(a)} applied`,
      content: (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Unsubscribed and bounced are always applied and cannot be turned off. These four are yours.</p>
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
          <div className="border-t pt-2">
            <Button size="sm" variant="outline" onClick={() => toast("Upload a CSV of addresses this audience never mails.")}>Upload a suppression list</Button>
          </div>
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
              Fed by {a.sources[0]} · new matches added automatically. The switch that turns the feed off lives on that list. <a className="underline" href={href("/ollopa/lists")}>Open Lists</a>
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
          <Button size="sm" variant="outline" onClick={() => toast(`Saved · at most ${cap} campaign${cap === "1" ? "" : "s"} per person per week from this audience.`)}>Save</Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <RecordPage
        back={{ label: "Campaigns", href: href("/ollopa/campaigns") }}
        title={{ value: a.name, onRename: (v) => { patch({ name: v }); toast("Saved · Audience name") } }}
        chips={<Badge variant="secondary">{a.mode === "live" ? "Live" : "Frozen"}</Badge>}
        fields={fields}
        actions={{
          primary: [{ label: "Rebuild now", onClick: () => { patch({ lastRebuilt: TODAY }); toast(`${a.name} rebuilt · ${num(net)} after suppressions.`) } }],
          secondary: [{ label: "Hand to sales", onClick: () => setHandOff(true) }],
          destructive: {
            label: "Delete audience",
            consequence: a.usedBy.length
              ? `${a.usedBy[0]} uses this audience, so it cannot be deleted while that campaign exists.`
              : "Removes the audience. The people stay; only the set goes.",
            onConfirm: () => {
              if (a.usedBy.length) { toast(`${a.name} is used by ${a.usedBy[0]} and was not deleted.`); return }
              removeRow(session.business, a.id)
              toast(`${a.name} deleted.`)
              navigate("/ollopa/campaigns")
            },
          },
        }}
        main={{
          kind: "sections",
          label: "Audience",
          sections: [
            {
              id: "size", title: "Size and who is suppressed",
              children: (
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="tabular-nums">{num(a.size)} total</span> · <span className="font-medium tabular-nums">{num(net)} after suppressions</span>
                  </p>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {counts.map((s) => (
                      <li key={s.key}>
                        <button className={s.on ? "underline" : "text-muted-foreground underline"} onClick={() => setRecords(s.key)}>
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
                  <Button size="sm" variant="outline" onClick={() => {
                    patch(a.mode === "live" ? { mode: "frozen", frozenAt: TODAY, refreshAt: null } : { mode: "live", frozenAt: null, refreshAt: TODAY })
                    toast(a.mode === "live" ? `${a.name} frozen at ${num(a.size)}. No new matches are added.` : `${a.name} is live again and refreshes daily at 06:00.`)
                  }}>{a.mode === "live" ? "Freeze" : "Make live"}</Button>
                </div>
              ),
            },
          ],
        }}
        side={[{
          id: "used-by", title: "Campaigns using this audience", count: a.usedBy.length,
          children: a.usedBy.length === 0
            ? <p className="text-sm text-muted-foreground">No campaign uses it yet.</p>
            : (
              <ul className="space-y-1 text-sm">
                {a.usedBy.map((name) => {
                  const c = rows.campaigns.find((x) => x.name === name)
                  return <li key={name}><a className="underline" href={href(`/ollopa/campaigns/${c?.id ?? ""}`)}>{name}</a> <span className="text-muted-foreground">· {c?.status}</span></li>
                })}
              </ul>
            ),
        }]}
        doors={doors}
      />

      {/* X-report-records: the names behind one number, titled by that number. */}
      <Panel id="audience-records" title={openCount ? `${num(openCount.count)} ${openCount.label}` : "Records"} open={!!openCount} onOpenChange={(o) => { if (!o) setRecords(null) }}>
        <ul className="space-y-1 text-sm">
          {namesFor(records ?? "").map((p) => (
            <li key={p.id} className="flex justify-between gap-2 border-t py-1 first:border-t-0">
              <a className="underline" href={href(`/ollopa/people/${p.id}`)}>{p.name}</a>
              <span className="text-xs text-muted-foreground">{p.company}</span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Hand to sales states the consequence before the click, and names the seat that takes it on. */}
      <Panel id="audience-hand" title="Hand to sales" open={handOff} onOpenChange={setHandOff}
        footer={<Button className="w-full" onClick={() => { setHandOff(false); toast(`${num(net)} people added to “${listName}”, owned by ${sdr}. Nothing was sent.`) }}>Add {num(net)} people</Button>}
      >
        <div className="space-y-3">
          <div>
            <Label htmlFor="hand-list" className="text-xs">List name</Label>
            <Input id="hand-list" className="mt-1" value={listName} onChange={(e) => setListName(e.target.value)} />
          </div>
          <p className="text-sm">
            Adds {num(net)} people to “{listName}”, owned by {sdr}. Nothing is sent. {sdr.split(" ")[0]} decides what happens next.
          </p>
          <p className="text-xs text-muted-foreground">Enrolling people in a sequence is the SDR's seat, not yours.</p>
        </div>
      </Panel>
    </>
  )
}
