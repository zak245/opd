// The rail: one step per rule, done, current and to come. Click to jump; arrow keys to walk.
import { useRef } from "react"
import { cn } from "@/lib/utils"
import type { LessonStep } from "./context"

function stepLabel(s: LessonStep, i: number): string {
  return s.rule ? `Rule ${s.rule}` : `Step ${i}`
}

/** Left, Up: back. Right, Down: on. Home, End: the ends. The focused button follows the step. */
function useArrows(onGo: (n: number) => void, count: number) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const to =
      e.key === "ArrowLeft" || e.key === "ArrowUp" ? i - 1
      : e.key === "ArrowRight" || e.key === "ArrowDown" ? i + 1
      : e.key === "Home" ? 0
      : e.key === "End" ? count - 1
      : null
    if (to === null) return
    e.preventDefault()
    e.stopPropagation()
    const next = Math.max(0, Math.min(count - 1, to))
    onGo(next)
    buttons.current[next]?.focus()
  }
  return { buttons, onKeyDown }
}

export function Rail({ steps, step, onGo }: { steps: LessonStep[]; step: number; onGo: (n: number) => void }) {
  const { buttons, onKeyDown } = useArrows(onGo, steps.length)
  return (
    <nav aria-label="Steps" data-lesson-rail>
      <ol className="m-0 list-none border-l-2 border-border p-0">
        {steps.map((s, i) => {
          const state = i < step ? "done" : i === step ? "current" : "todo"
          return (
            <li key={i} className="relative py-0.5 pl-3">
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -left-[7px] top-3 size-3 rounded-full border-2",
                  state === "done" && "border-foreground bg-foreground",
                  state === "current" && "border-foreground bg-background ring-3 ring-muted",
                  state === "todo" && "border-border bg-background",
                )}
              />
              <button
                ref={(el) => { buttons.current[i] = el }}
                type="button"
                tabIndex={i === step ? 0 : -1}
                aria-current={i === step ? "step" : undefined}
                onClick={() => onGo(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="block w-full rounded-md px-2 py-1 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="block t-small uppercase tracking-wider text-muted-foreground">{stepLabel(s, i)}</span>
                <span className={cn("block text-sm leading-tight", state === "current" ? "font-medium text-foreground" : state === "todo" ? "text-muted-foreground" : "text-foreground/80")}>
                  {s.title}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** Phone width: the same rail as a strip across the top. */
export function RailStrip({ steps, step, onGo, className }: { steps: LessonStep[]; step: number; onGo: (n: number) => void; className?: string }) {
  const { buttons, onKeyDown } = useArrows(onGo, steps.length)
  return (
    <nav aria-label="Steps" data-lesson-rail className={cn("flex gap-1 overflow-x-auto border-b bg-background px-2 py-1.5", className)}>
      {steps.map((s, i) => (
        <button
          key={i}
          ref={(el) => { buttons.current[i] = el }}
          type="button"
          tabIndex={i === step ? 0 : -1}
          aria-current={i === step ? "step" : undefined}
          onClick={() => onGo(i)}
          onKeyDown={(e) => onKeyDown(e, i)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            i === step ? "border-foreground bg-foreground text-background" : i < step ? "border-border bg-muted text-foreground" : "border-border text-muted-foreground",
          )}
        >
          <span className="font-medium">{stepLabel(s, i)}</span>
          <span className="max-w-[9rem] truncate">{s.title}</span>
        </button>
      ))}
    </nav>
  )
}
