// Reports registers itself. Product.tsx picks this up; nothing else in the app needs editing.
//
// `P-reports` is the page. `X-forecast` is a panel on its Forecast tab, so it has no route of its
// own in `map.ts`; it is registered here under its map id and renders the page with the Forecast tab
// chosen, so a deep link to the node lands where the panel lives rather than nowhere.
import type { PageComponent } from "../../Product"
import { ReportsPage } from "./ReportsPage"

const ForecastEntry: PageComponent = ({ session }) => <ReportsPage session={session} entry="forecast" />

export const nodes: Record<string, PageComponent> = {
  "P-reports": ({ session }) => <ReportsPage session={session} />,
  "X-forecast": ForecastEntry,
}

/** The one place the win rate and the coverage it requires are computed (spec 12 §2, 19 §4.5). */
export { coverageFor } from "./coverage"
