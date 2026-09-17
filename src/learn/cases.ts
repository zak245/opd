// Cases are data, not code: a folder under `cases/` with `case.ts`, `steps.ts` and `scores.ts`.
// Nothing here knows any case by name — a new folder is a new lesson.
import type { CaseMeta, LessonStep, Rule, StepScores } from "./context"

const metaFiles = import.meta.glob<{ meta?: CaseMeta }>("../../cases/*/case.ts", { eager: true })
const stepFiles = import.meta.glob<{ steps?: LessonStep[] }>("../../cases/*/steps.ts", { eager: true })
const scoreFiles = import.meta.glob<{ scores?: StepScores[] }>("../../cases/*/scores.ts", { eager: true })

export interface LessonCase {
  id: string
  meta: CaseMeta
  steps: LessonStep[]
  scores: StepScores[]
}

const folder = (path: string) => path.split("/").slice(-2)[0]

function build(): LessonCase[] {
  const out: LessonCase[] = []
  for (const [path, mod] of Object.entries(metaFiles)) {
    const id = folder(path)
    if (!mod.meta) continue
    const steps = stepFiles[path.replace("case.ts", "steps.ts")]?.steps ?? []
    const scores = scoreFiles[path.replace("case.ts", "scores.ts")]?.scores ?? []
    out.push({ id, meta: { ...mod.meta, id }, steps, scores })
  }
  return out.sort((a, b) => a.meta.title.localeCompare(b.meta.title))
}

export const CASES: LessonCase[] = build()

export function caseById(id: string): LessonCase | undefined {
  return CASES.find((c) => c.id === id)
}

/** Every rule applied at this step or before: the set a page reads through `ruleOn`. */
export function rulesThrough(steps: LessonStep[], step: number): ReadonlySet<Rule> {
  const on = new Set<Rule>()
  for (let i = 0; i <= step && i < steps.length; i++) {
    const rule = steps[i]?.rule
    if (rule) on.add(rule)
  }
  return on
}

/** The nine review questions, in the order of RULES.md, "The review score". */
export const RUBRIC = [
  "Decision-critical visible without interaction",
  "Every visible item backed by a sourced number",
  "No path beyond two levels, any screen size",
  "Doors labelled by content, chevron and text",
  "Doors adjacent, keyboard and touch",
  "Nothing mutually dependent split by a door",
  "Door state persists; expand-all and print",
  "User action or object state, never history",
  "Instrumented, with a scheduled review",
] as const

export const RULE_TITLE: Record<Rule, string> = {
  1: "Hide the rare, never the necessary",
  2: "Stop at two levels",
  3: "Split by task frequency, not user skill",
  4: "Make the door obvious and honest",
  5: "Keep context across the boundary",
  6: "Prefer stable, user-controlled disclosure",
  7: "Decision-critical information is never behind a door",
  8: "Fade the scaffold; give experts accelerators",
}

export function total(row: StepScores | undefined): number {
  return (row ?? []).reduce((a, b) => a + b, 0)
}
