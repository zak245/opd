// The Agents page registers itself here; Product.tsx picks it up and nothing else needs editing.
//
// Three node ids, one page: `P-agents` is the page, `R-agent-run` is a single event reached by the
// link on its row ("Copy a link to this event"), and `X-agent-batch` is the batch panel the palette's
// "Review n waiting" and Home's agent row open. The last two render the page with the item focused or
// the panel open, because a deep link never skips a level: the parent renders with the child open.
import type { PageComponent } from "../../Product"
import { AgentsPage } from "./AgentsPage"

export const nodes: Record<string, PageComponent> = {
  "P-agents": AgentsPage,
  "R-agent-run": AgentsPage,
  "X-agent-batch": AgentsPage,
}
