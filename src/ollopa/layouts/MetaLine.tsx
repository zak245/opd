// What a folded column says, under the row's own name.
//
// One small line, "Label value · Label value · …", wrapping to at most two. A grid of label/value
// pairs six lines tall is not a row any more — it is a record, and the table stops being scannable
// (LAYOUTS.md §6, alignment is a grouping signal). Anything past two lines is in the row's "…" and
// its quick look, which is where the whole record already lives.
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface MetaValue {
  key: string
  label: string
  value: ReactNode
}

export function MetaLine({ values, className }: { values: MetaValue[]; className?: string }) {
  if (values.length === 0) return null
  return (
    <div className={cn(
      // Two lines at most, whatever the width: the row stays about the height of a two-line row.
      // A value's own markup may be a block; in here everything reads on one running line, so the
      // row keeps the height of a two-line row whatever a cell would draw on its own.
      "t-small mt-0.5 line-clamp-2 font-normal break-words text-muted-foreground",
      // The cell it sits in may forbid wrapping for its own value; the meta line always wraps, or
      // its longest run sets the column's width and the fold can never win.
      "whitespace-normal [&_*]:inline [&_*]:whitespace-normal [&_br]:hidden [&_*+*]:ml-1",
      className,
    )}>
      {values.map((v, i) => (
        <span key={v.key}>
          {i > 0 && <span aria-hidden="true" className="px-1.5 opacity-50">·</span>}
          <span className="opacity-70">{v.label} </span>
          {v.value}
        </span>
      ))}
    </div>
  )
}
