# Brief for the chains-of-work research

This research is about the problem, not about solutions. The question: what does B2B work look like one level above screens, as chains of moves across related objects, and what does it cost when software organised by object cuts those chains? Nothing in a memo proposes a design. A memo describes work, measures cost, and tests the working model below.

ollopA, the example product in this repository, is one B2B product among many. It is used only as a test at the end, by the owner, and never as the reference. Do not read `PRODUCT.md`, `specs/` or `src/` for this research.

## The working model to test

These are hypotheses. Every memo says, with evidence, whether each holds, needs changing, or is wrong.

**H1. The work is a graph, the software is a tree.** A B2B workspace is a small set of object types with relations between them. A person's thought is a path through the graph. Software is organised as one screen per object type, so every hop across a screen boundary charges a cost unrelated to the difficulty of the thought.

**H2. The moves.** Stripped of nouns, B2B work is a small set of moves: read an object; traverse a relation; compare two things; link or unlink; mutate an attribute; create from context; collect a set; communicate outward; verify a state; decide; configure a rule that governs many objects. A chain is a sequence of moves with one intent.

**H3. The chain shapes.** Chains take a few shapes, and each breaks in its own way: the hop (A to B and back), the lap (the same short chain over many objects), the fork (gather from B and C, act on A), the detour (a precondition blocks the chain and a sub-chain must return to the exact point), the ripple (one move changes other objects and the person needs to see it where they acted), the chain over time (A now, B when something arrives), the handoff (the chain continues in another person's or an agent's hands).

**H4. Indirection is the cost.** The cost of a move is best predicted by its degree of indirection (Beaudouin-Lafon): the spatial and temporal distance between where the person acts and the thing acted on, plus the distance between the reason for the act and the act.

**H5. The properties of perfect.** Cost proportional to cognitive weight, never screen distance; the working set of a chain stays visible for the chain; reason and act on one surface; no move destroys state the chain still needs; effects appear where the cause was; a detour returns to the exact point; no modes; the software knows which chain the person is in, not only which object they are on.

## Rules

- **Fetch and quote.** Use WebSearch and WebFetch. Quote verbatim where it matters, with the URL and the date. Do not work from memory. When a source cannot be fetched, say so and rank the claim lower.
- **Rank sources.** Peer-reviewed first (CHI, CSCW, UIST, TOCHI, IJHCS, HFES, JAMIA for clinical work, arXiv from those communities), then industry research with published numbers, then documented practitioner accounts (vendor help centres, reviews with dates, engineering blogs). Say which tier each source is.
- **Numbers with settings.** For every measured cost: the number, the population, the task, the sample size, the year.
- **Test the model.** A section per hypothesis H1 to H5: holds, needs changing (say how), or wrong (say why), with the evidence.
- **Gather what the model cannot express.** Any move, chain shape or cost you find that the model has no word for goes in its own section, "Outside the model".
- **No solutions.** No proposals, no patterns, no "should". If a source proposes a design, report what it measured, not what it proposed.
- **Close with:** "Still unknown" and "Bibliography" with URLs.
- Plain English, 3000 to 5000 words. Questions for the owner go in your reply, never in the memo.

## The memos

Literature (two memos):

- **20. Theories of work structure.** Activity theory (Engeström; Kaptelinin and Nardi: actions, operations, breakdowns, focus shifts). GOMS and unit tasks (Card, Moran and Newell). Instrumental interaction (Beaudouin-Lafon 2000: degree of indirection, integration, compatibility). Direct manipulation (Shneiderman). Locus of attention and modes (Raskin, The Humane Interface). Interfaces for staying in the flow (Bederson 2004). Information foraging and patch switching (Pirolli and Card). Object-oriented user interfaces and OOUX (Collins; Prater). Distributed cognition (Hutchins). Read each for what it says about chains across objects, not screens.
- **21. Measured costs of cutting a chain.** Task switching (Rubinstein, Meyer and Evans 2001; Monsell 2003). Interruption and resumption (Bailey and Konstan; Mark, Gonzalez and Harris 2005; Iqbal and Horvitz; Altmann and Trafton, memory for goals). Working memory limits (Cowan 2001; Miller). Split attention (Sweller). Response time and latency (Nielsen's thresholds; Google and Akamai latency studies; Card's 100 ms, 1 s, 10 s). Navigation and re-finding cost (Scarr, Cockburn et al. on spatial memory; information scent). Multiple coordinated views (Baldonado, Woodruff and Kuchinsky 2000). Animated transitions and orientation (Chang and Ungar; Heer and Robertson 2007; Cockburn's reviews). Anything 2018 to 2026 that measured these in real products.

Domain audits (four memos, two domains each). For each domain: the object types and relations; the ten to twenty chains people run most, written as moves with a shape from H3 and an estimate of how many times a day; where documented software cuts them, with the evidence (click-count studies, published complaints, help-centre workarounds, vendor changelogs that fixed one); and the moves or shapes the model cannot express.

- **22. Clinical and support work.** Electronic health records (Epic, Cerner: patient, encounter, order, result, note; the click-burden literature such as Hill et al. 2013 and later JAMIA studies) and customer support (Zendesk, Intercom, ServiceNow: ticket, customer, article, escalation, macro).
- **23. Finance and procurement.** Accounts payable and ERP (NetSuite, SAP, Coupa: invoice, purchase order, vendor, approval, three-way match) and procurement or supply chain (order, shipment, supplier, exception).
- **24. Engineering and operations.** Issue tracking and project work (Jira, Linear, Asana: issue, epic, sprint, person, pull request) and incident response or observability (PagerDuty, Datadog: alert, service, deploy, log, runbook, on-call).
- **25. People and revenue operations.** Recruiting and HR (Greenhouse, Workday: candidate, job, interview, offer, approval) and CRM in general (Salesforce, HubSpot: account, contact, opportunity, activity, forecast), treated as one domain among many.

Files: `knowledge-base/sources/2N-<slug>.md`, one per memo.
