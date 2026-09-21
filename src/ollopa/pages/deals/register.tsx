// The nodes this folder owns, and the pane a deal reads in when another page opens it beside itself.
//
// `Q-deal` is the deal quick look: a drawer over the board, not a page of its own, so it renders the
// board with that deal's glance already open. The record it opens into is `R-deal`, which lives in
// pages/deal and is linked to from here, never rebuilt.
import { useState } from "react"
import { declarePaneFields } from "../../ui/Beside"
import { Input } from "@/components/ui/input"
import type { PageComponent } from "../../Product"
import type { BesideComponent } from "../../beside"
import { Actions } from "../../ui/Actions"
import { useDisclosure } from "../../ui/useDisclosure"
import { seedFor } from "../../data/seed"
import { DealsBoard } from "./DealsBoard"
import { recordEdit, useEdit } from "../../edits"
import { WON_STAGE, dealGlanceFields } from "./pipeline"

export const nodes: Record<string, PageComponent> = {
  "P-deals": ({ session }) => <DealsBoard session={session} />,
  "Q-deal": ({ session, id }) => <DealsBoard session={session} glanceAt={id} />,
}

function say(text: string) {
  document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: text }))
}

/**
 * A deal read beside another page: level one of the record, and the one act a chain runs here.
 *
 * The fields are `dealGlanceFields` — the same six, in the same order, with the same labels as the
 * top of the deal record and the board's quick look — so a deal read beside a company page is the
 * record's first level and not a third version of a deal.
 *
 * Closing won and marking lost are not here. Neither can be undone, and an act that cannot be undone
 * belongs on the record page with its confirmation (DESIGN.md §1 and §2); the pane's way to them is
 * "Open the page" above, which is a link because it is a destination and not a state change. What is
 * left is the one act a person reading a deal beside something else actually runs: saying what
 * happens next. It is reversible and free, so nothing is written under it.
 */
const DealBeside: BesideComponent = ({ session, id }) => {
  const seed = seedFor(session.business)
  // The same question the deal record asks before it lays out its header: which of the deal's fields
  // this seat at this business actually touches in a week. The pane shows those, in the record's
  // order, and nothing else — so what a Meridian AE reads here is not what the admin reads.
  const dealLevel = useDisclosure("deal")
  declarePaneFields("deal")
  // What an earlier action in this session did to this deal, from the one store the cards and the
  // table behind this pane read too, so the pane and the row can never say different things.
  const edit = useEdit("deal", id)
  // What the person typed, kept against the deal it was typed for: `]` walks the pane to another
  // deal without unmounting it, and a step written about one deal is not about the next.
  const [next, setNext] = useState<{ id: string; text: string } | null>(null)
  const found = seed.deals.find((x) => x.id === id)
  if (!found) return <p className="text-muted-foreground">This deal is not in {seed.workspace.name}.</p>

  const deal = { ...found, ...(edit as Partial<typeof found>) }
  const canEdit = deal.owner === session.user || session.role === "admin"
  const step = next?.id === id ? next.text : ""

  const setNextStep = () => {
    if (!step.trim()) return
    recordEdit("deal", deal.id, { nextStep: step.trim(), note: `next step: ${step.trim()}` })
    setNext({ id, text: "" })
    say(`Next step on ${deal.name}: ${step.trim()}.`)
  }

  return (
    <div className="space-y-4">
      <dl className="space-y-2.5">
        {dealGlanceFields(deal, seed.workspace.currency, dealLevel.atLevelOne).map((f) => (
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

      {/* A seat that may not change this deal gets the sentence naming who can, not a disabled
          control (RULES.md rule 4). A control is disabled only for state this person can change —
          here, an empty next step. */}
      {!canEdit ? (
        <p className="border-t pt-3 text-xs text-muted-foreground">
          Owned by {deal.owner}; only the owner or an admin can change this deal.
        </p>
      ) : (
        <div className="border-t pt-3">
          <Input
            value={step}
            onChange={(e) => setNext({ id, text: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") setNextStep() }}
            aria-label={`The next step on ${deal.name}`}
            placeholder="What happens next"
            className="mb-3 h-8 text-xs"
          />
          <Actions
            surface="pane"
            layout="stack"
            items={[{
              kind: "secondary",
              label: "Set the next step",
              onClick: setNextStep,
              disabledBecause: step.trim() ? undefined : "Say what happens next, above",
            }]}
          />
        </div>
      )}
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
