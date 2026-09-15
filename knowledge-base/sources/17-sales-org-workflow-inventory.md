# 17. What a B2B sales organisation actually does, day to day (2025–2026)

*An honest inventory of the recurring work in a B2B sales org that runs on a GTM platform — Apollo, Outreach, Salesloft, HubSpot Sales Hub, Clay, Gong, Common Room, Instantly, Lemlist and their neighbours. Built to give [PRODUCT.md](../../PRODUCT.md)'s five roles (SDR, AE, marketer, CS, RevOps admin) and four example customers (Fathom Labs, Meridian Software, Halyard Agency, Ridgeline) a factual basis, so that usage models are fitted to published evidence rather than invented. Compiled September 2026.*

**Sourcing rules.** Tier 1 = a survey or dataset with a published sample (Bridge Group, Salesforce State of Sales, ChurnZero, CRMArena-Pro). Tier 2 = first-party vendor documentation with concrete numbers or named settings (Gong Help Center, HubSpot Knowledge Base, Clay Docs, Salesforce Help, Chili Piper, Instantly). Tier 3 = practitioner essays, benchmark aggregators and vendor blogs. Everything not traceable to a source is marked **(unverified)**. Some searches could not be completed inside this session's budget; those gaps are listed in §11 rather than filled with guesses.

**A caution about benchmark laundering.** Many numbers below circulate with no primary source. Where a figure reaches me only through an aggregator citing a gated report, I say so. Bridge Group and Salesforce are the two solid spines here; most of the rest is vendor-published and directional.

---

## 0. Six findings that shape everything else

1. **Most of the working day is not selling.** Salesforce's *State of Sales, 7th edition* (4,050 sales professionals, 22 countries, surveyed August–September 2025) puts it at **40% selling / 60% not selling**, with the non-selling half made of prospecting, manual data entry, planning, quote creation and training. "Sales reps spend almost one full day of their workweek on prospecting," and planning alone "takes up almost a fifth of the sales pro's average week" — the report's own figure is **16% of time on preparation and planning**. The 6th edition (7,775 responses, 2022) had it at 28% selling; the direction is mildly better, the shape is unchanged.

2. **The SDR day is a fixed activity budget.** The Bridge Group's *2025 SDR Models, Motions & Metrics* (351 B2B companies, 78% North America, 83% B2B SaaS, median revenue $47M, median ASP $50K — their 10th biennial study) finds a median of **112 activities per day: 44 phone, 41 email, 19 LinkedIn, 8 text or other**, producing **4.1 quality conversations per day** and a median monthly quota of **10 held meetings**. Phone-centric teams average 56 dials and 4.6 conversations; email-centric teams 28 dials and 3.4.

3. **Tool sprawl is the background condition.** Only **34% of sales teams use one platform**; 45% use a platform plus standalone tools, 20% many standalone tools, averaging **eight per team**. **42% of reps are overwhelmed by too many tools.** Top data problems among teams running agents: manual errors, duplicate data, security, incomplete data, corrupt data.

4. **Agents are widely deployed and narrowly trusted.** 54% of sales teams use AI agents now, 34% expect to within two years. But the tasks they are trusted with cluster at the low-risk end — research, summarisation, field extraction, drafting — and the one place vendors consistently ship an explicit approval gate is *sending email as a human*. See §9.

5. **Frequency is bimodal.** A handful of workflows happen dozens of times a day (task list, reply triage, call logging, record advance). A second cluster is weekly (forecast, pipeline review, deliverability check, sync errors). A third is quarterly or annual (territory, quota, comp, permission audit). The middle is thin, and any screen mixing all three without ranking them will be wrong for somebody.

6. **The same setting is rare for three customers and daily for one.** The Halyard problem in PRODUCT.md holds up: an agency running ten client workspaces performs the "occasional admin" work — mailbox health, domain rotation, sending limits, workspace switching, client reporting — once per client per week, which is a daily job. Agency guidance puts the deliverability check at ~**fifteen minutes per client per week** (tier 3).

---

## 1. SDR — sales development

The SDR is the density argument. They live in a task list, a table and an inbox, all day, and they switch between them dozens of times an hour.

| Workflow | Frequency | Trigger | Steps | Tools | Sources |
|---|---|---|---|---|---|
| **Work the daily task queue** | Continuously, all day; ~112 activities/day median | Start of day; tasks due; AI re-prioritisation | Open task list → work due calls, emails, LinkedIn steps in priority order → mark complete/disposition → next | Outreach, Salesloft Rhythm, Apollo, HubSpot Sequences | Bridge Group 2025; Salesloft Rhythm "dynamically reorders an SDR's task list based on real-time signals" |
| **Protected call blocks ("power hours")** | 2–3 blocks/day, 90 min each | Calendar block | Prep 10–15 accounts → dial continuously, no email or CRM → log dispositions after the block | Dialer (Orum, Nooks, Apollo Parallel Dialer), CRM | Tier-3 SDR routines: "30–40 dials in 90 minutes with a parallel dialer, 15–20 with manual dialing"; "minimum 90 minutes to hit flow state" |
| **Cold calling with a dialer** | Daily; 44 dials median, 56 on phone-first teams; parallel-dialer roles post 100–210 dials/day | Call block | Load list → dial (1 line power, 2–7 lines parallel) → dialer filters voicemail/busy → live connect → opener → disposition → voicemail drop or next | Orum (up to 7 lines), Nooks (power 1, parallel 2–5, turbo ~6), Apollo Parallel Dialer, Salesfinity | Bridge Group; Apollo's own BDR posting: "Making ~210 dials per day using Apollo's Parallel Dialer… Booking at least 13 qualified meetings per client/month with 70%+ hold rate" |
| **Build a target account list** | Weekly to monthly; refreshed on new territory or campaign | New quarter, new segment, new signal, empty pipeline | Define filters (industry, size, geo, tech, funding, headcount growth) → run saved search → exclude owned/DNC/in-sequence → save list → assign | Apollo, Sales Navigator saved searches, Clay, Common Room, ZoomInfo | Sales Navigator saved searches with weekly alerts; LinkedIn invitation cap ~**100/week, all tiers** |
| **Work signals and intent** | Daily to weekly; Bombora Company Surge refreshes **weekly (Sundays)** | Signal fires: job change, funding, hiring, intent surge, site visit | Review signal feed/segment → check fit → research → add to a signal-specific sequence → act within 24–48h | Common Room, 6sense, Bombora, Clay, Warmly, Unify | Common Room job-change signal: data "comes from LinkedIn," previous-org filters, "included on all plans" |
| **Waterfall enrichment** | Per list build; continuous for always-on tables | New list; missing email or phone; CRM decay | Anchor on name + domain or LinkedIn URL → free "infer email" step → provider 1 → if no confident result, provider 2, 3… → validate (ZeroBounce; catch-all toggle) → stop at first hit | Clay, Apollo (enrichment provider order), Prospeo, Findymail, LeadMagic | Clay Docs: "if a provider finds a valid email, the process stops for that contact"; "always start by testing 10 rows" |
| **Phone number reveal** | Per-contact, as needed | Rep wants a mobile before dialing | Reveal → credit charged → number written to record | Apollo (email reveal = 1 credit, **phone reveal = 8 credits**) | Apollo credit docs via secondary; see §11 |
| **Build a Clay-style table** | Weekly; agencies daily | New play, new ICP, new signal | Import source → find people/companies → enrich (waterfall) → transform with formulas or Claygent → conditional runs → filter → export to CRM/sequencer | Clay (FETE: Find, Enrich, Transform, Export), 150+ providers | Clay University: "add a conditional run so the create action only fires when the lookup did not find an existing record" |
| **Build or edit a sequence** | Weekly to monthly per rep; daily for the team's ops owner | New segment, new messaging, poor reply rate | Clone a template → set steps and day gaps → write copy (or AI-draft) → attach snippets/personalisation tokens → set schedule and ruleset → A/B a step → enrol | Outreach, Salesloft Cadence, Apollo, Instantly, Lemlist, HubSpot Sequences | Outreach's sample 21-day multichannel cadence: day 1 email, 3 LinkedIn connect, 5 call+VM, 7 video, 10 email, 14 LinkedIn message, 17 call, 21 breakup |
| **A/B test a step** | Monthly; per sequence | Reply rate below target | Clone the email step → change one variable → let the platform split traffic → read after "a couple hundred prospects" | Outreach, Instantly, Lemlist | Outreach: "clone one of your email steps… After a couple hundred prospects have gone through, you'll clearly see which email performs better" |
| **Triage the reply inbox** | Continuously; several sweeps/day | A reply lands | Classify (interested / not now / objection / referral / wrong person / OOO / unsubscribe) → act: book, snooze, rebut, reassign, suppress → update record | Outreach/Salesloft inbox, Apollo, Smartlead/Instantly master inbox | Taxonomy: "positive, neutral, objection, referral, unsubscribe, and edge-case operational replies." OOO "pause the sequence and resume it later"; unsubscribe "immediately stop outreach and update suppression rules." Design rule: "action mapping matters far more than maintaining a massive list of highly specific labels" |
| **Book a meeting and hand it off** | 10 held meetings/month median (Stage 0); 6 converted (Stage 1) | Positive reply or live call | Send scheduling link or router → confirm → write the handoff brief → complete required CRM qualification fields → notify AE | Chili Piper, Calendly, Default, HubSpot Meetings; CRM | Bridge Group quota medians; "meeting is only marked as confirmed when the handoff package is complete" |
| **Chase no-shows** | Weekly batch; per booked meeting | Prospect misses | Automated reminder sequence (email + SMS) → no-show sequence with self-reschedule → reassign if the rep can't take the new slot | Chili Piper, Calendly | Chili Piper: industry no-show "20–35%"; their own "down to just 2%"; reminders "one hour before" and "one minute before"; 30-minute first meetings make a show "12% more likely" |
| **Mailbox and deliverability hygiene** | Weekly (daily at high volume) | Warm-up schedule; bounce spike; reply-rate drop | Check deliverability score, sent vs limit, bounce rate, spam rate, domain reputation → adjust caps, rotate inboxes, pause a domain | Apollo mailbox health, Instantly, Smartlead, Google Postmaster | Instantly: ~30 emails/day/mailbox, 20 for DFY, slow-ramp +2/day. Unify: 25/day default, up to 65; warm-up "roughly three weeks." Google (Feb 2024) and Microsoft (May 2025) bulk-sender rules: SPF+DKIM+DMARC at 5,000+/day, spam rate below 0.10%, never 0.30% |
| **CRM hygiene / logging** | Daily, in fragments | After every call, reply, meeting | Log activity → update contact/account stage → fix bad numbers → mark DNC → dedupe | CRM + engagement tool auto-logging | Business Wire SDR posting: "Maintains accurate records of all sales activities… in Salesforce CRM" |
| **Call review and coaching** | Weekly; 3–5 calls per rep | Manager cadence | Manager scores calls against a rubric → rep listens → practises → next block | Gong, Nooks AI coach, Chorus | Tier-3: "5–8 categories, a 0–3 scale… review 3–5 calls per rep per week" |

**Numbers worth carrying.** Ramp to full output: **3.0 months**, the lowest since 2010. Tenure 1.9 years; annual attrition 40% (13% involuntary, 11% voluntary, 16% promotion). Pipeline sourced per SDR $3.78M/yr, up from $2.83M in 2022. SDR:AE ratio 1:2.4, unchanged since 2018; 82% of SDRs are aligned to specific AE territories, up from 56% in 2018. Only **60% of reps hit quota — the lowest on record**. "AI SDRs" appeared as a distinct category for the first time, at **1% of respondents**.

**What job descriptions actually demand, 2025–26.** Apollo's own BDR posting: "Making ~210 dials per day using Apollo's Parallel Dialer… Booking at least 13 qualified meetings per client/month with 70%+ hold rate" — note that *show rate* is carried by the SDR, not just the AE. Business Wire: "Maintains a daily activity of 50-75 calls." Wheelhouse (OTE $95–115K) is the most instructive for product design, because the SDR owns the infrastructure as well as the outreach: "Own the day-to-day operation of our outbound stack across HubSpot and Instantly. Build, manage, and iterate on sequences… Keep CRM data clean and current… Work with leadership to identify and test AI-assisted approaches." The gap between these targets (50–210 calls/day) and Bridge Group's measured median of 44 is the story: job descriptions set aspirational floors, and the 210 figure exists only because of parallel dialing.

**Channel caps are hard constraints, not preferences.** LinkedIn allows ~100 invitations per week on every tier including Sales Navigator, with a soft daily cap around 20–25 — which bounds the 19-LinkedIn-touches-per-day median. Instantly's recommended ceiling is ~30 campaign emails per mailbox per day, so a 41-email/day median arithmetically implies **multiple mailboxes per rep**. This is why mailbox settings sit in the SDR's daily path, not the admin's.

**Conversion reality.** Gong's analysis of 300M+ calls puts average connect at **5.4% of prospects** against **13.3% for top-quartile reps** — 19 dials per conversation for an average rep, 8 for a top performer. Belkins' 2026 study of 175,000+ dials reports 9.9% connect per dial, 24.5% per prospect over ~3 attempts, 58% connect-to-conversation and 4.6% conversation-to-meeting — roughly **one booked meeting per 370 dials**. Cold email replies: Instantly's platform average **3.43%**, top quartile 5.5%, top decile 10.7%+; Belkins' strict net-new figure is **0.45%**. Outreach's own customer-wide sequence email reply average is **2.9%** (open 27.2%, bounce 2.8%, opt-out 1.1%). These are not the same metric and should never be compared directly.

---

## 2. Account executive

| Workflow | Frequency | Trigger | Steps | Tools | Sources |
|---|---|---|---|---|---|
| **Work the pipeline board** | Daily | Start of day; deal warnings | Open deal board → scan warnings → pick deals needing action → inline-edit fields → sync to CRM | Gong Deals, Outreach Commit, Salesloft Deals, Salesforce, HubSpot | Gong deal boards allow inline edit of "Amount, Owner name, close_date, Stage, Probability…" and changes are "synced immediately to your CRM" |
| **Respond to deal warnings** | Daily/weekly | Rule fires | Review the warning → act (multithread, re-date, disqualify) | Gong AI Deal Monitor | Gong's eight warning types: No Activity (7–14 days), Ghosted (4–7 days), Overdue, Not Enough Contacts, No Power, Pricing Not Mentioned, Red Flag, Stalled in Stage |
| **Run discovery and demo calls** | Several per week | Booked meeting | Prep brief → run the call (recorded) → AI summary → next-step email → log | Gong/Kaia/Clari Copilot, Zoom, calendar | Salesloft claims "Deal Summary AI reduces pre-call prep from 20 minutes to 30 seconds" (vendor claim) |
| **Fill qualification fields** | Per deal, ongoing | Stage advance; manager review | Review AI-extracted MEDDPICC/BANT/SPICED values → validate or correct → save | Gong AI Data Extractor, Outreach sales methodology fields, Salesloft Conversations | Outreach ships MEDDPICC out of the box — Metrics, Economic Buyer, Decision Criteria, Decision Process, Paper Process, Identify Pain, Champion, Competition — each "mapped to a custom Outreach field created by the Admin," with AI suggestions "enabled by default"; Gong Playbooks colour-code white → white+star (AI found evidence) → light blue (manual note) → dark blue ("validated by either the AE or manager") |
| **Maintain next steps and close dates** | Weekly minimum | Pipeline hygiene rules | Update next step (often a validation-rule-enforced field), re-date, re-categorise | Salesforce validation rules, Scratchpad | Tier 3: a "Next Step field with at least 20 characters"; deals unmoved 14+ days get flagged |
| **Submit the forecast** | Weekly (some bi-weekly) | Reminder in app and Slack | Select period and team → open the submission cell (Commit / Best Case / Pipeline) → enter number → add a note → review submission-change history → save | Clari, Gong Forecast boards, Salesforce Collaborative Forecasts, BoostUp | Gong: "When it's time for you to submit your forecast, by the cadence set by your business admin, you get a reminder in the Gong app and in Slack" |
| **Forecast call with the manager** | Weekly rep-to-manager; monthly leadership roll-up | Standing meeting | Every current-period deal reviewed and categorised → actions assigned | Clari, Gong, spreadsheet | "Most $50M+ SaaS teams run a weekly rep-to-manager forecast call and a bi-weekly or monthly leadership roll-up." Kellblog: forecast = "a 90% number," best case = "a 20% number"; Commit 90% / Forecast 70% / Upside 30% |
| **Pipeline review (generation, not period)** | Weekly 1:1 or team | Standing meeting | Inspect coverage, stage movement, stalls, single-threading; assign next steps | Gong deal boards, Clari, Salesloft Deals | Distinguished from the forecast call: "pipeline review is about generation and qualification of deals in all stages, while forecast call is about the specific deals in the current period." Entry rule: "If a deal is missing a current close date, a documented next step, and an owner, it does not get reviewed — it gets flagged for cleanup" |
| **Mutual action plan / success plan** | Per deal above a size threshold, from mid-funnel | Deal reaches evaluation | Build the plan with the buyer → share → track phase and next open step | Outreach Success Plans, Recapped, Aligned, Dock | Outreach Deal Overview surfaces "the current phase and next open step of associated success plans" |
| **Quote, approve, sign** | Per deal, near close | Verbal agreement | Build quote → discount approval chain → order form → e-signature → closed-won | CPQ (Salesforce CPQ, DealHub, PandaDoc), HubSpot Quotes | Salesforce State of Sales lists **creating quotes** among reps' weekly time slices and as the **#3 AI agent use case** |
| **Hand off to CS** | Per closed-won | Deal marked won | Complete handoff fields → attach discovery artefacts → document commitments and risks → internal handoff meeting → warm intro email → kickoff booked | CRM, CS platform | Seven-item checklist: CRM fields, discovery artefacts, risks and commitments, relationship map, internal handoff meeting, automated workflows, customer introduction. Common enforcement: a "Handoff Complete" checkbox required before Closed Won |

**Frameworks in use, 2025–26.** MEDDIC/MEDDPICC dominate enterprise SaaS (deals above ~$50K); BANT survives in SMB and short cycles; SPICED (Winning by Design — Situation, Pain, Impact, Critical Event, Decision) is the discovery-led alternative; Command of the Message supplies the value framework. The honest reading from the comparison literature: "the choice of qualification framework matters less than the rigor of its application."

**A cautionary data point on the tooling layer.** Dooly — a widely used CRM-update and notes layer — was acquired by Mediafly and **shut down on 30 June 2025**, data purged by July. Point solutions in the AE's daily path are not durable.

---

## 3. Sales leaders and managers

| Workflow | Frequency | Steps and evidence | Tools |
|---|---|---|---|
| **Forecast roll-up** | Weekly | Reports' latest submissions roll up automatically; manager adjusts, adds a judgement note, submits upward. Gong: team rollups "reflect the total of the latest submissions of all team members reporting to the selected manager" | Clari, Gong, Salesforce forecast hierarchy |
| **Pipeline inspection** | Weekly | Filter a deal board by team, date range and warning; drill into at-risk deals; subscribe to a weekly digest of "the board deals with the most risk" | Gong, Clari |
| **Call coaching** | Weekly in theory | Score calls, comment, roleplay. Only **26% get 1:1 coaching at least weekly** (Salesforce 6th ed); 46% of reps "rarely get feedback on my sales conversations," 40% cite "my manager's lack of time"; 34% of teams with agents use them for coaching | Gong, Nooks, Agentforce coaching agents |
| **Dashboards** | Daily glance | Activity, conversion, coverage, attainment. **(unverified — no published telemetry on what leaders actually open)** | Native reporting, Looker/Tableau/Sigma |
| **Territory, capacity and quota planning** | Quarterly to annual | Model coverage, carve territories, set quota, assign. Sales planning is the **#2 growth tactic** after AI and consumes ~16% of the average week across the org | Fullcast, CRM territories, spreadsheets |
| **Comp questions and disputes** | Monthly, at payout | Rep queries → ops checks → adjust. 76% of reps "wish there were more transparency in how my compensation is calculated"; **32% of sales leaders say their tech stacks lack compensation management capabilities** | Spiff, CaptivateIQ, QuotaPath |

---

## 4. Marketer (demand gen and lifecycle)

| Workflow | Frequency | Trigger | Steps | Tools | Sources |
|---|---|---|---|---|---|
| **Campaign build and launch** | Weekly to monthly per campaign | Brief submitted | Intake (name, audience, final copy, send date) → build → QA by someone other than the builder → launch → report at ~7 days | HubSpot, Marketo, Pardot; Asana/Monday for intake | Etumos 4-step COPs framework; SLAs: "5 business days for standard email campaigns, 10 for multi-touch nurture, 15 for integrated campaigns" |
| **Campaign QA** | Per campaign | Build complete | Checklist: sender name/email/preheader, copy, links, images, tokens, CRM sync, UTM, sample send, unsubscribe, rendering (Litmus/Email on Acid) | Marketing automation platform | "A builder should not QA their own work," and QA time must be inside the SLA "so that QAing does not become optional" |
| **Audience and suppression build** | Per campaign; standing lists refresh continuously | New campaign; segment change | Define dynamic vs static list → apply suppressions (customers, open opps, recent closed-lost, active sequences) → sync to ad platforms and sales tools | HubSpot lists, Marketo smart lists, Clay Audiences | "Make suppression checks a non-negotiable part of your campaign QA" |
| **Lifecycle stage management** | Continuous, automated; audited monthly, reviewed quarterly with sales | Contact behaviour | Move contacts across Subscriber → Lead → MQL → SQL → Opportunity → Customer → Evangelist | HubSpot lifecycle stages | Form submissions default to Lead; Opportunity auto-applies on deal creation; Customer on Closed Won. **MQL, SQL and Evangelist are not automated by HubSpot.** Governing rule: *"MQL is a marketing judgment. SQL is a sales judgment. Automating SQL on marketing data alone is how you destroy sales trust in your CRM."* Recycling is a flag ("MQL Expired"), never a stage rollback, because *"a contact reappearing at Lead stage makes it look like new leads when it is actually churn"* |
| **Lead scoring model maintenance** | Scores continuous; 30-minute review with a rep weekly or biweekly; recalibrated quarterly minimum | Conversion drift; sales complaints; new content, pricing or ICP change | Rebalance fit vs behaviour points → reset MQL threshold → apply decay → validate against closed-won | HubSpot (predictive needs ≥200 customers, optimal 500+), Marketo, Pardot, Breadcrumbs | Threshold method, verbatim: *"Pull a list of your last 50-100 closed-won customers… Look at the lead score they carried at the time of their first sales contact. Find the median."* Typical MQL threshold 40–80 points for mid-market B2B. Real point values in use: VP+ title +20, target industry +10, pricing page +20, demo request +50, competitor domain −50, personal email domain −30, 90 days inactive −10. Decay: 30 days inactive reduces, 60 halves, 90+ resets to fit baseline. Hygiene rule: *"If 80% of your database scores above MQL, the threshold isn't doing work"* |
| **MQL → SDR routing** | Continuous, automated; exceptions daily | Form fill, score threshold, intent stage | Lead-to-account match → score gate ("route leads scoring 70+ via round robin; send sub-70 leads to nurture") → weighted or capped round-robin, minus reps on leave → Slack notification → SLA timer → auto-reassign if untouched "within a defined window (typically 2-4 hours for high-intent leads)" → named-account override so enterprise ownership is not broken | LeanData, Chili Piper, HubSpot workflows | LeanData round-robin best practices; lead-to-account fuzzy matching with configurable tiebreakers. **Speed-to-lead, the best-documented dataset found:** Optifai's 2026 pipeline study of **939 B2B SaaS companies using CRM timestamp data (Q2 2025–Q1 2026)** — average response **47 hours**; only **23% respond within 5 minutes** and **42% take over 24 hours**; leads contacted in under 5 minutes close at **32% vs 12%**. Chili Piper's own 4M-form-submission figure (~30% → 66.7% on instant self-scheduling) is vendor-commissioned and directional |
| **Webinars and events** | Monthly to quarterly | Event on calendar | Promote on a fixed curve (T-21/T-14 initial, T-7 mid, T-3, T-1, day-of) → register → remind → run → follow-up sequences split by attended/no-show → publish replay → route hand-raisers | ON24, Goldcast, Zoom, marketing automation | Goldcast 2025 B2B benchmark: **33% attendance** (up from ~29%), 238 registrants and 51 attendees per average webinar, 45–60 min most common, 29-min average watch time, 80% on demand, 26% part of a series. ON24 reports 60% — different dataset and definition, not a performance gap. Registration now arrives late: **roughly one-third of registrations on the day of broadcast**, and day-of reminders are the highest-leverage send. Post-event funnel (aggregator, methodology not published): attended→MQL 38% in 14 days, MQL→SQL 27%, SQL→pipeline 41%, blended attended-to-pipeline **11.2% over 53 days** |
| **Attribution and reporting** | Daily dashboards, weekly campaign summaries, monthly attribution | Reporting rhythm | Pull sourced vs influenced pipeline → channel ROI → recommend reallocation | Dreamdata, HockeyStack, native reporting | Tier-3 marketing-ops SLA guidance: "daily operational dashboards, weekly campaign summaries, and monthly attribution reports" |
| **Data hygiene passes** | Weekly dedupe, monthly enrichment, quarterly audit | Calendar | Dedupe → enrich → normalise → audit | Ringlead/Openprise, Clay, native | Same source |

---

## 5. Customer success

| Workflow | Frequency | Trigger | Steps | Tools | Sources |
|---|---|---|---|---|---|
| **Receive the closed-won handoff** | Per new customer | Deal marked won | Read the handoff record: goals in the customer's words, who signed vs who uses it, every promise beyond the order form, what was demoed, risks and dissenters, deadline and why, commercial terms | CRM + CS platform | Tier-3 checklist; "schedule the kickoff before the intro email is sent so momentum continues" |
| **Run onboarding to first value** | Per new customer; 30–90 days to first value in sales-led B2B | Kickoff booked | Internal handoff → welcome and kickoff (week 1, recap email fixes the agreed definition of first value) → discovery and setup (weeks 2–3) → role-based training (week 4) → first value (week 6) → adoption beyond the champion (weeks 6–10) → transition to CS | Gainsight, Totango, Vitally, ChurnZero, OnRamp, GUIDEcx, Pendo | Seven-stage playbook, each with one binary exit criterion — e.g. first value is *"Done when the customer completes the outcome you agreed at kickoff, in production, without your team driving the clicks."* Rules of thumb: cap customer-facing asks at five per stage; *"Past 90 days without a first value milestone, treat the account as a churn-risk signal."* Time-to-value targets by motion: PLG within 24 hours; mid-market go-live 2–4 weeks; enterprise core go-live 30–60 days, full rollout by 90. Widely repeated (attributed to OnRamp's 2026 onboarding survey, unverified at source): *"roughly 70% of customer churn happens in the first 90 days"* |
| **Watch health scores** | Continuous recalculation; model reviewed quarterly | Score change; red account | Read score → open the risk CTA → run the attached playbook → close, or flag for escalation | Gainsight Scorecards + CTAs, ChurnZero, Planhat, Vitally | Gainsight's own internal model: eight risk scorecards (Readiness, Company, Sentiment, Product, Implementation, Bugs, Support, Habits), **each owned by a named VP**; green = no risk CTA, yellow = a risk CTA exists, red = the CSM has flagged it; a **weekly leadership meeting** walks each executive through their category, and "Closed – No Action" is tracked to retune thresholds. Planhat's worked weighting: product adoption and usage 40%, business outcomes and ROI 25%, feedback and sentiment 20%, support 15% — and *"A health score that is three weeks old is not a health score. It is a history report."* ChurnZero: the old norm was quarterly review "revisited after every major product release"; with AI, "embedded intelligence continuously monitors trends" |
| **Run QBRs / EBRs** | QBR quarterly; EBR annually or semi-annually | Calendar | Assemble health, usage, goal progress → generate deck → agenda circulated in advance → run (≤1 hour) → action items | Gainsight (auto-generated decks), Matik, slides | Seven-section deck: Executive Summary, KPIs, ROI, Progress vs Goals, Benchmarking, Health, Actions |
| **Renewal motion** | Per contract; work starts 90–120 days out | Renewal date approaching | T-120: risk surfaced → T-90: full account and health review, internal alignment → T-60: value-realisation QBR on outcomes and realised ROI, commercial alignment on price and scope → T-30: finalise agreement and confirm expansion | CS platform + CRM + CPQ | Four independent playbooks (Velaris, Sybill, June, Planhat) converge on this ladder; Renewtrak starts notifications at T-180. Split ownership: CS owns *"Health scores, product adoption, and ROI tracking"* plus QBRs; Sales/AM owns *"The commercial contract, legal terms, and procurement"* plus pricing and discount approvals. Targets quoted: GRR **85–90%+**, world-class NRR **110–120%**. **78% of companies now run a dedicated renewals team** (attributed to TSIA via secondary) |
| **Expansion plays** | Continuous; alert-driven | Seat utilisation ≥80–85%, API quota near limit, DAU spike, new exec stakeholder, champion promoted, adjacent intent | Signal fires → auto-queue a CSM task → generate a one-page handoff brief (what signal, relationship quality, business priorities, expansion specifics, timing) → route by ARR band → AE or CSM runs the conversation | Gainsight expansion CTAs, Pocus, Endgame, Correlated, Slack alerts | Routing thresholds published by ARR: seat expansion under $15K → CS; plan upgrade under $25K → CS with AE cc'd; new department $15–50K → CS surfaces, AE leads commercial; new product $25K+ → AE leads; enterprise rollout $50K+ → immediate AE + Solutions handoff. SLAs: champion move → outreach within **5 business days**; organic new-user adoption → **48 hours**. *"Fewer than 30% of CS teams have a formal, documented CS-to-sales handoff process with defined signal triggers"* (vendor-commissioned) |
| **Churn risk and save plays** | As triggered; standing check-ins post-onboarding, at 90 days, mid-contract, and T-60 | Risk CTA; usage drop; sponsor change; sentiment shift | Diagnose by signal tier → run the save play → escalate | CS platform, exec sponsors | Four-tier early-warning model with lead times: **sentiment 60–90 days** (shorter replies, transactional tone, no forward-looking language), **relationship 45–75 days** (champion departure, no-shows), **behavioural 30–60 days** (login drop, feature narrowing), **account under 30 days** (downgrade, auto-renew opt-out, late payment). Gainsight's tech-touch triggers are concrete: health below threshold two consecutive weeks → 48-hour diagnostic call; no login 14+ days post-activation → re-engagement; 3+ tickets in 7 days → troubleshooting session; AI-flagged negative sentiment → 24-hour outreach. The structural failure: *"most teams only detect risk once a usage-based health score has turned red, by which point the renewal is half lost"* |
| **Renewal forecasting** | Monthly/quarterly | Forecast cycle | Assign renewal probability across the book → roll up | CS platform, CRM | CSM job postings: "own renewal forecasting for assigned book of business" |

**Coverage ratios, which decide everything about the CS screen.** The clearest public segmentation: high-touch CSMs carry **20–25 accounts**, mid-touch **40–50**, low/tech-touch **well over 100, often 140+** (attributed to Gainsight's pool). Gainsight's own tech-touch ladder goes further — high touch 1:5–1:20, mid 1:30–1:60, low 1:75–1:150, **tech touch 1:500+** — with accounts under **$10–15K ARR** defaulting to tech touch, and an expected steady state of *"around 60 to 70% of accounts in tech touch once segmentation stabilizes."* A separate dataset from the KBCM/Sapphire private SaaS survey gives accounts per CSM as **SMB 110, mid-market 35, enterprise 10.5**, with ARR per CSM of $1.2M / $1.6M / $2.5M. The uncomfortable corollary, stated plainly in that analysis: at 110 accounts, "a CSM working a standard year has roughly two working days per account per year." And the measurement gap is worth naming: the same survey tracks an *output* metric for AEs but for CS *"measures capacity only: books, account loads, headcount… No retained-ARR-per-CSM, no expansion-per-CSM, no output series of any kind exists."*

**What the pooled model looks like in a real job description.** MongoDB's Scaled CSM posting (September 2026) is the clearest public artefact: the CSM is *"the trusted advisor helping a high volume of customers navigate their journey… using proactive, scalable engagement strategies initiated by health signals and journey milestones,"* responsible for *"a diverse portfolio of **thousands** of expanding MongoDB customers,"* driving value *"through a mix of 1:1 and 1:many engagements (e.g., targeted campaigns, webinars, office hours)"* and expected to *"forecast revenue retention and realization to senior leadership."* Braze's Global SMB CSM answers client questions *"via a queue"*, has *"experience managing a large number of accounts with a 'Tech-Touch' rather than a 'High-Touch' level of engagement"* — and still *"own[s] customer renewal targets"* and leads EBRs. Tech-touch is not no-touch; it is the same workflow list run through automation with a human exception path.

ChurnZero's 2025 Customer Revenue Leadership Study (**793 senior customer growth leaders**) reports that **74% of SaaS leaders say most company revenue now comes from existing customers**, that NRR and GRR stabilised in 2025 after a 2022–24 decline, and that "AI maturity is nascent. Most teams are in exploration or tactical stages."

---

## 6. RevOps admin

The admin is the only role in PRODUCT.md whose frequency is "weekly or less" — and that is right for three of the four customers and wrong for the fourth.

| Workflow | Frequency | Trigger | Steps | Tools | Sources |
|---|---|---|---|---|---|
| **Provision a new rep** | Per hire | Offer accepted | Create user → assign seat and licence → assign permission profile → add to team and territory → set credit limit → connect mailbox → assign to sequences/dashboards | GTM platform settings, SSO/SCIM, CRM | Apollo's settings map (memo 07 §2) puts Users and teams at "weekly in growing teams; on every hire/exit" |
| **Offboard and reassign** | Per departure | Exit | Deactivate → reassign records, deals and sequences → revoke mailbox → recover seat | Same | Same |
| **Review CRM sync errors** | Weekly | Error log grows | Open error log → fix field mapping or validation conflicts → re-sync → adjust push/pull conditions | Native CRM sync settings | Memo 07 §2: "Intensive at setup (6-hour window), then on field changes; error logs weekly" |
| **Field, stage and pipeline changes** | Monthly to quarterly | Process change | Add/modify custom field → set stage exit criteria and required properties → update forecast category mapping → communicate | CRM, HubSpot conditional stage properties | HubSpot default pipeline: Appointment scheduled (20%), Qualified to buy (40%), Presentation scheduled (60%), Decision maker bought-in (80%), Contract sent (90%), Closed won (100%), Closed lost (0%); properties can be marked Required per stage |
| **Data hygiene programme** | Weekly dedupe, monthly enrichment, quarterly audit | Calendar | Dedupe → normalise → enforce required fields → refresh enrichment → audit | Ringlead/Openprise, Clay, native | Tier 3 |
| **Compliance screening** | Continuous rules; ~30-day removal-request review | Regulation; opt-out | GDPR region restrictions → DNC screening (US, Germany, France, Canada, Australia, UK incl. TPS and Corporate TPS) → removal requests over a rolling 30-day window | Apollo prospecting rules | Apollo KB via secondary |
| **Credits and licence cost** | Weekly credit check; monthly invoice; annual renewal | Burn spike; true-up | Review credit burn by user and by enrichment → adjust provider waterfall order → cap per-user limits → negotiate | Platform billing, Vendr/Zylo | Memo 07 §2: credit usage checked "weekly or whenever credits burned unexpectedly; reviewers say daily anxiety" |
| **Standing and ad-hoc reporting** | Weekly rhythm; month-end and quarter-end close | Calendar | Monday pipeline pull → weekly summaries → month/quarter close | Looker, Tableau, Sigma, native | Tier 3 |
| **Territory, quota, comp** | Quarterly to annual | Planning cycle | Carve territories → set quota → design plans → handle disputes | Fullcast, Spiff, CaptivateIQ, QuotaPath | Salesforce: planning is 16% of the average week across the org |
| **Roll out a change** | Per change | New field, stage, tool | Build → pilot → enable → train → track adoption | All | (unverified — no published data on GTM change-management cadence) |

Staffing, for sizing: practitioner benchmarks put **1 RevOps person per 20–30 quota-carrying reps** (or per 25–30 revenue-team members), scaling as one generalist at $5–15M ARR, two to three at $15–50M, five to eight at $50M+ (tier 3). A 300-person Meridian-shaped company would therefore have a small team, not one person — PRODUCT.md's "one RevOps admin" is a simplification worth knowing about.

---

## 7. Developers and technical users

This role is absent from PRODUCT.md's five but is now unmistakably present in real GTM orgs, usually wearing a RevOps or "GTM engineer" title.

| Workflow | Frequency | Trigger | Steps | Tools | Sources |
|---|---|---|---|---|---|
| **Call platform APIs** | Continuous (scheduled jobs) | Nightly sync; enrichment batch | Authenticate → paginate → handle 429 with `Retry-After` and exponential backoff → write results | Clay Public API (`https://api.clay.com/public/v0/`, `clay-api-key` header), Apollo API, HubSpot, Outreach | Clay docs; Outreach has "a fixed limit of 10,000 requests per hour per user" |
| **Receive and emit webhooks** | Event-driven | Form submit, reply, meeting booked, stage change, routine completes | Register endpoint → verify HMAC-SHA256 signature (`X-Clay-Signature`) → fetch results → act | Clay webhooks (`clay webhooks create <url>`), platform webhooks | Clay: "Webhook delivery is not guaranteed. Use webhooks to react faster, but keep polling the run's results as a fallback." Clay webhook sources cap at **50,000 submissions per endpoint** |
| **Build an HTTP API column** | Per new integration | No native connector exists | Add enrichment → choose GET/POST/PUT/DELETE → set auth headers or JWT → body JSON → rate limit → field paths → test 10 rows | Clay HTTP API column (Growth plan and above) | Clay docs; pagination as a source up to 50,000 rows |
| **Connect an MCP server** | Once, then daily use | Rep or ops wants GTM data inside an AI client | Add remote MCP endpoint → OAuth → grant scopes → call from Claude/ChatGPT/Copilot | Apollo (`https://mcp.apollo.io/mcp`, Streamable HTTP, OAuth or API key, 40+ actions), HubSpot (`mcp.hubspot.com`, read/write on core CRM objects and engagements, read-only on marketing content), Gong (`ask_account`, `ask_deal`, `generate_brief` — read-only), Clay MCP, Attio (`mcp.attio.com/mcp`), Close, Salesloft/Clari, ZoomInfo, Zapier MCP (9,000+ apps, 30,000+ actions) | See bibliography. Dates: Salesforce DX MCP 30 May 2025; Gong MCP announced 21 October 2025; Attio MCP 19 February 2026; HubSpot developer MCP GA 19 February 2026; Clay MCP and Salesloft/Clari MCP in 2026 |
| **Reverse-ETL from the warehouse** | Scheduled (interval, cron, or triggered by dbt/Fivetran/Airflow) | Model refresh | Define model → map fields → choose Insert/Update/Upsert/Archive → schedule → CDC sends only changed rows | Hightouch, Fivetran Activations (formerly Census), Snowflake/BigQuery | Hightouch: "Between runs, Hightouch uses change data capture to compare the current model results against the previous run and send only the rows that were added, changed, or removed." Sync volume is bounded by "your Salesforce API request limits," not the tool. Outreach destination supports Accounts, Prospects and Sequence States |
| **No-code automation** | Weekly | A gap between two tools | Trigger → filter → action | Zapier, Make, n8n, Workato | n8n's library reached **11,741 community workflows by August 2026**, with 1,844 in the sales-automation category. The canonical GTM zap remains form → CRM record → Slack alert |
| **CLI work** | Occasional | Scripted ops | `clay login` / `clay mcp`; `hs project upload`; `sf` commands | Clay CLI, HubSpot CLI, Salesforce CLI | Vendor docs |

---

## 8. How the four example customers differ

The evidence supports PRODUCT.md's claim that the same screen has a different "most used" set per customer. Concretely:

**Fathom Labs — 12 people, seed, founder-led.** Two founders and one SDR; no marketer, no CS, so those workflows are absent or compressed into the founders' week. Sequences and lists are daily for the same people who administer the workspace, so **settings sit inside the daily path rather than behind a door**. The stack is two or three products, not eight (Apollo or Clay plus a sequencer, under $500/month — tier 3). Dominant workflows: list building, sequence editing, reply triage, deliverability — one bad week on one domain is the whole company's pipeline. Deal management is thin: nineteen open deals fits on one screen and needs no board mechanics. Agents matter most in the *research* slot, because nobody has time to research — which matches where agent use concentrates (34% of teams with agents use them for prospecting).

**Meridian Software — 300 people, full funnel, strict permissions.** The archetype the benchmark data describes. Marketing feeds SDRs (MQL routing under an SLA), SDRs feed AEs (1:2.4, 82% territory-aligned), AEs hand to CS. Every role has a different first screen because every role has a different daily loop: the SDR's 112 activities, the AE's forecast and deal warnings, the marketer's campaign QA and lead-score maintenance, the CSM's health scores and renewal clock, the admin's sync errors and provisioning. Admin items must be invisible to the rest, and the evidence is blunt about why: with 42% of reps already overwhelmed by tool count, showing an SDR a field-mapping control is actively harmful. Forecast, pipeline review and coaching are three separate weekly meetings. One RevOps person is probably understaffed here by the 1:20–30 benchmark.

**Halyard Agency — 25 people, ten client workspaces.** The distinctive fact is repetition: the same task, ten times, every week. Workspace-level settings that are annual for Meridian are weekly or daily here — mailbox pools, sending domains, warm-up state, per-client suppression lists, per-client reporting. Agency-specific operational detail from the cold-email tooling layer (tier 3, vendor blogs, treat as directional): roughly **six domains and twelve inboxes per client sending ~300/day**, one inbox per 30–50 emails/day, quarterly rotation of 15–20% of each client's inbox pool, and about **fifteen minutes per client per week** on the deliverability check. Multi-client platforms are built around this: Smartlead's master inbox filters by client and the workspace boundary is the isolation unit; one agency reports "about 15 companies" in a single Smartlead account. Clay, notably, does **not** let one account own multiple workspaces — agencies get invited into client-owned workspaces, and credits are per workspace, which makes the credit and billing settings a per-client routine rather than a one-off. Halyard's "rare admin setting" is Halyard's job.

**Ridgeline — 80 people, product-led.** Almost no outbound: two sequences against Meridian's twenty-six. The primary loop is signal-driven and inbound: product usage crosses a threshold → PQA/PQL score → route to a human or to a lifecycle campaign. The PLG tooling layer (Pocus, Endgame, Correlated) exists precisely to sit between the product database and the CRM. Thresholds are explicit: score a product-qualified account 1–100 on usage volume, feature breadth, usage velocity and behavioural signals, and set the sales-engagement threshold at ~80+; hand-raisers get contacted "in 15 min or less." Expansion, not acquisition, is the revenue engine — seat utilisation at 80–85% is the canonical trigger. Sequences and lists, primary elsewhere, are secondary; account health, signals and renewals are primary. Relevant context: Salesforce's 7th edition finds **usage pricing is the #1 revenue model contributing to growth**, and that its three hardest problems are forecasting revenue (40%), predicting future usage (39%) and tracking usage (37%) — precisely Ridgeline's shape.

---

## 9. What AI actually does unsupervised today — and what it does not

**Run unsupervised, routinely, in 2026:**

- **Research and enrichment.** Claygent-style agents visit pages, read profiles and return structured answers across a whole table without per-row review. Outreach's Research Agent runs "scheduled research" that "automatically refresh[es] at recurring intervals (daily, weekly, monthly)."
- **Call transcription, summarisation and briefing.** Universal and ungated.
- **CRM field extraction.** Gong's AI Data Extractor "recalculates answers for active accounts and deals whenever a new relevant conversation takes place. When new or better information is found, **the previous value is overwritten**." Capped at 20 published extractors per workspace; deal-target extractors *must* map to an existing CRM field (Gong will not create fields). There is no documented review step before the overwrite — this is the most consequential unsupervised write in the stack.
- **Task prioritisation.** Salesloft Rhythm's Conductor AI reorders the rep's day continuously.
- **Scoring and routing.** Predictive lead scores and routing decisions execute without a human in the path; LeanData added an AI inference node that reads unstructured free text and routes on it.
- **Deal-field auto-accept.** Outreach's August 2026 release added "accept, edit, and **auto-accept**" for the Next Steps field ("Admins can configure automatic acceptance of AI-suggested updates"); its February 2026 release states Deal Agent "AI-recommended updates can now be made automatically without rep intervention." The direction of travel over 2026 was a draft-then-approve queue being relaxed into auto-apply.

**Autonomy is now a dial, not a switch.** Gong's Agent Studio (16 April 2025) lets "business users define inputs, outputs, and **autonomy levels**" and "preview results before deployment"; by March 2026, "**Administrators can control placement and the level of autonomy**, ensuring Gong Agents work alongside humans as needed." The AI Call Reviewer is the clearest graded example: you can "either have the agent suggest answers to call review questions or **automatically answer them for you**."

**Still gated, almost everywhere: sending email as a person.** This is where vendors ship explicit approval UI.

- **HubSpot Breeze prospecting agent** ships the human gate as a named product state — **"semi-autonomous mode"**: "Review before sending: you'll review and approve each message before it goes out" versus "Send automatically: the agent sends emails without review." A "Ready for review" tab holds "enrolled contacts to whom emails have been written but not sent"; the reviewer edits, saves, then clicks "Start outreach". Notifications can be batched as a daily email. Hard caps: **1,000 emails/day** and 1,000 contacts researched per account per day, sending from a connected rep mailbox.
- **Salesforce Agentforce (SDR agent, renamed Agentforce Lead Nurturing)**: "The Require Manual Approval feature omits the AI disclosure from generated emails. The disclosure is omitted because there's a sales rep reviewing each email." With approval off, "Send as Seller includes an AI disclosure at the beginning of each generated email to ensure regulatory compliance." And the queue expires: "the record owner has 14 calendar days to approve each email. After 14 days without approval, the agent cancels the email."
- **Clay Account Agents**: CRM and warehouse writes are described as "human-approved."

That contrast is the single most useful design signal in this memo: **reads and internal writes run free; outbound communication in a human's name gets a queue, a disclosure, and an expiry.**

**And the supervision tooling is unevenly distributed.** The incumbent platforms — HubSpot, Salesforce, Outreach, Gong — document approval states, autonomy dials, send caps, config diffs and audit trails. The AI-native outbound vendors (11x, Artisan, Unify, Warmly, Qualified, Common Room, Regie, AiSDR), on their own public pages, document **no approval queue, no autonomy setting, no audit trail and no test mode**. Warmly's "AI-Native • Human-Supervised" tagline with no supporting detail is the sharpest illustration: supervision as an adjective rather than a described control. The counter-example is Nooks, which markets the opposite — "AI handles the research, prioritization, and admin. A rep runs the conversation."

**Common practice** (tier 3): manual approval on for the first one to two weeks, then autonomous once quality is verified. Salesforce ships a Testing Center for checking guardrails before go-live and an Audit Trail "to track AI agent actions and outputs." Outreach shipped an "AI Control Hub" in August 2026 to "enable or disable individual AI features… from a single, admin-controlled hub" — but its release notes contain **no mention of approval queues, review-before-send workflows, or audit logs for agent actions**.

**What the measured evidence says about capability.** This matters because the vendor claims are uniformly confident and the benchmarks are not. Salesforce Research's own **CRMArena-Pro** (arXiv 2505.18878, 24 May 2025; 19 expert-validated tasks across sales, service and CPQ, B2B and B2C): "leading LLM agents achieve only around **58% single-turn success**… dropping significantly to approximately **35% in multi-turn settings**." Workflow Execution — the mechanical, deterministic slice — clears 83% single-turn; everything else is worse. Per-model single-turn B2B scores include gemini-2.5-pro 54.1%, o1 47.5%, gpt-4o 26.7%. And: "agents exhibit **near-zero inherent confidentiality awareness**; though targeted prompting can improve this, it often compromises task performance." τ-bench makes the reliability point harder still, because repeatability collapses faster than headline accuracy: the GPT-4o agent "drops to ~25% on pass^8 in 𝜏-retail, which is a staggering 60% drop compared to its corresponding pass^1 score," and "all the models exhibit considerable performance degradation as k increases, demonstrating their unreliability." That single result is the technical justification for every approval queue above.

**Documented failure.** TechCrunch, 24 March 2025, on 11x (Alice, the best-funded AI SDR): ZoomInfo said "We did not give them permission to use our logo in any manner, and we are not a customer," and that in a one-month pilot "11x's product performed significantly worse than our SDR employees." A former employee on retention: "We were losing 70-80% of customers that came through the door." A former engineer: "The products barely work." The CEO stepped down on 5 May 2025. Artisan's founder was franker about the mechanism, telling TechCrunch (9 April 2025) "We had extremely bad hallucinations when we first launched," claiming a move to rigid prompts brought it to "maybe one in 10,000 emails, if that" — a vendor-asserted rate inside third-party reporting — and conceding "not every company should be using AI SDR." Meanwhile the channel itself is degrading: Arjun Pillai, ex-ZoomInfo, told TechCrunch that "over the last two years, the reply rate on cold emails fell at least 50%." The lesson for a product surfacing agent output is not that agents are useless — it is that the gap between "the agent ran" and "the agent was right" is where the trust problem lives, and an activity log showing only the former is a liability.

**The economics are consumption-shaped, which is a settings problem.** Salesforce Flex Credits (announced 15 May 2025): 20 credits per action, **$0.10 per action**, $500 per 100,000 credits. Clay separates **Actions** ("a few tenths of a penny" — every enrichment, AI call, export, HTTP API call) from **Data Credits** ("a few pennies" — buying data or AI from the marketplace), with 6–20 data credits for a fully enriched record; Actions reset each cycle and don't roll over, credits roll up to 2x monthly. Apollo charges 1 credit for an email reveal and **8 for a phone number**. Two artefacts capture the unpredictability better than any complaint thread. Clay's own pricing page says 80% of its models cost a flat credit count, but token-intensive ones display only "an estimated number of Data Credits per row, **indicated by a tilde symbol (~)**" — a tilde in a pricing UI. And HubSpot's credits KB (updated 29 July 2026) states credits "reset monthly" and expire without rollover, while publishing **no per-action cost at all**, redirecting to a catalogue. This is why PRODUCT.md marks per-run and monthly credit caps as decision-critical; Salesforce's own framing is that "90% of CIOs report that managing AI costs is limiting their ability to drive value."

---

## 10. The 25 most common workflows across the whole organisation, ranked

Ranked by **total executions per week across a Meridian-shaped org**, then by how many roles touch them. Activity-count ranks (1–6) rest on the Bridge Group medians; the rest are ordered by documented cadence and are a considered judgement, not a measurement.

| # | Workflow | Who | Roughly how often |
|---|---|---|---|
| 1 | Work the task/action queue | SDR, AE | Continuously; 112 activities/day median per SDR |
| 2 | Send or complete a sequence email step | SDR, AE, marketer | ~41 emails/day/SDR |
| 3 | Dial a prospect and disposition the call | SDR, AE | 44/day median; 56 phone-first; 100–210 on parallel dialers |
| 4 | Log an activity / update a record after contact | Everyone | Every touch; the largest single slice of non-selling time |
| 5 | LinkedIn touch (view, connect, message) | SDR, AE | ~19/day; capped at ~100 invites/week |
| 6 | Triage an inbound reply | SDR, AE | Every reply; several sweeps/day |
| 7 | Search/filter a contact or account table | SDR, AE, CS, marketer | Many times daily |
| 8 | Enrich a record (email, phone, firmographic) | SDR, RevOps, marketer | Per list build; continuously on always-on tables |
| 9 | Review an agent's output (research brief, draft, suggested field) | SDR, AE | Daily where agents are on — 54% of teams |
| 10 | Add/remove a contact from a list or sequence | SDR, marketer | Daily |
| 11 | Book, confirm or reschedule a meeting | SDR, AE, CS | Daily; ~10 held meetings/month/SDR |
| 12 | Advance a deal stage and update next step | AE | Daily to weekly per deal |
| 13 | Prep for a call (brief, account context) | AE, CS, SDR | Before every meeting |
| 14 | Check mailbox/domain deliverability | SDR, RevOps, agency ops | Weekly; daily at volume; per client for agencies |
| 15 | Build or edit a list / saved search | SDR, marketer | Weekly |
| 16 | Build or edit a sequence/cadence | SDR, RevOps | Weekly |
| 17 | Watch an account health score / signal feed | CS, AE, SDR | Daily glance |
| 18 | Submit or adjust a forecast | AE, manager | Weekly |
| 19 | Run a pipeline or deal review | Manager, AE | Weekly |
| 20 | Route an inbound lead and honour the SLA | Marketer, RevOps, SDR | Continuous automation; exceptions daily |
| 21 | Review CRM sync errors / data hygiene | RevOps | Weekly |
| 22 | Build, QA and launch a campaign | Marketer | Weekly to monthly |
| 23 | Hand off (SDR→AE, AE→CS) | All three | Per meeting; per closed-won |
| 24 | Run a QBR or business review | CS | Quarterly per account |
| 25 | Provision or deprovision a user, set permissions and credit limits | RevOps admin | Per hire/exit; weekly in growing teams |

Below the cut, deliberately: territory carve-up, quota setting, comp plan design, SSO configuration, attribution model change, CPQ approval-chain redesign. These are quarterly-to-annual, high-stakes, and belong behind a door for everyone except — again — the agency, whose workspace-level equivalents are weekly.

---

## 11. What could not be sourced

- **Feature-level telemetry.** No vendor publishes which screens their users open, how often, or in what order. Every usage percentage in this product must be fitted from activity benchmarks, not read from a source. This is the same gap memo 13 found for density toggles.
- **Gong Labs' primary pages** could not be fetched directly in this session; the 300M-call connect-rate figures and the talk-ratio numbers come through secondary sources that cite Gong. Treat as tier 3 until confirmed.
- **The Bridge Group's SaaS AE report** (384 B2B technology companies) is gated; AE-side quota, ACV, win-rate and cycle-length medians are therefore missing. Outreach's *Sales 2025 Data Report* offers win-rate figures (47% for opportunities closed within 50 days; 21% average market win rate in 2025) but **discloses no sample size or methodology**.
- **Gainsight's Customer Success Index 2025** (400+ CS professionals) and its benchmarking tool are both gated; the coverage ratios quoted here come from secondary summaries and from the KBCM/Sapphire survey.
- **Apollo's credit and DNC pages** were read through secondary sources this session, not fetched first-party. Memo 07 has the first-party Apollo settings evidence.
- **Renewal commercial mechanics** — auto-renew versus negotiated, notice periods, price-uplift percentages, multi-year discounting — are absent from all four renewal playbooks consulted (Velaris, Sybill, June, Renewtrak). This is a real evidence gap, not an oversight. **(unverified)**
- **Sourced versus influenced pipeline** has no primary source with published numbers; the attribution vendors' own comparison pages sidestep the definition. Treat it as a convention, not a benchmark. **(unverified)**
- **Goldcast's 2025 attendance rate** appears as both 33% and 40% across sources. The 33% figure with the fuller benchmark set is used here.
- **Reddit and LinkedIn** were not directly fetchable. The r/sales and r/salesops quotes reproduced in aggregators ("~6% connect rates," "80 dials/day with only 1–2 of roughly 20 reps hitting quota") are **second-hand and unverified**.
- **Reply-rate decline** now has one named practitioner source (Pillai, "at least 50%" over two years) but no dataset behind it. Treat as testimony, not measurement.
- **Salesforce's "nine in 10 sales teams use agents"** appears on a landing page with no disclosed methodology; the figure used in this memo comes from the 7th-edition PDF, which does disclose it (4,050 respondents, 22 countries).
- **Gifting and direct mail** (Sendoso, Reachdesk) as sequence steps: named in cadence templates, no usage or frequency data found. **(unverified)**
- **Video steps** (Vidyard, Loom) appear at day 7 in Outreach's sample cadence; no adoption data found. **(unverified)**
- **Change-management cadence in RevOps**, the real volume of ad-hoc report requests, and the adoption rate of mutual action plans: no published figures. **(unverified)**
- Several planned searches (warehouse-native scoring details, nurture-programme cadences, sales-engagement feature adoption) hit this session's web-search budget and were not run.

---

## 12. Bibliography

**Tier 1 — surveys and datasets with published samples**

- The Bridge Group, *SDR Models, Motions & Metrics: 2025 Research Report* (351 B2B companies) — https://www.bridgegroupinc.com/research/2025-sdr-models-metrics-report-the-bridge-group
- Salesforce, *State of Sales, 7th Edition* (4,050 sales professionals, 22 countries, Aug–Sep 2025) — https://www.salesforce.com/en-us/wp-content/uploads/sites/4/documents/reports/sales/salesforce-state-of-sales-report-2026.pdf
- Salesforce, *State of Sales, 6th Edition* press summary (7,775 responses, 2022) — https://www.salesforce.com/news/stories/sales-research-2023/
- ChurnZero, *2025 Customer Revenue Leadership Study* (793 leaders) — https://churnzero.com/guides/customer-revenue-study-2025/ and https://churnzero.com/press-release/new-research-customer-revenue-leadership-study-2025-2026/
- Huang et al., *CRMArena-Pro: Holistic Assessment of LLM Agents Across Diverse Business Scenarios and Interactions*, arXiv:2505.18878 (24 May 2025) — https://arxiv.org/abs/2505.18878
- Yao et al., *τ-bench*, arXiv:2406.12045 (pass^k results: https://sierra.ai/blog/benchmarking-ai-agents); *τ²-bench*, arXiv:2506.07982 — https://github.com/sierra-research/tau2-bench
- HubSpot, *State of Sales in 2026* (1,000+ sales leaders; "94% of sales leaders say their teams use AI") — https://offers.hubspot.com/sales-trends-report
- Drouin et al., *WorkArena* (33 ServiceNow tasks) — https://arxiv.org/abs/2403.07718
- Goldcast, *2025 B2B Webinar Benchmark Report* — https://www.goldcast.io/reports/b2b-webinar-benchmark-report-2025
- ON24, *Webinar Benchmarks 2025* — https://www.on24.com/blog/key-takeaways-from-the-webinar-benchmarks-report/
- Chili Piper, 2025 Demo Form Conversion Rate Benchmark (4M form submissions; vendor-commissioned) — https://www.chilipiper.com/article/speed-to-lead-statistics
- KBCM/Sapphire private SaaS survey, CS coverage extract — https://research.successcoaching.co/docs/focus-cs-coverage
- Optifai, lead response time benchmark (939 B2B SaaS companies, CRM timestamp data, Q2 2025–Q1 2026) — https://optif.ai/learn/questions/lead-response-time-benchmark/

**Tier 2 — first-party vendor documentation**

- Gong, AI Data Extractor — https://help.gong.io/docs/ai-data-extractor
- Gong, deal warning settings — https://help.gong.io/docs/customize-your-deal-warning-settings
- Gong, deal boards — https://help.gong.io/docs/review-your-pipeline-on-a-deal-board ; understanding playbooks — https://help.gong.io/docs/understanding-playbooks
- Gong, how to forecast / forecast boards — https://help.gong.io/docs/how-to-forecast-1 ; https://help.gong.io/docs/understanding-configurable-forecast-boards
- Gong, MCP support announcement (21 Oct 2025) — https://www.gong.io/press/gong-introduces-model-context-protocol-mcp-support-to-unify-enterprise-ai-agents-from-hubspot-microsoft-salesforce-and-others
- Outreach, Customize Sales Methodology — https://support.outreach.io/hc/en-us/articles/39332047292315-Customize-Sales-Methodology-in-Outreach
- Outreach, Deal Overview — https://support.outreach.io/hc/en-us/articles/19694632787867-Outreach-Deal-Overview ; Smart Deal Assist — https://support.outreach.io/hc/en-us/articles/25480928547611-Smart-Deal-Assist-Overview
- Outreach, February 2026 release — https://www.outreach.ai/resources/blog/february-2026-product-release ; April 2026 (Omni, Agent Studio) — https://www.businesswire.com/news/home/20260427304135/en/Outreach-Launches-Omni-Reimagining-How-Revenue-Teams-Execute-with-AI-Agents ; August 2026 release notes — https://support.outreach.io/support/solutions/articles/159000434715-outreach-product-release-notes-august-2026
- Outreach, sequence best practices — https://www.outreach.ai/resources/blog/timeless-tips-for-sales-sequences ; Sales 2025 Data Report — https://www.outreach.ai/resources/blog/sales-2025-data-analysis
- Salesloft, Rhythm and Conductor AI — https://www.salesloft.com/platform/rhythm ; 15 new AI agents (13 May 2025) — https://www.salesloft.com/company/newsroom/spring-2025-ai-agents-launch
- Salesloft, MCP server — https://www.salesloft.com/company/newsroom/salesloft-mcp-server-revenue-data-ai-ecosystem ; Clari + Salesloft MCP (14 Apr 2026) — https://www.salesloft.com/company/newsroom/clari-salesloft-forecasting-execution-mcp-server
- Clari, forecast categories — https://www.clari.com/blog/defining-sales-forecast-categories-to-drive-reliable-revenue/
- Salesforce Help, Collaborative Forecasts elements — https://help.salesforce.com/s/articleView?id=sf.forecasts3_definitions.htm
- Salesforce Help, Agentforce Lead Nurturing considerations (manual approval, AI disclosure, 14-day expiry, send limits) — https://help.salesforce.com/s/articleView?id=sales.sales_agent_sdr_considerations.htm
- Salesforce, Flex Credits pricing (15 May 2025) — https://www.salesforce.com/news/press-releases/2025/05/15/agentforce-flexible-pricing-news/
- Salesforce, Agentforce dev tools (Testing Center, Interaction Explorer, Audit Trail) — https://www.salesforce.com/agentforce/dev-tools/
- Gong, agents launch with configurable "autonomy levels" (16 Apr 2025) — https://www.gong.io/press/gong-redefines-ai-agents-to-deliver-real-revenue-impact ; admin control of autonomy (9 Mar 2026) — https://www.gong.io/blog/announcing-gong-agents-for-revenue-teams
- HubSpot, understand HubSpot Credits and billing (29 Jul 2026) — https://knowledge.hubspot.com/account-management/understand-hubspot-credits-and-billing
- Clay, pricing and credit model — https://www.clay.com/pricing ; agents (CRM writes "Automatic (human-approved)") — https://www.clay.com/agents
- Yahoo bulk sender best practices (Feb 2024) — https://senders.yahooinc.com/best-practices/
- Salesforce Developers, hosted MCP servers GA — https://developer.salesforce.com/blogs/2026/04/salesforce-hosted-mcp-servers-are-now-generally-available ; DX MCP — https://developer.salesforce.com/blogs/2025/06/level-up-your-developer-tools-with-salesforce-dx-mcp
- HubSpot, set up and use the prospecting agent (email approval, 1,000/day) — https://knowledge.hubspot.com/prospecting/use-the-prospecting-agent
- HubSpot, sequences enrolment and send limits — https://knowledge.hubspot.com/sequences/enroll-contacts-in-a-sequence ; https://knowledge.hubspot.com/connected-email/sales-email-send-limits
- HubSpot, MCP server — https://developers.hubspot.com/ai-tools/mcp ; developer MCP GA — https://developers.hubspot.com/changelog/hubspot-developer-mcp-server-for-app-and-cms-development-now-in-ga
- Clay Docs: Actions & Data Credits — https://university.clay.com/docs/actions-data-credits ; plans and billing — https://university.clay.com/docs/plans-and-billing ; HTTP API — https://university.clay.com/docs/http-api-integration-overview ; webhooks — https://university.clay.com/docs/webhook-integration-guide ; waterfall enrichment — https://www.clay.com/guides/waterfall-enrichment ; Claygent — https://www.clay.com/claygent ; conditional runs — https://www.clay.com/university/guide/conditional-runs
- Clay developer docs: authentication — https://developers.clay.com/public-api/authentication.md ; rate limits — https://developers.clay.com/public-api/rate-limits.md ; webhooks — https://developers.clay.com/public-api/webhooks.md
- Clay template, "Find and outreach to companies hiring your ICP" — https://www.clay.com/templates/find-and-outreach-to-companies-hiring-your-icp
- Clay MCP — https://www.clay.com/mcp and https://www.clay.com/blog/clay-mcp
- Apollo MCP — https://docs.apollo.io/docs/apollo-mcp ; Apollo agentic GTM launch (9 Oct 2025) — https://www.apollo.io/magazine/redefining-how-companies-drive-revenue-in-the-ai-era ; Apollo credits — https://knowledge.apollo.io/hc/en-us/articles/9527776320781-What-Are-Credits ; DNC screening — https://knowledge.apollo.io/hc/en-us/articles/19207906524557-Enable-Do-Not-Call-DNC-Phone-Screening ; removal requests — https://knowledge.apollo.io/hc/en-us/articles/19331318468621-Understand-Removal-Requests-and-Stay-Compliant-on-Apollo
- Attio MCP changelog (19 Feb 2026) — https://attio.com/changelog/2026/mcp-server ; docs — https://docs.attio.com/mcp/overview
- Close MCP server — https://help.close.com/docs/mcp-server
- Zapier MCP — https://docs.zapier.com/mcp/home
- Hightouch, Salesforce and Outreach destinations, sync schedules — https://hightouch.com/docs/destinations/salesforce ; composable CDP — https://hightouch.com/blog/composable-cdp
- Fivetran Activations (formerly Census) — https://fivetran.com/docs/activations
- Instantly, account and campaign limits — https://help.instantly.ai/en/articles/6248612-account-and-campaign-limits ; inbox rotation — https://instantly.ai/blog/inbox-rotation/
- Google bulk sender guidelines (5,000+/day from 1 Feb 2024) — https://support.google.com/a/answer/81126
- Microsoft, Outlook high-volume sender requirements (from 5 May 2025) — https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%e2%80%99s-new-requirements-for-high%e2%80%90volume-senders/4399730
- Common Room, job change signal — https://www.commonroom.io/docs/signals/common-room-native-signals/job-changes/
- LinkedIn Sales Navigator alerts — https://www.linkedin.com/help/sales-navigator/answer/a105133
- Chili Piper, how to handle no-shows — https://www.chilipiper.com/article/how-to-handle-no-shows
- LeanData, 10 lead routing plays — https://www.leandata.com/blog/10-lead-routing-plays-leandata/ ; lead-to-account match — https://leandatahelp.zendesk.com/hc/en-us/articles/360040118814-Routing-Lead-to-Account-Match-Node-Guide
- Gainsight, Scorecards and Calls to Action — https://www.gainsight.com/customer-success-best-practices/how-gainsight-uses-scorecards-and-calls-to-action/ ; CTAs, tasks and playbooks — https://support.gainsight.com/gainsight_nxt/04Cockpit_and_Playbooks/00Cockpit_Horizon_Experience/About/CTAs%2C_Tasks%2C_and_Playbooks_Overview ; tech-touch segmentation and ratio ladder — https://www.gainsight.com/blog/tech-touch-customer-success/ ; QBR guide — https://www.gainsight.com/essential-guide/quarterly-business-reviews-qbrs/
- HubSpot, active vs static lists — https://knowledge.hubspot.com/lists/create-active-or-static-lists
- Planhat, customer health — https://www.planhat.com/customer-success/health ; renewals — https://www.planhat.com/customer-success/renewals ; expansion — https://www.planhat.com/customer-success/expansion
- ChurnZero, customer health scores in the age of AI — https://churnzero.com/blog/customer-health-scores-in-the-age-of-ai/
- Dreamdata, multi-touch attribution models — https://dreamdata.io/multi-touch-attribution
- MEDDICC, MEDDPICC methodology — https://meddicc.com/meddpicc-sales-methodology-and-process
- Winning by Design, SPICED — https://winningbydesign.com/spiced-framework/
- Force Management, Command of the Message — https://www.forcemanagement.com/blog/whats-the-meaning-of-command-of-the-message
- Smartlead for agencies — https://www.smartlead.ai/marketing-agencies
- Clay community, credits across multiple workspaces — https://community.clay.com/x/support/g5b0kzqtthj1/understanding-clay-account-credits-across-multiple

**Tier 3 — practitioner essays, aggregators, vendor blogs**

- LevelUp Leads, *B2B Outbound Benchmarks 2026* — https://levelupleads.io/blog/b2b-outbound-benchmarks/
- Unify, *Cold Email in 2026: Domains, Deliverability, Replies* — https://www.unifygtm.com/explore/cold-email-2026-domain-setup-deliverability-sequences
- Maildeck, cold email for agencies at scale — https://maildeck.co/blog/cold-email-agency-inbox-management/
- Litemail, cold email infrastructure for agencies — https://litemail.ai/blog/cold-email-infrastructure-marketing-agencies
- 30 Minutes to President's Club, cold-calling framework — https://www.30mpc.com/newsletter/the-ultimate-30mpc-cold-calling-framework
- Gong blog, talk-to-listen ratio — https://www.gong.io/blog/talk-to-listen-conversion-ratio ; cold call stats — https://www.gong.io/blog/cold-call-stats
- SkipCall, SDR daily routine hour-by-hour — https://skipcall.io/en/blog/sdr-daily-routine
- Nooks, parallel dialer guide — https://www.nooks.ai/blog-posts/parallel-dialer-guide
- Etumos, campaign production COPs framework — https://etumos.com/marketing-productivity/marketing-campaign-production-processes-4-steps-for-success/ ; marketing ops QA process — https://etumos.com/marketing-productivity/how-to-implement-a-marketing-operations-qa-process/
- Pedowitz Group, marketing ops SLA essentials — https://www.pedowitzgroup.com/blog/10-marketing-ops-sla-essentials-for-demand-gen-in-2026
- The CS Cafe, CSM-to-customer ratios — https://www.thecscafe.com/p/csm-to-customer-ratio-optimization
- Pulse RevOps, CS coverage ratios by tier — https://pulserevops.com/knowledge/ra0247
- Endgame, PQA and PQL guide (Elena Verna) — https://www.endgame.io/blog/elena-verna-pqa-pql-guide
- Dock, product-qualified leads — https://www.dock.us/library/product-qualified-leads
- The RevOps Report, RevOps team structure — https://therevopsreport.com/insights/revops-team-structure-guide/ ; QuotaPath rule of thumb — https://www.quotapath.com/blog/revops-rule-of-thumb/
- Scratchpad, Dooly shutdown — https://www.scratchpad.com/dooly-replacement
- Kellblog on forecasting discipline — https://kellblog.com/2017/05/10/how-to-train-your-vp-of-sales-to-think-about-the-forecast/
- n8n workflow library — https://n8n.io/workflows
- OnRamp, sales-to-CS handoff checklist — https://onramp.us/blog/sales-to-customer-success-handoff ; GainTrace seven-stage onboarding — https://gaintrace.com/blog/customer-onboarding-best-practices
- Velaris renewal playbook — https://www.velaris.io/articles/free-renewal-playbook-for-csms ; Sybill — https://www.sybill.ai/blogs/customer-success-renewal-playbook ; June.so — https://www.june.so/blog/customer-success-renewal-playbook
- Statisfy, CS-to-sales expansion handoff (ARR routing bands) — https://www.statisfy.com/blog/cs-to-sales-handoff-expansion-revenue
- Perspective AI, four-tier churn early-warning model — https://getperspective.ai/blog/early-churn-warning-signals-2026-catch-at-risk-customers-before-they-leave
- Pedowitz Group, HubSpot lifecycle stages — https://www.pedowitzgroup.com/blog/hubspot-lifecycle-stages-blog ; HubSpot lead scoring — https://www.pedowitzgroup.com/blog/hubspot-lead-scoring-blog
- Marketo lead scoring model design — https://www.leads-technologies.com/en/blogs/marketo-lead-scoring-model-design/
- LeanData, round-robin best practices — https://www.leandata.com/blog/round-robin-lead-distribution-best-practices/
- Digital Applied, webinar registration curve and post-event funnel — https://www.digitalapplied.com/blog/webinar-statistics-2026-attendance-conversion-data

**Job descriptions cited (live postings, 2025–2026)**

- Apollo.io, Business Development Representative (~210 dials/day) — https://builtin.com/job/sdr-caller/4377102
- Business Wire, SDR Prospector (50–75 calls/day) — https://builtin.com/job/sales-development-representative-prospector/8006212
- Wheelhouse, SDR (owns HubSpot + Instantly stack) — https://job-boards.greenhouse.io/wheelhouse/jobs/4709947005
- MongoDB, Customer Success Manager (Scaled) — https://www.mongodb.com/careers/job/?gh_jid=8153054 ; Marketing Automation Manager (Workato, Claude, Marketo) — https://www.mongodb.com/careers/job/?gh_jid=8152810
- Braze, CSM Global SMB (tech-touch, queue-based) — https://job-boards.greenhouse.io/braze/jobs/8025153 ; Lifecycle Marketing Senior Specialist — https://job-boards.greenhouse.io/braze/jobs/8096677
- Datadog, Marketing Operations Associate — https://careers.datadoghq.com/detail/8177270/?gh_jid=8177270
- Checkr, Staff Customer Success Manager — https://job-boards.greenhouse.io/checkr/jobs/7727737
- Klaviyo, Demand Generation Manager, Asia — https://www.klaviyo.com/careers/jobs/7818147003?gh_jid=7818147003

**Investigative journalism**

- TechCrunch, "a16z- and Benchmark-backed 11x has been claiming customers it doesn't have," 24 March 2025 — https://techcrunch.com/2025/03/24/a16z-and-benchmark-backed-11x-has-been-claiming-customers-it-doesnt-have/
- TechCrunch, "11x CEO Hasan Sukkar steps down," 5 May 2025 — https://techcrunch.com/2025/05/05/11x-ceo-hasan-sukkar-steps-down/
- TechCrunch, "Artisan… raises $25M — and is still hiring humans," 9 April 2025 (hallucination rates) — https://techcrunch.com/2025/04/09/artisan-the-stop-hiring-humans-ai-agent-startup-raises-25m-and-is-still-hiring-humans/
- TechCrunch, "AI sales rep startups are booming. So why are VCs wary?", 26 December 2024 (cold-email reply rates "fell at least 50%") — https://techcrunch.com/2024/12/26/ai-sdr-startups-are-booming-so-why-are-vcs-wary/
- The Register, "Salesforce study finds LLM agents flunk CRM and confidentiality tests," 16 June 2025 — https://www.theregister.com/2025/06/16/salesforce_llm_agents_benchmark/
