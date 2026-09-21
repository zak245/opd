// The campaign record (`R-campaign`), with its four panels: the pre-send checks (`X-qa`), the
// schedule (`X-schedule`), the test send (`X-sendtest`) and the recipients (`X-recipients`).
//
// Results first, because that is what the reader came for; then the audience with its six suppression
// counts and its mode; then the content with both previews side by side, because a marketer compares
// them and a comparison across a menu is the split rule 5 forbids; then the schedule or the trigger,
// with the QA line directly above the button that sends. The QA line never disables the button: a send
// is the sender's decision, and the page's job is to make sure nobody makes it blind.
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { href, navigate, useRoute } from "@/app/router"
import { openBeside } from "../../beside"
import { follow, type Origin } from "../../chain"
import { useEdits } from "../../edits"
import { RowNote, useTick } from "../engage/shared"
import { ActedNote, actOn, undoable } from "./acted"
import { toast } from "../../templates/TablePage"
import { RecordPage, type RecordDoor, type RecordField } from "../../templates/RecordPage"
import { ConsequenceLine, consequenceText } from "../../ui/ConsequenceLine"
import { Actions } from "../../ui/Actions"
import { Panel } from "../../ui/Panel"
import { EmptyState } from "../../ui/EmptyState"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { BOUNCE_GUARD, SECOND_APPROVAL, TODAY, seedFor, type Audience, type Campaign } from "../../data/seed"
import type { Session } from "../../session"
import { StatusBadge } from "./CampaignsPage"
import { netSize, preSendChecks, qaLine, suppressionCounts } from "./derive"
import { ago, day, num, pct } from "./format"
import { patchRow, removeRow, useMarketing } from "./store"

/* ------------------------------------------------------------------------------- the funnel */

function Funnel({ c }: { c: Campaign }) {
  const steps = [
    { label: "Sent", n: c.sent, of: c.sent },
    { label: "Delivered", n: c.delivered, of: c.sent },
    { label: "Opened", n: c.opened, of: c.delivered },
    { label: "Clicked", n: c.clicked, of: c.delivered },
    { label: "Replied", n: c.replied, of: c.delivered },
    { label: "Converted", n: c.converted, of: c.delivered },
  ]
  return (
    <div>
      <ol className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((s) => (
          <li key={s.label}>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-lg font-semibold tabular-nums">{num(s.n)}</div>
            <div className="text-xs tabular-nums text-muted-foreground">{s.label === "Sent" ? c.goal : pct(s.n, s.of)}</div>
          </li>
        ))}
      </ol>
      {/* Bounced and unsubscribed are the cost of the send and sit on the same line as the rest. */}
      <p className="pt-3 text-sm">
        <span className={c.sent && (c.bounced / c.sent) * 100 >= BOUNCE_GUARD.warnPercent ? "font-medium text-amber-700 dark:text-amber-400" : ""}>
          {num(c.bounced)} bounced · {pct(c.bounced, c.sent)}
        </span>
        <span className="text-muted-foreground"> (warns at {BOUNCE_GUARD.warnPercent}%, pauses at {BOUNCE_GUARD.pausePercent}%)</span>
        {" · "}
        <span>{num(c.unsubscribed)} unsubscribed · {pct(c.unsubscribed, c.delivered)}</span>
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------------------ the two previews */

function Previews({ c }: { c: Campaign }) {
  const body = (
    <>
      <p className="text-[11px] text-muted-foreground">{c.fromName} &lt;{c.fromMailbox}&gt;</p>
      <p className="font-medium">{c.subject || "No subject yet"}</p>
      <p className="text-[11px] text-muted-foreground">{c.previewText || "No preview text yet"}</p>
      <p className="pt-2">Hi {"{{first_name}}"},</p>
      <p className="pt-1">{c.kind === "Lifecycle" ? "You are a week into your trial. Here is the one thing most teams set up next." : "Here is what changed this quarter, in two minutes and one number."}</p>
      <p className="pt-2 text-[11px] text-muted-foreground">Unsubscribe · {c.fromMailbox}</p>
    </>
  )
  return (
    <div className="flex flex-wrap items-start gap-4">
      <figure className="min-w-0 flex-1">
        <figcaption className="pb-1 text-xs text-muted-foreground">Desktop</figcaption>
        <div className="min-h-40 rounded-md border p-3 text-sm">{body}</div>
      </figure>
      <figure>
        <figcaption className="pb-1 text-xs text-muted-foreground">Phone, 400 px</figcaption>
        <div className="min-h-40 w-[200px] rounded-md border p-2 text-xs">{body}</div>
      </figure>
    </div>
  )
}

/* ------------------------------------------------------------------------------------- the page */

export function CampaignRecord({ session, id }: { session: Session; id?: string }) {
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  const rows = useMarketing(session.business)
  const d = useDisclosure("campaigns")
  const route = useRoute()
  const admin = b.roles.find((r) => r.role === "admin")?.user ?? "your admin"

  // What actions took on the recipients and on this campaign's audience this session, from the one
  // store every page reads: acting in a pane redraws the row it was caused on, here, at once.
  const personEdits = useEdits("person")
  const audienceEdits = useEdits("audience")
  useTick(Object.values({ ...personEdits, ...audienceEdits }).some(undoable))

  const c = rows.campaigns.find((x) => x.id === id)
  const [qaOpen, setQaOpen] = useState(false)
  const [testOpen, setTestOpen] = useState(route.query.get("open") === "test")
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [note, setNote] = useState("")
  const [testTo, setTestTo] = useState(`${session.user.split(" ")[0].toLowerCase()}@${b.id === "meridian" ? "meridian.io" : `${b.id}.com`}`)
  const [sendDate, setSendDate] = useState(c?.sendAt ?? TODAY)
  const [sendTime, setSendTime] = useState("09:00")
  const [timezone, setTimezone] = useState(b.timezone)
  const [speed, setSpeed] = useState("As fast as the mailbox allows")
  const [recipientQ, setRecipientQ] = useState("")

  if (!c) {
    return (
      <div className="p-10">
        <EmptyState title="That campaign is not here" body="It may have been deleted, or the link may be old." action={<Actions surface="card" items={[{ kind: "link", label: "Back to Campaigns", href: href("/ollopa/campaigns") }]} />} />
      </div>
    )
  }

  const audience: Audience | undefined = rows.audiences.find((a) => a.id === c.audienceId)
  const recipients = audience ? netSize(audience) : c.audienceSize
  const policy = seed.sendPolicy
  const checks = preSendChecks(c, audience, seed, seed.domains[0], policy)
  const line = qaLine(c, checks)
  const failures = checks.filter((k) => k.state === "fail")
  const at = (itemId: string) => d.level(itemId) === 1
  const isOwner = c.owner === session.user || session.role === "admin"
  const awaiting = c.activity[0]?.what.startsWith("Approval requested")
  const needsSecond = recipients >= SECOND_APPROVAL.recipients

  const patch = (p: Partial<Campaign>) => patchRow(session.business, "campaigns", c.id, p)
  const log = (what: string) => patch({ activity: [{ at: TODAY, by: session.user, what }, ...c.activity] })

  /* ------------------------------------------------------------------- the two ways off this page */

  /** Where this page is and the row being left, for the crumb and for the return cue. */
  const from = (anchor?: string): Origin => ({ route: route.raw, title: `${c.name} · Campaigns`, anchor })

  /**
   * The audience read beside the campaign. The campaign stays mounted and untouched behind it, and
   * "Open the page" in the pane's header pushes the trail with the audience row as the anchor — so
   * the crumb back lands on the row in the header grid, lit.
   */
  const readAudience = (opener?: HTMLElement | null) => {
    if (!audience) return
    openBeside({ kind: "audience", id: audience.id, opener: opener ?? (document.activeElement as HTMLElement | null) })
  }

  /** A person on the recipients list, read beside the campaign, walking the list as it is shown. */
  const readPerson = (id: string, ids: string[], opener?: HTMLElement | null) => {
    const index = ids.indexOf(id)
    openBeside({ kind: "person", id, list: { ids, index: index < 0 ? 0 : index }, opener: opener ?? (document.activeElement as HTMLElement | null) })
  }

  const pause = () => {
    actOn(session.business, "campaign", c.id, { status: "Paused", pausedBy: session.user }, { status: c.status, pausedBy: c.pausedBy },
      `paused by ${session.user} · the send time is kept`)
    log("Paused")
    toast(`${c.name} paused. The send time is kept.`)
  }
  const resume = () => {
    const passed = c.sendAt !== null && c.sendAt < TODAY
    patch({ status: c.kind === "Lifecycle" ? "Running" : passed ? "Draft" : "Scheduled", pausedBy: null })
    toast(passed ? "Resumed as a draft: the kept time has passed, so choose a new one." : `${c.name} resumed.`)
  }

  const sendConsequence = consequenceText({
    sends: recipients,
    to: audience ? audience.name : "the audience at send time",
    from: c.fromMailbox,
    changes: `Sends on ${day(sendDate)} at ${sendTime} ${timezone}`,
  })

  /* -------------------------------------------------------------------------------- the header */

  const fields: RecordField[] = [
    { key: "kind", label: "Kind", value: c.kind },
    { key: "status", label: "Status", value: <StatusBadge c={c} /> },
    { key: "owner", label: "Owner", value: c.owner, under: session.role === "admin" ? undefined : `${admin} can change the owner` },
    {
      key: "audience", label: "Audience",
      // The audience row: tagged so the pane marks it while it is being read, and so the crumb back
      // from the audience page lands on it, lit and focused.
      value: audience
        ? (
          <span data-item={audience.id} data-item-label={audience.name}>
            <button type="button" className="underline" onClick={(ev) => readAudience(ev.currentTarget)}>{audience.name}</button>
            <ActedNote business={session.business} kind="audience" id={audience.id} edit={audienceEdits[audience.id]} />
          </span>
        )
        : `Audience removed; ${num(c.audienceSize)} people at send time`,
      under: `${num(recipients)} after suppressions`,
    },
    { key: "goal", label: "Goal", value: c.goal },
    c.kind === "Lifecycle"
      ? { key: "trigger", label: "Trigger", value: c.trigger ?? "—", under: "Measured on enrolment over the period", level: at("camp.detail.trigger") ? 1 : 2 }
      : { key: "send", label: "Send", value: c.status === "Scheduled" ? `Scheduled ${day(c.sendAt)}` : c.sendAt ? `Sent ${day(c.sendAt)}` : "Not scheduled" },
    { key: "from", label: "From", value: `${c.fromName} · ${c.fromMailbox}`, level: at("camp.list.from") ? 1 : 2 },
  ]

  /* --------------------------------------------------------------------------------- the doors */

  const doors: RecordDoor[] = []

  if (c.sendsByDay.length > 0) {
    const peak = Math.max(...c.sendsByDay.map((s) => s.sent))
    doors.push({
      id: "campaign.sends-by-day", label: "Sends by day", count: c.sendsByDay.length, openByDefault: at("camp.detail.sends-by-day"),
      content: (
        <ol className="space-y-1">
          {c.sendsByDay.slice(-14).map((s) => (
            <li key={s.day} className="flex items-center gap-2 text-xs">
              <span className="w-14 shrink-0 text-muted-foreground">{day(s.day)}</span>
              <span className="h-2 rounded bg-foreground/70" style={{ width: `${Math.max(4, (s.sent / peak) * 100)}%` }} aria-hidden="true" />
              <span className="tabular-nums">{num(s.sent)}</span>
            </li>
          ))}
        </ol>
      ),
    })
  }

  // Every link in the body and how many people clicked it. Removed when the body carries no links.
  if (c.links.length > 0) {
    const clicks = c.links.reduce((n, l) => n + l.clicks, 0)
    doors.push({
      id: "campaign.links", label: `Links clicked · ${num(clicks)}`, count: c.links.length,
      content: (
        <table className="w-full text-xs">
          <thead><tr className="text-left text-muted-foreground"><th className="py-1">Link</th><th className="text-right">Clicks</th><th className="text-right">Of delivered</th></tr></thead>
          <tbody>
            {[...c.links].sort((a, z) => z.clicks - a.clicks).map((l) => (
              <tr key={l.url} className="border-t">
                <td className="max-w-0 truncate py-1"><span title={l.url}>{l.url}</span></td>
                <td className="text-right tabular-nums">{num(l.clicks)}</td>
                <td className="text-right tabular-nums">{pct(l.clicks, c.delivered)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    })
  }

  if (c.variants.length > 0) {
    doors.push({
      id: "campaign.variants", label: `Variants ${c.variants.map((v) => v.label).join(" and ")}`, count: c.variants.length,
      content: (
        <ul className="space-y-2">
          {c.variants.map((v) => (
            <li key={v.label}>
              <div className="font-medium">{v.label} · “{v.subject}”</div>
              <div className="text-xs tabular-nums text-muted-foreground">{num(v.sent)} sent · {num(v.opened)} opened · {pct(v.opened, v.sent)} · {num(v.replied)} replied</div>
            </li>
          ))}
        </ul>
      ),
    })
  }

  doors.push({
    id: "campaign.goal", label: "Goal, what it produced and the attribution window", count: 4,
    content: (
      <dl className="grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1">
        <dt className="text-muted-foreground">Goal</dt><dd>{c.goal}</dd>
        <dt className="text-muted-foreground">Deals created</dt><dd className="tabular-nums">{num(c.dealsCreated)}</dd>
        <dt className="text-muted-foreground">Pipeline</dt><dd className="tabular-nums">{b.currency} {num(c.pipelineAmount)} created · {b.currency} {num(c.pipelineInfluenced)} influenced</dd>
        <dt className="text-muted-foreground">Attribution window</dt>
        <dd>{c.attributionDays} days</dd>
      </dl>
    ),
  })

  doors.push({
    id: "campaign.delivery-settings", label: "Delivery settings: tracking, reply-to, unsubscribe text, footer", count: 4,
    content: (
      <dl className="grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1">
        <dt className="text-muted-foreground">Tracking</dt><dd>{seed.domains[0]?.trackingSubdomain ?? "Not set up"}</dd>
        <dt className="text-muted-foreground">Reply-to</dt><dd>{c.fromMailbox}</dd>
        <dt className="text-muted-foreground">Unsubscribe text</dt><dd>“Stop receiving these emails” · {admin} can change it</dd>
        <dt className="text-muted-foreground">Footer</dt><dd>{b.name}, with the postal address from Settings.</dd>
      </dl>
    ),
  })

  if (c.status === "Sent") {
    const nonOpeners = Math.max(0, c.delivered - c.opened)
    doors.push({
      id: "campaign.resend", label: "Resend to people who did not open", count: nonOpeners,
      content: (
        <Actions surface="card" items={[{
          kind: "secondary",
          label: "Prepare the resend",
          onClick: () => { log(`Resend to ${num(nonOpeners)} non-openers prepared`); toast(`A draft resend to ${num(nonOpeners)} people was created.`) },
        }]} />
      ),
    })
  }

  doors.push({
    id: "campaign.activity", label: "Activity", count: c.activity.length,
    content: <ul className="space-y-1 text-xs">{c.activity.map((a, i) => <li key={i} className="flex justify-between gap-2"><span>{a.what} · {a.by}</span><span className="tabular-nums text-muted-foreground">{day(a.at)}</span></li>)}</ul>,
  })

  doors.push({
    id: "campaign.notes", label: "Notes",
    content: (
      <div className="space-y-2">
        <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why this campaign exists, and what it is for." aria-label="Note" />
        <Actions surface="card" items={[{
          kind: "secondary", label: "Save the note",
          onClick: () => { log(`Note: ${note.trim()}`); setNote(""); toast("Saved · Notes") },
          disabledBecause: note.trim() ? undefined : "Write the note first",
        }]} />
        <ul className="space-y-1 text-xs text-muted-foreground">
          {c.activity.filter((a) => a.what.startsWith("Note:") || a.what.startsWith("Retired")).map((a, i) => <li key={i}>{a.what} — {a.by}, {day(a.at)}</li>)}
        </ul>
      </div>
    ),
  })

  /* ------------------------------------------------------------------------------- the sections */

  // Who it went to is found inside the campaign, whatever the count: a real list with search, and
  // rows that open beside the campaign rather than replacing it. It was a drawer, which is a place
  // you leave the campaign to stand in; a related list belongs in the object it belongs to.
  const recipientPool = seed.contacts.slice(0, Math.min(40, Math.max(0, recipients)))
  const recipientNeedle = recipientQ.trim().toLowerCase()
  const recipientRows = recipientNeedle
    ? recipientPool.filter((p) => `${p.name} ${p.company}`.toLowerCase().includes(recipientNeedle))
    : recipientPool
  const recipientIds = recipientRows.map((p) => p.id)

  const recipientsBlock = (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">The first {num(recipientPool.length)} of {num(recipients)}.</p>
        {/* Search once the list is longer than a screenful of names (over ten). */}
        {recipientPool.length > 10 && (
          <Input
            aria-label="Find a recipient of this campaign"
            placeholder="Find a person"
            value={recipientQ}
            onChange={(e) => setRecipientQ(e.target.value)}
            className="h-8 w-48"
          />
        )}
      </div>
      <table className="w-full text-xs">
        <thead><tr className="text-left text-muted-foreground"><th className="py-1">Person</th><th>Company</th><th>Opened</th><th>Replied</th></tr></thead>
        <tbody>
          {recipientRows.map((p) => (
            <tr key={p.id} className="border-t" data-item={p.id} data-item-label={p.name}>
              <td className="py-1">
                <button type="button" className="underline" onClick={(ev) => readPerson(p.id, recipientIds, ev.currentTarget)}>{p.name}</button>
                {/* What an action from the pane beside this list did to this person, in place. */}
                {personEdits[p.id]?.note && <RowNote kind="person" id={p.id} note={String(personEdits[p.id].note)} at={personEdits[p.id].at} />}
              </td>
              <td>{p.company}</td>
              <td className="tabular-nums">{p.opens}</td>
              <td className="tabular-nums">{p.replies}</td>
            </tr>
          ))}
          {recipientRows.length === 0 && (
            <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">Nobody here matches “{recipientQ}”.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )

  const audienceBlock = (
    <div className="space-y-2">
      {audience ? (
        <>
          <p className="text-sm">
            <span className="tabular-nums">{num(audience.size)} total</span> ·{" "}
            <span className="font-medium tabular-nums">{num(netSize(audience))} after suppressions</span>
          </p>
          {/* Six counts, level one, each a link to the names behind it. A count behind a door is a
              count nobody checks before a send. */}
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {suppressionCounts(audience).map((s) => (
              <li key={s.key}>
                {/* The names behind a number are a level the pane must not open, so this is a
                    `follow`: the campaign and its audience row stay on the trail behind it. */}
                <a
                  href={href(`/ollopa/audiences/${audience.id}?records=${s.key}`)}
                  className={cn("underline", s.on ? "" : "text-muted-foreground")}
                  onClick={(ev) => { if (!ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); follow(`/ollopa/audiences/${audience.id}?records=${s.key}`, from(audience.id)) } }}
                >
                  <span className="tabular-nums">{num(s.count)}</span> {s.label}
                </a>
                <span className="text-xs text-muted-foreground">{s.always ? ", always applied" : s.on ? "" : ", off"}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm">
            {audience.mode === "live"
              ? <>Mode: live · refreshes daily 06:00 · new matches are added to {audience.usedBy[0] ?? "no campaign yet"}</>
              : <>Frozen at {num(audience.size)} on {day(audience.frozenAt)}</>}
          </p>
          <Actions surface="page" items={[
            {
              kind: "secondary",
              label: audience.mode === "live" ? "Freeze" : "Make live",
              onClick: () => {
                const was = { mode: audience.mode, frozenAt: audience.frozenAt, refreshAt: audience.refreshAt }
                actOn(
                  session.business, "audience", audience.id,
                  audience.mode === "live" ? { mode: "frozen", frozenAt: TODAY, refreshAt: null } : { mode: "live", frozenAt: null, refreshAt: TODAY },
                  was,
                  audience.mode === "live" ? `frozen at ${num(audience.size)} · no new match is added` : "live again · refreshes daily at 06:00",
                )
                toast(audience.mode === "live" ? `${audience.name} frozen at ${num(audience.size)}. No new matches are added.` : `${audience.name} is live again and refreshes daily at 06:00.`)
              },
            },
            // A destination, not a state change, so it is a link and not a button (DESIGN.md §1).
            { kind: "link", label: "Open the audience", href: href(`/ollopa/audiences/${audience.id}`), onClick: () => follow(`/ollopa/audiences/${audience.id}`, from(audience.id)) },
          ]} />
          <ActedNote business={session.business} kind="audience" id={audience.id} edit={audienceEdits[audience.id]} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Audience removed; {num(c.audienceSize)} people at send time.</p>
      )}
    </div>
  )

  const scheduleSection = (
    <div className="space-y-3">
      {c.kind === "Lifecycle" ? (
        <dl className="grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Trigger</dt><dd>{c.trigger}</dd>
          <dt className="text-muted-foreground">Delay</dt><dd>{c.delayDays} day{c.delayDays === 1 ? "" : "s"} after the trigger</dd>
          <dt className="text-muted-foreground">Exit rule</dt><dd>{c.exitRule}</dd>
          <dt className="text-muted-foreground">Measured on</dt><dd>Enrolment over the period, not on one send</dd>
        </dl>
      ) : (
        <dl className="grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Time</dt><dd>{c.status === "Scheduled" ? `${day(c.sendAt)}, ${sendTime}` : c.sendAt ? day(c.sendAt) : "Not scheduled"}</dd>
          <dt className="text-muted-foreground">Timezone</dt><dd>{timezone}</dd>
          <dt className="text-muted-foreground">Send speed</dt><dd>{speed}</dd>
        </dl>
      )}

      {/* The QA line, directly above the button, never disabled and never blocking. */}
      <div className="rounded-md border px-3 py-2">
        <p className="text-sm">
          <span className={failures.length ? "font-medium text-amber-700 dark:text-amber-400" : ""}>{line}</span>
          {c.qa.on && <span className="text-muted-foreground">. Run {day(c.qa.on)} by {c.qa.by}</span>}
        </p>
        <div id="camp-run-checks" className="mt-1">
          <Actions surface="card" items={[{ kind: "secondary", label: "Run the checks", onClick: () => setQaOpen(true), keys: "Q" }]} />
        </div>
      </div>

      {c.status === "Sent" ? (
        <p className="text-sm text-muted-foreground">Sent {day(c.sendAt)}.</p>
      ) : (
        // One primary per surface: whichever of pause, resume or schedule this campaign is at.
        // Resuming and scheduling both send, and a send cannot be undone, so each carries its
        // confirmation with the verb in the affirmative and the consequence above it.
        <Actions surface="page" items={[
          // The page header already carries the filled control for whichever of these applies, so
          // here the same acts are outline: one filled control per surface, and never the same act
          // filled twice on one page (DESIGN.md §1).
          ...(c.status === "Sending" || c.status === "Running"
            ? [{ kind: "secondary" as const, label: "Pause", onClick: pause, keys: "P" }]
            : c.status === "Paused"
              ? [{
                kind: "secondary" as const, label: "Resume", onClick: resume, keys: "P",
                irreversible: {
                  title: `Resume ${c.name}?`,
                  consequence: `Sending starts again to ${num(recipients)} people from ${c.fromMailbox}. Emails already sent cannot be recalled.`,
                  confirmLabel: "Resume sending",
                },
              }]
              : [{ kind: "secondary" as const, label: needsSecond ? "Request approval" : "Schedule", onClick: () => setScheduleOpen(true) }]),
          { kind: "secondary" as const, label: "Send test", onClick: () => setTestOpen(true), keys: "T" },
        ]} />
      )}
      {/* The seat cannot finish this alone above the workspace threshold, so the sentence names who
          does (DESIGN.md §3, reason 2). */}
      {needsSecond && c.status !== "Sent" && (
        <p className="text-xs text-muted-foreground">
          Above {num(SECOND_APPROVAL.recipients)} recipients, {admin} approves before it goes out.
        </p>
      )}
    </div>
  )

  const buildAudienceFrom = c.sent > 0 && (
    <p className="pt-3 text-sm">
      Build an audience from:{" "}
      {[
        { label: "opened", n: c.opened },
        { label: "clicked", n: c.clicked },
        { label: "did not open", n: Math.max(0, c.delivered - c.opened) },
      ].map((x, i) => (
        <span key={x.label}>
          {i > 0 && " · "}
          <button className="underline" onClick={() => toast(`New audience from ${c.name}: ${x.label} · ${num(x.n)} people. Nothing is sent.`)}>
            {x.label} <span className="tabular-nums">{num(x.n)}</span>
          </button>
        </span>
      ))}
    </p>
  )

  /* -------------------------------------------------------------------------------- the render */

  return (
    <>
      <RecordPage
        back={{ label: "Campaigns", href: href("/ollopa/campaigns") }}
        title={{ value: c.name, onRename: isOwner ? (v) => { patch({ name: v }); toast("Saved · Campaign name") } : undefined }}
        chips={<span className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{c.kind}</Badge><StatusBadge c={c} /></span>}
        ribbon={
          c.status === "Sending"
            ? { tone: "warning", text: `Sending: ${num(c.sent)} of ${num(recipients)} · bounced ${pct(c.bounced, c.sent)} against warn ${BOUNCE_GUARD.warnPercent}% and pause ${BOUNCE_GUARD.pausePercent}%`, action: <Actions surface="card" items={[{ kind: "secondary", label: "Pause", onClick: pause }]} /> }
            : c.pausedBy === "Bounce guard"
              ? {
                tone: "error",
                text: `Paused by the bounce guard at ${pct(c.bounced, c.sent)}, past the ${BOUNCE_GUARD.pausePercent}% pause threshold.`,
                // Into Settings at the row that holds the pair, with this campaign kept behind it.
                action: (
                  <button
                    type="button" id="camp-bounce-guard" className="text-sm underline"
                    onClick={() => follow("/ollopa/settings/email-sending?row=mail.bounce-guard", from("camp-bounce-guard"))}
                  >
                    Bounce guard
                  </button>
                ),
              }
              : awaiting
                ? { tone: "info", text: `Awaiting approval: ${admin}. ${sendConsequence}` }
                : undefined
        }
        fields={fields}
        actions={{
          primary: c.status === "Sending" || c.status === "Running" ? [{ label: "Pause", onClick: pause, shortcut: "P" }]
            : c.status === "Paused" ? [{ label: "Resume", onClick: resume, shortcut: "P" }]
              : c.status === "Sent" ? [{ label: "Duplicate", onClick: () => { toast("Duplicate from the Campaigns table keeps audience, content and schedule.") ; navigate("/ollopa/campaigns") } }]
                : [{ label: "Send test", onClick: () => setTestOpen(true), shortcut: "T" }],
          secondary: [{ label: "Run the checks", onClick: () => setQaOpen(true) }, { label: "Export results", onClick: () => toast(`${c.name}: results exported as CSV.`) }],
          destructive: c.status === "Draft" ? {
            label: "Delete draft",
            consequence: "Deletes the draft and its test sends. Sent campaigns are archived, never deleted.",
            onConfirm: () => { removeRow(session.business, c.id); toast(`${c.name} deleted.`); navigate("/ollopa/campaigns") },
          } : undefined,
        }}
        main={{
          kind: "sections",
          label: "Campaign",
          sections: [
            { id: "results", title: "Results", children: <><Funnel c={c} />{buildAudienceFrom}</> },
            { id: "audience", title: "Audience", children: audienceBlock },
            // The count in the heading is what the section holds; the line under it says of how many.
            ...(recipients > 0 ? [{ id: "recipients", title: "Recipients", count: recipientPool.length, children: recipientsBlock }] : []),
            { id: "content", title: "Content", children: <Previews c={c} /> },
            { id: "schedule", title: c.kind === "Lifecycle" ? "Trigger" : "Schedule", children: scheduleSection },
          ],
        }}
        side={[
          {
            id: "policy", title: "Sending policy",
            children: (
              <ul className="space-y-1 text-sm">
                <li>Bounce guard: warn {BOUNCE_GUARD.warnPercent}%, pause {BOUNCE_GUARD.pausePercent}% · observed {seed.bounceGuard.observedPercent}% this week</li>
                <li className="tabular-nums">{num(policy.usedToday)} of {num(policy.dailyCap)} sends used today</li>
                <li>{seed.domains[0]?.domain} · {seed.domains[0]?.spf && seed.domains[0]?.dkim && seed.domains[0]?.dmarc ? "SPF, DKIM and DMARC pass" : "needs SPF, DKIM or DMARC"}</li>
                <li className="text-xs text-muted-foreground">{admin} sets the thresholds in Settings.</li>
              </ul>
            ),
          },
        ]}
        doors={doors}
        shortcuts={[
          { keys: "T", label: "Send a test", run: () => setTestOpen(true) },
          { keys: "P", label: c.status === "Paused" ? "Resume" : "Pause", run: () => (c.status === "Paused" ? resume() : pause()) },
          { keys: "Q", label: "Run the pre-send checks", run: () => setQaOpen(true) },
        ]}
      />

      {/* ------------------------------------------------- X-qa: eight checks, flat, failures in words */}
      <Panel id="campaign-qa" title="Pre-send checks" open={qaOpen} onOpenChange={setQaOpen}
        footer={
          <Actions surface="dialog" layout="stack" items={[{
            kind: "primary", label: "Run the checks now",
            onClick: () => {
              patch({ qa: { by: session.user, on: TODAY, checklist: c.qa.checklist.map((k) => ({ ...k, done: true })), checks: c.qa.checks.map((k) => ({ ...k, state: "pass" as const })) } })
              setQaOpen(false)
              toast(`Checks run by ${session.user}.`)
            },
          }]} />
        }
      >
        <ol className="space-y-3">
          {checks.map((k) => (
            <li key={k.n}>
              <div className="flex items-baseline gap-2">
                <span className={cn("text-xs font-medium", k.state === "fail" ? "text-amber-700 dark:text-amber-400" : k.state === "pass" ? "text-green-700 dark:text-green-400" : "text-muted-foreground")}>{k.state}</span>
                <span className="text-sm font-medium">{k.title}</span>
              </div>
              {/* A check that passed says so in one word. Only a failure earns a sentence, because
                  only a failure is about to go wrong to a few thousand people. */}
              {k.state === "fail" && <p className="text-xs text-muted-foreground">{k.words}</p>}
              {/* A fix is a destination, so it is a real link (DESIGN.md §1) — never a bare one:
                  a page is a `follow`, and a related object opens beside the campaign, which stays
                  exactly where it is. */}
              {k.fix?.hash && <a className="text-xs underline" href={k.fix.hash} onClick={() => setQaOpen(false)}>{k.fix.label}</a>}
              {k.fix?.to && (
                <a
                  className="text-xs underline" href={href(k.fix.to)}
                  onClick={(ev) => { if (!ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); follow(k.fix!.to!, from("camp-run-checks")) } }}
                >
                  {k.fix.label}
                </a>
              )}
              {k.fix?.beside && (
                <button
                  type="button" className="text-xs underline"
                  onClick={() => { setQaOpen(false); openBeside({ kind: k.fix!.beside!.kind, id: k.fix!.beside!.id }) }}
                >
                  {k.fix.label}
                </button>
              )}
            </li>
          ))}
        </ol>
        <p className="pt-4 text-xs text-muted-foreground">
          {c.qa.on ? `Run ${day(c.qa.on)} by ${c.qa.by}.` : "Not run yet."}
        </p>
      </Panel>

      {/* ---------------------------------------------------------------------- X-sendtest: a test */}
      <Panel id="campaign-test" title="Send a test" open={testOpen} onOpenChange={setTestOpen}
        footer={<Actions surface="dialog" layout="stack" items={[{
          kind: "primary", label: "Send the test",
          onClick: () => { setTestOpen(false); toast(`Test sent to ${testTo} from ${c.fromMailbox}.`) },
          cost: "1 email", consequence: "It cannot be recalled",
        }]} />}
      >
        <div className="space-y-3">
          <div>
            <Label htmlFor="test-to" className="text-xs">To</Label>
            <Input id="test-to" className="mt-1" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
          </div>
          {c.variants.length > 0 && (
            <div>
              <Label htmlFor="test-variant" className="text-xs">Variant</Label>
              <Select defaultValue={c.variants[0].label}>
                <SelectTrigger id="test-variant" className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{c.variants.map((v) => <SelectItem key={v.label} value={v.label}>{v.label} · {v.subject}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <ConsequenceLine sends={1} to={testTo} from={c.fromMailbox} changes="The test carries a working unsubscribe link that unsubscribes nobody" />
        </div>
      </Panel>

      {/* ------------------------------------- X-schedule, which becomes "Request approval" above the
          workspace's threshold. The threshold is read from Settings and never written here. */}
      <Panel id="campaign-schedule" title={needsSecond ? "Request approval" : "Schedule and send"} open={scheduleOpen} onOpenChange={setScheduleOpen}
        footer={
          <Actions surface="dialog" layout="stack" items={[{
            kind: "primary",
            label: needsSecond ? `Request approval from ${admin}` : "Schedule the send",
            onClick: () => {
              if (needsSecond) {
                patch({ activity: [{ at: TODAY, by: session.user, what: `Approval requested from ${admin}` }, ...c.activity] })
                toast(`${admin} was asked to approve. ${sendConsequence}`)
              } else {
                patch({ status: "Scheduled", sendAt: sendDate, activity: [{ at: TODAY, by: session.user, what: `Scheduled for ${day(sendDate)} ${sendTime}` }, ...c.activity] })
                toast(`Scheduled. ${sendConsequence}`)
              }
              setScheduleOpen(false)
            },
            ...(needsSecond ? {} : { cost: `${num(recipients)} emails`, consequence: "They cannot be recalled" }),
          }]} />
        }
      >
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div><Label htmlFor="send-date" className="text-xs">Date</Label><Input id="send-date" type="date" className="mt-1" value={sendDate} onChange={(e) => setSendDate(e.target.value)} /></div>
            <div><Label htmlFor="send-time" className="text-xs">Time</Label><Input id="send-time" type="time" className="mt-1" value={sendTime} onChange={(e) => setSendTime(e.target.value)} /></div>
          </div>
          <div>
            <Label htmlFor="send-tz" className="text-xs">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="send-tz" className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={b.timezone}>{b.timezone} — the workspace default</SelectItem>
                <SelectItem value="each recipient's local time">Each recipient's local time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="send-speed" className="text-xs">Send speed</Label>
            <Select value={speed} onValueChange={setSpeed}>
              <SelectTrigger id="send-speed" className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="As fast as the mailbox allows">As fast as the mailbox allows</SelectItem>
                <SelectItem value="Spread over 4 hours">Spread over 4 hours</SelectItem>
                <SelectItem value="Spread over the day">Spread over the day</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border p-3">
            <p className="text-sm">{sendConsequence}</p>
            {audience && (
              <p className="pt-1 text-xs text-muted-foreground">
                Suppressed: {suppressionCounts(audience).filter((s) => s.on).map((s) => `${num(s.count)} ${s.label}`).join(" · ")}.
              </p>
            )}
            <p className="pt-1 text-xs text-muted-foreground">{line}{c.qa.on ? ` · run ${day(c.qa.on)} by ${c.qa.by}` : ""}</p>
          </div>

        </div>
      </Panel>
    </>
  )
}
