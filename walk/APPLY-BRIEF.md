# Brief for the apply pass

Seven walk logs in `walk/WALK-*.md` each end with a change list: file, location, current, new, rule. This pass applies them. Four editors own disjoint sets of files. You apply every change from EVERY walk log that targets a file you own, and nothing else.

## Order of authority when changes conflict

1. `PLAN.md` section 2 decisions (including the S1 walk decisions and the map decisions).
2. `RULES.md`, including the three named patterns.
3. `IA-MAP.md` part 6 gap resolutions.
4. The walk log's stated rule for the change.
If two walks propose different changes to the same place, take the one that better satisfies the rules and note the other in your log. If a walk proposes something that contradicts a PLAN.md decision, do not apply it; log it.

## How to apply

- Edit in place. Rewrite the affected sentences, rows or items; do not append "update" notes to specs.
- Where a walk proposes a NEW spec (the developer surfaces; import and enrichment; workflows), the owner of that spec number writes it following `specs/BRIEF.md`, with a usage file in `src/ollopa/usage/` and, where the `Page` union in `src/ollopa/usage/model.ts` lacks a value, editor C adds it and registers the file in `index.ts`.
- Keep every spec's claims audit intact: no new Apollo claim without a source or an `(unverified)` mark.
- After editing any usage file, run `npx tsc -b` from the repo root and fix what you broke. Run the duplicate-id check: `node -e 'const fs=require("fs");const d="src/ollopa/usage/";const ids={};for(const f of fs.readdirSync(d)){if(/^(model|index)\.ts$/.test(f))continue;for(const m of fs.readFileSync(d+f,"utf8").matchAll(/id:\s*"([^"]+)"/g)){(ids[m[1]]??=[]).push(f)}}console.log(Object.entries(ids).filter(([,v])=>v.length>1))'` and fix any duplicates.
- Write `walk/APPLY-<group>.md`: one line per change applied (walk id, file, what), one line per change skipped with the reason, and any cross-group dependency you noticed (for example a spec you own now references a node another editor must add to the map).

## Reply

A 200-word summary, counts applied and skipped, the log path, and cross-group dependencies.
