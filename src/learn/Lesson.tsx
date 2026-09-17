// The lesson view: `#/learn/<caseId>?step=N`.
//
// Six parts (PLAN.md §4): the rail of steps, the stage with the real page on it, the delta that says
// what moved, the nine-point score, the evidence behind the rule, and the controls. The case decides
// everything else: which page, which seat, how many steps, which rules, which quotes.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { href, navigate, useRoute } from "@/app/router"
import { applyTheme, signIn, useSession } from "@/ollopa/session"
import { Controls } from "./Controls"
import { Evidence } from "./Evidence"
import { Rail, RailStrip } from "./Rail"
import { Score } from "./Score"
import { Stage } from "./Stage"
import { CASES, caseById, type LessonCase } from "./cases"
import { applyDelta, clearDelta, openDoor, snapshot, type Move, type Snap } from "./delta"
import "./lesson.css"

const PLAY_MS = 6000

export function Lesson() {
  const route = useRoute()
  const id = route.path[1]
  const wanted = Number(route.query.get("step") ?? 0)
  useEffect(() => { applyTheme() }, [])

  const lessonCase = id ? caseById(id) : undefined
  if (!id || !lessonCase) return <Index missing={id} />
  const steps = lessonCase.steps
  if (steps.length === 0) return <Index missing={id} reason={`${id} has no steps.ts yet.`} />
  const step = Math.max(0, Math.min(steps.length - 1, Number.isFinite(wanted) ? wanted : 0))
  return <LessonView key={lessonCase.id} lessonCase={lessonCase} step={step} />
}

function LessonView({ lessonCase, step }: { lessonCase: LessonCase; step: number }) {
  const { meta, steps, scores } = lessonCase
  const session = useSession()
  const stageRef = useRef<HTMLDivElement>(null)
  const pending = useRef<Snap | null>(null)
  const [moves, setMoves] = useState<Move[]>([])
  const [trace, setTrace] = useState(true)
  const [slow, setSlow] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [sheet, setSheet] = useState<"score" | "why" | null>(null)

  // The lesson is signed in as the case says: the same seat at the same workspace, every time.
  const seatOk = !!session && session.business === meta.session.business && session.role === meta.session.role
  useEffect(() => { if (!seatOk) signIn(meta.session) }, [seatOk, meta.session])

  /** Jump to a step: measure where everything is, open the doors the step needs, then render it. */
  const goStep = useCallback((n: number) => {
    const next = Math.max(0, Math.min(steps.length - 1, n))
    if (next === step) return
    const root = stageRef.current
    clearDelta(root)
    pending.current = snapshot(root)
    ;(steps[next].openDoors ?? []).forEach((d) => openDoor(d, true))
    navigate(`/learn/${meta.id}?step=${next}`)
  }, [meta.id, step, steps])

  // The delta, drawn once the step has rendered. Without a snapshot from the step before (a deep
  // link, a reload, the back button) there is nothing to compare, so nothing is marked.
  //
  // A door that only exists from this step on cannot have heard the event `goStep` sent before it
  // rendered, so the step's doors are asked again here; the measurement waits one frame for them,
  // because whether a thing is open decides whether its caption reads "now in" or "now behind".
  useLayoutEffect(() => {
    const root = stageRef.current
    const before = pending.current
    pending.current = null
    if (!before) { clearDelta(root); setMoves([]) }
    let second = 0
    const first = requestAnimationFrame(() => {
      for (const d of steps[step].openDoors ?? []) {
        if (root?.querySelector(`[data-door="${CSS.escape(d)}"][data-open="false"]`)) openDoor(d, true)
      }
      if (!before) return
      second = requestAnimationFrame(() => setMoves(applyDelta(root, before, { trace, slow })))
    })
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, seatOk])

  // Play: one step every six seconds, twice that in slow motion, stopping at the last step.
  useEffect(() => {
    if (!playing) return
    if (step >= steps.length - 1) { setPlaying(false); return }
    const t = window.setTimeout(() => goStep(step + 1), PLAY_MS * (slow ? 2 : 1))
    return () => window.clearTimeout(t)
  }, [playing, step, slow, steps.length, goStep])

  // ← → step, space plays. Ignored inside a field, inside the rail (which walks itself) and inside
  // the stage, where the arrow keys belong to the product.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return
      if (el?.closest("[data-lesson-rail]") || el?.closest(".lesson-stage")) return
      if (e.key === "ArrowRight") { setPlaying(false); goStep(step + 1) }
      else if (e.key === "ArrowLeft") { setPlaying(false); goStep(step - 1) }
      else if (e.key === " " && el?.tagName !== "BUTTON") { e.preventDefault(); setPlaying((p) => !p) }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [goStep, step])

  const onTrace = (on: boolean) => { setTrace(on); if (!on) { clearDelta(stageRef.current); setMoves([]) } }

  // The stage is held by identity so the marks drawn on its DOM survive a re-render of the chrome.
  const stage = useMemo(
    () => (session && seatOk ? <Stage lessonCase={lessonCase} step={step} session={session} stageRef={stageRef} /> : null),
    [lessonCase, step, session, seatOk],
  )

  const controls = {
    step, count: steps.length, playing, trace, slow,
    onGo: (n: number) => { setPlaying(false); goStep(n) },
    onPlay: () => setPlaying((p) => !p),
    onTrace,
    onSlow: setSlow,
  }
  const current = steps[step]
  const score = <Score row={scores[step]} previous={scores[step - 1]} />
  const evidence = <Evidence step={current} index={step} moves={moves} />

  return (
    <div className={"lesson-root flex h-dvh flex-col bg-muted/40 text-foreground" + (slow ? " lesson-slow" : "")}>
      <header className="flex shrink-0 flex-wrap items-baseline gap-x-3 gap-y-1 border-b bg-background px-3 py-2">
        <a href={href("/cases/" + meta.id)} className="text-sm font-semibold hover:underline">{meta.title}</a>
        <span className="hidden text-xs text-muted-foreground sm:inline">{meta.summary}</span>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          Step {step} of {steps.length - 1} · {meta.session.business} · {meta.session.role}
        </span>
      </header>

      <RailStrip steps={steps} step={step} onGo={controls.onGo} className="lg:hidden" />

      <div className="grid min-h-0 flex-1 lg:grid-cols-[14rem_minmax(0,1fr)_20rem]">
        <aside className="hidden min-h-0 overflow-y-auto border-r bg-background px-3 py-3 lg:block">
          <Rail steps={steps} step={step} onGo={controls.onGo} />
          <div className="mt-3 border-t pt-3"><Controls {...controls} /></div>
          <div className="mt-3 border-t pt-3">{score}</div>
        </aside>

        <div className="min-h-0 p-2 lg:p-3">
          {stage ?? <div className="grid h-full place-items-center rounded-lg border bg-background text-sm text-muted-foreground">Signing in as {meta.session.role}…</div>}
        </div>

        <aside className="hidden min-h-0 overflow-y-auto border-l bg-background px-4 py-3 lg:block">{evidence}</aside>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 border-t bg-background px-2 py-1.5 lg:hidden">
        <Controls {...controls} compact />
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => setSheet("score")}>Score</Button>
        <Button variant="outline" size="sm" onClick={() => setSheet("why")}>Why</Button>
      </div>

      <Sheet open={sheet !== null} onOpenChange={(o) => !o && setSheet(null)}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
          <SheetHeader className="pb-0">
            <SheetTitle>{sheet === "score" ? "Review score" : "Why this step"}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            {sheet === "score" ? score : evidence}
            {sheet === "score" && <div className="mt-4 border-t pt-3"><Controls {...controls} /></div>}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

/** `#/learn` with no case, or a case id that has no folder: say what there is. */
function Index({ missing, reason }: { missing?: string; reason?: string }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-xl font-semibold">Lessons</h1>
      {missing && <p className="mt-2 text-sm text-muted-foreground">{reason ?? `There is no case folder called “${missing}”.`}</p>}
      {CASES.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No case folders yet. A case is a folder under <code>cases/</code> with case.ts, steps.ts and scores.ts.</p>
      ) : (
        <ul className="mt-4 list-none space-y-3 p-0">
          {CASES.map((c) => (
            <li key={c.id}>
              <a className="font-medium hover:underline" href={href(`/learn/${c.id}?step=0`)}>{c.meta.title}</a>
              <p className="text-sm text-muted-foreground">{c.meta.summary} · {c.steps.length} steps</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
