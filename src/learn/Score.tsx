// The score: the nine review questions from RULES.md, filled as the rules land. The line that
// changed at this step lights up. Sixteen of eighteen is a pass.
import { cn } from "@/lib/utils"
import type { StepScores } from "./context"
import { RUBRIC, total } from "./cases"

export function Score({ row, previous }: { row?: StepScores; previous?: StepScores }) {
  const now = row ?? ([0, 0, 0, 0, 0, 0, 0, 0, 0] as unknown as StepScores)
  const sum = total(row)
  return (
    <section aria-label="Review score">
      <h2 className="text-[11px] uppercase tracking-wider text-muted-foreground">Review score</h2>
      <p className="mt-0.5 mb-1 text-2xl font-semibold tabular-nums leading-none">
        {row ? sum : "—"}
        <span className="ml-1 text-xs font-normal text-muted-foreground">/ 18{row && sum >= 16 ? " · passes" : ""}</span>
      </p>
      <ul className="m-0 grid list-none gap-1 p-0">
        {RUBRIC.map((question, i) => {
          const changed = !!row && !!previous && previous[i] !== now[i]
          return (
            <li key={i} className={cn("grid grid-cols-[26px_1fr] items-center gap-1.5 text-[11px] leading-tight", changed ? "font-medium text-foreground" : "text-muted-foreground")}>
              <span className="flex gap-0.5" aria-hidden="true">
                <span className={cn("h-1.5 w-2.5 rounded-xs", now[i] >= 1 ? "bg-foreground" : "bg-border")} />
                <span className={cn("h-1.5 w-2.5 rounded-xs", now[i] >= 2 ? "bg-foreground" : "bg-border")} />
              </span>
              <span>
                <span className="sr-only">{now[i]} of 2{changed ? `, changed from ${previous![i]}` : ""}: </span>
                {question}
                {changed && <span aria-hidden="true" className="ml-1 inline-block size-1.5 translate-y-[-1px] rounded-full align-middle" style={{ background: "var(--lesson-accent)" }} />}
              </span>
            </li>
          )
        })}
      </ul>
      {!row && <p className="mt-1 text-[11px] text-muted-foreground">This case has no scores.ts row for this step yet.</p>}
    </section>
  )
}
