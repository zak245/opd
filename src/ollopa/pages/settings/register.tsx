// The node ids this folder answers for.
//
// Settings is one page; the twelve area nodes are deep links into it, so `#/ollopa/settings/plan`
// opens the same page at the area it names rather than a second screen (IA-MAP convention 1:
// navigation costs no level). Requests is a page and a record of its own.
import type { PageComponent } from "../../Product"
import { AREA_BY_NODE, SettingsPage } from "./SettingsPage"
import { RequestsPage } from "./RequestsPage"
import { RequestRecord } from "./RequestRecord"

const areaNodes: Record<string, PageComponent> = Object.fromEntries(
  Object.keys(AREA_BY_NODE).map((node) => [node, ((props) => <SettingsPage session={props.session} node={node} />) as PageComponent]),
)

export const nodes: Record<string, PageComponent> = {
  "P-settings": ({ session }) => <SettingsPage session={session} />,
  ...areaNodes,
  "P-requests": ({ session }) => <RequestsPage session={session} />,
  "R-request": ({ session, id }) => <RequestRecord session={session} id={id} />,
}
