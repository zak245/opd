// Every action on these two pages says what it did and offers one click back.
//
// The shell's toast carries text only, so the Inbox and Tasks put the same sentence in a polite live
// region with the Undo beside it: undoing is the same length as doing (rule 7). Reversible low-cost
// work is logged with Undo and never queued for approval.
import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "../../templates/TablePage"

export interface Undoable { message: string; undo?: () => void }

/** Eight seconds, the length spec 07 §3 gives an undo toast. */
const LIFE = 8_000

export function useUndo() {
  const [item, setItem] = useState<Undoable | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const say = useCallback((message: string, undo?: () => void) => {
    toast(message)
    setItem({ message, undo })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setItem(null), LIFE)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const bar = (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-16 z-40 flex justify-center px-4 md:bottom-6">
      {item && (
        <div className="pointer-events-auto flex max-w-full items-center gap-3 rounded-md border bg-card px-3 py-2 text-sm shadow-lg">
          <span className="min-w-0">{item.message}</span>
          {item.undo && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 shrink-0 px-2 text-xs"
              onClick={() => { item.undo?.(); setItem(null); toast("Undone.") }}
            >
              Undo
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 shrink-0 px-2 text-xs" onClick={() => setItem(null)}>Dismiss</Button>
        </div>
      )}
    </div>
  )

  return { say, bar }
}
