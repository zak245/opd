# Sweep 13: Information density versus disclosure for all-day professional users, 2018–2026

*Gap closed: what evidence since 2018 says about dense expert interfaces versus disclosed or simplified ones for people who live in a tool all day. Related older memos: [04, section 7](04-b2b-saas-practice-and-case-studies.md) and [05, section 9](05-critiques-pitfalls-and-measurement.md). Sweep run September 2026.*

**Tiers.** 1 = peer-reviewed (CHI, IHM, JAMIA, JMIR, Frontiers). 2 = industry research with published numbers (NN/g, vendor design systems, vendor bug trackers). 3 = practitioner essays and trade press.

---

## 0. The headline finding, stated plainly

The knowledge base rests core-model section 8.2 ("when to prefer density and persistent visibility instead") and memo 05 section 9.2 on a single practitioner essay: Matt Ström-Awn's "UI Density" (2024). This sweep set out to find the experiments behind that position. **They do not exist.**

Between 2018 and 2026 there is no published controlled experiment comparing a dense version and a progressively-disclosed version of the same professional tool, with that tool's own all-day users, measuring task time and errors. Not for trading terminals, clinical systems, IDEs, sales-engagement tools, or any enterprise data table. I searched the peer-reviewed HCI literature, Crossref, the clinical informatics literature, and the design-system and vendor-blog layer.

What exists is four adjacent bodies of evidence that support the KB's position but change its shape: one small NN/g study (2023) measuring dispersed versus condensed layouts; a clinical measurement programme (Khairat et al., 81 ICU providers, 4 medical centres) that quantifies information-processing burden in an all-day professional tool but varies *case complexity*, not *interface density*; four documented cases of vendors moving items behind a door in daily-use tools and being forced to reverse; and one peer-reviewed result on shortcut teaching (KeyMap, CHI 2020) that gives rule 8 its first real number.

Also: **nobody publishes density-toggle adoption rates.** Not Salesforce, AWS, Google or Mozilla. Mozilla's bug tracker shows they tried to remove a density setting while admitting they had no usage data at all. That is the sharpest single finding here, and it undercuts how the KB talks about "power user" toggles.

---

## 1. The one study that actually measured density and performance

**Kim Flaherty, Tim Neusesser and Nishi Chitale, "The Negative Impact of Mobile-First Web Design on Desktop," NN/g, 13 October 2023 — Tier 2.** Four prototypes — two homepages and two product pages, each in a "dispersed" and a "condensed" layout — and 13 qualitative usability tests with semi-structured interviews (5 pilot, 8 final).

They quantified both layouts. Verbatim from the methodology page: dispersed pages averaged "fewer than 7 unique content elements per screenful, whereas condensed pages had a higher content density—around 8–14 unique content elements per screenful." And: "Our dispersed page examples had a higher average (30%) of unused space, compared to 17% for condensed pages."

The effects are exactly the costs the KB attributes to over-disclosure. Content dispersion causes "an increase in cognitive load and interaction cost, difficulty understanding content, and user frustration," through mechanisms including "Mobile-specific elements (accordions) requiring excessive clicks" and "Related content fragmented across viewports, overwhelming short-term memory."

Participant quotes are users articulating the interaction tax: "I prefer this page. It's less number of clicks. All the information is right there." And: "Having to try to retain the four or five offers to understand the scope...is more difficult for me."

**Verdict: confirms** core-model 6.2 (working memory across the boundary) and rule 5, with a measured density figure rather than an assertion. Caveats: the population is general web users on marketing pages, not all-day professionals, and n=13 qualitative. It is the best available answer to "how dense is dense," not proof about experts.

The usable number to carry forward: **roughly 8–14 meaningful elements per screenful is "condensed"; under 7 is "dispersed"; 17% unused space versus 30%.** That is the first concrete operational definition of density in this knowledge base.

---

## 2. All-day professionals, measured: the clinical evidence

Clinical informatics is the only field that routinely instruments all-day professional users at scale. Three pieces, all post-2018, all Tier 1.

### 2.1 Khairat et al., JAMIA, April 2026 — 81 ICU providers, eye-tracked

"Association of patient complexity with information processing and usability of electronic health records among ICU providers: a multicenter study." Cross-sectional; providers from 4 US medical centres on 2 major EHR systems (Epic and Oracle), 4 simulated cases (2 basic, 2 complex), 5 questions each; data collection finished December 2023.

Verbatim: "Eighty-one providers were included for analysis." Complex cases produced "significantly more eye fixations (*P* < .001)" and "longer task completion times (*P* < .001)" but "significantly fewer mouse clicks per minute during complex cases (*P* < .001)." Crucially, "Case complexity did not significantly affect...the number of EHR screens viewed," nor performance scores. Order mattered: complex cases first produced "significantly more eye fixations (*P* = .015) and longer task completion times (*P* < .01)." Conclusion: "Higher case complexity was associated with greater information-processing burden and less efficient EHR use."

**Verdict: refines.** This is the first post-2018 measurement of information-processing burden in an all-day professional tool with a real professional population, and it refines the KB's implicit model that interaction count is the tax. Clicks-per-minute *fell* while burden *rose*: the expensive part was reading and searching, not clicking, and screens visited was flat. The tax on a dense screen is paid in fixations; the tax on a disclosed screen is paid in navigation. A product that counts only clicks will under-measure the cost of density and over-measure the cost of disclosure. The KB's quantitative record has no fixation-based measure at all.

### 2.2 Khairat et al., JMIR Research Protocols, 11 February 2025 — the design behind it

The protocol paper names the outcome set the KB should copy for any density evaluation: primary — eye fixations per case, correct decisions, task completion time, screens visited; secondary — mouse clicks, NASA-TLX and Computer System Usability Questionnaire scores. Population: 81 providers (53 physicians, 28 advanced practice providers), medical ICUs of 74–200 beds, simulation-lab sessions.

It defines information overload as "an overabundance of clinically irrelevant information, poor data presentation, and excessive alert notifications" — **relevance and presentation, not quantity** — and never defines "information density" or "information sprawl."

**Verdict: refines** core-model 6.1. The clinical field's own definition of overload is about irrelevance, not volume: Ström's visual-versus-value distinction, arrived at independently by a field that measures.

### 2.3 ICU flowsheet usability, published May 2025 — 25 physicians, qualitative

Single-site qualitative study at a tertiary academic medical centre in the south-eastern US: 25 ICU physicians (11 residents, 9 fellows, 5 attendings), mean 4.2 years EHR experience, **32.6 hours per week of EHR use** — a measured definition of an all-day professional user.

What they said cuts both ways. On density as a benefit: "The Flowsheet is more comprehensive… the trend of multiple vital signs at the same time is much easier to see." On density as a cost: "Flowsheets display so much extraneous information that it's very distracting… there's a plethora of information that I don't care about." And, from one user in one breath, the whole trade: "The layout is a little too cramped… you do want to see as much on one screen as possible but scrolling on an iPad in the Flowsheet is really hard."

The remedy they asked for was not a Basic/Advanced mode: "I really think that if I were able to have my own flowsheet that I can customize… I think that would help a lot in decreasing the frustration."

**Verdict: confirms** rule 3's exception and the McGrenere, Baecker and Booth (2002) finding the KB already cites. Twenty-four years later, in a different domain, all-day experts asked for the same thing: a self-populated personal view, not a designer-chosen skill level.

### 2.4 Control rooms: Afzal et al., Frontiers in Psychology, 2022

"Investigating Cognitive Load in Energy Network Control Rooms." Australian energy market operators; 3 operators, across training scenarios and live operations, using heart-rate variability, the Workload Profile questionnaire and eye-tracking.

"Each operator has their own workstation composed of 7 screens." The finding: "the layout of applications across the seven screens was not optimal for many tasks," forcing "long-distance visual transitions" that raised cognitive load through visual search. A second failure was procedural disclosure at its worst: "Procedures to follow when such events happen consist of word documents that operators need to manually find in repositories that contain hundreds of them."

**Verdict: refines** core-model 8.2. The KB says homogeneous expert populations doing the same task all day should get density. This says density is not sufficient: seven screens of everything still cost dearly, because *locality* was wrong. The authors recommend consolidation and linked views, not more pixels. Rule 5 ("reveal next to the cause") therefore applies to dense interfaces too — it is not only a rule about doors. n=3; treat as directional.

---

## 3. Density settings as actually shipped, and who uses them

This is the sub-question the brief asked about most directly: data-table density settings, "power user" density toggles, and adoption. Here is everything that is publicly documented.

### 3.1 Salesforce, Winter '19 (2018) — the largest deployed density toggle

Salesforce added a Display Density setting to Lightning Experience in Winter '19: two values, Comfy and Compact. The org admin sets the default; users override it from their profile menu and switch back and forth. The Salesforce Developers post announcing it returned HTTP 403 to this sweep, so the claim below is secondary and ranked lower.

Strata Information Group, undated, no author (Tier 3): "The 'Compact' setting has less white space so more elements fit onto the viewing page. The label for fields is located at the side of each value allowing for up to 30% more information to be seen." It separately estimates "approximately 40% more information in the same vertical space," sourcing neither figure. The related claim that Compact reaches "information density parity with Salesforce Classic" traces to the unfetched Salesforce post. Vendor arithmetic, not measurement.

**No adoption figure has ever been published.** Salesforce has the data — Display Density is a per-user field — and has not released it.

### 3.2 AWS Cloudscape — the design-system rule

Cloudscape (AWS's console design system) is the clearest vendor statement of the contract. Comfortable "optimizes content consumption and readability, as well as cross device experiences"; compact is "an additional density level for data intensive views. It increases the visibility of large amounts of data by reducing the space between elements."

Its two mandates: "Always set comfortable mode as default. Compact mode can hinder readability, overwhelm, and prolong content consumption." And: "Ensure users can always switch between comfortable and compact mode." Mechanically, compact reduces the 4px spacing scale "in increments of 4, decreasing the vertical spacing inside components (paddings) and the vertical and horizontal spacing between components (margins)." No percentage of content gained, and no adoption data.

**Verdict on 3.1 and 3.2 together: refines rule 3 and rule 8.** A density toggle is the one "mode" that survives the KB's own objection to Basic/Advanced. It does not ask the user to declare a skill level, it does not change what exists or where anything lives, it is one click, it persists, and it is reversible — precisely the profile of the McGrenere two-interface design that beat adaptive menus. The KB should say this explicitly: **density is a legitimate axis for a user-controlled mode; capability is not.**

### 3.3 Mozilla Firefox Proton, 2021 — the only vendor that documented the decision in public

The most instructive case in the sweep, because the primary evidence is a public bug tracker.

Bug 1693028, "Remove compact mode inside Density menu of customize palette." The stated rationale, verbatim: "The 'Compact' density is a feature of the 'Customize toolbar' view which is currently fairly hard to discover, and **we assume gets low engagement**." The supporting argument was a 768-pixel minimum screen height, with Proton's tabs and address bar consuming 92 pixels. The bug "repeatedly emphasizes 'we assume gets low engagement' without citing actual numbers. Commenters repeatedly requested hard data before removal."

Two dependency bugs were then filed *because the data did not exist*: bug 1698100, "Record usage of compact mode in telemetry," and bug 1698171, "Run an experiment to determine user preference for Normal vs Compact UI density in Proton." Bug 1698171, filed by Jonathan Kew, proposed "setting the default density to Compact for a meaningfully-large experimental population; and adding telemetry that will tell us what proportion of users who start with the default Normal setting choose to change." **That bug is still NEW with no assignee, five years later. The experiment was never run.** A thread objection is methodologically serious: bug 1698100's telemetry measures compact usage in the *old* UI, "which is not comparable in overall density," on a setting "not readily discoverable."

Mozilla reversed on 30 March 2021. Romain Testard: "So we're going to ensure current users can retain compact mode if they already enjoy it. For other users they can find the feature behind a pref." Compact mode was grandfathered for existing users and moved behind an `about:config` preference. A supporting number from Youssuff Quips, 21 March 2021 (Tier 3, citing Mozilla hardware telemetry): "~30% of Firefox users" run displays 768 pixels tall or shorter, rising to "45-50% of users" in Africa and South America.

**Verdict: overturns the way the KB uses Spool's "<5% of users ever changed a setting."** The KB cites that 2011 figure (core-model 6.3, rule 6) as evidence that customisation cannot fix a bad default. That holds for capability settings. But the reasoning applied to *density* settings here is circular: the setting is hard to find, therefore engagement is assumed low, therefore it should be removed — no measurement at any step, with the vendor's own engineers saying so internally. The rule to carry: **do not cite low toggle usage as a reason to delete a density control unless the control was discoverable and the number was actually measured.** Spool's figure is about settings nobody needs; a density setting a minority uses every second of every day is a different object.

Gmail, for completeness, ships three levels, with Compact described in Google's help text as matching "the line spacing that existing Gmail users are used to" — a density setting that exists to retain incumbents after a redesign. No adoption figures published.

---

## 4. What all-day professionals actually reject, 2018–2026

Four cases, all Tier 3 (trade press, vendor forums, vendor blogs), but all describing real shipped products and real reversals — the *pattern* is worth more than any one source.

**Windows 11 context menu (2021).** Microsoft moved most commands behind "Show more options." Trade coverage records the complaint precisely: users "now had to click on 'Show More Options' first," described as "maddening and frustrating," and "anyone with an established workflow now pays an extra click for actions that used to be one click away." The characterisation that matters: "a speed bump deliberately placed in the path of muscle memory, which is why the backlash endured." On 3 June 2026 Microsoft's Windows design leadership said it is working on a refresh to make the menu "faster, simpler by default, and configurable around the commands people use most." No quantitative measurement of the cost was ever published by anyone, Microsoft included.

**Figma UI3 (2024).** Roman Kamushken, Setproduct, 30 July 2024, verbatim: the redesign made "simple tasks much harder to complete. What used to be done in a couple of clicks now takes a series of them," and "power users who have long been expressing their loyalty to Figma seem to be forgotten." Complaints: frequently-used functions relocated to a "More Actions" menu; a floating toolbar; collapsed nested instances requiring manual expansion. Figma reverted several changes — restoring "clip content" to a checkbox, putting constraints and blend modes inline in the properties panel, and reverting the condensed alignment grid in Auto Layout specifically "to preserve muscle memory for power users."

**Office simplified ribbon (2018–2019).** Microsoft's single-row ribbon shipped with the guarantee that users "would always be able to revert back to the classic ribbon with one click," and rolled out to the web first. A vendor already burned by the 2007 ribbon designed the escape hatch in from day one.

**Firefox Proton compact density (2021).** Covered above: reversed under user pressure.

**Verdict: confirms core-model 8.2 and rule 8, and refines rule 1.** The pattern is not "experts hate hiding." It is narrower: *experts reject the removal of items from paths their hands already know.* Figma's own fix was described in terms of muscle memory; Windows 11's backlash "endured" for the same reason. Aggregate frequency data does not predict this — a command used by 4% of users on 100% of their days is exactly what a frequency cut deletes and a trained hand cannot lose.

Concrete addition to rule 1's test: alongside "what share of users touch it weekly," ask **"what share of the people who touch it at all touch it daily?"** A low-reach, high-repetition item is a density item, not a door item. The KB has no current mechanism for spotting these.

---

## 5. Keyboard-first tools and shortcut teaching

### 5.1 The one solid number: KeyMap, CHI 2020 — Tier 1

Blaine Lewis, Greg d'Eon, Andy Cockburn and Daniel Vogel, "KeyMap: Improving Keyboard Shortcut Vocabulary Using Norman's Mapping," CHI 2020. KeyMap shows command labels on a picture of the keyboard when a modifier is held. Crowdsourced, 98 participants after filtering (118 recruited), against ExposeHK, the previous state of the art.

Verbatim: "KeyMap users remembered 1 more shortcut than ExposeHK immediately after training, and this advantage increased to 4.5 more shortcuts when tested again after 24 hours." In detail: median 10 correct immediately versus 9; after 24 hours KeyMap held at 10 while ExposeHK dropped to 5.5. Incidental learning — recalling a command never practised — occurred for 14 KeyMap participants versus 6. Selection times converged at about 2.6 seconds by block 6, with no significant difference. Subjectively, 3 KeyMap users (6%) found it not useful versus 10 (20%).

The paper states rule 8's premise as researchers see it: "Most users have a small shortcut vocabulary," and shortcuts "are typically hidden in GUI-activated tooltips, dropdown menus, or help screens, so they are hard to find."

**Verdict: refines rule 8 substantially.** Rule 8 says a command palette showing the shortcut every time is "the purest form" of a disclosure control designed to make users stop needing it, citing NN/g heuristic 7 and Cockburn et al. (2014). KeyMap gives the first hard number on the teaching side, and says something the KB does not: **retention at 24 hours differed by roughly double — 5.5 versus 10 commands — and the difference was spatial layout.** Showing a shortcut in a list, which is what a command palette does, was the weaker of the two conditions. The stronger showed each command *at its position on the keyboard*. So rule 8 should read: teach with spatial feedforward where you can, and treat the palette's inline hint as the floor, not the ceiling. The 2.6-second convergence adds a caution: the teaching mechanism is not itself a speed win; its value is retention.

### 5.2 The keyboard-first products: no usable numbers

The sweep looked for measured effects from Superhuman and Linear, both cited in memo 04 sections 3.4 and 3.5 for *design*, not evidence.

Superhuman's blog (17 January 2026), each claim checked for a source: "4+ hours weekly" (none); "cut processing time by 50-70%" (none); "Mouse-based actions take 2-3 seconds each, while keyboard shortcuts take 0.5-1 second" (none); "saves 20-40 minutes daily" for mastering 10–15 commands (none); "Superhuman Mail delivers documented time savings of 4 hours per person every week" — called documented, no study linked. The figures it does source are about context switching generally, not about Superhuman.

**Verdict: the numbers in memo 04 section 3.5 (shortcut usage +20%, feature adoption +67%, week-1 activation +17%) are unsourced and should be labelled so, not repeated as evidence.** The defensible claim about keyboard-first products is that experienced practitioners choose them — preference, not measurement. Linear's public `/method` pages contain no quotable statements about density, shortcuts or speed; memo 04 section 3.4's density claims about Linear remain third-party.

One more paper found but unread: "The Role of Social Interactions in the Interaction Discovery of Keyboard Shortcuts," IHM 2025, DOI 10.1145/3765712.3765714 (ACM DL returned 403 to every attempt). It is the only 2025 peer-reviewed work on shortcut *discovery* found, and its topic matches the 2004 Peres et al. finding that shortcut use spreads by working alongside other shortcut users. Ranked low here because unread.

---

## 6. Interaction cost for repeated daily tasks

This is the thinnest area in the sweep. What exists is almost entirely vendor arithmetic of the form "X seconds × Y repetitions = Z hours." No independent study measured the per-repetition cost of a disclosure step in a professional tool between 2018 and 2026.

The credible fragments: the JAMIA 2026 result gives per-case fixations, completion times and clicks-per-minute for 81 professionals — the right shape of measurement on the wrong variable. A widely repeated clinical figure has badge-based EHR login, replacing credentials typed "up to 140 times daily," saving "as much as 20 minutes per day"; only secondary coverage was fetched, so rank it low, but 140 repetitions a day is what makes a two-second step expensive. The much-cited Harvard Business Review study of application toggling (Murty et al., August 2022) could not be fetched, and the "1,200+ daily app toggles" figure circulating in vendor blogs traces through Atlassian to that article, whose page also could not be fetched. **Do not put that number in the KB until someone reads the original**; it is currently a third-hand citation in a marketing post.

**Verdict: the KB's "interaction tax" language in core-model 8.2 and rule 1's "disclosure debt" consequence are, as of 2026, arguments rather than measurements.** Good arguments, consistent with the Windows 11 and Figma reversals — but the KB should stop implying a measured per-visit cost figure exists.

---

## 7. The 2024–2026 "dense UI" discussion, and whether it measured anything

The brief asked for the recent dense-UI discussion "with any measurements." I fetched the main pieces. The revival is entirely rhetorical.

- **Matt Ström-Awn, "UI Density," 21 May 2024 (Tier 3).** The KB's anchor, fetched and checked for empirical content: the only numbers in it are latency thresholds (100ms, 1s, 10s, 1 minute), a citation that Apple's Aqua progress stripes "made waiting times seem 11% shorter," and a Google/Yahoo valuation comparison. **There is no measurement of density, elements per screen, or task performance anywhere in it.** Its conceptual contribution — separating visual, information, design, temporal and value density — is genuinely useful and should be kept; its status as evidence should be corrected.
- **"Dense Interfaces Are Back," MyDesigner, 8 March 2026 (Tier 3).** Cites Notion, Linear, Superhuman, Stripe and the Bloomberg Terminal. **No quantitative measurements** of density, clicks or usability. Its line "If it's more than one [click], you're hiding value" is advice, not a finding.
- **Ayana Campbell Smith, Envy Labs, 9 August 2022 (Tier 3).** "Power users know just where to go and what to do in an interface to get things done. They aren't intimidated by complexity, and often benefit when everything's laid out at once." No data.
- **Roman Kamushken, Setproduct, 12 June 2026 (Tier 3).** "Ship compact, comfortable, and spacious as real options, because an analyst and a casual user want different row heights" — plus, to his credit, a refusal to invent numbers: "If you do not have a sourced number for a given measurement, design it by eye against your own type scale rather than inventing a precise pixel value." No adoption data.

**Verdict: refines memo 04 section 7 and memo 05 section 9.2.** The dense-UI revival is a real and near-unanimous shift in practitioner opinion between 2022 and 2026 and should be recorded as such. It has produced zero measurements. Present it as the state of professional opinion, with the NN/g content-dispersion study as its only measured support.

One older data point, named as old per the brief: NN/g's "Are Chinese Websites Too Complex?" (2016) found Chinese users "prefer fairly high information density" and complain less about complexity than Western users. No post-2018 replication was found, but it is a reminder that a single global density default is a choice, not a neutral position.

---

## 8. What this sweep changes in the knowledge base

1. **Core-model 6.3 gains four rows.** Condensed versus dispersed: 8–14 versus <7 elements per screenful, 17% versus 30% unused space (NN/g 2023, n=13). Shortcut retention at 24 hours: median 10 versus 5.5 commands (KeyMap, CHI 2020, n=98). Incidental shortcut learning: 14 versus 6 participants (same). All-day professional EHR exposure: 32.6 hours per week (25 ICU physicians, 2025).
2. **Core-model 8.2 must be re-sourced.** Its claim is sound; its citation (Ström 2024) contains no measurement. Re-anchor on the NN/g numbers, the four rejection cases and the clinical evidence, and say plainly that no head-to-head experiment exists.
3. **Rule 1's test needs a second question:** what share of the people who use this item at all use it *daily*? Low-reach, high-repetition items are density items and must not be doored on aggregate frequency.
4. **Rule 3 should name density as the licensed exception.** A density toggle is a user-controlled view setting, not an audience-labelled mode. Salesforce and Cloudscape both ship an admin default plus a per-user override; Cloudscape mandates that users "can always switch."
5. **Rule 6 and the Spool <5% figure need a boundary.** Low toggle usage justifies deleting a capability setting, not a density setting, and only when the control was discoverable and usage was measured. Firefox is the cautionary case.
6. **Rule 8 sharpens.** Spatial feedforward roughly doubled 24-hour shortcut retention over the previous best method; the palette hint is the floor. And rule 8's Superhuman numbers should be demoted — vendor claims with no source, on a blog that calls unsourced figures "documented."
7. **Rule 5 extends to dense screens.** The control-room study shows a dense interface with poor locality still costs heavily. "Reveal next to the cause" generalises to "put related things near each other," door or no door.

---

## 9. Still unknown

- **No head-to-head experiment.** Nothing 2018–2026 compares a dense and a progressively-disclosed build of the same professional tool with its own all-day users on task time and errors. The central gap, wide open.
- **No density-toggle adoption rate, anywhere.** Salesforce, AWS, Google, Atlassian, GitHub and Mozilla all ship density controls; none has published what fraction of users change them. Mozilla's attempt to find out was filed in 2021 and never run.
- **No measurement of the per-repetition cost of a disclosure step** in a professional tool.
- **No peer-reviewed Bloomberg Terminal UX research since 2018.** The KB's Bloomberg material still rests on Dominique Leca's 2010 UX Magazine essay; searches surfaced only trade guides repeating the same framing.
- **Nothing measured on trading, operations or sales-engagement interfaces.** Sales-engagement vendors publish ROI numbers (a Forrester-sourced "329% ROI," a Salesforce-sourced "64% of rep time on admin"), none of which touch density or disclosure. Apollo, Outreach and Salesloft have no published interface research at all.
- **Nothing measured on IDE density.** Memo 05 section 9.2's claim that IDEs trend toward showing more is observation, not evidence. JetBrains' Developer Ecosystem surveys (26,000+ respondents in 2023; 23,262 in 2024) do not appear to ask about shortcuts or density.
- **The 2025 IHM paper on social discovery of shortcuts is unread** (ACM DL 403). It is the most likely source of a newer adoption number.
- **The HBR application-toggling study is unread** and its headline figure should not enter the KB until it is.
- **No post-2018 replication of the cross-cultural density-preference finding.**

---

## 10. Bibliography

**Tier 1 — peer-reviewed**

- Khairat, S., et al. "Association of patient complexity with information processing and usability of electronic health records among ICU providers: a multicenter study." *Journal of the American Medical Informatics Association*, April 2026. https://academic.oup.com/jamia/advance-article-abstract/doi/10.1093/jamia/ocag017/8493186 (abstract fetched; full text not accessed)
- Khairat, S., Morelli, J., Boynton, M., Bice, T., Gold, J., Carson, S. "Investigation of Information Overload in Electronic Health Records: Protocol for Usability Study." *JMIR Research Protocols*, 11 February 2025. https://pmc.ncbi.nlm.nih.gov/articles/PMC11862759/
- "Facilitators and Barriers to ICU Providers' Usability of Electronic Health Records Screens," May 2025. https://pmc.ncbi.nlm.nih.gov/articles/PMC12745929/
- Afzal, S., et al. "Investigating Cognitive Load in Energy Network Control Rooms: Recommendations for Future Designs." *Frontiers in Psychology*, 2022. https://pmc.ncbi.nlm.nih.gov/articles/PMC8995508/
- Lewis, B., d'Eon, G., Cockburn, A., Vogel, D. "KeyMap: Improving Keyboard Shortcut Vocabulary Using Norman's Mapping." *CHI 2020*. https://dl.acm.org/doi/10.1145/3313831.3376483 (ACM 403; content via https://www.readkong.com/page/keymap-improving-keyboard-shortcut-vocabulary-using-7538229)
- "The Role of Social Interactions in the Interaction Discovery of Keyboard Shortcuts." *IHM 2025*. https://dl.acm.org/doi/full/10.1145/3765712.3765714 — **not fetched (403)**

**Tier 2 — industry research and vendor primary sources with published numbers**

- Flaherty, K., Neusesser, T., Chitale, N. "The Negative Impact of Mobile-First Web Design on Desktop." NN/g, 13 October 2023. https://www.nngroup.com/articles/content-dispersion/ and methodology: https://www.nngroup.com/articles/content-dispersion-methodology/
- Cloudscape Design System (AWS). "Content density." https://cloudscape.design/foundation/visual-foundation/content-density/
- Mozilla Bugzilla 1693028, "Remove compact mode inside Density menu of customize palette." https://bugzilla.mozilla.org/show_bug.cgi?id=1693028
- Mozilla Bugzilla 1698171, "Run an experiment to determine user preference for Normal vs Compact UI density in Proton." https://bugzilla.mozilla.org/show_bug.cgi?id=1698171
- Salesforce Developers. "New Density Settings for the Lightning Experience UI in Winter '19," August 2018. https://developer.salesforce.com/blogs/2018/08/new-density-settings-for-the-lightning-experience-ui-in-winter-19 — **not fetched (403)**
- NN/g information density topic index (used to confirm no NN/g density study exists beyond the above). https://www.nngroup.com/topic/information-density/

**Tier 3 — practitioner essays, vendor blogs, trade press**

- Ström-Awn, M. "UI Density," 21 May 2024. https://mattstromawn.com/writing/ui-density/
- Kamushken, R. "The Dark Side of Recent Figma Updates," Setproduct, 30 July 2024. https://www.setproduct.com/blog/dark-side-of-figmas-updates
- Kamushken, R. "Data table UI design reference guide for 2026," Setproduct, 12 June 2026. https://www.setproduct.com/blog/data-table-ui-design
- MyDesigner. "Dense Interfaces Are Back: Why Information Hierarchy Beats Minimalism in 2026," 8 March 2026. https://mydesigner.gg/blog/dense-interfaces-information-hierarchy-2026
- Campbell Smith, A. "Web Applications: How To Balance Interface Information Density," Envy Labs, 9 August 2022. https://envylabs.com/insights/interface-information-density-best-practices
- Quips, Y. "Supporting Compact Mode in Firefox Proton," 21 March 2021. https://www.quippd.com/writing/2021/03/21/supporting-compact-mode-in-firefox-proton.html
- Strata Information Group. "Salesforce Display Density – Comfy vs. Compact," undated. https://www.sigcorp.com/insights/salesforce-display-density-comfy-vs-compact/
- Mondal, R. "SaaS Data Table & List View UX Patterns," 2 July 2026. https://www.saasui.design/blog/saas-data-table-ux-patterns
- Superhuman. "High volume email management: 3 frameworks to reclaim 4+ hours weekly," 17 January 2026. https://blog.superhuman.com/high-volume-email-management/
- PCWorld. "Windows 11's decluttered right-click menu draws criticism for one big flaw." https://www.pcworld.com/article/2964382/windows-11s-decluttered-right-click-menu-draws-criticism-for-one-big-flaw.html
- Figma. "Inside the Redesigned Figma, Where Your Work Takes Center Stage." https://www.figma.com/blog/behind-our-redesign-ui3/
- Figma Forum, UI3 feedback threads. https://forum.figma.com/share-your-feedback-26/ui3-feedback-3058/
- ghacks.net coverage of the Firefox compact-mode decision, March 2021. https://www.ghacks.net/2021/03/14/mozilla-plans-to-remove-the-compact-density-option-from-firefoxs-customize-menu/ — **not fetched (403)**
- Harvard Business Review, Murty, R. N., et al. "How Much Time and Energy Do We Waste Toggling Between Applications?", August 2022. https://hbr.org/2022/08/how-much-time-and-energy-do-we-waste-toggling-between-applications — **not fetched (paywall)**
