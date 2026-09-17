// The Settings case: the whole settings inventory of one workspace on one page.
//
// The stage renders `P-settings` — the same component the product routes to — signed in as
// Meridian Software's RevOps admin, the seat with the most to lose sight of: the price, the credit
// burn, the bounce guard, what the agents may do on their own, and the two destructive actions.
import type { CaseMeta } from "@/learn/context"

export const meta: CaseMeta = {
  id: "settings",
  title: "Settings",
  summary:
    "A hundred settings for one workspace. The common version scatters them across a settings shell of its own — fourteen pages, eight collapsible groups, tabs inside groups inside drawers — with the price behind a checkout and no way to delete anything. Six rules put them on one page.",
  node: "P-settings",
  session: { business: "meridian", role: "admin" },
  spec: "specs/14-settings.md",
}
