// What a folded column says, under the row's own name.
//
// **One line.** Not two, not a grid of label/value pairs: a row that reads "Company Wayfare Systems
// · Email mateo.novak@… Verified · Stage · Sequence — · Last contacted — · Score 12" across two
// lines is the wall of text again, in a row. A meta line that would run past one line means too
// much has been folded, and what does not fit reaches the person through the row's "…" or the pane.
//
// And an empty value is not worth folding at all: "Sequence —" says nothing and costs the width of
// a fact, so empties are dropped before anything is drawn.
import { isValidElement, type ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface MetaValue {
  key: string
  label: string
  value: ReactNode
}

/** An em dash, a blank, a nothing: a value that says nothing does not go in the line. */
function empty(value: ReactNode): boolean {
  if (value === null || value === undefined || value === false || value === "") return true
  if (typeof value === "string") return value.trim() === "" || value.trim() === "—" || value.trim() === "-"
  if (typeof value === "number") return false
  if (Array.isArray(value)) return value.every(empty)
  if (isValidElement(value)) {
    const children = (value.props as { children?: ReactNode }).children
    return children === undefined ? false : empty(children)
  }
  return false
}

export function MetaLine({ values, className }: { values: MetaValue[]; className?: string }) {
  const said = values.filter((v) => !empty(v.value))
  if (said.length === 0) return null
  return (
    <div className={cn(
      // One line, whatever the width. What does not fit is not shown here at all.
      "t-small mt-0.5 truncate font-normal text-muted-foreground",
      // The cell it sits in may forbid wrapping for its own value, and a value's own markup may be
      // a block; in here everything reads on one running line.
      "whitespace-nowrap [&_*]:inline [&_*]:whitespace-nowrap [&_br]:hidden [&_*+*]:ml-1",
      className,
    )}>
      {said.map((v, i) => (
        <span key={v.key}>
          {i > 0 && <span aria-hidden="true" className="px-1.5 opacity-50">·</span>}
          <span className="opacity-70">{v.label} </span>
          {v.value}
        </span>
      ))}
    </div>
  )
}
