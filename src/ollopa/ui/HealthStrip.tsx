// One line across the top of a page, carrying only what needs attention now.
//
// A strip, never a banner and never a modal: it is a persistent list, because the best "is this user
// stuck" detector on real enterprise logs reaches 0.27 precision, so three interruptions in four would
// be wrong. Nothing here is decorative; when there is nothing to say the strip is not rendered.
//
// The drawing is shadcn's Alert, one per line, stacked with the library's gap. The only thing this
// file overrides is Alert's internal grid: a health line is one sentence and an Open, so it is laid
// out as one row. Everything else — the border, the radius, the padding, the ink — is the library's.
import { AlertTriangle, CircleAlert, Info } from "lucide-react"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export type HealthKind = "error" | "warning" | "info"

export interface HealthLine {
  kind: HealthKind
  text: string
  href: string
}

const ICON = { error: CircleAlert, warning: AlertTriangle, info: Info }

export function HealthStrip({ lines }: { lines: HealthLine[] }) {
  if (lines.length === 0) return null
  return (
    <div className="grid gap-2 border-b p-4 sm:px-6">
      {lines.map((l) => {
        const Icon = ICON[l.kind]
        return (
          <Alert
            key={l.text}
            variant={l.kind === "error" ? "destructive" : "default"}
            className="flex items-center gap-3 py-2"
          >
            <Icon style={l.kind === "warning" ? { color: "var(--warning-ink)" } : undefined} />
            <AlertTitle className="line-clamp-none min-w-0 flex-1 font-normal">{l.text}</AlertTitle>
            <Button asChild variant="link" size="sm" className="shrink-0 px-0">
              <a href={l.href}>Open</a>
            </Button>
          </Alert>
        )
      })}
    </div>
  )
}
