// Home: what needs me now, composed from the seat and the workspace rather than from a saved layout.
//
// Which sections appear, and what sits on the surface inside them, is asked of the usage model at
// sign-in; a section the seat does not hold is absent, never greyed and never empty-with-a-tour. The
// work queue is the left column and what waits for a decision is the right one, and on a phone it is
// one column in the same order. Nothing moves with use: the only things that appear by state are the
// workspace tile, the overdue block and the set-up door.
//
// There is no status row above the page (REVIEW-ALERTS.md §5). What the workspace has to say about
// itself is a tile in Home's own body with its numbers in it, and it is absent when there is nothing
// wrong. The workspace announcement is a Badge beside the title here, read once and then gone; it
// never appears on another page.
//
// There is no layout editor, no widget library and no chart. Those were removed, not hidden.
//
// The page is the Home template (LAYOUTS.md §1): it declares its type, fills the page header and
// hands over the tiles. The measure and the grid are the template's, never this file's.
import { useMemo, useState } from "react"
import { HomePage as HomeTemplate } from "../../layouts"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Megaphone } from "lucide-react"
import { DoorGroup, ExpandAll, useDisclosure } from "../../ui"
import type { Session } from "../../session"
import { useRenderCount } from "../work/register"
import { homeData, type SectionKey } from "./data"
import { firstName, greeting, headerDate } from "./format"
import { Accounts } from "./Accounts"
import { Approvals } from "./Approvals"
import { Campaigns } from "./Campaigns"
import { Pipeline } from "./Pipeline"
import { Replies } from "./Replies"
import { Health, SetupDoor, healthLines } from "./Health"
import { Today } from "./Today"
import { Week } from "./Week"

/**
 * A workspace change, beside the Home title and nowhere else. It is read once and then gone: the
 * note opens in a popover, and the whole of it is in there — nothing is cut (REVIEW-ALERTS.md §5).
 */
function Announcement({ note }: { note: { text: string; href?: string } }) {
  const [read, setRead] = useState(false)
  if (read) return null
  return (
    <Popover onOpenChange={(open) => { if (!open) setRead(true) }}>
      <PopoverTrigger asChild>
        <Badge variant="outline" className="cursor-pointer font-normal text-muted-foreground">
          <Megaphone aria-hidden="true" />
          What changed
        </Badge>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <p className="t-body">{note.text}</p>
        {note.href && (
          <p className="pt-2">
            <a className="t-body underline underline-offset-4" href={note.href}>Open the request</a>
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function HomePage({ session }: { session: Session }) {
  const renders = useRenderCount()
  const d = useDisclosure("home")
  const data = useMemo(() => homeData(session), [session])
  // What is not fine about the workspace. Nothing here reassures, so an empty list is no tile.
  const lines = healthLines(data, d)

  // A section is on the page when the seat holds at least one of the items in it at level one.
  const has: Record<SectionKey, boolean> = {
    today: d.atLevelOne("home.tasks.due"),
    replies: d.atLevelOne("home.replies.hot"),
    pipeline: ["home.pipeline.mine", "home.pipeline.team", "home.pipeline.warnings", "home.pipeline.closing"].some(d.atLevelOne),
    approvals: d.weekly("home.agents.approvals") > 0,
    campaigns: d.atLevelOne("home.campaigns.running"),
    accounts: ["home.accounts.renewals", "home.accounts.health", "home.accounts.expansion"].some(d.atLevelOne),
    week: d.atLevelOne("home.activity.week") || d.atLevelOne("home.activity.coaching"),
    health: lines.length > 0,
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
  const right = (["approvals", "pipeline", "accounts", "health", "week"] as SectionKey[])
    .filter((k, i, all) => has[k] && all.indexOf(k) === i && !left.includes(k))

  // One column on a phone: the first section, then what waits for a decision, then the rest. The
  // template's grid places the tiles above `lg`, so the order a tile carries is the phone's alone.
  const phone = [left[0], right[0], ...left.slice(1), ...right.slice(1)].filter(Boolean) as SectionKey[]
  const order = (k: SectionKey) => phone.indexOf(k) + 1

  // The template owns the grid (LAYOUTS.md §6) and flows the tiles by height, not by count: it fills
  // the first column, then the next. So the page hands them over in reading order — the work queue,
  // then what waits for a decision — and the template decides where the break falls. Zipping them
  // pair by pair, as a row-by-row grid needed, would put a tall tile beside a short one and leave the
  // rest of that row empty.
  const tiles: SectionKey[] = [...left, ...right]


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
      case "health": return <Health key={key} lines={lines} order={order(key)} />
    }
  }

  return (
    <DoorGroup>
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
        trailing={(
          <span data-print-hide className="flex items-center gap-2">
            {data.announcement && <Announcement note={data.announcement} />}
            <ExpandAll />
          </span>
        )}
        above={d.weekly("home.health.setup") > 0 ? <SetupDoor rows={data.setupRows} /> : undefined}
      >
        {tiles.map(render)}
      </HomeTemplate>
    </DoorGroup>
  )
}
