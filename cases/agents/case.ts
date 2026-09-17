// The Agents case: what the agents did, what waits for a decision, and what all of it cost.
//
// Apollo has no page called Agents, so the common version is the spread: an AI Assistant chat, a
// workflow's Enrollment tab, and a credits page four levels down in Settings behind a permission
// (specs/13-agents.md §5). Six rules move it onto one screen, in the order §7 gives: 7, 1, 2, 4, 5, 8.
import type { CaseMeta } from "@/learn/context"

export const meta: CaseMeta = {
  id: "agents",
  title: "Agents",
  summary:
    "An SDR comes back to find out what three agents did overnight, what is waiting for a decision, and what it cost. Six rules move the spend and the approvals out of a chat and a settings page and onto one screen.",
  node: "P-agents",
  session: { business: "meridian", role: "sdr" },
  spec: "specs/13-agents.md",
}
