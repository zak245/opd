// The lesson context: how a page knows it is on a lesson stage, and at which step.
//
// A page reads `useLesson()`. In the product it is null, and every rule is on: the page renders its
// final form. On a lesson stage it names the case, the step and the set of rules applied so far, and
// the page renders the layout for that step from the same rows, seed and usage numbers. Step 0 has
// no rule on and renders the common version the spec's section 5 describes. There is never a second
// implementation of a page: one model, one component, a layout per step.
import { createContext, useContext } from "react"

export type Rule = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface Lesson {
  /** The case folder's id: "settings", "people", "deal-record", "connect", "agents". */
  caseId: string
  /** 0 is the common version; the last step is the product as shipped. */
  step: number
  totalSteps: number
  /** Every rule applied at this step or before. */
  rulesOn: ReadonlySet<Rule>
}

const Ctx = createContext<Lesson | null>(null)
export const LessonProvider = Ctx.Provider

/** Null in the product. A page treats null as "every rule is on". */
export function useLesson(): Lesson | null {
  return useContext(Ctx)
}

/** Is this rule applied? In the product, always. */
export function ruleOn(lesson: Lesson | null, rule: Rule): boolean {
  return lesson === null || lesson.rulesOn.has(rule)
}

/** What a case folder's `case.ts` exports. */
export interface CaseMeta {
  id: string
  title: string
  /** One sentence for the cases index. */
  summary: string
  /** The map node the stage renders, and the record id when the node is a record. */
  node: string
  recordId?: string
  /** The seat the lesson signs in as. */
  session: { business: "fathom" | "meridian" | "halyard" | "ridgeline"; role: "sdr" | "ae" | "marketer" | "cs" | "admin" }
  /** The spec the case is built from, repo-relative. */
  spec: string
}

/** One entry per step in a case folder's `steps.ts`. Step 0 is the common version and has no rule. */
export interface LessonStep {
  rule: Rule | null
  title: string
  /** What moved, in plain English, two to four sentences. */
  moved: string
  /** Why, one or two sentences. */
  why: string
  /** Quotes that exist in the knowledge base, each with its source name. */
  evidence: { quote: string; source: string }[]
  /** Door ids to open on arrival so the change is visible. */
  openDoors?: string[]
  /** Chrome around the page: the product shell, or the page draws its own (a parody shell at step 0). */
  chrome: "product" | "own"
}

/** Nine rubric scores, 0 to 2 each, one row per step, in `scores.ts`. */
export type StepScores = [number, number, number, number, number, number, number, number, number]
