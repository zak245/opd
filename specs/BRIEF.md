# Brief for page specs

Every page of Ollopa gets one spec in this folder. Written in plain English. No open questions inside a spec: what is written is decided by the spec author and reviewed; questions for the owner go to the owner in conversation, never into the file.

## Read first

- `RULES.md`: the eight rules and the nine-point review score. The spec must obey them and score itself.
- `PRODUCT.md`: what Ollopa is, the five roles, the four example customers, the fourteen pages, the settings inventory, and the rules the product itself follows.
- `USAGE-MODEL.md`: how weekly-use numbers are chosen and the shape they must fit.
- `knowledge-base/00-core-model.md` and `knowledge-base/08-principles-and-checklists.md`: the reasoning and the per-pattern checklists.
- `knowledge-base/sources/07-apollo-settings-map.md`: how Apollo, the product we parody, is organised; also its complaints and praise.
- `src/ollopa/usage/model.ts` and `src/ollopa/usage/settings.ts`: the code shape of usage items.
- `src/ollopa/data/businesses.ts` and `src/ollopa/data/seed.ts`: the data that exists.
- `src/ollopa/templates/TablePage.tsx` and `src/ollopa/pages/tables.tsx`: what is already built.

## Structure of a spec

1. **Purpose.** What the page is for, who lives there (roles), how often, and the one thing they must never lose sight of.
2. **Data.** Every field shown, where it comes from in the seed, and what must be added to the seed.
3. **Features.** Complete and grouped: what is shown, actions (row, bulk, page), filters and search, sorting and columns, states (empty, loading, error, no access), keyboard and shortcuts, accessibility, phone width, and what differs by role and by business.
4. **Usage items.** Every item on the page with weekly use per role and per-business overrides, in a table, following USAGE-MODEL.md, with the head-body-tail shape checked for at least two role-business pairs. Decision-critical items marked.
5. **Before: the common version.** How this page looks when built the way most GTM tools build it, modelled on Apollo's equivalent page where one exists (research it: Apollo's knowledge base, reviews, screenshots described in text). Layout, navigation depth, labels, what is visible, what is hidden, and every documented problem with a source.
6. **After: the disclosed version.** Layout; what sits at level one and level two for each role, and how that changes across the four businesses; every door and its content label; the container for each door (in place, drawer, page); persistence; accelerators; decision-critical items; what was removed rather than hidden. Then the nine-point score with a line per point.
7. **Lesson steps.** For a page that becomes a lesson: the steps from before to after, one rule each, with what moves and the evidence. For other pages: the three or four rules that mattered most, in one line each.
8. **Review.** A completeness check against this list, with each gap found and how it was closed: all roles covered; all four businesses covered; every field has a source; every action has an outcome; empty, error and no-access states; keyboard; phone width; decision-critical visible; two levels maximum; doors labelled by content; dependent fields together; state persists; accelerators present; usage shape checked; nothing hover-only; role gaps explain themselves; the page shows no usage numbers or teaching text.

## Style

Plain English. Short sentences. Tables where things repeat. Name the Apollo source for every "before" problem. Do not invent Apollo facts; say "unverified" when you cannot find a source.
