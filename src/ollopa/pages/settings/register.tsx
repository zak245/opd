// The node ids this folder answers for, and the pane one setting reads in.
//
// Settings is one page; the twelve area nodes are deep links into it, so `#/ollopa/settings/plan`
// opens the same page at the area it names rather than a second screen (IA-MAP convention 1:
// navigation costs no level). Requests is a page and a record of its own.
import { useMemo } from "react"
import type { PageComponent } from "../../Product"
import type { BesideComponent } from "../../beside"
import { declarePaneFields } from "../../ui/Beside"
import { businessById } from "../../data/businesses"
import { nodeById } from "../../map"
import { seedFor } from "../../data/seed"
import { settingsItems } from "../../usage/settings"
import type { Session } from "../../session"
import { AREA_BY_NODE, SettingsPage } from "./SettingsPage"
import { RequestsPage } from "./RequestsPage"
import { RequestRecord } from "./RequestRecord"
import { settingsFor } from "./derived"
import { Row, personalRows, rowsFor, type RowCtx, type SettingRow } from "./rows"
import { SaveBar, SettingsState, toast } from "./state"
import { Fields } from "../../layouts"
import { Chip } from "../../ui/Identity"
import { day, money, plural } from "./format"
import { STATE_LABEL, STATE_STATUS, waitingOf } from "./RequestsPage"

const areaNodes: Record<string, PageComponent> = Object.fromEntries(
  Object.keys(AREA_BY_NODE).map((node) => [node, ((props) => <SettingsPage session={props.session} node={node} />) as PageComponent]),
)

export const nodes: Record<string, PageComponent> = {
  "P-settings": ({ session }) => <SettingsPage session={session} />,
  ...areaNodes,
  "P-requests": ({ session }) => <RequestsPage session={session} />,
  "R-request": ({ session, id }) => <RequestRecord session={session} id={id} />,
}

/* -------------------------------------------------------------------- one setting, read beside */

/** The settings area a row lives in, and the route that opens the page at it — the map's own. */
const ROUTE_BY_AREA: Record<string, string> = Object.fromEntries(
  Object.entries(AREA_BY_NODE).map(([node, area]) => [area, nodeById(node)?.route ?? "/ollopa/settings"]),
)

function areaOf(id: string): string {
  return settingsItems.find((i) => i.id === id)?.area ?? "You"
}

/** Where "Open the page" goes: the settings area, naming the row, so the row is lit on arrival. */
function routeFor(id: string): string {
  return `${ROUTE_BY_AREA[areaOf(id)] ?? "/ollopa/settings"}?row=${encodeURIComponent(id)}`
}

/**
 * The context a row needs to build itself. A setting read beside another page is the row and only
 * the row: the drawers, View as and the settings search all belong to the page, so asking for one
 * from in here says where it lives rather than opening a second surface over the first.
 */
function besideCtx(session: Session): RowCtx {
  const b = businessById(session.business)
  return {
    session,
    user: session.user,
    role: session.role,
    business: session.business,
    seed: seedFor(session.business),
    b,
    st: settingsFor(session.business),
    admin: b.roles.find((r) => r.role === "admin")?.user ?? "your admin",
    isAdmin: session.role === "admin",
    open: () => toast("That opens on the Settings page. Open the page to go there."),
    viewAs: () => toast("View as a teammate is on the Settings page."),
    search: () => toast("The settings search is on the Settings page."),
  }
}

function findRow(session: Session, id: string): SettingRow | undefined {
  const ctx = besideCtx(session)
  return [...personalRows(ctx), ...rowsFor(ctx)].find((r) => r.id === id)
}

/**
 * One setting read beside the page that needed it: the label, what it is set to now, the real
 * control, and the page's one Save convention — nothing saves on its own, the change raises the bar,
 * and the bar names what it will save. That is the whole pane. A setting that needs its drawer, its
 * neighbours or the search needs the page, and "Open the page" above is how you get there.
 */
const SettingBeside: BesideComponent = ({ session, id }) => (
  <SettingsState>
    <SettingBesideBody session={session} id={id} />
  </SettingsState>
)

function SettingBesideBody({ session, id }: { session: Session; id: string }) {
  declarePaneFields("settings")   // one setting row, at the level the settings model gives it
  const ctx = useMemo(() => besideCtx(session), [session])
  const row = useMemo(() => [...personalRows(ctx), ...rowsFor(ctx)].find((r) => r.id === id), [ctx, id])
  if (!row) return <p className="text-muted-foreground">This workspace has no setting called {id}.</p>
  return (
    <div className={
      // 28 rem is narrower than a settings row expects: labels go above their control, a control
      // that is a long line of text wraps instead of running off the edge, and nothing scrolls sideways.
      "-mx-1 flex min-h-full flex-col [&_button]:h-auto [&_button]:whitespace-normal [&_button]:text-left [&_button]:py-1"
    }>
      {/* The same Row the page draws, with a DOM id of its own so the page's copy stays the page's. */}
      <Row row={row} admin={ctx.admin} idPrefix="beside-row-" stacked />
      <div className="mt-auto pt-3"><SaveBar /></div>
    </div>
  )
}

/** The frame's header: the setting's name, the area it lives in, and where "Open the page" goes. */
SettingBeside.head = ({ session, id }) => {
  const row = findRow(session, id)
  return { name: row?.label ?? id, context: `${areaOf(id)} · Settings`, route: routeFor(id) }
}

/* ------------------------------------------------------------------- one request, read beside */

/**
 * A request read beside the queue: what was asked, how long it has waited, where it stands and who
 * decides. The acts that change somebody else's week stay on the record page, which is what
 * "Open the page" is for (BUILD-CHAINS.md: beside, not instead).
 */
const RequestBeside: BesideComponent = ({ session, id }) => {
  const seed = seedFor(session.business)
  const target = seed.workspace.answerTarget.businessDays
  const r = seed.requests.find((x) => x.id === id)
  if (!r) return <p className="text-muted-foreground">That request is not here.</p>
  const w = waitingOf(r, target)
  return (
    <Fields fields={[
      { id: "waiting", label: "Waiting", value: w.past > 0 ? <Chip status="overdue">{w.text}</Chip> : w.text },
      { id: "state", label: "State", value: <Chip status={STATE_STATUS[r.state]}>{STATE_LABEL[r.state]}</Chip> },
      { id: "asked", label: "Asked by", value: r.requester.user, note: `Raised ${day(r.raisedOn)}` },
      { id: "decides", label: "Decides", value: r.decisionOwner },
      { id: "affects", label: "Affects", value: `${plural(r.affected.count, "person", "people")}` },
      { id: "kind", label: "Kind", value: r.kind === "upgrade" ? "Locked feature" : "Workspace change" },
      ...(r.upgrade ? [{ id: "cost", label: "Cost", value: `${money(r.upgrade.monthlyTotal)} a month`, note: r.upgrade.plan }] : []),
      { id: "touches", label: "What it touches", value: r.touches.map((t) => t.name).join(" · ") || "—" },
    ]} />
  )
}

RequestBeside.head = ({ session, id }) => {
  const r = seedFor(session.business).requests.find((x) => x.id === id)
  return { name: r?.outcome ?? id, context: "Requests", route: `/ollopa/requests/${id}` }
}

export const besides: Record<string, BesideComponent> = { setting: SettingBeside, request: RequestBeside }
