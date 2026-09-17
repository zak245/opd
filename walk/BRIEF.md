# Brief for the journey walk

You walk a group of journeys across the map, the way a reviewer who knows the domain would, and you decide. The owner has delegated the judgement calls; the rules are the judge.

## Read first

- `RULES.md`: the eight rules, the three named patterns, the review score.
- `PLAN.md` section 2: every decision, including the S1 walk decisions (queue mode default for SDR and AE; digest defaults; Approve all with consequence label) and the map decisions.
- `IA-MAP.md`: part 2 (nodes), part 3 (edges), part 5 (the journey walks), part 6 (gap resolutions).
- `JOURNEYS.md`: the full text of each journey in your group.
- The specs in `specs/` for the pages your journeys touch. Read only sections 3, 6 and 7 of each (features, after, lesson steps).
- `USAGE-MODEL.md` and the relevant `src/ollopa/usage/*.ts` files for the numbers.

## For each journey in your group

1. Walk the node sequence from IA-MAP part 5, stop by stop. At each stop write, in plain words: what is visible first for this seat at this business, which doors exist and what each holds, the container of each door, and the one thing the person must never lose sight of.
2. Check the stop against the rules and the patterns. Name every violation or weakness: a third level, an audience label, a dependent pair split by a door, decision-critical content behind a door, a hover-only control, a silent gap where a role or profile explanation is missing, a door with no count, an approval without a consequence line, a locked feature moved or hidden, a suggestion that hints instead of exposing, an approval mid-task instead of at a boundary.
3. Check the journey against reality using JOURNEYS.md's source rows: does the flow match how the work is actually done (frequency, order, who does it), or did a spec simplify it?
4. **Decide.** For each issue, write the change: which file (spec section, map node or edge, usage item), what it says now, what it should say. Use the same judgement the owner accepted on S1: density wins for all-day seats; declared over inferred; exposure over hints; fewer better-placed approvals; content labels; the quick-look-and-record pattern; the declared sidebar. Do not ask; decide, and state the rule that decides it.
5. Score the journey: does the person reach the end without a third level, without losing the critical thing, and without a step the specs forgot? Yes or no, with the missing step named if no.

## Write

`walk/WALK-<group>.md`: one section per journey with the stops, the issues, the decisions and the score; then a consolidated **change list** as a table: file, location, current, new, rule. Do NOT edit specs, the map or usage files yourself; a single apply pass does that from the change lists so agents never collide. Plain English. No open questions.

## Reply

A 200-word summary, the number of issues found and changes proposed, any journey that fails, and the file path.
