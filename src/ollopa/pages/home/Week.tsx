// Your week: one line of numbers, no chart. The charts are on Reports, which this links to.
//
// Under it, the coaching note a manager saved on one of your calls. It waits here rather than ringing
// a bell: it is not safety state, and a note about how you sounded is not an interruption.
import { follow } from "../../chain"
import { originHere } from "../work/register"
import { type Disclosure } from "../../ui"
import type { HomeData } from "./data"
import { count, plural } from "./format"
import { Section } from "./rows"

export function Week({ data, d, order, hasReports }: { data: HomeData; d: Disclosure; order: number; hasReports: boolean }) {
  const w = data.week
  const line = d.atLevelOne("home.activity.week")
  const sequences = d.atLevelOne("home.health.sequences") && w.sequenceLine
  const coaching = d.atLevelOne("home.activity.coaching") && w.coaching.length > 0

  return (
    <Section id="home-week" title="Your week" order={order} link={{ label: "Reports", to: "/ollopa/reports" }}>
      {line && (
        <p className="t-body tabular-nums">
          Sent {count(w.activity.sentThisWeek)} · Calls {count(w.activity.callsThisWeek)} · Meetings booked {count(w.activity.meetingsBooked)}
          {sequences && <span className="text-muted-foreground"> · {w.sequenceLine}</span>}
        </p>
      )}

      {coaching && (
        <p className="mt-2 text-sm">
          <button type="button" className="underline underline-offset-4"
                  onClick={() => follow(`/ollopa/tasks?call=${w.coaching[0].id}`, originHere("home-week"))}>
            Feedback on your calls ({w.coaching.length})
          </button>
          <span className="text-muted-foreground"> · saved by {w.coaching[0].coachingNote?.author}</span>
        </p>
      )}

      {hasReports && (
        <p className="mt-2 text-sm">
          <button type="button" className="underline underline-offset-4"
                  onClick={() => follow("/ollopa/reports?report=activity", originHere("home-week"))}>
            Coaching you saved this week ({w.coachedByMe.length})
          </button>
          <span className="text-muted-foreground"> · {w.repsCoached} of {plural(data.reports.length, "seller")} coached</span>
        </p>
      )}
    </Section>
  )
}
