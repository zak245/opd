// Replies: the interested and question replies nobody has worked yet, newest first.
//
// Reply opens the thread in Inbox, where the composer lives. Home has no composer of its own, so the
// product has one and not two. Unsubscribe states what it does to the person before it runs, in place,
// because it cannot be undone from a toast.
import { useState } from "react"
import { Actions, type Action } from "../../ui/Actions"
import { Rows } from "../../layouts"
import { openBeside } from "../../beside"
import { follow } from "../../chain"
import { useEdits } from "../../edits"
import { originHere } from "../work/register"
import { toast } from "../../templates/TablePage"
import { Chip, Door, type Disclosure } from "../../ui"
import type { Reply } from "../../data/seed"
import type { HomeData } from "./data"
import { when } from "./format"
import { Confirm, Nothing, Row, RowList, RowMenu, Section, UndoLine, useUndo } from "./rows"

interface ReplyRowProps {
  r: Reply
  canBook: boolean
  confirming: boolean
  /** The replies on screen, in the order they are on screen, so [ and ] walk them in the pane. */
  ids: string[]
  onNotInterested: (r: Reply) => void
  onAsk: (id: string | null) => void
  onUnsubscribe: (r: Reply) => void
}

/**
 * The row names a reply. Enter reads it beside Home — who, what they meant and the message itself,
 * with Home still on screen. Reply and Book a meeting are page moves, because the composer and the
 * calendar live in the thread and there is one of each in the product: both go with the trail
 * holding Home and this row, so the crumb comes back to it lit.
 */
function ReplyRow({ r, canBook, confirming, ids, onNotInterested, onAsk, onUnsubscribe }: ReplyRowProps) {
  const here = () => document.querySelector<HTMLElement>(`[data-item="${r.id}"]`)
  const beside = () => openBeside({
    kind: "reply",
    id: r.id,
    list: { ids, index: Math.max(0, ids.indexOf(r.id)) },
    opener: here(),
  })
  const open = () => follow(`/ollopa/inbox/${r.id}`, originHere(r.id))
  const book = () => follow(`/ollopa/inbox/${r.id}?meeting=new`, originHere(r.id))
  return (
    <Row
      itemId={r.id}
      itemLabel={r.contact}
      keys={{ r: open, b: () => { if (canBook) book() }, n: () => onNotInterested(r) }}
      onEnter={beside}
      className="flex-col items-stretch sm:flex-row sm:items-start"
    >
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2">
          <span className="font-medium">{r.contact}</span>
          <span className="text-muted-foreground">· {r.company}</span>
          <Chip icon={false}>{r.outcome}</Chip>
          <span className="text-xs text-muted-foreground">{when(r.received)}</span>
        </span>
        <span className="block truncate text-xs text-muted-foreground">{r.snippet}</span>
      </span>
      {confirming ? (
        <Confirm
          text={`${r.contact} will never be emailed from this workspace again.`}
          label="Unsubscribe"
          onConfirm={() => onUnsubscribe(r)}
          onCancel={() => onAsk(null)}
        />
      ) : (
        <span className="flex shrink-0 items-center gap-2">
          {/* The row's own acts. Nothing on a Home row is filled: the two acts a person runs from
              here are outlines, and the row says nothing under them — both are free and neither is
              final until the thread sends. */}
          <Actions
            surface="card"
            items={([
              { kind: "secondary", label: "Reply", keys: "r", onClick: open },
              ...(canBook ? [{ kind: "secondary", label: "Book a meeting", keys: "b", onClick: book }] : []),
            ]) as Action[]}
          />
          {!canBook && (
            <button
              type="button"
              className="hidden text-xs text-muted-foreground underline underline-offset-4 sm:inline"
              onClick={() => follow("/ollopa/connect/calendar", originHere(r.id))}
            >
              Connect a calendar to book from here
            </button>
          )}
          <RowMenu
            name={r.contact}
            actions={[
              { label: "Read it beside this", shortcut: "Enter", onSelect: beside },
              { label: "Reply in Inbox", shortcut: "R", onSelect: open },
              canBook
                ? { label: "Book a meeting", shortcut: "B", onSelect: book }
                : { label: "Connect a calendar to book from here", onSelect: () => follow("/ollopa/connect/calendar", originHere(r.id)) },
              { label: "Mark not interested", shortcut: "N", onSelect: () => onNotInterested(r) },
              { label: `Unsubscribe ${r.contact} · never emailed from this workspace again`, destructive: true, onSelect: () => onAsk(r.id) },
            ]}
          />
        </span>
      )}
    </Row>
  )
}

export function Replies({ data, d, order }: { data: HomeData; d: Disclosure; order: number }) {
  const [gone, setGone] = useState<Record<string, string>>({})
  // What the reply pane did, from the one store the Inbox reads too: a reply handled beside this
  // page leaves this list here, at once, without a second channel between them.
  const acted = useEdits("reply")
  const [confirming, setConfirming] = useState<string | null>(null)
  const [note, setNote, clearNote] = useUndo()
  const canBook = data.replies.hasCalendar && d.weekly("home.replies.book") > 0

  const handled = (r: Reply) => !!gone[r.id] || acted[r.id]?.handled === true
  const hot = data.replies.hot.filter((r) => !handled(r))
  const other = data.replies.other.filter((r) => !handled(r))

  function leave(r: Reply, what: string, sentence: string, undoable = true) {
    setGone((g) => ({ ...g, [r.id]: what }))
    toast(sentence)
    if (undoable) setNote({ text: sentence, undo: () => setGone((g) => { const next = { ...g }; delete next[r.id]; return next }) })
    else clearNote()
  }

  const notInterested = (r: Reply) => leave(r, "not-interested", `Not interested · ${r.contact} left ${r.sequence}.`)
  const unsubscribe = (r: Reply) => {
    setConfirming(null)
    leave(r, "unsubscribed", `Unsubscribed · ${r.contact} will never be emailed from this workspace again.`, false)
  }

  return (
    <Section id="home-replies" title="Replies" count={hot.length} order={order} link={{ label: "Inbox", to: "/ollopa/inbox" }}>
      <UndoLine note={note} onDone={clearNote} />

      {hot.length > 0 ? (
        <RowList label="Interested and question replies">
          {hot.map((r) => (
            <ReplyRow
              key={r.id}
              r={r}
              ids={hot.map((x) => x.id)}
              canBook={canBook}
              confirming={confirming === r.id}
              onNotInterested={notInterested}
              onAsk={setConfirming}
              onUnsubscribe={unsubscribe}
            />
          ))}
        </RowList>
      ) : (
        <Nothing text="No interested or question replies waiting." link={{ label: "Inbox", to: "/ollopa/inbox" }} />
      )}

      {other.length > 0 && (
        <div className="pt-1">
          <Door id="home.replies.other" label="Not now and out-of-office replies" count={other.length}>
            <Rows>
              {other.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{r.contact}</span>
                    <span className="text-muted-foreground"> · {r.company} · {r.outcome}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {r.returnsOn ? `Back on ${r.returnsOn}` : r.followUpOn ? `Asked for ${r.followUpOn}` : r.snippet}
                    </span>
                  </span>
                  <Actions
                    surface="card"
                    className="shrink-0"
                    items={([
                      { kind: "secondary", label: "Mark not interested", onClick: () => notInterested(r) },
                      { kind: "secondary", label: "Snooze", onClick: () => leave(r, "snoozed", `Snoozed · ${r.contact} comes back on ${r.returnsOn ?? r.followUpOn ?? "the date they gave"}.`) },
                    ]) as Action[]}
                  />
                </div>
              ))}
            </Rows>
          </Door>
        </div>
      )}
    </Section>
  )
}
