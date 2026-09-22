// Home: what needs me now, composed from the seat and the workspace rather than from a saved layout.
//
// Which sections appear, and what sits on the surface inside them, is asked of the usage model at
// sign-in; a section the seat does not hold is absent, never greyed and never empty-with-a-tour. The
// health strip runs across the top, the work queue is the left column and what waits for a decision is
// the right one, and on a phone it is one column in the same order. Nothing moves with use: the only
// things that appear by state are the strip, the overdue block and the set-up door.
//
// There is no layout editor, no widget library and no chart. Those were removed, not hidden.
import { useMemo } from "react"
import { Announcement, DoorGroup, ExpandAll, HealthStrip, useDisclosure } from "../../ui"
import type { Session } from "../../session"
import { useRenderCount } from "../work/register"
import { homeData, type SectionKey } from "./data"
import { firstName, greeting, headerDate } from "./format"
import { Accounts } from "./Accounts"
import { Approvals } from "./Approvals"
import { Campaigns } from "./Campaigns"
import { Pipeline } from "./Pipeline"
import { Replies } from "./Replies"
import { SetupDoor, healthLines, needsAttention } from "./Health"
import { Today } from "./Today"
import { Week } from "./Week"

export function HomePage({ session }: { session: Session }) {
  const renders = useRenderCount()
  const d = useDisclosure("home")
  const data = useMemo(() => homeData(session), [session])

  // A section is on the page when the seat holds at least one of the items in it at level one.
  const has: Record<SectionKey, boolean> = {
    today: d.atLevelOne("home.tasks.due"),
    replies: d.atLevelOne("home.replies.hot"),
    pipeline: ["home.pipeline.mine", "home.pipeline.team", "home.pipeline.warnings", "home.pipeline.closing"].some(d.atLevelOne),
    approvals: d.weekly("home.agents.approvals") > 0,
    campaigns: d.atLevelOne("home.campaigns.running"),
    accounts: ["home.accounts.renewals", "home.accounts.health", "home.accounts.expansion"].some(d.atLevelOne),
    week: d.atLevelOne("home.activity.week") || d.atLevelOne("home.activity.coaching"),
  }

  // The first section is the one the seat opens the day with (spec 01 §3.8); the work queue follows it
  // on the left, and what waits for a decision sits on the right, approvals first.
  const first: SectionKey =
    session.role === "sdr" ? "today"
      : session.role === "ae" ? (has.accounts ? "accounts" : "pipeline")
        : session.role === "marketer" ? "campaigns"
          : session.role === "cs" ? "accounts"
            : has.today ? "today" : "approvals"

  const left = ([first, "today", "replies", "campaigns", "accounts"] as SectionKey[])
    .filter((k, i, all) => has[k] && all.indexOf(k) === i)
  const right = (["approvals", "pipeline", "accounts", "week"] as SectionKey[])
    .filter((k, i, all) => has[k] && all.indexOf(k) === i && !left.includes(k))

  // One column on a phone: the first section, then what waits for a decision, then the rest.
  const phone = [left[0], right[0], ...left.slice(1), ...right.slice(1)].filter(Boolean) as SectionKey[]
  const order = (k: SectionKey) => phone.indexOf(k) + 1

  const lines = healthLines(data, d)
  const strip = needsAttention(lines)

  // `key` is React's own, never a prop: spreading it in would hand each section a prop it does not
  // declare and warn twice on every render. It goes on the element, and only there.
  function render(key: SectionKey) {
    const props = { data, d, order: order(key) }
    switch (key) {
      case "today": return <Today key={key} {...props} />
      case "replies": return <Replies key={key} {...props} />
      case "pipeline": return <Pipeline key={key} {...props} hasReports={session.hasReports} />
      case "approvals": return <Approvals key={key} {...props} session={session} />
      case "campaigns": return <Campaigns key={key} {...props} />
      case "accounts": return <Accounts key={key} {...props} />
      case "week": return <Week key={key} {...props} hasReports={session.hasReports} />
    }
  }

  return (
    <DoorGroup>
      <div className={strip ? "border-b-2 border-[var(--warning-ink)]" : undefined}>
        <HealthStrip lines={lines} />
      </div>
      {data.announcement && <Announcement text={data.announcement.text} href={data.announcement.href} />}
      {d.weekly("home.health.setup") > 0 && <SetupDoor rows={data.setupRows} />}

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <header className="flex flex-wrap items-end gap-x-4 gap-y-1 pb-4">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">
              {greeting()}, {firstName(session.user)}
              {import.meta.env.DEV && (
                <span data-renders="home" className="ml-2 rounded border px-1.5 py-0.5 font-mono text-[10px] font-normal tabular-nums text-muted-foreground">
                  home renders: {renders}
                </span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground">{headerDate()} · {data.business.name}</p>
          </div>
          <div className="ml-auto" data-print-hide><ExpandAll /></div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <div className="contents lg:flex lg:flex-col lg:gap-6">{left.map(render)}</div>
          <div className="contents lg:flex lg:flex-col lg:gap-6">{right.map(render)}</div>
        </div>
      </div>
    </DoorGroup>
  )
}
