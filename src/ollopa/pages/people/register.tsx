// The People nodes: the table, the quick look it opens beside itself, and the contact record.
//
// `Q-person` has no route of its own — a drawer carries no deep link, which is the reason the record
// page exists — so the node resolves to the table that opens it, and the drawer opens from a row, from
// Enter on a focused row and from "Quick look" in the row's menu.
import type { PageComponent } from "../../Product"
import { PeoplePage } from "./PeoplePage"
import { ContactRecord } from "./ContactRecord"

export const nodes: Record<string, PageComponent> = {
  "P-people": ({ session }) => <PeoplePage session={session} />,
  "Q-person": ({ session }) => <PeoplePage session={session} />,
  "R-person": ({ session, id }) => <ContactRecord session={session} id={id} />,
}
