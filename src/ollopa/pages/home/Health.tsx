// The state of the workspace, on the page that owns it.
//
// REVIEW-ALERTS.md §5: there is no status row and no band of all-clears. "Credits on track" and
// "Sending healthy" are never said — an all-clear is the absence of the band — and every number that
// is worth reading keeps its numbers and sits in Home's own body, as a section with its rows, next
// to the thing it is about. A bounce trip links to where it is fixed, which is a different place in
// each of three cases: the paused sequence when one sequence tripped, Sequences filtered to
// auto-paused when several did, and Settings when the trip is mailbox-level.
import { useState } from "react"
import { href } from "@/app/router"
import { follow } from "../../chain"
import { originHere } from "../work/register"
import { toast } from "../../templates/TablePage"
import { Button } from "@/components/ui/button"
import { Door, type Disclosure, type HealthLine } from "../../ui"
import type { HomeData, SetupRow } from "./data"
import { count } from "./format"
import { Rows } from "../../layouts"
import { Row, RowList, Section } from "./rows"

const RANK = { error: 0, warning: 1, info: 2 }

/**
 * What about the workspace is worth a row on Home. Only what is not fine: nothing here reassures.
 * Each row keeps its numbers, because the row is the only place they are now said.
 */
export function healthLines(data: HomeData, d: Disclosure): HealthLine[] {
  const h = data.health
  // The section carries an item for the seats that actually watch it: the seat's weekly use of the
  // item, not just whether the seat has it at all. Credit burn is the exception — it is the price of
  // the workspace, so anyone who holds it sees it (spec 01 §3.8).
  const holds = (id: string) => d.weekly(id) >= 8
  const lines: HealthLine[] = []

  if (holds("home.health.bounce") && h.bounceGuard !== "ok") {
    lines.push({
      kind: h.bounceGuard === "paused" ? "error" : "warning",
      text: h.bounceGuard === "paused"
        ? `Bounce guard paused sending · ${h.bounceRate}% of ${count(h.bounceVolume)} sent — it pauses at ${h.guard.pausePercent}%`
        : `Bounce ${h.bounceRate}% of ${count(h.bounceVolume)} sent · the guard warns at ${h.guard.warnPercent}% and pauses at ${h.guard.pausePercent}%`,
      href: href(h.bounceHref),
    })
  }

  if (holds("home.agents.paused") && h.pausedOutreach > 0) {
    lines.push({
      kind: "warning",
      text: `An agent paused outreach in ${h.pausedOutreach} place${h.pausedOutreach === 1 ? "" : "s"}`,
      href: href("/ollopa/agents?filter=paused"),
    })
  }

  if (holds("home.health.mailboxes") && h.mailboxesNearLimit > 0) {
    lines.push({
      kind: "warning",
      text: `${h.mailboxesNearLimit} mailbox${h.mailboxesNearLimit === 1 ? "" : "es"} near the daily limit`,
      href: href("/ollopa/settings/email-sending?row=mail.mailboxes"),
    })
  }

  if (holds("home.health.sync") && h.syncErrors > 0) {
    lines.push({
      kind: "warning",
      text: `${h.crmName}: ${h.syncErrors} record${h.syncErrors === 1 ? "" : "s"} did not sync`,
      href: href("/ollopa/settings/integrations?row=int.error-log"),
    })
  }

  // Only when the cap is close. "Credits on track" is an all-clear and is never said; the balance
  // and the burn are already on the credits pill and in Settings › Plan.
  if (d.weekly("home.health.credits") > 0 && h.daysOfCredit <= 21) {
    lines.push({
      kind: "warning",
      text: `Credits: at ${count(h.credits.burnPerWeek)} a week the cap is reached on ${h.runsOutOn} · ${count(h.credits.balance)} left`,
      href: href("/ollopa/settings/plan?row=plan.credits"),
    })
  }

  if (holds("home.health.invites") && h.invitesPending > 0) {
    lines.push({
      kind: "info",
      text: `${h.invitesPending} invitation${h.invitesPending === 1 ? "" : "s"} not accepted`,
      href: href("/ollopa/settings/team?row=team.users"),
    })
  }

  return lines.sort((a, b) => RANK[a.kind] - RANK[b.kind])
}

/** True when a line needs a human. */
export function needsAttention(lines: HealthLine[]): boolean {
  return lines.some((l) => l.kind !== "info")
}

/**
 * The workspace's own state, as a tile of Home. It is absent when there is nothing wrong: an
 * all-clear is the absence of the section, not a row saying everything is fine.
 */
export function Health({ lines, order }: { lines: HealthLine[]; order: number }) {
  if (lines.length === 0) return null
  const open = (l: HealthLine) => follow(l.href.replace(/^#/, ""), originHere("home-health"))
  return (
    <Section id="home-health" title="The workspace" count={lines.length} order={order}
             link={{ label: "Settings", to: "/ollopa/settings" }}>
      <RowList label="The workspace">
        {lines.map((l) => (
          <Row key={l.text} itemId={l.text} itemLabel={l.text} onEnter={() => open(l)} keys={{ o: () => open(l) }}>
            {/* The word carries the state, never the ink alone (DESIGN.md §5). */}
            <span className="min-w-0 flex-1">{l.text}</span>
            <button type="button" className="shrink-0 underline underline-offset-4" onClick={() => open(l)}>Open</button>
          </Row>
        ))}
      </RowList>
    </Section>
  )
}

/**
 * The steps the workspace has not finished. A row leaves when its answer is done or declared —
 * "ollopA is our CRM" removes the CRM row — and the door is removed, not disabled, when the list empties.
 */
export function SetupDoor({ rows }: { rows: SetupRow[] }) {
  const [declared, setDeclared] = useState<Record<string, string>>({})
  const live = rows.filter((r) => !declared[r.id])
  if (live.length === 0) return null
  const nouns = [...new Set(live.map((r) => r.noun))].join(", ")
  const answered = rows.filter((r) => declared[r.id])

  return (
    <div>
      <Door id="home.health.setup" label={`Not set up yet: ${nouns}`} count={live.length}>
        <Rows>
          {live.map((r) => (
            <div key={r.id} data-item={r.id} data-item-label={r.noun} className="flex flex-wrap items-center gap-2 py-1.5 text-xs">
              <span className="min-w-0 flex-1">{r.text}</span>
              {/* A set-up step is a page in Settings: the trail keeps Home and this row, so
                  finishing it comes back to the door still open and the row lit. */}
              <button type="button" className="shrink-0 underline underline-offset-4"
                      onClick={() => follow(r.href, originHere(r.id))}>
                Open
              </button>
              {r.declare && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 shrink-0 px-2 text-xs"
                  onClick={() => { setDeclared((x) => ({ ...x, [r.id]: r.declare! })); toast(`Saved · ${r.declare}`) }}
                >
                  {r.declare}
                </Button>
              )}
            </div>
          ))}
          {answered.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-2 py-1.5 text-xs text-muted-foreground">
              <span className="min-w-0 flex-1">{r.noun}: {declared[r.id]}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 shrink-0 px-2 text-xs"
                onClick={() => setDeclared((x) => { const next = { ...x }; delete next[r.id]; return next })}
              >
                Change this
              </Button>
            </div>
          ))}
        </Rows>
      </Door>
    </div>
  )
}
