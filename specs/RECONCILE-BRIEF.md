# Brief for the reconciliation pass

The sixteen specs were written in parallel before ten decisions were taken and before the 2018–2026 research sweeps. This pass brings them into line. Three editors work on disjoint groups of specs. Nobody edits a spec outside their group, and nobody edits REVIEW.md.

## Sources of truth, in order

1. `PLAN.md`, section 2, the decisions table. Every row dated 13 or 14 September 2026 is a decision. Apply all of them.
2. `RULES.md`, including the three named patterns (gated features, the declared sidebar, the quick look and the record) and the corrected evidence lines.
3. `specs/REVIEW.md`, sections 1 to 4 and 6: the contradictions and their recommended resolutions, the shared things, the usage issues, the rule violations, the seed table. Where a recommendation conflicts with a decision in PLAN.md, the decision wins.
4. `knowledge-base/11-what-changed-2018-2026.md`: three findings must flow into the specs: hints do not teach but temporary exposure does; suggestions are accepted at task boundaries and dismissed mid-task; approval queues rubber-stamp, so fewer, better-placed approvals.

## What to do in each spec

- Apply every decision that touches it. Rewrite the affected sentences; do not append notes.
- Close every contradiction in REVIEW.md section 1 that names the spec, using the resolution there unless PLAN.md decided otherwise.
- Rename doors per the door-label decision.
- Fix the self-score where REVIEW.md section 4 called it generous, and re-score honestly.
- **Claims audit.** Every factual claim about Apollo, about a study, or about a number must either carry its source (article title or URL already in the knowledge base) or be marked `(unverified)`. Remove any claim you cannot trace. This is the most important part: the owner will review every spec by hand and nothing may be invented.
- Keep the spec's structure from BRIEF.md. Plain English. No open questions inside the spec.
- Update the matching usage file in `src/ollopa/usage/` only where a decision requires it (door labels do not; bounce guard, approvals, seats and removed items do). Run `npx tsc -b` from the repo root after editing usage files and fix any error you introduced.

## What to write

- Your spec edits, in place.
- One change log: `specs/CHANGES-<group>.md`, one line per change, per spec: what changed and which decision or finding drove it. Unverified claims removed go in a separate list at the end.

## Reply

A 200-word summary, the change-log path, and any question that only the owner can answer (there should be almost none; the decisions are made).
