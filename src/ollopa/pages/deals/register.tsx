// The nodes this folder owns. Product.tsx picks them up; nothing else needs editing.
//
// `Q-deal` is the deal quick look: a drawer over the board, not a page of its own, so it renders the
// board with that deal's glance already open. The record it opens into is `R-deal`, which lives in
// pages/deal and is linked to from here, never rebuilt.
import type { PageComponent } from "../../Product"
import { DealsBoard } from "./DealsBoard"

export const nodes: Record<string, PageComponent> = {
  "P-deals": ({ session }) => <DealsBoard session={session} />,
  "Q-deal": ({ session, id }) => <DealsBoard session={session} glanceAt={id} />,
}
