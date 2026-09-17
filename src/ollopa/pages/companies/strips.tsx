// Two strips both tables use, above the rows where the person is looking.
//
// `ConfirmStrip` writes what the control will do *before* the click, in the same words the control
// carries, and asks once. `Notice` is what happened, with Undo beside it for ten seconds — the path
// back is one click, no longer than the path in (rule 7).
import { useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function ConfirmStrip({ text, confirmLabel, onConfirm, onCancel, tone, children }: {
  text: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  tone?: "destructive"
  children?: ReactNode
}) {
  return (
    <div
      role="group"
      aria-label={confirmLabel}
      className={cn("flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-sm", tone === "destructive" && "border-destructive/40")}
    >
      <span className={cn("min-w-0 flex-1", tone === "destructive" ? "text-destructive" : "text-muted-foreground")}>{text}</span>
      {children}
      <Button size="sm" variant={tone === "destructive" ? "destructive" : "default"} onClick={onConfirm} autoFocus>{confirmLabel}</Button>
      <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
    </div>
  )
}

export function Notice({ text, undo, onDone }: { text: string; undo?: () => void; onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 10_000)
    return () => window.clearTimeout(t)
  }, [onDone, text])
  return (
    <div role="status" aria-live="polite" className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
      <span className="min-w-0 flex-1">{text}</span>
      {undo && <Button size="sm" variant="outline" onClick={() => { undo(); onDone() }}>Undo</Button>}
      <Button size="sm" variant="ghost" onClick={onDone}>Dismiss</Button>
    </div>
  )
}
