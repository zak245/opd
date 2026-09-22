// One line across the top of a page, carrying only what needs attention now.
//
// A strip, never a banner and never a modal: it is a persistent list, because the best "is this user
// stuck" detector on real enterprise logs reaches 0.27 precision, so three interruptions in four would
// be wrong. Nothing here is decorative; when there is nothing to say the strip is not rendered.
//
// One row, muted, one Badge per item, and the workspace announcement rides in the same row — because
// nothing but the interrupting alert may take a second row away from the page.
import { useState } from "react"
import { AlertTriangle, CircleAlert, Info, Megaphone, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type HealthKind = "error" | "warning" | "info"

export interface HealthLine {
  kind: HealthKind
  text: string
  href: string
}

const ICON = { error: CircleAlert, warning: AlertTriangle, info: Info }

export function HealthStrip({ lines, announcement }: {
  lines: HealthLine[]
  /** The workspace-change line, drawn in this same row so it costs no height of its own. */
  announcement?: { text: string; href?: string }
}) {
  const [saidIt, setSaidIt] = useState(false)
  const news = saidIt ? undefined : announcement
  if (lines.length === 0 && !news) return null
  return (
    <div className="flex items-center gap-3 overflow-x-auto border-b px-4 py-1.5 sm:px-6">
      {lines.map((l) => {
        const Icon = ICON[l.kind]
        // Compact: a long line is written "what · the detail", and the row shows the lead. The whole
        // sentence stays in the title, and the badge links to the page that carries it.
        const cut = l.text.indexOf(" · ")
        const short = cut > 0 && l.text.length > 44 ? l.text.slice(0, cut) : l.text
        return (
          <Badge key={l.text} asChild variant="outline" className="shrink-0 font-normal text-muted-foreground">
            <a href={l.href} title={l.text}>
              <Icon
                aria-hidden="true"
                style={l.kind === "warning" ? { color: "var(--warning-ink)" } : l.kind === "error" ? { color: "var(--danger-ink)" } : undefined}
              />
              {short}
            </a>
          </Badge>
        )
      })}
      {news && (
        <span className="t-small flex min-w-0 flex-1 items-center gap-1.5 text-muted-foreground">
          <Megaphone className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0 truncate">{news.text}</span>
          {news.href && (
            <Button asChild variant="link" size="sm" className="h-auto shrink-0 px-0 py-0">
              <a href={news.href}>Open</a>
            </Button>
          )}
          <Button variant="ghost" size="icon-xs" className="shrink-0" aria-label="Dismiss this notice" onClick={() => setSaidIt(true)}>
            <X aria-hidden="true" />
          </Button>
        </span>
      )}
    </div>
  )
}
