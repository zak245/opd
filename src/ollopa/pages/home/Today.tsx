// Today: what is due, oldest first, with overdue above it in its own block.
//
// Done is on the row. Snooze and Skip are a separate choice, so they sit in the row's menu with the
// key that runs them, and Skip carries what it does to the sequence in its label. Everything that
// happens leaves an undo line, and nothing reorders while you work.
import { useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Actions } from "../../ui/Actions"
import { openBeside } from "../../beside"
import { clearEdit, recordEdit, useEdits } from "../../edits"
import { toast } from "../../templates/TablePage"
import { Door, type Disclosure } from "../../ui"
import type { Task } from "../../data/seed"
import type { HomeData } from "./data"
import { day, overdueBy } from "./format"
import { Nothing, Row, RowList, RowMenu, Section, UndoLine, useUndo } from "./rows"

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
 * The row names a task, so the row opens the task — beside Home, with Home still on screen and the
 * rest of the day's list under the pane's walker. The task's own name is the control that does it,
 * so it is one click with a mouse and Enter from the keyboard, not a thing behind a menu. The
 * contact is reached from inside that pane, which is the one step in; the way to a page from
 * either is "Open the page", which keeps Home on the trail.
 */
function TaskRow({ t, late, showSequence, ids, onDone, onSnooze, onSkip }: TaskRowProps) {
  const openTask = (opener?: HTMLElement | null) => openBeside({
    kind: "task",
    id: t.id,
    list: { ids, index: Math.max(0, ids.indexOf(t.id)) },
    opener: opener ?? document.querySelector<HTMLElement>(`[data-item="${t.id}"]`),
  })
  return (
    <Row
      itemId={t.id}
      itemLabel={t.contact}
      keys={{ d: () => onDone(t), s: () => onSnooze(t), x: () => onSkip(t) }}
      onEnter={() => openTask()}
    >
      <Badge variant="outline" className="w-[4.5rem] shrink-0 justify-center font-normal">{t.kind}</Badge>
      <span className="min-w-[11rem] flex-1">
        <button
          type="button"
          className="text-left font-medium underline-offset-4 hover:underline focus-visible:underline focus-visible:outline-none"
          onClick={(e) => openTask(e.currentTarget)}
        >
          {t.contact}
        </button>
        <span className="text-muted-foreground"> · {t.company}</span>
        <span className="block text-xs text-muted-foreground">
          {t.title}
          {showSequence && t.sequence && <> · {t.sequence}</>}
          {late && <span className="ml-2 font-medium text-destructive">{overdueBy(t.due)}</span>}
        </span>
      </span>
      <span className="ml-auto flex shrink-0 items-center gap-2">
        {/* The row's own act. A row is not the surface Home exists for, so nothing on it is
            filled: Done is an outline, and the rest of the row's acts are in its menu. */}
        <Actions surface="card" items={[{ kind: "secondary", label: "Done", keys: "d", onClick: () => onDone(t) }]} />
        <RowMenu
          name={t.contact}
          actions={[
            ...(showSequence || !t.sequence ? [] : [{ label: `From ${t.sequence}`, fact: true, onSelect: () => { } }]),
            { label: "Done", shortcut: "D", onSelect: () => onDone(t) },
            { label: "Snooze to tomorrow", shortcut: "S", onSelect: () => onSnooze(t) },
            { label: `Open this ${t.kind.toLowerCase()} task beside Home`, shortcut: "Enter", onSelect: () => openTask() },
            { label: t.sequence ? `Skip this step · ${t.contact} moves on in ${t.sequence}` : "Skip this task", shortcut: "X", destructive: true, onSelect: () => onSkip(t) },
          ]}
        />
      </span>
    </Row>
  )
}

export function Today({ data, d, order }: { data: HomeData; d: Disclosure; order: number }) {
  // What has happened to these tasks this session, from the shared store: this section's own Done,
  // the queue's, and the task pane's, all the same record. One source, so the row and the pane can
  // never disagree, and the pane needs no private channel back to here.
  const acted = useEdits("task")
  const [note, setNote, clearNote] = useUndo()
  const showSequence = d.atLevelOne("home.tasks.from-sequence")

  const live = (rows: Task[]) => rows.filter((t) => !acted[t.id])
  const overdue = live(data.tasks.overdue)
  const dueToday = live(data.tasks.dueToday)
  const later = live(data.tasks.later)

  function act(t: Task, what: "done" | "snoozed" | "skipped", sentence: string) {
    recordEdit("task", t.id, { [what]: true, note: sentence })
    toast(sentence)
  }

  const done = (t: Task) => act(t, "done", `Done · ${t.kind} with ${t.contact}.`)
  const snooze = (t: Task) => act(t, "snoozed", `Snoozed to tomorrow · ${t.kind} with ${t.contact}.`)
  const skip = (t: Task) => act(t, "skipped", `Skipped · ${t.contact} moves to the next step of ${t.sequence ?? "the sequence"}.`)

  // The undo line says what the last action did, whoever pressed it — a row here, or the task pane
  // beside this page. It reads the record rather than the button, so there is one line and one way
  // back, and a record that was already there when the section mounted never raises a stale line.
  const since = useRef(Date.now())
  useEffect(() => {
    const latest = Object.entries(acted)
      .filter(([, e]) => typeof e.at === "number" && e.at > since.current && e.note)
      .sort((a, b) => (b[1].at as number) - (a[1].at as number))[0]
    if (!latest) return
    since.current = latest[1].at as number
    setNote({ text: String(latest[1].note), undo: () => clearEdit("task", latest[0]) })
  }, [acted, setNote])

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
                  <Actions surface="card" className="shrink-0" items={[{ kind: "secondary", label: "Done", onClick: () => done(t) }]} />
                </li>
              ))}
            </ul>
          </Door>
        </div>
      )}
    </Section>
  )
}
