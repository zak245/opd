// Home: what needs me now, composed from the seat and the workspace rather than from a saved layout.
//
// Which sections appear, and what sits on the surface inside them, is asked of the usage model at
// sign-in; a section the seat does not hold is absent, never greyed and never empty-with-a-tour. The
// health strip runs across the top, the work queue is the left column and what waits for a decision is
// the right one, and on a phone it is one column in the same order. Nothing moves with use: the only
// things that appear by state are the strip, the overdue block and the set-up door.
//
// There is no layout editor, no widget library and no chart. Those were removed, not hidden.
//
// The page is the Home template (LAYOUTS.md §1): it declares its type, fills the page header and
// hands over the tiles. The measure and the grid are the template's, never this file's.
import { useMemo } from "react"
import { HomePage as HomeTemplate } from "../../layouts"
import { DoorGroup, ExpandAll, HealthStrip, useDisclosure } from "../../ui"
import type { Session } from "../../session"
import { useRenderCount } from "../work/register"
import { homeData, type SectionKey } from "./data"
import { firstName, greeting, headerDate } from "./format"
import { Accounts } from "./Accounts"
import { Approvals } from "./Approvals"
import { Campaigns } from "./Campaigns"
import { Pipeline } from "./Pipeline"
import { Replies } from "./Replies"
import { SetupDoor, healthLines } from "./Health"
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

  // One column on a phone: the first section, then what waits for a decision, then the rest. The
  // template's grid places the tiles above `lg`, so the order a tile carries is the phone's alone.
  const phone = [left[0], right[0], ...left.slice(1), ...right.slice(1)].filter(Boolean) as SectionKey[]
  const order = (k: SectionKey) => phone.indexOf(k) + 1

  // The template owns the grid (LAYOUTS.md §6), and a grid fills row by row: the work queue and what
  // waits for a decision are zipped, so the first lands in the left column and the second in the right.
  const tiles: SectionKey[] = []
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    if (left[i]) tiles.push(left[i])
    if (right[i]) tiles.push(right[i])
  }

  const lines = healthLines(data, d)

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
      {/* One row above the page, never two: the health items and the workspace notice share it. It
          publishes to the shell and draws nothing here. */}
      <HealthStrip lines={lines} announcement={data.announcement ?? undefined} />

      <HomeTemplate
        family="home"
        title={`${greeting()}, ${firstName(session.user)}`}
        description={
          <>
            {headerDate()} · {data.business.name}
            {import.meta.env.DEV && (
              <span data-renders="home" className="ml-2 rounded border px-1.5 py-0.5 font-mono t-small font-normal tabular-nums text-muted-foreground">
                home renders: {renders}
              </span>
            )}
          </>
        }
        // "Expand all" belongs on the greeting line, not on a row of its own above the cards.
        trailing={<span data-print-hide><ExpandAll /></span>}
        above={d.weekly("home.health.setup") > 0 ? <SetupDoor rows={data.setupRows} /> : undefined}
      >
        {tiles.map(render)}
      </HomeTemplate>
    </DoorGroup>
  )
}
