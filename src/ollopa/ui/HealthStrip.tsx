// What needs attention now, said once, at the top of the page.
//
// A strip, never a banner and never a modal: it is a persistent list, because the best "is this user
// stuck" detector on real enterprise logs reaches 0.27 precision, so three interruptions in four would
// be wrong. Nothing here is decorative; when there is nothing to say, nothing is said.
//
// Round 11: it draws no band of its own. Above a page's content there is the header and one Alert,
// so this publishes its lines to `shell/banner.ts` and the shell folds them into that Alert as
// small outline Badges. Every call site keeps working and no page gains a row.
import { useEffect } from "react"
import { setBanner, clearBanner } from "../shell/banner"

export type HealthKind = "error" | "warning" | "info"

export interface HealthLine {
  kind: HealthKind
  text: string
  href: string
}

export function HealthStrip({ lines, announcement }: {
  lines: HealthLine[]
  /** The workspace-change line, said in the same Alert so it costs no row of its own. */
  announcement?: { text: string; href?: string }
}) {
  const key = lines.map((l) => `${l.kind}|${l.text}|${l.href}`).join("\n")
  const news = announcement ? `${announcement.text}|${announcement.href ?? ""}` : ""
  useEffect(() => {
    setBanner(lines, announcement)
    return () => clearBanner()
    // The lines are rebuilt on every render of the page, so the strings are the identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, news])
  return null
}
