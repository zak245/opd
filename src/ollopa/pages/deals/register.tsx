// The nodes this folder owns, and the pane a deal reads in when another page opens it beside itself.
//
// `Q-deal` is the deal quick look: a drawer over the board, not a page of its own, so it renders the
// board with that deal's glance already open. The record it opens into is `R-deal`, which lives in
// pages/deal and is linked to from here, never rebuilt.
import { Button } from "@/components/ui/button"
import type { PageComponent } from "../../Product"
import type { BesideComponent } from "../../beside"
import { ConsequenceLine } from "../../ui/ConsequenceLine"
import { businessById } from "../../data/businesses"
import { TODAY, seedFor } from "../../data/seed"
import { DealsBoard } from "./DealsBoard"
import { recordEdit, useEdit } from "../../edits"
import { WON_STAGE, dealGlanceFields, lostConsequenceText, wonConsequenceText } from "./pipeline"

export const nodes: Record<string, PageComponent> = {
  "P-deals": ({ session }) => <DealsBoard session={session} />,
  "Q-deal": ({ session, id }) => <DealsBoard session={session} glanceAt={id} />,
}

function say(text: string) {
  document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: text }))
}

/**
 * A deal read beside another page: level one of the record, and the two things that end a deal.
 *
 * The fields are `dealGlanceFields` — the same six, in the same order, with the same labels as the
 * top of the deal record and the board's quick look — so a deal read beside a company page is the
 * record's first level and not a third version of a deal. Closing it won and marking it lost carry
 * the record's own consequence sentences, word for word. Nothing here opens a door, a panel or
 * another pane: past these the way on is "Open the page" in the frame above.
 */
const DealBeside: BesideComponent = ({ session, id }) => {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  // What an earlier action in this session did to this deal, from the one store the cards and the
  // table behind this pane read too, so the pane and the row can never say different things.
  const edit = useEdit("deal", id)
  const found = seed.deals.find((x) => x.id === id)
  if (!found) return <p className="text-muted-foreground">This deal is not in {seed.workspace.name}.</p>

  const deal = { ...found, ...(edit as Partial<typeof found>) }
  const closed = deal.stage === WON_STAGE
  const archived = !!deal.archivedAt
  const won = wonConsequenceText(deal, seed, b)
  const lost = lostConsequenceText(deal, seed, b)
  const canEdit = deal.owner === session.user || session.role === "admin"

  return (
    <div className="space-y-4">
      <dl className="space-y-2.5">
        {dealGlanceFields(deal, seed.workspace.currency).map((f) => (
          <div key={f.label} className="grid grid-cols-[7rem_1fr] items-baseline gap-3">
            <dt className="text-xs text-muted-foreground">{f.label}</dt>
            <dd className="min-w-0">{f.value}</dd>
          </div>
        ))}
      </dl>

      {/* What the last action did, where it was caused. */}
      {edit?.note && (
        <p role="status" aria-live="polite" className="rounded-md bg-muted px-2.5 py-1.5 text-xs">{edit.note}</p>
      )}

      {/* The two actions a chain that arrives at a deal needs, each with what it will do under it. */}
      <div className="space-y-3 border-t pt-3">
        <div>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start"
            disabled={!canEdit || closed || archived}
            onClick={() => {
              recordEdit("deal", deal.id, { stage: WON_STAGE, probability: 100, forecast: "Closed", note: `Closed won · ${won}` })
              say(`${deal.name} closed won.`)
            }}
          >
            Close won
          </Button>
          <ConsequenceLine
            className="mt-1"
            changes={closed ? `${deal.name} is already closed won` : !canEdit ? `Owned by ${deal.owner}; only the owner or an admin can close it` : won}
          />
        </div>

        <div>
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start"
            disabled={!canEdit || archived}
            onClick={() => {
              recordEdit("deal", deal.id, { archivedAt: TODAY, lostReason: "No decision", note: `Archived as lost · No decision · ${lost}` })
              say(`${deal.name} archived as lost.`)
            }}
          >
            Mark lost and archive
          </Button>
          <ConsequenceLine
            className="mt-1"
            changes={archived ? `${deal.name} was archived as lost · ${deal.lostReason}` : !canEdit ? `Owned by ${deal.owner}; only the owner or an admin can archive it` : lost}
          />
        </div>
      </div>
    </div>
  )
}

/** The frame's header: the name, one line of context, and where "Open the page" goes. */
DealBeside.head = ({ session, id }) => {
  const seed = seedFor(session.business)
  const found = seed.deals.find((x) => x.id === id)
  if (!found) return { name: id, context: "", route: `/ollopa/deals/${id}` }
  // Who and where, not what state it is in: the frame's header does not re-render when an action in
  // the body changes the stage, so a stage printed here would be the one thing that could go stale.
  return {
    name: found.name,
    context: `${found.company} · ${found.owner}`,
    route: `/ollopa/deals/${found.id}`,
  }
}

export const besides: Record<string, BesideComponent> = { deal: DealBeside }
