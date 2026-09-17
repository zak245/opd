// The stage: the real page, live, at this step. Not a picture and not a second implementation —
// `PageBody` is the same component the product routes to, inside a `LessonProvider` that tells it
// which rules are on. Step 0 gets the same component with no rule on.
import type { RefObject } from "react"
import { AppShell } from "@/ollopa/shell/AppShell"
import { PageBody } from "@/ollopa/Product"
import { nodeById } from "@/ollopa/map"
import { navItem } from "@/ollopa/nav"
import type { Session } from "@/ollopa/session"
import { LessonProvider, type Lesson } from "./context"
import { rulesThrough } from "./cases"
import type { LessonCase } from "./cases"

export function Stage({ lessonCase, step, session, stageRef }: {
  lessonCase: LessonCase
  step: number
  session: Session
  stageRef: RefObject<HTMLDivElement | null>
}) {
  const { meta, steps } = lessonCase
  const node = nodeById(meta.node)
  const page = node?.page ?? "home"
  const title = node?.type === "page" ? navItem(page)?.label ?? node.name : node?.name ?? meta.title
  const chrome = steps[step]?.chrome ?? "product"
  const lesson: Lesson = {
    caseId: meta.id,
    step,
    totalSteps: steps.length,
    rulesOn: rulesThrough(steps, step),
  }
  const body = <PageBody nodeId={meta.node} session={session} id={meta.recordId} />

  return (
    <div ref={stageRef} className="lesson-stage h-full overflow-hidden rounded-lg border bg-background shadow-sm">
      <LessonProvider value={lesson}>
        {chrome === "product"
          ? <AppShell session={session} page={page} title={title} defaultCollapsed>{body}</AppShell>
          : <div className="h-full overflow-y-auto">{body}</div>}
      </LessonProvider>
    </div>
  )
}
