# Progressive Disclosure in Complex B2B SaaS: A Knowledge Base

A research-backed knowledge base on how progressive disclosure works, why it works, where it fails, and how the leading UX and design thinkers define and apply it in complex business software. Compiled 12 September 2026 from roughly 200 fetched sources (Nielsen Norman Group, Apple, Microsoft, IBM, GOV.UK, W3C, peer-reviewed HCI papers, design systems, product blogs, PLG vendors), with verbatim quotes and URLs throughout.

## Start here

1. **[00 Core model](knowledge-base/00-core-model.md)**: the synthesized understanding. Definition, the four-part mechanism, the three senses of the term, related patterns, the taxonomy, the cognitive trade, the population model, when PD works and when it doesn't, the enterprise-specific model, and the eight laws. Read this first.
2. **[08 Principles and checklists](knowledge-base/08-principles-and-checklists.md)**: the operational layer. Eight laws expanded, a decision tree, pattern-selection table, per-pattern checklists, measurement plan, anti-pattern catalogue, and a screen review rubric.
3. **[09 Expert voices](knowledge-base/09-expert-voices.md)**: who said what. Nielsen, Carroll, Apple HIG, Cooper, Norman, Tognazzini, Shneiderman, Lidwell, Krug, Raskin, Tidwell, Harris, Spool, McGovern, Rauch, the SwiftUI team, Linear, Anthropic, Google PAIR, Microsoft HAX.
4. **[10 Glossary](knowledge-base/10-glossary.md)**: the vocabulary.

## Source memos (full research, verbatim quotes, bibliographies)

| Memo | Covers |
|---|---|
| [01 Foundations and definitions](knowledge-base/sources/01-foundations-and-definitions.md) | Nielsen 2006 and 2026; Carroll's training wheels and the active-user paradox; Apple's 1992 guidelines (primary source); Cooper; IxDF; Lidwell; Tognazzini; Norman; Raskin; Krug; encyclopedic definitions; competing taxonomies |
| [02 Cognitive science](knowledge-base/sources/02-cognitive-science.md) | Cognitive load theory; Hick's, Miller's, Tesler's, Jakob's laws; choice-overload meta-analyses; attention and blindness effects; learning, scaffolding, perpetual intermediates; recognition vs recall; foraging and scent; interaction cost and Fitts; the empirical studies (training wheels, multi-layer UIs, adaptive menus, the Office Ribbon, Baymard forms, ScaffoldUI) |
| [03 Pattern catalog](knowledge-base/sources/03-pattern-catalog.md) | 20 design systems' definitions and rules; 22 patterns with when/when-not and accessibility; Tidwell's patterns; WAI-ARIA and WCAG requirements |
| [04 B2B SaaS practice and case studies](knowledge-base/sources/04-b2b-saas-practice-and-case-studies.md) | NN/g on complex applications; PLG vendors on progressive onboarding; case studies (Office Ribbon, Salesforce, Jira, Linear, Superhuman, Notion, Figma, Stripe, Grafana, Zapier, Shopify, GitHub, Windows UX Guide, AWS vs Vercel, Bloomberg); developer-tool "progressive disclosure of complexity"; modes and bloat; role-based disclosure; density; AI-era applications |
| [05 Critiques, pitfalls and measurement](knowledge-base/sources/05-critiques-pitfalls-and-measurement.md) | Discoverability cost with numbers; the 3-click myth; over-nesting; mode toggles and adaptive menus; dark-pattern misuse and regulation; accessibility failures; find-in-page, print, mobile side-effects; when not to use PD; validation methods; organisational politics |
| [06 Academic literature](knowledge-base/sources/06-academic-literature.md) | The peer-reviewed record with citations: training wheels, multi-layer interfaces, adaptive vs adaptable UIs, software bloat studies, learnability of feature-rich software, PD in privacy notices and explainable AI, theoretical models |

## The short version

Progressive disclosure shows the few options most tasks need and reveals the rest on request, in a clearly labelled second level. It works because it reduces extraneous cognitive load, protects novices from choice overload and errors, and lets people learn in the flow of work. It costs discoverability, because every hidden item converts recognition into recall and relies entirely on the scent of its trigger.

The literature agrees on eight rules: hide the rare, never the necessary; stop at two levels; split by task frequency, not user skill; make the door obvious and labelled by content; keep context across the boundary; prefer stable, user-controlled disclosure over inferred adaptation; never hide decision-critical information; and fade the scaffold while giving experts accelerators.

In complex B2B applications three things change the picture: several personas need different level-1 surfaces; permissions double as disclosure; and sales-driven feature growth turns settings pages into feature graveyards. The healthy enterprise forms are per-capability disclosure, synchronised dual representations, and context-by-object-state, not global Basic/Advanced modes. For homogeneous expert populations working in one tool all day, density beats disclosure.

## Method and caveats

Six parallel research passes (foundations, cognitive science, patterns, B2B practice, critiques and measurement, academic literature) each fetched and read primary sources, quoting verbatim. Where a page could not be fetched (paywalls, JS-rendered design systems, 403s), the memo says so and marks the quote as coming from a secondary source or search snippet. Vendor statistics without a cited study are flagged as unsourced. One authorship correction recurs: the 1984 training-wheels study is Carroll & Carrithers, not Carroll & Rosson.
