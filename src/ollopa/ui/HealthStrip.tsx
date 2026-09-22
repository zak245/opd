// One line across the top of a page, carrying only what needs attention now.
//
// A strip, never a banner and never a modal: it is a persistent list, because the best "is this user
// stuck" detector on real enterprise logs reaches 0.27 precision, so three interruptions in four would
// be wrong. Nothing here is decorative; when there is nothing to say the strip is not rendered.
import { AlertTriangle, CircleAlert, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export type HealthKind = "error" | "warning" | "info"

export interface HealthLine {
  kind: HealthKind
  text: string
  href: string
}

const ICON = { error: CircleAlert, warning: AlertTriangle, info: Info }
const TONE: Record<HealthKind, string> = {
  error: "text-destructive",
  warning: "[color:var(--warning-ink)]",
  info: "text-muted-foreground",
}

export function HealthStrip({ lines }: { lines: HealthLine[] }) {
  if (lines.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-b-border bg-muted/40 px-6 py-2 text-xs">
      {lines.map((l) => {
        const Icon = ICON[l.kind]
        return (
          <a key={l.text} href={l.href} className={cn("inline-flex items-center gap-1.5 hover:underline", TONE[l.kind])}>
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
            {l.text}
          </a>
        )
      })}
    </div>
  )
}
