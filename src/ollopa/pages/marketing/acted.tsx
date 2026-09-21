// What an action took on a campaign, an audience, a form or a workflow this session — so the row it
// was caused on says so at once, and can be put back.
//
// The pane is drawn by the shell and the row by the page; they share no props. Opening a pane must
// not re-render the page, so a pane's action writes one small record in the shared store
// (`src/ollopa/edits.ts`) and only the rows reading that kind redraw (chain rule 8). Rows that show a
// person use the same store under the kind "person", which is what the people folder writes.
//
// Undo here is real, not cosmetic: these four kinds have state in the marketing store, so the record
// carries the values the action replaced and Undo puts them back before dropping the note.
import { clearEdit, recordEdit, useEdit, type Edit } from "../../edits"
import type { Business } from "../../usage/model"
import { UNDO_MS, useTick } from "../engage/shared"
import { patchRow } from "./store"

/** The four objects this folder owns, as the shared store files them. */
export type MarketingKind = "campaign" | "audience" | "form" | "workflow"

/** The same four, as the marketing store names its tables. */
const TABLE = { campaign: "campaigns", audience: "audiences", form: "forms", workflow: "workflows" } as const

/** An action on one of these four: change the row, and say on the row what changed. */
export function actOn(
  business: Business,
  kind: MarketingKind,
  id: string,
  patch: Record<string, unknown>,
  /** The values the patch replaced, so Undo is a real undo and not just a vanished sentence. */
  before: Record<string, unknown>,
  note: string,
) {
  apply(business, kind, id, patch)
  recordEdit(kind, id, { note, before })
}

/** An action with nothing to put back — a test send, a copied link. The note is the whole record. */
export function noteOn(kind: MarketingKind, id: string, note: string) {
  recordEdit(kind, id, { note })
}

/** Put back what the action replaced, then drop the note. */
export function undoAct(business: Business, kind: MarketingKind, id: string, edit: Edit) {
  const before = edit.before as Record<string, unknown> | undefined
  if (before) apply(business, kind, id, before)
  clearEdit(kind, id)
}

function apply(business: Business, kind: MarketingKind, id: string, patch: Record<string, unknown>) {
  // One call per table so the store keeps its per-table types; the patch is the caller's own shape.
  const table = TABLE[kind]
  if (table === "campaigns") patchRow(business, "campaigns", id, patch)
  else if (table === "audiences") patchRow(business, "audiences", id, patch)
  else if (table === "forms") patchRow(business, "forms", id, patch)
  else patchRow(business, "workflows", id, patch)
}

/** True while the record is new enough that the row should still offer Undo. */
export const undoable = (e?: Edit) => !!e?.at && Date.now() - e.at < UNDO_MS

/** One object's record, subscribed, for a pane — which draws one thing and must follow it. */
export function useActed(kind: MarketingKind, id: string): Edit | undefined {
  return useEdit(kind, id)
}

/**
 * One line under a row's name saying what the last action did to it, with Undo while the window is
 * open. This is chain rule 8 in one component: a pane's action writes to the shared store, and the
 * row it was caused on says so at once, in place, without the pane telling the page anything.
 */
export function ActedNote({ business, kind, id, edit }: {
  business: Business
  kind: MarketingKind
  id: string
  edit: Edit | undefined
}) {
  const fresh = undoable(edit)
  useTick(fresh)
  if (!edit?.note) return null
  return (
    <div role="status" className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
      <span className="rounded bg-muted px-1.5 py-0.5 font-normal">{String(edit.note)}</span>
      {fresh && (
        <button
          type="button"
          className="underline underline-offset-2 hover:text-foreground"
          onClick={(e) => { e.stopPropagation(); undoAct(business, kind, id, edit) }}
        >
          Undo
        </button>
      )}
    </div>
  )
}
