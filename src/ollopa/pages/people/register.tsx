// The People nodes: the table, the quick look it opens beside itself, and the contact record —
// plus the pane a contact reads in when another page opens them beside itself.
//
// `Q-person` has no route of its own — a drawer carries no deep link, which is the reason the record
// page exists — so the node resolves to the table that opens it, and the drawer opens from a row, from
// Enter on a focused row and from "Quick look" in the row's menu.
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PageComponent } from "../../Product"
import type { BesideComponent } from "../../beside"
import { Actions, type Action } from "../../ui/Actions"
import { useBesideDone, declarePaneFields } from "../../ui/Beside"
import { useDisclosure } from "../../ui/useDisclosure"
import { CREDITS, seedFor } from "../../data/seed"
import { PeoplePage } from "./PeoplePage"
import { ContactRecord } from "./ContactRecord"
import { clearPersonEdit, editPerson, usePersonEdit } from "./edits"
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
  // What sits at level one for this seat at this business — the same question the record page and
  // the quick look ask, so the pane is not a third opinion about what a contact is.
  const d = useDisclosure("people")
  declarePaneFields("people")
  // What earlier actions in this session did to this person, from the one store every page reads.
  // The row behind this pane — on a sequence, a company, a task queue or People — reads the same
  // record under `useEdits("person")`, so the pane and the page can never say different things.
  const edit = usePersonEdit(id)
  // The destination the person chose, kept against the id it was chosen for: `]` walks the pane to
  // another contact without unmounting it, and a choice made about one person is not about the next.
  const [picked, setPicked] = useState<{ id: string; dest: string } | null>(null)

  const found = rowsFor(seed).find((r) => r.id === id)

  /**
   * Putting it back has to do more than drop the record — the picker goes back to empty and the
   * person is told in words — so the frame's footer line takes this undo instead of its default.
   */
  const undo = () => {
    clearPersonEdit(id)
    setPicked({ id, dest: "" })
    if (found) say(`Put back as it was: ${found.name} is ${found.inSequence ? `in ${found.inSequence}` : "not in a sequence"} again.`)
  }
  useBesideDone(typeof edit?.note === "string" ? { note: edit.note, onUndo: undo } : null)

  if (!found) return <p className="text-muted-foreground">This person is not in {seed.workspace.name}.</p>

  const p = {
    ...found,
    inSequence: edit?.sequence !== undefined ? edit.sequence || null : found.inSequence,
    phoneRevealed: found.phoneRevealed || edit?.phoneRevealed === true,
  }

  const from = seed.mailboxes.find((m) => m.owner === session.user)?.address
  const blocked = p.doNotContact
  const canCall = p.phoneRevealed && !!p.phoneNumber

  /* ------------------------------------------------------------- the move, chosen not guessed */

  // Where they could go: this workspace's sequences, minus the one they are in now.
  const options = seed.sequences.map((sq) => sq.name).filter((n) => n !== p.inSequence)
  // Nothing is chosen until the person chooses it, so the button never picks a destination for
  // them and never changes its own mind between two clicks.
  const dest = picked?.id === id ? picked.dest : ""
  const verb = p.inSequence ? "Move" : "Add"

  const move = () => {
    if (!dest) return
    const was = p.inSequence
    editPerson(p.id, {
      sequence: dest,
      note: was ? `moved from ${was} to ${dest} · step 1` : `added to ${dest} · step 1`,
    })
    // The picker goes back to empty: the action is finished, and the next one is a fresh choice.
    setPicked({ id, dest: "" })
    say(was ? `${p.name} moved from ${was} to ${dest}. They start again at step 1.` : `${p.name} added to ${dest} at step 1.`)
  }

  const draftEmail = () => {
    editPerson(p.id, { note: `draft written · ${CREDITS.draft} credits · waiting for you to send` })
    say(`Draft ready for ${p.name} · ${CREDITS.draft} credits. It is in your drafts.`)
  }

  /** Whether this seat reads the action weekly. The model answers; nothing here is hard-coded. */
  const shows = (itemId: string) => d.level(itemId) === 1

  const listName = seed.lists.find((l) => l.kind === "people")?.name ?? "a list"

  const callTask = () => {
    editPerson(p.id, { note: `call task due today · owned by ${session.user}` })
    say(`Call task due today for ${p.name}. It is in Tasks.`)
  }

  const addToList = () => {
    editPerson(p.id, { note: `added to ${listName}` })
    say(`${p.name} added to ${listName}.`)
  }

  const callOrReveal = () => {
    if (canCall) {
      editPerson(p.id, { note: `called ${p.phoneNumber} · logged on the record` })
      say(`Calling ${p.name} · ${p.phoneNumber}. The call is logged on their record.`)
      return
    }
    editPerson(p.id, { phoneRevealed: true, note: `phone revealed · ${CREDITS.revealPhone} credits` })
    say(`Phone revealed for ${p.name} · ${CREDITS.revealPhone} credits. The number stays on the record.`)
  }

  /**
   * Every act this pane could carry, each named by its usage item. The model says which of them
   * this seat touches in a week and how often; the pane takes the three it touches most and leaves
   * the rest to the record page. All secondary: they are comparable acts, and three comparable acts
   * are never drawn as one filled and two outlined (DESIGN.md §1).
   */
  const candidates: { item: string; action: Action }[] = [
    {
      item: "people.row.sequence",
      action: {
        kind: "secondary",
        label: dest ? `${verb} to ${dest}` : `${verb} to a sequence`,
        onClick: move,
        disabledBecause: dest ? undefined : "Choose a sequence above",
      },
    },
    {
      item: "people.row.email",
      action: {
        kind: "secondary",
        label: "Draft an email",
        onClick: draftEmail,
        cost: `${CREDITS.draft} credits`,
        consequence: "Nothing is sent; the draft waits for you",
        disabledBecause: blocked ? `${p.name} is marked do not contact` : undefined,
      },
    },
    {
      item: "people.row.call",
      action: {
        kind: "secondary",
        label: "Create a call task",
        onClick: callTask,
        disabledBecause: p.doNotCall ? `${p.name} is marked do not call` : undefined,
      },
    },
    {
      item: "people.row.reveal-phone",
      action: canCall
        ? { kind: "secondary", label: `Call ${p.phoneNumber}`, onClick: callOrReveal, disabledBecause: p.doNotCall ? `${p.name} is marked do not call` : undefined }
        : {
          kind: "secondary",
          label: "Reveal the phone",
          onClick: callOrReveal,
          cost: `${CREDITS.revealPhone} credits`,
          consequence: "Charged once",
          disabledBecause: p.doNotCall ? `${p.name} is marked do not call` : undefined,
        },
    },
    // "Add to Replied, no meeting yet" reads as a sentence; the act is "Add to list" and the list
    // is which one, so the name goes after the act, not into it.
    { item: "people.row.list", action: { kind: "secondary", label: `Add to list · ${listName}`, onClick: addToList } },
  ]

  const acts = candidates
    .filter((c) => shows(c.item))
    .sort((a, b) => d.weekly(b.item) - d.weekly(a.item))
    .slice(0, 3)
    .map((c) => c.action)

  return (
    <div className="space-y-4">
      <dl className="space-y-2.5">
        {glanceFields(p, seed, d.level).map((f) => (
          <div key={f.label} className="grid grid-cols-[7rem_1fr] items-baseline gap-3">
            <dt className="text-xs text-muted-foreground">{f.label}</dt>
            <dd className="min-w-0">{f.value}</dd>
          </div>
        ))}
      </dl>

      {/* The three acts this seat runs most, and no more: the pane carries three (DESIGN.md §1),
          each candidate names its usage item, and the model ranks them. Nothing here is filled —
          these are comparable acts, so they are all secondary — and nothing here cannot be undone:
          an irreversible act stays on the record page, which "Open the page" above leads to.
          A line sits beside a control only where the act spends credits. */}
      <div className="border-t pt-3">
        {shows("people.row.sequence") && (
          // A picker, in place — not a door and not a guess. Flat, so the pane stays one level.
          <Select value={dest} onValueChange={(v) => setPicked({ id, dest: v })}>
            <SelectTrigger className="mb-3 h-8 w-full text-xs" aria-label={`Sequence to ${verb.toLowerCase()} ${p.name} to`}>
              <SelectValue placeholder="Choose a sequence" />
            </SelectTrigger>
            <SelectContent>
              {options.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Actions surface="pane" layout="stack" items={acts} />
      </div>

      {/* What the last action did and the way out of it are the frame's footer line, from the same
          record the row behind is reading — so the pane and the row cannot say different things. */}
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
