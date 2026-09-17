// Lesson 3: the deal record. Spec: specs/09-deal-record.md, sections 5 and 7.
//
// The seat is the Meridian account executive, Elena Vasquez, who lives on this page all day. The
// record is one of her open deals: activity on the timeline, three files, three contacts with roles,
// a meeting, eight qualification elements and a research agent waiting for a decision.
import type { CaseMeta } from "@/learn/context"

export const meta: CaseMeta = {
  id: "deal-record",
  title: "The deal record",
  summary:
    "An Apollo-style deal profile — a panel of widgets, a strip of tabs, a gear, hover-to-edit — becomes a record that answers where the deal is, what it is worth, when it closes and what happens next, without a click.",
  node: "R-deal",
  recordId: "d-1",
  session: { business: "meridian", role: "ae" },
  spec: "specs/09-deal-record.md",
}
