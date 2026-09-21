// The People nodes: the table, the quick look it opens beside itself, and the contact record —
// plus the pane a contact reads in when another page opens them beside itself.
//
// `Q-person` has no route of its own — a drawer carries no deep link, which is the reason the record
// page exists — so the node resolves to the table that opens it, and the drawer opens from a row, from
// Enter on a focused row and from "Quick look" in the row's menu.
import { Button } from "@/components/ui/button"
import type { PageComponent } from "../../Product"
import type { BesideComponent } from "../../beside"
import { ConsequenceLine } from "../../ui/ConsequenceLine"
import { CREDITS, seedFor } from "../../data/seed"
import { PeoplePage } from "./PeoplePage"
import { ContactRecord } from "./ContactRecord"
import { editPerson, usePersonEdits } from "./edits"
import { glanceFields, rowsFor } from "./person"

export const nodes: Record<string, PageComponent> = {
  "P-people": ({ session }) => <PeoplePage session={session} />,
  "Q-person": ({ session }) => <PeoplePage session={session} />,
  "R-person": ({ session, id }) => <ContactRecord session={session} id={id} />,
}

function say(text: string) {
  document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: text }))
}

/**
 * A contact read beside another page: level one of the record, and the three things a chain that
 * arrives here wants to do with them.
 *
 * The fields are `glanceFields` — the same list, the same order, the same labels as the quick look
 * and the top of the record page — so a person reading beside a sequence is reading the record's
 * first level and not a third version of a contact. Nothing here opens a door, a panel or another
 * pane: past these fields the way on is "Open the page" in the frame above.
 */
const PersonBeside: BesideComponent = ({ session, id }) => {
  const seed = seedFor(session.business)
  // What earlier actions in this session did to this person. Read here as well as in the list
  // behind, so the pane and the row can never say two different things about the same contact.
  const edit = usePersonEdits()[id]
  const found = rowsFor(seed).find((r) => r.id === id)
  if (!found) return <p className="text-muted-foreground">This person is not in {seed.workspace.name}.</p>

  const p = {
    ...found,
    inSequence: edit?.sequence !== undefined ? edit.sequence || null : found.inSequence,
    phoneRevealed: found.phoneRevealed || edit?.phoneRevealed === true,
  }

  const from = seed.mailboxes.find((m) => m.owner === session.user)?.address
  const blocked = p.doNotContact
  const canCall = p.phoneRevealed && !!p.phoneNumber
  // Where "Add to a sequence" puts them, and where "Move" moves them to: the workspace's own first
  // sequence, or the next one along when they are already in it.
  const sequences = seed.sequences.map((s) => s.name)
  const target = sequences.find((n) => n !== p.inSequence) ?? "Outbound"

  const addToSequence = () => {
    const was = p.inSequence
    editPerson(p.id, {
      sequence: target,
      note: was ? `Moved from ${was} to ${target} · step 1` : `Added to ${target} · step 1`,
    })
    say(was ? `${p.name} moved from ${was} to ${target}. They start again at step 1.` : `${p.name} added to ${target} at step 1.`)
  }

  const draftEmail = () => {
    editPerson(p.id, { note: `Draft written · ${CREDITS.draft} credits · waiting for you to send` })
    say(`Draft ready for ${p.name} · ${CREDITS.draft} credits. It is in your drafts.`)
  }

  const callOrReveal = () => {
    if (canCall) {
      editPerson(p.id, { note: `Called ${p.phoneNumber} · logged on the record` })
      say(`Calling ${p.name} · ${p.phoneNumber}. The call is logged on their record.`)
      return
    }
    editPerson(p.id, { phoneRevealed: true, note: `Phone revealed · ${CREDITS.revealPhone} credits` })
    say(`Phone revealed for ${p.name} · ${CREDITS.revealPhone} credits. The number stays on the record.`)
  }

  return (
    <div className="space-y-4">
      <dl className="space-y-2.5">
        {glanceFields(p, seed).map((f) => (
          <div key={f.label} className="grid grid-cols-[7rem_1fr] items-baseline gap-3">
            <dt className="text-xs text-muted-foreground">{f.label}</dt>
            <dd className="min-w-0">{f.value}</dd>
          </div>
        ))}
      </dl>

      {/* What the last action did, where it was caused. The row behind says the same sentence. */}
      {edit?.note && (
        <p role="status" aria-live="polite" className="rounded-md bg-muted px-2.5 py-1.5 text-xs">{edit.note}</p>
      )}

      {/* The actions the chain needs: a real control each, with what it will do written under it. */}
      <div className="space-y-3 border-t pt-3">
        <div>
          <Button size="sm" variant="outline" className="w-full justify-start" onClick={addToSequence}>
            {p.inSequence ? `Move to ${target}` : `Add to ${target}`}
          </Button>
          <ConsequenceLine
            className="mt-1"
            changes={p.inSequence
              ? `Takes ${p.name} out of ${p.inSequence} and starts them at step 1 of ${target}`
              : `Starts ${p.name} at step 1; the first email goes in ${target}'s next sending window`}
          />
        </div>

        <div>
          <Button size="sm" variant="outline" className="w-full justify-start" disabled={blocked} onClick={draftEmail}>
            Draft an email
          </Button>
          <ConsequenceLine
            className="mt-1"
            {...(blocked
              ? { changes: `${p.name} is marked do not contact, so nothing can be sent` }
              : { sends: 1, to: p.name, from, credits: CREDITS.draft, changes: "Replies land in your Inbox" })}
          />
        </div>

        <div>
          <Button size="sm" variant="outline" className="w-full justify-start" disabled={p.doNotCall} onClick={callOrReveal}>
            {canCall ? `Call ${p.phoneNumber}` : `Reveal the phone · ${CREDITS.revealPhone} credits`}
          </Button>
          <ConsequenceLine
            className="mt-1"
            {...(p.doNotCall
              ? { changes: `${p.name} is marked do not call${p.doNotCallSource ? ` · ${p.doNotCallSource}` : ""}` }
              : canCall
                ? { changes: `Opens the dialler and logs the call on ${p.name}'s record` }
                : { credits: CREDITS.revealPhone, changes: "Charged once; the number stays on the record" })}
          />
        </div>
      </div>
    </div>
  )
}

/** The frame's header: the name, one line of context, and where "Open the page" goes. */
PersonBeside.head = ({ session, id }) => {
  const p = seedFor(session.business).contacts.find((c) => c.id === id)
  if (!p) return { name: id, context: "", route: `/ollopa/people/${id}` }
  return { name: p.name, context: `${p.title} · ${p.company}`, route: `/ollopa/people/${p.id}` }
}

export const besides: Record<string, BesideComponent> = { person: PersonBeside }
