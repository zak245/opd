// Home registers itself with Product.tsx. The node id is IA-MAP's.
//
// It also registers the pane an agent's proposal reads in. That object belongs to Agents, which is
// not a Stage 2 folder and has nothing registered; Home is the page where a proposal is read and
// decided, so the renderer lives here until Agents claims it. If Agents ever registers `agent-run`,
// this one goes and the chain keeps working.
//
// A decision taken in here is written to the shared store (src/ollopa/edits.ts), which is where the
// row behind reads it from: one source, so the pane and the section cannot disagree.
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PageComponent } from "../../Product"
import { closeBeside, openBeside, type BesideComponent } from "../../beside"
import { editOf, recordEdit } from "../../edits"
import { ConsequenceLine, consequenceText } from "../../ui/ConsequenceLine"
import { seedFor } from "../../data/seed"
import { HomePage } from "./HomePage"
import { consequenceOf, proposalOf, wordsOf } from "./data"
import { count, when } from "./format"

export const nodes: Record<string, PageComponent> = {
  "P-home": ({ session }) => <HomePage session={session} />,
}

/**
 * An agent's proposal read beside Home: what it will do, what that costs, and the draft or the
 * sources it was built from — flat, because a pane never contains a door. Approve and Decline are
 * here because they are the decision the row is asking for; the section behind hears them and the
 * row changes there, where it was caused, with its undo line.
 */
const ApprovalBeside: BesideComponent = ({ session, id, target }) => {
  const seed = seedFor(session.business)
  const e = seed.agentEvents.find((x) => x.id === id)
  if (!e) return <p className="text-muted-foreground">This agent run is not in {seed.workspace.name}.</p>

  const words = wordsOf(e)
  const consequence = consequenceOf(e)

  /**
   * Deciding takes this proposal off the queue, so the pane moves with the queue: the proposal that
   * took its place, counted against what is waiting now. The section behind reads the same record
   * and changes its row in place, with its own undo line.
   */
  const decide = (decision: "approved" | "declined") => {
    const note = decision === "approved"
      ? `Approved · ${consequenceText(consequence)}`
      : `Declined · ${proposalOf(e)}. Nothing was sent and nothing was spent.`
    recordEdit("agent-run", e.id, { decision, note })

    const was = target.list?.ids ?? [e.id]
    const rest = was.filter((x) => x !== e.id && !editOf("agent-run", x)?.decision)
    if (rest.length === 0) { closeBeside(); return }
    const index = Math.min(Math.max(0, was.indexOf(e.id)), rest.length - 1)
    openBeside({ kind: "agent-run", id: rest[index], list: { ids: rest, index }, opener: target.opener })
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-medium">{proposalOf(e)}</p>
        <ConsequenceLine {...consequence} className="mt-0.5" />
      </div>

      <dl className="space-y-2.5">
        <div className="grid grid-cols-[7rem_1fr] items-baseline gap-3">
          <dt className="text-xs text-muted-foreground">Agent</dt>
          <dd><Badge variant="outline" className="font-normal">{e.agent}</Badge></dd>
        </div>
        <div className="grid grid-cols-[7rem_1fr] items-baseline gap-3">
          <dt className="text-xs text-muted-foreground">Proposed</dt>
          <dd>{when(e.when)}</dd>
        </div>
        <div className="grid grid-cols-[7rem_1fr] items-baseline gap-3">
          <dt className="text-xs text-muted-foreground">Because</dt>
          <dd className="min-w-0">{e.trigger}</dd>
        </div>
        <div className="grid grid-cols-[7rem_1fr] items-baseline gap-3">
          <dt className="text-xs text-muted-foreground">Owner</dt>
          <dd>{e.ownerId}</dd>
        </div>
      </dl>

      {/* Built from, then the draft itself: the whole text, never a summary of it. */}
      <div className="border-t pt-3">
        <p className="text-xs text-muted-foreground">
          Built from:{" "}
          {e.inputs.map((input, i) => (
            <span key={input.label}>{i > 0 && " · "}{input.label}</span>
          ))}
        </p>
        {e.draft
          ? <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted/50 p-2 text-xs">{e.draft}</p>
          : <p className="mt-1 text-xs text-muted-foreground">{e.detail}</p>}
        {e.draft && <p className="pt-1 text-xs text-muted-foreground">{count(words)} words · {e.sources.length} sources</p>}
        {e.sourceQuote && <p className="pt-1 text-xs text-muted-foreground">{e.sourceQuote}</p>}
      </div>

      <div className="space-y-3 border-t pt-3">
        <div>
          <Button size="sm" className="w-full justify-start" onClick={() => decide("approved")}>Approve</Button>
          <ConsequenceLine {...consequence} className="mt-1" />
        </div>
        <div>
          <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => decide("declined")}>Decline</Button>
          <ConsequenceLine className="mt-1" changes="Nothing is sent and nothing is spent; the run stays in this week's ledger" />
        </div>
      </div>
    </div>
  )
}

ApprovalBeside.head = ({ session, id }) => {
  const e = seedFor(session.business).agentEvents.find((x) => x.id === id)
  if (!e) return { name: id, context: "", route: "/ollopa/agents" }
  return { name: proposalOf(e), context: `${e.agent} · ${when(e.when)}`, route: "/ollopa/agents" }
}

export const besides: Record<string, BesideComponent> = { "agent-run": ApprovalBeside }
