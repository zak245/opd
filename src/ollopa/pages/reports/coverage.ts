// Win rate, and the coverage it requires. Computed once, here.
//
// Required coverage is 1 ÷ win rate (`19-revops-and-developer-notes.md` §4.5). It is the last line of
// the Pipeline report's stage-to-stage conversion door and the figure the Deals board strip prints,
// and the two must never disagree — so the Deals board imports `coverageFor` from this file rather
// than working it out again:
//
//     import { coverageFor } from "../reports/coverage"
//     const { line } = coverageFor(seedFor(session.business))
//
// ollopA has no "Closed lost" stage and no outcome flag (PLAN.md, 13 Sep 2026): **won** means the deal
// reached Closed won, **lost** means it was archived. Both words are printed beside the number so a
// reader can check the arithmetic against the same rows.
import { TODAY, type Deal, type Seed } from "../../data/seed"
import { addDays } from "./format"

export interface Coverage {
  /** Deals that reached Closed won in the window. */
  won: number
  /** Deals archived in the window. Archived is what "lost" means here. */
  lost: number
  /** Won ÷ (won + lost), as a percentage. 0 when nothing closed either way. */
  winRatePercent: number
  /** 1 ÷ win rate. `null` when nothing was won, because dividing by nothing is not a number to act on. */
  required: number | null
  /** The window the two counts came from. */
  from: string
  to: string
  /** "Win rate 20% · needs 5.0x coverage" — the words both surfaces print. */
  line: string
}

/** Was this deal won, and when? Closed won with a close date is the only "won" in the model. */
function wonOn(d: Deal): string | null {
  return d.stage === "Closed won" && !d.archivedAt ? d.closeDate : null
}

/** Was this deal lost, and when? Archived is lost; `archivedAt` is the date. */
function lostOn(d: Deal): string | null {
  return d.archivedAt
}

/**
 * The win rate and required coverage for a window. The window defaults to the last 90 days, which is
 * what the Deals board strip wants when it asks without one; the Pipeline report passes the range the
 * person has chosen, so the door's last line always matches the tiles above it.
 */
export function coverageFor(seed: Seed, range?: { from: string; to: string }): Coverage {
  const from = range?.from ?? addDays(TODAY, -89)
  const to = range?.to ?? TODAY
  const inRange = (d: string | null) => d !== null && d >= from && d <= to

  const won = seed.deals.filter((d) => inRange(wonOn(d))).length
  const lost = seed.deals.filter((d) => inRange(lostOn(d))).length
  const closed = won + lost
  const winRatePercent = closed > 0 ? (won / closed) * 100 : 0
  const required = won > 0 ? closed / won : null

  const line = closed === 0
    ? "Nothing closed in this range, so there is no win rate to divide by."
    : required === null
      ? `Win rate 0% · ${lost} archived, none won. There is no coverage figure until a deal is won.`
      : `Win rate ${Math.round(winRatePercent)}% · needs ${required.toFixed(1)}x coverage`

  return { won, lost, winRatePercent, required, from, to, line }
}
