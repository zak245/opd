// What a pane says about an agent's proposal, and how the row it came from hears it.
//
// An approval read beside Home still has to be decided beside Home, and the decision has to show on
// the row that raised it rather than in a toast that floats away (rule 8). The pane is drawn by the
// shell, not by the section, so it cannot reach into the section's state: it says what was decided
// and the section applies it, keeps the undo line and writes the ledger sentence.
export type Decision = "approved" | "declined"

const DECIDE = "ollopa:approval-decide"

/** Said by the approval pane. */
export function decideApproval(id: string, decision: Decision) {
  document.dispatchEvent(new CustomEvent(DECIDE, { detail: { id, decision } }))
}

/** Heard by the Approvals section. Returns the cleanup an effect wants. */
export function onApprovalDecision(run: (id: string, decision: Decision) => void): () => void {
  const on = (e: Event) => {
    const d = (e as CustomEvent<{ id: string; decision: Decision }>).detail
    if (d) run(d.id, d.decision)
  }
  document.addEventListener(DECIDE, on)
  return () => document.removeEventListener(DECIDE, on)
}
