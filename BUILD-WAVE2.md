# Wave 2: pages

Every page builder follows `BUILD-BRIEF.md` and this file. Read BUILD-BRIEF.md, RULES.md, the spec for your nodes (sections 3, 6, 7), the IA-MAP.md rows for your nodes (part 2) and their edges (part 3), and `src/ollopa/ui/README.md` for the primitives. Look at `src/ollopa/pages/deal/DealRecord.tsx` as the reference for how a page reads seed, the usage model and the primitives.

## Ownership

You own exactly one folder: `src/ollopa/pages/<yours>/`. You create it. You do not edit any file outside it, except: you may append seed fields you need by sending them in your reply (the data owner lands them); until then, derive or stub locally with a clear comment.

## Registration

Create `src/ollopa/pages/<yours>/register.tsx` exporting:

```ts
import type { PageComponent } from "../../Product"
export const nodes: Record<string, PageComponent> = { "P-xxx": XxxPage, "R-xxx": XxxRecord }
```

Product.tsx picks it up automatically. Node ids are the map's ids. A component receives `{ session, id }`.

## Data and disclosure

- Read data through `seedFor(session.business)` from `src/ollopa/data/seed.ts`. Never invent rows inline.
- Decide what is level one with `useDisclosure("<page>")` from `src/ollopa/ui`: `level(itemId) === 1` shows it on the surface, `2` puts it behind the door the spec names. Item ids are in `src/ollopa/usage/<page>.ts`.
- Door labels come from the spec, with counts computed from data.
- Plan gates through `gate(feature)` and the `Locked` primitive.
- Every action does something visible in the session: edits persist in component state or the session store, and a toast confirms ("Saved · Payment terms"). Nothing pretends.

## Deliver

- `npx tsc -b` and `npx vite build` pass with your folder in.
- Screenshots at 1440 and 400 for each seat-business pair the spec calls out, taken with `node scripts/shot.mjs "<route>" shots/<yours>/<name>.png <business>:<role> [width] [height]` against a preview you start yourself on a port of your own (`npx vite preview --port 41NN --strictPort`, kill it after). Look at them. Fix what is wrong.
- Keyboard-only once through the page.
- Reply: 200-word summary, the nine-point self-score with proof lines, seed fields you need, deviations from the spec stated plainly, file paths.
