// Today: what is due, oldest first, with overdue above it in its own block.
//
// Done is on the row. Snooze and Skip are a separate choice, so they sit in the row's menu with the
// key that runs them, and Skip carries what it does to the sequence in its label. Everything that
// happens leaves an undo line, and nothing reorders while you work.
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { openBeside } from "../../beside"
import { onTaskAct } from "../work/register"
import { toast } from "../../templates/TablePage"
import { Door, type Disclosure } from "../../ui"
import type { Task } from "../../data/seed"
import type { HomeData } from "./data"
import { day, overdueBy } from "./format"
import { Nothing, Row, RowList, RowMenu, Section, UndoLine, useUndo } from "./rows"

type Acted = Record<string, "Done" | "Snoozed" | "Skipped">

interface TaskRowProps {
  t: Task
  late?: boolean
  showSequence: boolean
  /** The ids of the tasks on screen, in the order they are on screen, for [ and ] in the pane. */
  ids: string[]
  onDone: (t: Task) => void
  onSnooze: (t: Task) => void
  onSkip: (t: Task) => void
}

/**
 * The row names a task, so the row opens the task — beside Home, with Home still on screen. The
 * contact it is with is one more thing this row names, and opens beside too. Neither is a page:
 * the way to a page from either is "Open the page" in the pane, which keeps Home on the trail.
 */
function TaskRow({ t, late, showSequence, ids, onDone, onSnooze, onSkip }: TaskRowProps) {
  const openTask = (opener?: HTMLElement | null) => openBeside({
    kind: "task",
    id: t.id,
    list: { ids, index: Math.max(0, ids.indexOf(t.id)) },
    opener: opener ?? document.querySelector<HTMLElement>(`[data-item="${t.id}"]`),
  })
  const openContact = () => openBeside({
    kind: "person",
    id: t.contactId,
    opener: document.querySelector<HTMLElement>(`[data-item="${t.id}"]`),
  })
  return (
    <Row
      itemId={t.id}
      itemLabel={t.contact}
      keys={{ d: () => onDone(t), s: () => onSnooze(t), x: () => onSkip(t), o: () => openContact() }}
      onEnter={() => openTask()}
    >
      <Badge variant="outline" className="w-[4.5rem] shrink-0 justify-center font-normal">{t.kind}</Badge>
      <span className="min-w-[11rem] flex-1">
        <span className="font-medium">{t.contact}</span>
        <span className="text-muted-foreground"> · {t.company}</span>
        <span className="block text-xs text-muted-foreground">
          {t.title}
          {showSequence && t.sequence && <> · {t.sequence}</>}
          {late && <span className="ml-2 font-medium text-destructive">{overdueBy(t.due)}</span>}
        </span>
      </span>
      <span className="ml-auto flex shrink-0 items-center gap-2">
        <Button size="sm" variant="outline" className="h-7" onClick={() => onDone(t)}>Done</Button>
        <RowMenu
          name={t.contact}
          actions={[
            ...(showSequence || !t.sequence ? [] : [{ label: `From ${t.sequence}`, fact: true, onSelect: () => { } }]),
            { label: "Done", shortcut: "D", onSelect: () => onDone(t) },
            { label: "Snooze to tomorrow", shortcut: "S", onSelect: () => onSnooze(t) },
            { label: "Open the task beside this", shortcut: "Enter", onSelect: () => openTask() },
            { label: `Open ${t.contact} beside this`, shortcut: "O", onSelect: () => openContact() },
            { label: t.sequence ? `Skip this step · ${t.contact} moves on in ${t.sequence}` : "Skip this task", shortcut: "X", destructive: true, onSelect: () => onSkip(t) },
          ]}
        />
      </span>
    </Row>
  )
}

export function Today({ data, d, order }: { data: HomeData; d: Disclosure; order: number }) {
  const [acted, setActed] = useState<Acted>({})
  const [note, setNote, clearNote] = useUndo()
  const showSequence = d.atLevelOne("home.tasks.from-sequence")

  const live = (rows: Task[]) => rows.filter((t) => !acted[t.id])
  const overdue = live(data.tasks.overdue)
  const dueToday = live(data.tasks.dueToday)
  const later = live(data.tasks.later)

  function act(t: Task, what: "Done" | "Snoozed" | "Skipped", sentence: string) {
    setActed((a) => ({ ...a, [t.id]: what }))
    setNote({ text: sentence, undo: () => setActed((a) => { const next = { ...a }; delete next[t.id]; return next }) })
    toast(sentence)
  }

  const done = (t: Task) => act(t, "Done", `Done · ${t.kind} with ${t.contact}.`)
  const snooze = (t: Task) => act(t, "Snoozed", `Snoozed to tomorrow · ${t.kind} with ${t.contact}.`)
  const skip = (t: Task) => act(t, "Skipped", `Skipped · ${t.contact} moves to the next step of ${t.sequence ?? "the sequence"}.`)

  // A task done or snoozed inside the pane changes this row, here, with its undo line — the pane
  // already said the sentence out loud, so this does not say it twice.
  useEffect(() => onTaskAct((id, what) => {
    const t = [...data.tasks.overdue, ...data.tasks.dueToday, ...data.tasks.later].find((x) => x.id === id)
    if (!t) return
    const label = what === "done" ? "Done" : "Snoozed"
    const sentence = what === "done"
      ? `Done · ${t.kind} with ${t.contact}.`
      : `Snoozed to tomorrow · ${t.kind} with ${t.contact}.`
    setActed((a) => ({ ...a, [t.id]: label }))
    setNote({ text: sentence, undo: () => setActed((a) => { const next = { ...a }; delete next[t.id]; return next }) })
  }), [data, setNote])

  const ids = [...overdue, ...dueToday].map((t) => t.id)
  const rowProps = { showSequence, ids, onDone: done, onSnooze: snooze, onSkip: skip }
  const total = overdue.length + dueToday.length

  return (
    <Section id="home-today" title="Today" count={total} order={order} link={{ label: "All tasks", to: "/ollopa/tasks" }}>
      <UndoLine note={note} onDone={clearNote} />

      {overdue.length > 0 && (
        <div className="pb-3">
          <p className="pb-1 text-xs font-medium text-destructive">Overdue ({overdue.length})</p>
          <RowList label="Overdue tasks">
            {overdue.map((t) => <TaskRow key={t.id} t={t} late {...rowProps} />)}
          </RowList>
        </div>
      )}

      {dueToday.length > 0 ? (
        <RowList label="Tasks due today">
          {dueToday.map((t) => <TaskRow key={t.id} t={t} {...rowProps} />)}
        </RowList>
      ) : overdue.length === 0 && (
        <Nothing
          text={`Nothing due today. The next five days have ${later.length}.`}
          link={{ label: "All tasks", to: "/ollopa/tasks" }}
        />
      )}

      {later.length > 0 && (
        <div className="pt-1">
          <Door id="home.tasks.later" label="Tomorrow and later" count={later.length}>
            <ul className="divide-y">
              {later.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
                  <Badge variant="outline" className="w-[4.5rem] shrink-0 justify-center font-normal">{t.kind}</Badge>
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{t.contact}</span>
                    <span className="text-muted-foreground"> · {t.company}{showSequence && t.sequence ? ` · ${t.sequence}` : ""}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{day(t.due)}</span>
                  <Button size="sm" variant="ghost" className="h-7 shrink-0" onClick={() => done(t)}>Done</Button>
                </li>
              ))}
            </ul>
          </Door>
        </div>
      )}
    </Section>
  )
}
