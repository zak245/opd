// Evidence: the rule, what moved, why — and the quotes one level down, behind a toggle. The lesson
// obeys the rules it teaches: two levels, never three, and the door says what is behind it.
import { Door } from "@/ollopa/ui/Door"
import type { LessonStep } from "./context"
import { RULE_TITLE } from "./cases"
import { moveSentence, type Move } from "./delta"

export function Evidence({ step, index, moves }: { step: LessonStep; index: number; moves: Move[] }) {
  return (
    <section aria-label="This step">
      <p className="t-small uppercase tracking-wider text-muted-foreground">
        {step.rule ? `Rule ${step.rule} · ${RULE_TITLE[step.rule]}` : `Step ${index} · the common version`}
      </p>
      <h2 className="mt-1 text-lg font-semibold leading-tight">{step.title}</h2>

      <h3 className="mt-3 t-small uppercase tracking-wider text-muted-foreground">What moved</h3>
      <p className="mt-1 text-sm text-foreground/90">{step.moved}</p>

      <h3 className="mt-3 t-small uppercase tracking-wider text-muted-foreground">Why</h3>
      <p className="mt-1 text-sm text-foreground/90">{step.why}</p>

      {moves.length > 0 && (
        <>
          <h3 className="mt-3 t-small uppercase tracking-wider text-muted-foreground">
            {moves.length === 1 ? "1 move on the page" : `${moves.length} moves on the page`}
          </h3>
          <ul className="mt-1 list-none space-y-0.5 p-0 text-xs text-muted-foreground">
            {moves.slice(0, 12).map((m) => <li key={m.id}>{moveSentence(m)}</li>)}
          </ul>
        </>
      )}

      {step.evidence.length > 0 && (
        <div className="mt-4 border-t">
          <Door id="lesson.evidence" label="The studies behind this rule" count={step.evidence.length}>
            {step.evidence.map((e, i) => (
              <blockquote key={i} className="m-0 mb-3 border-l-2 pl-3">
                <p className="m-0 text-sm">“{e.quote}”</p>
                <cite className="mt-1 block t-small not-italic text-muted-foreground">{e.source}</cite>
              </blockquote>
            ))}
          </Door>
        </div>
      )}
    </section>
  )
}
