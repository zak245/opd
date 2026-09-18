# Progressive Disclosure in Complex B2B SaaS: A Knowledge Base

A research-backed knowledge base on how progressive disclosure works, why it works, where it fails, and how the leading UX and design thinkers define and apply it in complex business software. Compiled 12 September 2026 from roughly 200 fetched sources (Nielsen Norman Group, Apple, Microsoft, IBM, GOV.UK, W3C, peer-reviewed HCI papers, design systems, product blogs, PLG vendors), with verbatim quotes and URLs throughout.

## Start here

1. **[00 Core model](knowledge-base/00-core-model.md)**: the synthesized understanding. Definition, the four-part mechanism, the three senses of the term, related patterns, the taxonomy, the cognitive trade, the population model, when PD works and when it doesn't, the enterprise-specific model, and the eight laws. Read this first.
2. **[08 Principles and checklists](knowledge-base/08-principles-and-checklists.md)**: the operational layer. Eight laws expanded, a decision tree, pattern-selection table, per-pattern checklists, measurement plan, anti-pattern catalogue, and a screen review rubric.
3. **[11 What changed, 2018–2026](knowledge-base/11-what-changed-2018-2026.md)**: what eight years of new evidence did to each of the eight laws and to the gated-features pattern — confirmed, refined or overturned, with the study and the number — plus the numbers this knowledge base had wrong. Read this second.
4. **[12 Gaps we accept](knowledge-base/12-gaps-we-accept.md)**: the register of what is still unproven, what we stand on instead, and the smallest study that would close each gap.
5. **[09 Expert voices](knowledge-base/09-expert-voices.md)**: who said what. Nielsen, Carroll, Apple HIG, Cooper, Norman, Tognazzini, Shneiderman, Lidwell, Krug, Raskin, Tidwell, Harris, Spool, McGovern, Rauch, the SwiftUI team, Linear, Anthropic, Google PAIR, Microsoft HAX.
6. **[10 Glossary](knowledge-base/10-glossary.md)**: the vocabulary.
7. **[13 Chains of work](knowledge-base/13-chains-of-work.md)**: the problem one level above screens. What B2B work looks like as chains of moves across related objects, what it costs when software cuts them, and what perfect would have to mean. Synthesis of six memos across eight domains; describes the problem and proposes nothing.

## Source memos (full research, verbatim quotes, bibliographies)

| Memo | Covers |
|---|---|
| [01 Foundations and definitions](knowledge-base/sources/01-foundations-and-definitions.md) | Nielsen 2006 and 2026; Carroll's training wheels and the active-user paradox; Apple's 1992 guidelines (primary source); Cooper; IxDF; Lidwell; Tognazzini; Norman; Raskin; Krug; encyclopedic definitions; competing taxonomies |
| [02 Cognitive science](knowledge-base/sources/02-cognitive-science.md) | Cognitive load theory; Hick's, Miller's, Tesler's, Jakob's laws; choice-overload meta-analyses; attention and blindness effects; learning, scaffolding, perpetual intermediates; recognition vs recall; foraging and scent; interaction cost and Fitts; the empirical studies (training wheels, multi-layer UIs, adaptive menus, the Office Ribbon, Baymard forms, ScaffoldUI) |
| [03 Pattern catalog](knowledge-base/sources/03-pattern-catalog.md) | 20 design systems' definitions and rules; 22 patterns with when/when-not and accessibility; Tidwell's patterns; WAI-ARIA and WCAG requirements |
| [04 B2B SaaS practice and case studies](knowledge-base/sources/04-b2b-saas-practice-and-case-studies.md) | NN/g on complex applications; PLG vendors on progressive onboarding; case studies (Office Ribbon, Salesforce, Jira, Linear, Superhuman, Notion, Figma, Stripe, Grafana, Zapier, Shopify, GitHub, Windows UX Guide, AWS vs Vercel, Bloomberg); developer-tool "progressive disclosure of complexity"; modes and bloat; role-based disclosure; density; AI-era applications |
| [05 Critiques, pitfalls and measurement](knowledge-base/sources/05-critiques-pitfalls-and-measurement.md) | Discoverability cost with numbers; the 3-click myth; over-nesting; mode toggles and adaptive menus; dark-pattern misuse and regulation; accessibility failures; find-in-page, print, mobile side-effects; when not to use PD; validation methods; organisational politics |
| [06 Academic literature](knowledge-base/sources/06-academic-literature.md) | The peer-reviewed record with citations: training wheels, multi-layer interfaces, adaptive vs adaptable UIs, software bloat studies, learnability of feature-rich software, PD in privacy notices and explainable AI, theoretical models |
| [07 Apollo settings map](knowledge-base/sources/07-apollo-settings-map.md) | A real enterprise settings surface mapped end to end, as a worked example of disclosure sprawl |

## The 2018–2026 sweeps

Eight passes run in September 2026, each closing one gap and looking only at evidence published from 2018 onwards. Every finding names its tier, its sample and whether it confirms, refines or overturns something the knowledge base already said. Synthesised in [11 What changed](knowledge-base/11-what-changed-2018-2026.md).

| Sweep | Closes |
|---|---|
| [08 Adaptation in the LLM era](knowledge-base/sources/08-sweep-adaptation-llm-era.md) | Whether the ~70% accuracy threshold survived: spatial adaptation, AI suggestions, generative UI, and what users accept from a system that changes itself |
| [09 Layers and promotion](knowledge-base/sources/09-sweep-layers-and-promotion.md) | What actually moves a user from a reduced layer to the full product: exposure, tooltips, suggestion acceptance, notification fatigue, expertise plateaus |
| [10 Onboarding paths](knowledge-base/sources/10-sweep-onboarding-paths.md) | Persona questions, templates and presets, deferred setup, activation benchmarks, checklists versus contextual guidance — with published numbers |
| [11 Navigation and findability](knowledge-base/sources/11-sweep-navigation-findability.md) | Hidden navigation, icon rails, command palettes, external deep links, tree-test and first-click benchmarks |
| [12 Plan gating](knowledge-base/sources/12-sweep-plan-gating.md) | Visible-but-locked versus hidden features, paywall placement, upgrade requests, nagging, and the regulatory map since 2018 |
| [13 Density and all-day users](knowledge-base/sources/13-sweep-density-all-day-users.md) | Dense expert interfaces versus disclosed ones: density toggles, clinical eye-tracking, four vendor reversals, shortcut teaching |
| [14 Agent disclosure](knowledge-base/sources/14-sweep-agent-disclosure.md) | Agent traces, approval queues and rubber-stamping, explanation depth, confidence displays, cost readouts |
| [15 Enterprise field studies](knowledge-base/sources/15-sweep-enterprise-field-studies.md) | Real B2B usage data: feature-adoption distributions, the Pendo corrections, within-tenant variation, feature removal, settings usage |

## The chains-of-work research

Six memos written in September 2026 against a draft model of work as chains of moves ([CHAINS-BRIEF.md](knowledge-base/sources/CHAINS-BRIEF.md)), with the instruction to test it, not confirm it. Each ends with a verdict per hypothesis and a section on what the model has no words for. Synthesised in [13 Chains of work](knowledge-base/13-chains-of-work.md).

| Memo | Covers |
|---|---|
| [20 Theories of work structure](knowledge-base/sources/20-theories-of-work-structure.md) | Activity theory, GOMS, instrumental interaction, direct manipulation, locus of attention, information foraging, distributed cognition, sensemaking |
| [21 Measured costs of cutting a chain](knowledge-base/sources/21-measured-costs-of-cutting-a-chain.md) | Task switching, interruption and resumption, working memory, split attention, latency, re-finding, coordinated views, animated transitions, enterprise telemetry |
| [22 Clinical and support work](knowledge-base/sources/22-clinical-and-support-work.md) | Electronic health records (the audit-log and click-burden literature) and customer support tools |
| [23 Finance and procurement](knowledge-base/sources/23-finance-and-procurement.md) | Accounts payable and the ERP (a 1.6-million-event purchase-to-pay log), procurement and supply chain |
| [24 Engineering and operations](knowledge-base/sources/24-engineering-and-operations.md) | Issue tracking and project work, incident response and observability |
| [25 People and revenue operations](knowledge-base/sources/25-people-and-revenue-operations.md) | Recruiting and HR, and CRM as one domain among eight |

## The short version

Progressive disclosure shows the few options most tasks need and reveals the rest on request, in a clearly labelled second level. It works because it reduces extraneous cognitive load, protects novices from choice overload and errors, and lets people learn in the flow of work. It costs discoverability, because every hidden item converts recognition into recall and relies entirely on the scent of its trigger.

The literature agrees on eight rules: hide the rare, never the necessary; stop at two levels; split by task frequency, not user skill; make the door obvious and labelled by content; keep context across the boundary; prefer stable, user-controlled disclosure over inferred adaptation; never hide decision-critical information; and fade the scaffold while giving experts accelerators.

In complex B2B applications three things change the picture: several personas need different level-1 surfaces; permissions double as disclosure; and sales-driven feature growth turns settings pages into feature graveyards. The healthy enterprise forms are per-capability disclosure, synchronised dual representations, and context-by-object-state, not global Basic/Advanced modes. For homogeneous expert populations working in one tool all day, density beats disclosure.

## Method and caveats

Six parallel research passes (foundations, cognitive science, patterns, B2B practice, critiques and measurement, academic literature) each fetched and read primary sources, quoting verbatim. Where a page could not be fetched (paywalls, JS-rendered design systems, 403s), the memo says so and marks the quote as coming from a secondary source or search snippet. Vendor statistics without a cited study are flagged as unsourced. One authorship correction recurs: the 1984 training-wheels study is Carroll & Carrithers, not Carroll & Rosson.

In September 2026 eight further sweeps covered 2018–2026 and produced a set of corrections. Where a number changed, the affected line carries a note of the form *(corrected 14 Sep 2026: see sweep NN)*. The Pendo 2019 sample and distribution, the "6% of features" median, the tree-test success target, the Superhuman activation figures, the Ström-Awn density citation and the 3–5% removal threshold were all wrong or unevidenced as previously stated.
