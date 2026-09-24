// Retired. Nothing is drawn here any more.
//
// `REVIEW-ALERTS.md` §5: the status row is deleted, and "everything is fine" is never said — an
// all-clear is the absence of the band. A number about the workspace lives on the page that owns
// it: a summary strip, a settings row, the credits pill. Nothing above every page.
//
// The file stays, and renders nothing, only so the pages that still call it keep compiling while
// their owners move each number to where it belongs. Do not call it from anything new.
export type HealthKind = "error" | "warning" | "info"

export interface HealthLine {
  kind: HealthKind
  text: string
  href: string
}

export function HealthStrip(_: {
  lines: HealthLine[]
  announcement?: { text: string; href?: string }
}): null {
  return null
}
