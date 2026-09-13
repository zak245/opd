# OPD, Open Progressive Disclosure: project plan

*Written 13 September 2026, after the knowledge base was compiled and the evolution pattern was prototyped and validated. Plain language on purpose. This is the working plan; change it as you learn.*

---

## 1. What we are building

Three things, in one public repo, in this order.

1. **The rules.** One file. The eight laws of progressive disclosure, each with its evidence and a one-line test. Everything else points at this file. It changes only when someone brings evidence.
2. **The case library.** A fake but believable B2B product: a GTM platform used in different ways by different kinds of businesses (see the decisions table for its boundary, roles and example customers). The screens every B2B app ends up with, each shown as an evolution: the common version, then one rule applied per step, to the disclosed version. Built with shadcn.
3. **The agent.** A Claude Code plugin (with a plain rules file that also works in Codex) that reviews screens against the rules and prototypes new screens with a team's own design system. It is built from the case library and tested against it. It comes last.

What we are **not** building: another component library, a full design system, or MCP integrations before there are users.

---

## 2. Decisions already made

| Decision | Choice | Why |
|---|---|---|
| Public artifact | Case library, not tooling | Tooling is a team setup; the library is what teaches and spreads |
| Design system | shadcn first | 114k stars, fastest adoption ever recorded in State of React, and what Claude Code, Cursor, v0, Lovable and Bolt generate by default |
| Other systems | shadcn first. Material UI second, for two or three cases only. Anything after that is decided later | Proves the rules are about views, not buttons; also becomes the mapping examples the agent needs. Not every case |
| Fake product | A GTM (go-to-market) platform, used in different ways by different kinds of businesses. Boundary: contacts and companies, pipeline, outreach sequences, campaigns, basic reporting, integrations, agents. No ads, website builder or support desk. Roles: SDR, account executive, marketer, customer success, RevOps admin. Four example customers: a 12-person startup, a 300-person SaaS company, a GTM agency serving ten clients, a product-led company | A product used one way hides the hard part. PD must hold when one customer's rare setting is another's daily task |
| Framework | Vite with shadcn | Static case library published as a site; no server needed |
| First five screens | Settings, data table with row actions, record page, setup wizard, agent activity log with pending approvals | The screens every B2B product has, plus the one nobody has written rules for |
| Teaching device | The evolution stepper (see section 4) | Validated in the prototype |
| Quality method | Human walkthrough against the nine-point rubric, no automated tests | Cheap, fixed, and the rubric already exists in the knowledge base |
| Publish when | After five reviewed cases, not when finished | Public early beats public perfect |
| Name | OPD, Open Progressive Disclosure | |
| Home | Public repo on the author's personal GitHub | |
| Licence | MIT for code, Creative Commons for the writing | |
| Reviewer | The author, sole reviewer for now | |
| Usage numbers | Nielsen is the reference. Every split is an opinionated decision backed by published data (Nielsen's 80/20, Pendo's feature-adoption benchmarks, McGrenere and Moore's Word study). Field-level percentages are illustrative, fitted to the published shape, and labelled with their source on every screen. They do not have to be real; they have to be right. | No product analytics exist; being data-driven means following the published evidence, not inventing freely |
| Order of work | Define the product first (what it sells, who uses it, what they do daily); field-level decisions follow from that | The split depends on the roles and their daily tasks |
| What we deploy | Three surfaces from one static build: the product (Ollopa, sign in as a business and role, explorable, no education, final version only), the lessons (same page in the middle, steps and score on the left, rule and evidence on the right, step 0 is the common version), and the library site (rules, cases, how to contribute, knowledge base rendered as pages) | One code path: the product renders a page at its final step; a lesson renders the same page at any step |
| The whole app first | The shell, sign-in and all fourteen pages are built before the first lesson is published. Nine simpler pages come from two shared templates (table page, record page); five are fully interactive and become the first five lessons | A one-page app is not believable; the cases are lessons about pages inside a complete product |
| Timeline | Five to six weeks to first publish, not three | Five interactive pages, the stepper, the lesson view and the site do not fit in three |
| Usage model | Written before any page. One file: every item on every page, weekly use per role, with per-business overrides, fitted to the published shape | Every page reads from it; without it each page invents its own numbers |
| Where numbers show | Usage figures and their sources appear only in lessons and case files, never in the product UI | The product has no labels or education |
| Role gaps explain themselves | When a role cannot see or do something, the product says so and names who can, instead of leaving a silent gap | Knowledge base guidance on permission-based disclosure |
| Settings case | Step 0 is a faithful parody of Apollo's settings (separate settings shell, vague labels, five levels, renamed pages, duplicates, split dependent settings, price and cancel below the fold, no delete). Six steps: rules 7, 1, 2, 4, 5, 8. Rule 6 is a note, not a step | Every problem in step 0 is documented in the Apollo source memo |

---

## 3. The shape of a case

Every case folder has the same shape. This is what makes it a library and lets strangers add cases.

```
cases/<screen-name>/
  README.md        the task, the roles, the common mistake, the rules applied, the evidence
  model.ts         one screen model, with a layout per step (no separate "bad" and "good" code)
  steps.ts         the steps: rule, title, what moved, why, evidence quotes, doors to open
  scores.ts        the nine rubric scores per step
  screens/         screenshots of step 0 and the last step
```

One model, rendered with N rules on, is step N. The two versions can never drift apart because there is only one.

---

## 4. The evolution stepper: the reusable pattern

Six parts, the same on every case. Only the screen model, the steps, and the scores change.

- **Rail.** The steps, one rule each. Done, current, to come. Click any to jump. Arrow keys work.
- **Stage.** The real screen, built with the real components, live at every step. Fields edit and save. Buttons do things. Doors open. The viewer must believe it is a product.
- **Delta.** Things that move slide to their new place and glow. Things that leave a place stay there as a ghost: the whole component, faded and hatched, with a caption underneath ("was here → now behind Localisation") and a "show me" button that opens the door and highlights the real one. A door that something left gets a tag ("↑ left: Growth plan"). Some steps open the doors the change happens in, so the change is visible.
- **Score.** The nine-point rubric, filled as each rule lands. The line that changed lights up.
- **Evidence.** Rule, what moved, why, and the study behind it. One level down, behind a toggle. The page follows its own rules: two levels, never three.
- **Controls.** Back, next, play, compare 0 ⇄ last, trace changes (ghosts stay until the next step; default on), slow motion.

Things learned building it that the real implementation must keep:

- Only real moves are marked: a change of container or a change of order. Things that shift down to make room are not moves. Marking them buried the signal in noise.
- Ghosts go **in the flow**, not as overlays. Overlays at old coordinates sit on top of the new layout and are unreadable.
- The ghost is a clone of the row captured before the change. No second version is ever drawn by hand.
- "Is it hidden" is answered by "is any ancestor door closed", not by measuring size. Browsers report stale sizes for content inside a closed disclosure.
- Timings for a first-time viewer: slides about a second, highlights about three seconds, ghosts until the next step. A slow-motion switch doubles everything.

Prototype: https://claude.ai/code/artifact/dcdaf339-dfb3-44a5-9b8b-f6a7d3096438 (plain HTML; the library version is rebuilt on shadcn).

---

## 5. Definition of done for a case

A case is done when a person who did not build it walks through this and it scores at least 16 of 18 on the rubric.

- Both the common and the disclosed version run and look real with the seed data.
- Every rule applied is cited by number, and every citation is true.
- Nothing decision-critical is hidden. The reviewer looks for the price, the destructive action, the pending approval without clicking.
- No path is more than two doors deep, on desktop or phone.
- Keyboard only, once through both versions. Screen reader, once through the disclosed version.
- Phone width, once.
- Screenshots of step 0 and the last step are in the folder.
- The evidence quotes exist in the knowledge base sources.

About thirty minutes per case. Nothing merges without it.

---

## 6. How we build fast without losing control

- **Week 1, by hand, slowly.** The rules file. The product definition file (name, boundary, five roles, four example customers, seed data). The case template. One complete case: settings, rebuilt on shadcn from the prototype. This case is the model everything else copies.
- **Week 2, in parallel.** Four more cases at once, by people or by agents in separate worktrees, each given the template, the rules file, the finished settings case, and one screen. Agents draft. Humans walk through. Expect to send half back once.
- **Week 3.** Publish. Then batches of three to five cases, because review is the bottleneck and review is what protects quality.

Parallel work is safe because the template, the rules file, and the company file are fixed before anyone starts. Builders fill a shape; they do not invent one.

---

## 7. Publishing

- GitHub, public, from week 3.
- A static site built from the case folders: the rules file is the front page, each case is a page, annotations behind a toggle.
- A "how to add a case" page that is the template plus the checklist.
- The published field guide and knowledge base link to the site as the evidence layer.
- One launch post: one screen, before and after, the rules that changed it. No manifesto.
- Measure one thing: do cases arrive from outside.

---

## 8. The agent (after five cases exist)

- **Week 4.** A skill, loaded in layers: short summary always; rules file when designing or reviewing; a single case only when an example of that screen type is needed. A review command that walks the rubric on a screen or a pull request, names violations by rule number, and proposes fixes. A hook that checks a disclosure pattern before an agent's edit lands.
- **Week 5.** A prototype command: give it a concept (task, roles, data, usage frequencies if known) and a design system; it produces a stepped case in the library's shape. Without usage data it states its assumptions and asks for confirmation. It self-scores with the rubric before handing over.
- **Mapping files.** One small file per design system mapping the building blocks (door, level, scope, agent status) to real components. shadcn from the library; Material UI and Ant from the rebuilt cases.
- **Test.** Give the agent step 0 of a library case, blind. Compare its result with the human one on the rubric. The library is the test set and grows with every case.
- **Later.** MCP into analytics (Pendo, Amplitude, Mixpanel) so the frequency question gets real answers; into Figma and GitHub so review happens where designers and engineers work.

---

## 9. Where the supporting material lives

- [README.md](README.md): index of the knowledge base.
- [knowledge-base/00-core-model.md](knowledge-base/00-core-model.md): the synthesized understanding and the eight laws.
- [knowledge-base/08-principles-and-checklists.md](knowledge-base/08-principles-and-checklists.md): the rubric, checklists, decision tree, anti-patterns. The rules file is cut from this.
- [knowledge-base/sources/](knowledge-base/sources/): the six research memos with verbatim quotes and URLs. The evidence quotes in every case must trace here.
- Field guide (one page): https://claude.ai/code/artifact/51ed555b-8f52-40e3-9e08-27c72fd75c09
