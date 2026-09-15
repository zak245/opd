<!-- Raw primary-source research notes from the industry audit helper, September 2026. Companion to 17-sales-org-workflow-inventory.md. -->

# AE & Sales-Leader Cluster — Primary-Source Research Notes (Sept 2026)

**Method note:** All claims below come from live fetches this session. The session's 200-call WebSearch budget was exhausted partway through; the back half was done by direct WebFetch of known primary URLs (vendor help centers, Trailhead, Greenhouse/Lever ATS, research-report pages, PDF text extraction). **Flagged inline:** AI-generated SEO reference sites (`pulserevops.com`, `optif.ai`, `rework.com`, `orm-tech.com`) surfaced heavily in search and are *not* primary research — I've marked where they're the only source. One sub-area (discovery/demo call mechanics + leader coaching) was also assigned to a third background researcher that had not reported by write-up time; I closed that gap myself from Gong's help center, so §3 and §9 below are primary-sourced but thinner on non-Gong tools.

---

## 1. Deal management: stages, exit criteria, CRM hygiene, stalled deals

| | |
|---|---|
| **Frequency** | Continuous; CRM update bursts are **weekly before pipeline review/1:1**. Salesforce 7th-ed. data: reps spend **17% of the workweek "manually entering data"** — Gen Z loses *"approximately two full hours weekly to manual data entry."* |
| **Trigger** | Stage advance, close-date change, any customer interaction, manager's pre-review scrub |
| **Tools** | Salesforce (Opportunity, Pipeline Inspection), HubSpot Deals, Gong Deal Boards, Salesloft Deals, Outreach Commit, Scratchpad |

**The workweek, verbatim (Salesforce *State of Sales*, 7th ed., n=4,050, fielded Aug–Sep 2025, 22 countries):**
> "How Reps Spend Their Time During an Average Workweek — **Selling 40% / Not selling 60%**"

Extracted component split (sums check: 22+18=40; 17+16+13+11+3=60):
- **Selling:** Meeting with customers 22% · Prospecting 18%
- **Not selling:** **Manually entering data 17%** · Planning 16% · Creating quotes 13% · Training 11% · Other 3%
> "They spend more than half of their time on nonselling work like data entry and prospecting."
> "On average, sales professionals spend 16% of their time on preparation and planning."

**Hygiene as a performance differentiator (same report):**
> "79% of high performers prioritize data hygiene compared with only 54% of underperformers" (moderate performers 72%; 74% of AI-using teams prioritize it)
> "42% of sales reps are overwhelmed by too many tools" — average **eight tools per team**; only **34%** on one platform.

**Stage / exit-criteria model** — Fast Slow Motion (Salesforce consultancy), 5–7 stages:
Qualification → Discovery/Needs Confirmed → Solution Fit/Evaluation → Proposal/Pricing → Negotiation/Review → Commit/Final Steps → Closed Won/Lost.
Exit criteria quoted: Qualification → *"ICP segment selected + next meeting scheduled"*; Proposal/Pricing → *"pricing package selected + approval path confirmed"*; Commit → *"contract sent + signature process underway."*
Minimal required field set: **Amount, Close date, Stage, Primary contact/stakeholder, "Next step + next step date", Product/solution, Forecast category.**
Six hygiene rules: close-date discipline with slip tracking · *"Next step required"* on all opps · deal-aging thresholds · stage revalidation after X days inactive · amount confidence before Proposal · standardized loss reasons. (No hard day-thresholds published — "X days" is configurable.)
→ https://www.fastslowmotion.com/salesforce-opportunity-stages-pipeline-hygiene/

**HubSpot ships default stages with hard probabilities** (knowledge base, verbatim):
> "Appointment scheduled (20%), Qualified to buy (40%), Presentation scheduled (60%), Decision maker bought-in (80%), Contract sent (90%), Closed won (100%, Won), Closed lost (0%, Lost)"
> Probability is "used to determine the weighted amount shown in board view, which is calculated by multiplying the total amount in each stage by the stage probability."
> Stage requirements: conditional logic to "show certain properties when users manually create a record in or move a record to a specific stage"; "Select the Required checkbox to require a property."
→ https://knowledge.hubspot.com/deals/set-up-and-customize-your-deal-pipelines-and-deal-stages

**Salesforce Pipeline Inspection** (the manager-side hygiene surface), verbatim:
> "Pipeline metrics, opportunities, week-to-week changes" · "Key metrics, opportunities, and weekly changes in close dates, amounts, stages, forecast categories" · Einstein "Opportunity Scores" · "Who's Involved feature" · **next-steps status monitoring to identify stalled deals** · direct record modification in the interface.
→ https://help.salesforce.com/s/articleView?id=sales.pipeline_inspection.htm&language=en_US&type=5

### Stalled-deal rules — the one place with published numeric defaults

**Gong deal warnings** (8 types, with Gong's own recommended thresholds by cycle type):

| Warning | Definition (verbatim) | Default threshold |
|---|---|---|
| No Activity | *"No activity over the last X days… (emails or calls picked up by Gong) during that time by you or the prospect"* | Short cycle **7d**; long early-stage **14d**; long late-stage **7d** |
| Ghosted | *"No prospect activity for X days… no one on the prospect side had involvement"* | Short **4d**; long early **7d**; long late **4d** |
| Overdue | *"Closing date is in the past"* | no threshold |
| Not Enough Contacts | *"X (1/2/3/4/5 active contacts) or fewer for X days"* | configurable |
| No Power | *"No active X (Director/Vice president/C level) or higher and deal is closing in X days or less"* | configurable |
| Pricing Not Mentioned | *"No mention and deal is closing in X days or less"* | configurable |
| Red Flag | *"Email labeled 'Red flag' received in the last X days"* | configurable |
| Stalled in Stage | *"No change for X days or more"* | configurable **per stage** |

Recalculation: *"It can take up to a few hours to recalculate the deals and show the new warnings."*
→ https://help.gong.io/docs/pipeline-review-stay-on-top-of-your-deals-with-warnings · https://help.gong.io/docs/customize-your-deal-warning-settings · https://help.gong.io/docs/warnings-faqs

**Gong's published "swing deals" board — real threshold values in use:**
Filters: status Open · forecast category **Commit** · amount **>$75k** · Account Tier Strategic · "Closing this month". Warnings set to: *no rep activity in **7 days***; *prospect non-response in **10 days***; *"Only 1 or less active prospects for **14 days**"*; *"No Vice President level or above active…for **60 days** before close date."*
→ https://help.gong.io/docs/recipe-deal-board-for-swing-deals

### Next-step hygiene — the data behind the rule

Gong Labs (three years of data, **184 companies**, hundreds of thousands of deals):
> "Sellers who close deals fastest discuss next steps 53% more."
> "Sellers who prioritize timely follow-up (within one business day) and complete all open action items… can cut deal duration by an average of 11%."
> "In 2022, win rates doubled in deals with CXOs involved compared to those with no executive involvement."
> "On average reps saw a 36% decrease in the total number of interactions with buyers compared to 2020."
→ https://www.gong.io/blog/4-ways-to-close-more-deals-in-2023-according-to-new-buying-data

Gong Labs, **1M+ opportunities across 1,418 sales organizations**:
> "average win rates increased by a whopping 50% in deals where reps completed **all** their AI-recommended to-dos."

### Inline CRM editing is now the dominant update path

Gong deal boards support inline edits to *"Account source, Account industry, Account type, Lead source, Amount, Owner name, close_date, Stage, Probability, Opportunity type, and additional custom fields"*; changes are *"synced immediately to your CRM, and a green success message appears."* Salesforce, HubSpot, Dynamics 365.
→ https://help.gong.io/docs/review-your-pipeline-on-a-deal-board

**Tool-landscape change worth noting:** **Dooly shut down June 2025** (acquired by Mediafly, then shuttered). Scratchpad absorbed much of the base. Scratchpad now positions as auto-updater: *"Scratchpad AI automatically updates Salesforce fields from customer interactions"*; Hygiene Monitor gives *"Daily tracking of CRM hygiene and process adherence."* Customer claims: Recharge *"saved sellers 455 hours a month"* and *"over 9,000 Salesforce updates with AI"*; Settle *"6,000 hours reclaimed from admin to selling."*
→ https://www.scratchpad.com/ · https://www.scratchpad.com/dooly-replacement

---

## 2. Qualification frameworks in 2025–26 — and the AI auto-fill shift

| | |
|---|---|
| **Frequency** | Updated per-call in the AI-assisted model; historically "before pipeline review" (i.e. weekly, often stale) |
| **Trigger** | Call ends → AI extracts → rep validates; or stage gate blocks advance on missing fields |
| **Who fills it in** | **This is the thing that changed in 2025–26.** See the two opposing product models below. |

**Adoption signal from live 2026 job postings (see §JDs): MEDDPICC named in 4 of 5 AE postings.** DataGrail asks for *"Command of a modern sales methodology (MEDDPICC, Command of the Message, or similar)."*

**MEDDPICC canonical definitions** (meddicc.com, verbatim): Metrics — *"The quantifiable measures of value that your solution can provide"* · Economic Buyer — *"The person with the overall authority in the buying decision"* · Decision Criteria — *"A set of principles, guidelines and requirements that an organization uses to make a decision about your solution"* · Decision Process — *"The steps that the buyer will take to decide whether they will buy"* · Paper Process — *"The series of steps that follow the Decision Process in how you will go from Decision to signature"* · Implicate the Pain · Champion — *"A person who has power, influence, and credibility within the customer's organization"* · Competition — *"Any alternative person, vendor, or initiative."*
Metrics sub-taxonomy: **M1s** (outcomes delivered for existing customers), **M2s** (personalized to this customer), **M3s** (validated M2 after go-live). EB: *"has the power to say yes when others say no, and say no when others say yes."*
→ https://meddicc.com/meddpicc-sales-methodology-and-process · https://meddicc.com/what-is-meddpicc/metrics · https://meddicc.com/what-is-meddpicc/economic-buyer

**SPICED** (Winning by Design): Situation · Pain · Impact · Critical Event · Decision — *"a diagnostic framework to identify and transfer critical customer information along the entire customer lifecycle."* Explicitly designed to run **across the whole lifecycle**, not just sales — which is why it shows up in AE→CS handoffs.
→ https://winningbydesign.com/spiced-framework/ · https://winningbydesign.com/wp-content/uploads/2022/04/Winning-by-Design-Blueprint-The-SPICED-Framework-7.pdf

**Command of the Message** (Force Management) — verbatim definition:
> "Being **audible-ready** to define your solutions to **customer problems** in a way that **differentiates** you from your competitors and allows you to **charge a premium** for your products and services."
> "A Value Framework isn't a script. It's a repeatable framework that guides the customer conversation…"
> "In a value-based conversation, metrics are the way you measure required capabilities or the requirements for solution success."
Reinforced by managers *"through coaching and certification."* Three claimed measurable outcomes: shorter cycles, increased C-level engagement, greater use of customer proof points.
→ https://www.forcemanagement.com/blog/whats-the-meaning-of-command-of-the-message · https://www.forcemanagement.com/blog/what-is-a-value-framework

### Where the fields live, and who actually fills them — two competing product models

**Model A — AI fills, no human in the loop (Gong AI Data Extractor).** This is the sharpest finding in the cluster.
Gong's marketing page: AI Data Extractor *"Identifies key deal and account details, and automatically fills out CRM fields **with no rep input required**."*
Gong's help doc mechanics, verbatim:
> "Gong selects deals or accounts that had a call in the last month or received an inbound email. For those deals and accounts, answers are generated according to call data from the last six months."
> "Gong recalculates answers for active accounts and deals whenever a new relevant conversation takes place. **When new or better information is found, the previous value is overwritten.**"
Constraints: **max 20 published extractors per workspace**; deal-target extractors **require** CRM field mapping; *"you can only choose a CRM field that is already imported into Gong—Gong does not create new fields in the CRM."* Default filter: activity in last 30 days. **No documented review step before overwrite.**
→ https://help.gong.io/docs/ai-data-extractor · https://www.gong.io/platform/ai-agents-for-revenue-teams

**Model B — AI suggests, human validates (Gong Playbooks).** Same vendor, opposite posture:
> Pre-built: *"MEDDICC, BANT, SPIN, Challenger, SPICED, Solution Selling, and Sandler."* *"You can have as many active playbooks at a time as you want."*
> AI *"finds relevant conversations that meet the fulfillment of that element and generates suggested notes"* — it does **not** auto-complete. AI notes examine *"the last 100 emails and the last 50 calls."*
> Four-state colour scheme: **White** = no findings/notes · **White with star** = AI detected relevant conversations · **Light blue** = manual note added · **Dark blue** = *"The manual note has been validated by either the AE or manager."*
> Bidirectional CRM sync: *"When you configure each element in a playbook, you can select a CRM field to provide synchronization for that element between Gong and your CRM."* Syncs last 3 months.
→ https://help.gong.io/docs/understanding-playbooks · https://help.gong.io/docs/playbook-faqs

**Outreach** — ships MEDDPICC natively:
> "Outreach supports the MEDDPICC framework out of the box… Metrics, Economic Buyer, Decision Criteria, Decision Process, Paper Process, Identify Pain, Champion, Competition."
> Each field *"must be mapped to a custom Outreach field created by the Admin."* Admins can rename, hide, reorder.
> "AI-generated insights are enabled by default and based on **Kaia topics** available in Outreach." A **sparkle icon** marks AI-suggested fields.
Also: **Deal Agent** *"transforms meeting conversations into accurate, reviewable deal insights and opportunity field recommendations"*; **Smart Deal Assist** uses *"the latest 80 meetings/calls transcripts and 500 emails"* and runs on Azure OpenAI.
→ https://support.outreach.io/hc/en-us/articles/39332047292315-Customize-Sales-Methodology-in-Outreach · https://support.outreach.io/hc/en-us/articles/25480928547611-Smart-Deal-Assist-Overview

**Salesloft** — *"Automatically capture MEDDPICC, BANT, SPIN, and other sales framework insights from buyer conversations to qualify deals faster"*; *"automatic CRM sync populates sales methodology fields from call transcripts"*; logs *"more than 30 distinct activity metrics — including call duration, sentiment, and email engagement — directly into Salesforce, HubSpot, or Microsoft Dynamics 365."* Deal Summary AI *"cuts pre-call prep from 20 minutes to 30 seconds."* Deal Engagement Score = 7-day trend.
**Deal Gaps** is the enforcement mechanic. Practitioner (Salesloft community, verbatim): *"Deals Gaps set up that trigger when certain MEDDICC Fields aren't filled out at certain Opportunity Stages"* and *"custom Deal fields specific to MEDDIC that the manager would use in their pipeline reviews"* — managers check *"if what they're seeing aligns to the deal stage and forecast category."*
→ https://www.salesloft.com/platform/deal-management-software · https://community.salesloft.com/fid-7/tid-157

**Practitioner counter-view on scorecards** (Gong Visioneers community): *"a scorecard is something you use on a single call and MEDDPICC typically is not going to be fully vetted in one call."* Recommended instead: smart trackers + playbooks + deal boards, and managers *"review each area during a one on one with a rep."*
→ https://visioneers.gong.io/sales-enablement-40/meddpicc-scorecards-1165

**Claimed impact (vendor, low-confidence):** Spotlight.ai — *"3.3x to 3.8x improvements in win rates for qualified deals, with full adoption of evidence-based deal reviews within 90 days."* Their diagnosis of the failure mode is the quotable part: teams *"treat it like a CRM checklist instead of a coaching operating system"*; *"A checkbox that says 'Champion: Yes' tells you nothing about evidence quality."*
→ https://www.spotlight.ai/post/meddicc-implementation-guide-for-enterprise-sales-teams
⚠️ **Correction to propagate:** the widely-repeated "MEDDIC lifts forecast accuracy from 52% to 89% in six months" traces to a vendor blog with no methodology. Do not cite.

---

## 3. Discovery and demo calls

| | |
|---|---|
| **Frequency** | Per-call. AE cadence Gong recommends: *"Listen to your own calls **once a day**"* |
| **Trigger** | Calendar event with external attendees → recorder auto-joins |
| **Tools** | Gong, Chorus (ZoomInfo), Clari Copilot, Salesloft Conversations, Avoma, Fathom, Einstein Conversation Insights |

**Prep.** Gong AI meeting prep is available *"on any customer call that hasn't started yet or is currently in progress (ON AIR - 15 min before start)"* and delivers *"comprehensive, AI-generated summaries, recaps, and insights"* — objectives, prior-conversation highlights, action items, suggested questions, plus an **Ask Anything** box and a **Dry Run** practice mode. Generates only *"when there's prior tracked activity with the account."*
→ https://help.gong.io/docs/get-ready-for-meetings-with-ai-powered-meeting-prep.md

**Recording + consent.** Three consent mechanisms, verbatim: **pre-call email** *"10 minutes prior to the meeting"*; **consent page** *"before the participant joins the meeting where they can give explicit consent"*; **audio prompt** *"when a participant joins the meeting announcing that the call is being recorded."* Per-user auto-record settings; calendar add-on link *"first displays the consent page and then starts or opens the meeting."*
→ https://help.gong.io/docs/call-recording-and-consent-settings.md

**What actually reaches the CRM — an important limit.** Gong exports *"meeting invites," "conference calls," "telephony system calls," "emails," "Engage tasks," and "LinkedIn connection requests and messages"* to Salesforce as Tasks/Events, including *"when the call took place, how long it lasted and what the call resolution was."* But: **"The call transcript is not exported."**
And automated AI briefs are **email-only**: *"A dedicated email containing the full brief is sent to the selected recipients"*; on CRM delivery — *"Not at this stage"*, with CRM integration *"planned for a future release."*
→ https://help.gong.io/docs/export-data-as-salesforce-tasks-or-events.md · https://help.gong.io/docs/set-up-automated-ai-briefs.md
**So:** structured fields reach the CRM via AI Data Extractor / Playbooks (§2); narrative summaries largely do not. This is the seam where the "AI auto-logs everything to CRM" claim breaks down.

**Follow-up email.** Gong: *"Gong generates the email in the same language as the call"*; *"Review the generated draft and edit it as needed"*; sends via Engage composer or copy-paste. **Sending from Gong requires an Engage license.** Salesloft Conversations *"automatically records, transcribes, and analyzes every sales call,"* generates *"AI-powered call summaries and follow-up emails,"* *"action items by attendee,"* *"smart chapters,"* and *"automated CRM updates."*
→ https://help.gong.io/docs/generate-a-follow-up-email.md · https://www.salesloft.com/platform/conversation-intelligence

### Gong Labs call-behaviour data (the numbers that drive coaching)

**Discovery:** slides on a discovery call → *"17% less likely to book a follow-up meeting."* Optimal **11–14 targeted questions**. Pricing on first call → win rates **10% higher**; best reps introduce price at the **38–46 minute mark**. Social proof early-stage → *"decreases close rates by 47%."*
**Executive discovery (1M+ executive sales cycles, w/ Jen Allen-Knuth):** *"you're **22% less likely** to earn a next step with an executive compared to a non-executive after a discovery call."* Skipping rapport cuts next-meeting rate *"by up to 8.3%"*; 1–2 minutes of rapport raises it *"by 3.8%."* *"Mentioning ROI at all during discovery correlated with lower next-meeting set rates with executives."*
**Demos:** winning intro meetings averaged **9.1 min** of presentation content vs **11.4** for losses; win rates drop **26% → 5%** as demo monologue extends to 500 seconds. Video on: deals **127% more likely to close**; seller camera on **+94%** win rate; buyer camera on **+96%**.
**Talk ratios:** top sellers ~**46%** talk-to-listen; average reps in the high 60s. *"High performers maintain the same talk-to-listen ratio whether they win or lose"* (~60% consistent) while low performers swing 54%→64%.
**Objections:** top reps pause **5x longer** after an objection; speak **176 wpm** vs 188 for average reps when flustered; respond with questions **54.3%** vs **31%**.
**Email:** won deals average **8.21 emails/week** vs **1.87** for losses.
Gong's own AE-facing interaction-stat targets: talk ratio **≤65%**, longest monologue **≤2m30s**, customer engagement **1–2 min**, interactivity **≥5/10**, patience **0.6–1.0s**.
→ https://www.gong.io/blog/sales-stats · https://www.gong.io/blog/3-proven-ways-to-book-your-next-executive-meeting · https://help.gong.io/docs/coaching-for-account-executives.md

---

## 4. Forecasting

| | |
|---|---|
| **Frequency** | **Weekly submission** by rep; roll-up weekly; exec forecast call weekly, with every-other-week out-quarter focus (Clari's own practice) |
| **Trigger** | Cadence-driven reminder. Gong: *"When it's time for you to submit your forecast, by the cadence set by your business admin, you get a reminder in the Gong app and in Slack."* |
| **Tools** | Salesforce Collaborative Forecasts, Clari, Gong Forecast, Outreach Commit, Salesloft Forecast, BoostUp |

**Real-world cadence, practitioner verbatim** (Gong Visioneers community):
> "Every Monday morning, AEs update their forecast… they tell me every week how much they expect to close that month from each bucket (**Commit / Maybe / Surprise**)."
→ https://visioneers.gong.io/deals-73

**Category definitions — Salesforce (canonical):**
> "The standard forecast categories are **Pipeline, Best Case, Commit, Omitted (not included in forecasts), and Closed**."
> Forecast hierarchy: *"A nested, expandable list of forecast users or territories that determine how forecasts roll up within a company and who can view and adjust them."*
> Adjustment: *"An adjustment indicates a judgment about the final figure a forecast's opportunities are expected to bring in at the close of the forecast period."* Adds detail **without altering underlying gross rollup figures**; both managers and reps can adjust.
> Quota: *"The monthly or quarterly sales goal that's assigned to a user or territory. A manager's quota equals the sales that the manager and team are expected to generate together."*
→ https://help.salesforce.com/s/articleView?id=sf.forecasts3_definitions.htm · .../forecasts3_adjustments_overview.htm · .../forecasts3_hierarchy_overview.htm

**Clari's definitions (verbatim), with the one published probability:**
> **Pipeline:** "early in the sales cycle, and sales reps are still actively working on them"
> **Best Case:** "fully qualified, and they have a contract and closing plan, but the rep still needs to do work to move them forward"
> **Commit:** "expected to close within the current period. **Reps should expect to close about 90% of the deals in the commit category.**"
> **Closed** / **Omitted:** "lost or dropped due to being unqualified and therefore are not included in forecasts"
Commit gate, four conditions: primary contact has decision authority (or has sign-off), confirmed start timeline, understands the purchase process, compelling reason to act now. Clari cites SiriusDecisions: *"only 21% of companies come within 10% of their sales forecasts."*
→ https://www.clari.com/blog/defining-sales-forecast-categories-to-drive-reliable-revenue/ · https://www.clari.com/blog/do-your-sales-reps-know-what-a-commit-really-means-1/

**Kellblog (Dave Kellogg) — the probability discipline, verbatim:**
> Forecast = *"A 90% number on being at/above the forecast"* → *"I should come in under my forecast once every 2.5 years (10 quarters)"*
> Best case = *"A 20% number on being at/above the best case"* → *"I should hit/beat the best case about once every 5 quarters"*
> Worst case = *"A 5% number on being at/below the worst case"*
> Opportunity-level: **Commit 90% · Forecast 70% · Upside 30%**. *"forecast category should effectively equal probability."* Both *"reps and managers should forecast"* independently.
> To-go coverage: *"at all times during the quarter I'd like to have **3.0x coverage** of what I have left to sell to hit plan"* — 3.0x at quarter start is *"not a bad rule of thumb"* but *"likely an excessively high bar as you get further into the quarter."* Scrub weeks **2, 5, 8**; cleaned data presented weeks **3, 6, 9**.
→ https://kellblog.com/2017/05/10/how-to-train-your-vp-of-sales-to-think-about-the-forecast/ · https://kellblog.com/2021/04/29/using-to-go-coverage-to-better-understand-pipeline-and-improve-forecasting/

**Gong Forecast — the actual submission steps, verbatim:**
1. *"Select what you're forecasting for, your team, and the period you're forecasting for"*
2. *"Click a submission cell (for example: Commit). A panel opens on the right."*
3. *"Enter your forecast number. If your admin has set this column to **auto-submit**, numbers are submitted automatically on your behalf."*
4. Review rollup, *"write notes for managers"*, check *"Submission changes"* for trend/history, drill into underlying deals sorted by amount
5. *"Next submission"* to advance, or *"Save"*
Rollups: *"Team rollups reflect the total of the latest submissions of all team members reporting to the selected manager."* Configurable boards = *"the flexibility of spreadsheets connected to the real-time data of Gong and your CRM data"*, columns of three types: **forecast submission, metric, target**. (Configurable Forecast Boards shipped **November 2025**; AI Data Extractor **December 2025**.) Metrics available: *"Bookings ($)," "Win rate $," "Open pipeline ($)," "Pipeline created (#)"*, plus formula metrics like booking attainment. Forecast analytics dashboards show *"Forecast rollup for the selected and following periods," "Forecast and pipeline trends," "Highest-value deals and highest-value deals at risk," "Changes by forecast category."*
→ https://help.gong.io/docs/how-to-forecast-1 · .../understanding-configurable-forecast-boards · .../set-up-forecast-rollup-board-business-totals · .../build-your-own-metrics · .../analyze-forecast-analytics-dashboards · .../monthly-updat

### Forecast accuracy benchmarks

| Figure | Source |
|---|---|
| *"only 21% of companies come within 10% of their sales forecasts"* | SiriusDecisions via Clari |
| *"most sales leaders' 'forecasts' don't get within 10% accuracy until week 10 or week 11 of the quarter"* | Clari, *Ultimate Guide to Forecasting Confidence* (PDF) |
| *"Only 7% of companies achieve 90%+ forecast accuracy"* | Gartner via Clari |
| *"Only 24% of sales organizations reach forecast accuracy above 75% at 30 days"* | Gartner via Clari |
| *"55% of sales leaders don't have a high degree of confidence in their sales forecast accuracy"* | Gartner via Clari |
| Stage-based forecasting **60–75%** accurate *"when CRM field population remains inconsistent"*; deal-level ML **75–90%** | Clari (vendor) |
| *"only 60–70% of CRM fields are consistently populated across B2B organizations"* | Clari (vendor) |
| *"40% of sales professionals with usage pricing say forecasting revenue is a top challenge"* | Salesforce SoS 7th ed. |
| Gong: *"20 percent more precision than forecasts that use CRM data alone"*; customer results *"20 percent increase"* (Frontify), *"25 percent greater forecast accuracy"* (Verse.ai) | ⚠️ vendor marketing, no sample sizes |

Clari's stated root cause, verbatim: *"Reps don't add all deal data into CRM. This is no fault of the reps… They were hired to do what they do best: sell, not enter data… this critical missed step leaves holes in your ability as a leader to properly inspect deals, and cripples any attempt to apply machine learning or AI."*
→ https://www.clari.com/blog/sales-forecasting-accuracy/ · https://pages.clari.com/rs/866-BBG-005/images/ebook_newwaytorevconfidence.pdf

---

## 5. Deal reviews and pipeline reviews

| Meeting | Cadence | Who runs | What's inspected |
|---|---|---|---|
| Rep 1:1 / deal review | Weekly | Frontline manager | At-risk deals by score + MEDDIC gaps |
| Team pipeline review | Weekly | Frontline manager | Coverage, warnings, stage movement |
| Exec forecast call | Weekly (every other week on out-quarter) | CRO/VP | Commit deals flagged at-risk |
| Monthly business review | Monthly | Second-line leader | Segment/territory performance |
| Territory & capacity planning | Quarterly | Second-line leader | — |

The cadence table above is **stated verbatim in a live Verkada Director of Sales posting** (updated 2026-09-10):
> "**Run the operating cadence: weekly forecast calls, pipeline and deal inspection, monthly business reviews, quarterly territory and capacity planning.**"
→ https://job-boards.greenhouse.io/verkada/jobs/5221556007

**Gong's published manager pipeline-review workflow** — *"We recommend checking this board **weekly**, particularly before 1:1s and pipeline reviews."* Six steps:
1. Verify setup — deal count and total align with expectations
2. Pulse check — *"Check activity: activity is a good sign of deal health"*; look for **bidirectional** communication, not just rep outreach; verify next calls scheduled; *"Check what Gong-AI warnings are showing you about the deals"*
3. Deep dive on flagged deals — multi-threading evidence in Activity tab, latest emails/calls, Contacts tab for titles engaged
4. **Async** — tag reps with comments on accounts/activities *"rather than waiting for meetings"*
5. 1:1 prep — filter by individual rep, repeat steps 1–2
6. Strategic discussion — blockers, action plans, pull in other teams
→ https://help.gong.io/docs/recipe-focus-on-deals-that-need-your-attention

**Clari's 4-step leader rhythm** (*Ultimate Guide to Forecasting Confidence*), verbatim:
Step 1 Triangulate a Reality Check — *"What history is telling you / What your team is telling you / What you're being asked to deliver"*
Step 2 Inspect Current and Out-Quarter Pipeline — *"In most companies, pipeline inspection rarely is a data-driven process."*
Step 3 Data-Driven 1:1 Coaching — **the ratio quote:**
> "**Your 1:1s should be 90% coaching around risk mitigation, pipeline acceleration, and deal execution, and 10% reviewing your deals line by line. Unfortunately, almost all 1:1s are on the exact opposite side of that metric.**"
> "It's the difference between an interrogation and a strategy session."
Three 1:1 tactics: *"Come With a Point of View"* · *"Have Specific Questions Prepared"* · *"Spend Time Strategizing."*
The three-signal at-risk trigger, verbatim: *"1. The CRM Score is low… 2. Activity has fallen off… 3. **MEDDIC is not filled out**: Key data points like metrics and economic buyer are missing."*
Step 4 Bring the Entire Revenue Team Together — **the Clari forecast call case study:**
> "Leaders come prepared with a POV to executive forecast calls just like managers do for 1:1s. Our executive leadership team posts comments in our **Slack channel ahead of the meeting** to call out key details they would like to inspect on the call."
> "revenue leaders don't have to sort the forecast by deal size, they can **sort by committed deals and the CRM Score, focusing on opportunities in red**… come prepared with pointed questions about why the sales force is still committing these deals even though the data science says there is risk."
> "**Marketing attends the forecast call** and has reviewed these deals for opportunities to accelerate with ABM. Customer Success offers customer intros…"
> "**Every other week we focus the entire call on out-quarter pipeline inspection.** Marketing drives this discussion…"
> Worked coverage example: *"for our $55m quota for next quarter, we're going to need $150m in pipeline based on historical data"* (≈**2.7x**)
> "Protect the Base. Renewals and upsell opportunities… should be forecasted against in that same way."
Clari's Time Series Data Hub is *"historically tracking and time-stamping every single field in the CRM every 15 minutes"*, looking back two years.
→ https://pages.clari.com/rs/866-BBG-005/images/ebook_newwaytorevconfidence.pdf

**Gong's own pipeline-review advice:** *"Target One Deal Per Rep"* — each rep brings their most pressing deal; focus *"on the Future, Not the Past."* Cost framing: *"Depending on your team's size, you may easily have more than $1M in salary sitting at your pipeline meetings."*
→ https://www.gong.io/blog/pipeline-review/

**Reality check on 1:1 frequency (Salesforce SoS 7th ed.):** among "Types of Enablement Offered Among Sales Teams," **"Regular 1-on-1 meetings with managers" is offered by only 34%** — below "Training material and resources" (36%) and tied with "Personalized action plans" (34%). Also offered: Performance reviews 51% · Account reviews 43% · Sales strategy reviews 42% · Win/loss reviews 42% · Roleplay sessions 26%.

---

## 6. Mutual action plans / close plans

| | |
|---|---|
| **Frequency** | Per-deal, selectively — *"particularly useful in higher-ACV deals with more complexity, multiple stakeholders, and longer sales cycles"* (Dock). Once live: *"reviews should happen on every call"* (Aligned) |
| **Trigger** | Three competing published positions (below) |
| **Tools** | Accord, Recapped, Dock, Aligned, Trumpet, Flowla, GetAccept, Arrows, Outreach Success Plans, DealHub, Gong, Clari, Highspot |

**When to introduce — the vendors disagree, and the disagreement is the finding:**
- **Aligned:** *"Introduce the plan once discovery confirms real pain and a timeline, typically before the proof-of-concept or pilot stage. Bringing it in earlier feels premature to the buyer; bringing it in after procurement starts means you lose control of the process."*
- **Highspot:** *"immediately after confirming shared objectives and validating budget authority with champions and economic buyers."*
- **Outreach:** *"Early in the deal, I'll take 30 minutes with a champion to talk through the success metrics"*; "Success Plan Review" as *"one of my first project milestones."*

**Who builds it.** Dock is blunt: *"while the mutual action plan is technically a shared checklist between you and the buying team, **you (as the salesperson) should take on the bulk of the work**."* Aligned prescribes building *"the first draft live with your champion"* — *"to turn skepticism into buy-in."*

**Sections.** Dock's five: **Overview** (*"target kickoff date, success criteria, key dates, and high-level goals"*) · **Plan Progress** · **Evaluation** (*"platform demo, executive presentation, and proof-of-concept steps"*) · **Procurement** (*"legal review, security review, and contract signoff milestones"*) · **Implementation**. Aligned's six: Value summary · Stakeholders · Action items (owners + due dates) · Timeline **working backward from go-live** · Risks · Success metrics. Clari prescribes a *"20- to 30-word"* value proposition and **"seven to nine milestones."**

**Distribution.** Universal: shared workspace, not a spreadsheet. Aligned: *"Spreadsheets get emailed and forgotten; a shared workspace keeps one source of truth visible to everyone."* Recapped templates support **MEDDPICC, MEDDIC, BANT, Sandler, Challenger** with bi-directional Salesforce/HubSpot sync.

### Impact data, ranked by trustworthiness

**Tier 1 — real datasets (Gong Labs), measuring the *behaviour*, not the artifact:**
- *"average win rates increased by a whopping 50% in deals where reps completed **all** their AI-recommended to-dos"* — **1M+ opportunities, 1,418 organizations**. AI to *optimize* +50% · *guide* +35% · *inform* +26%.
- *"within one business day… complete all open action items… cut deal duration by an average of 11%"* — **184 companies**
- *"In the fastest deals, the seller spent **53% more** time discussing 'next steps' during the first meeting"*

**Tier 2 — vendor dataset with stated N. Flowla, *State of Digital Sales Rooms 2026*** (N = *"30,000+ deal rooms"* + 100+ practitioners) — **the most useful under-quoted number in this whole cluster:**
> **"~48% of deal rooms created never receive any engagement."**
Also: **54%** of surveyed sales professionals actively use DSRs, **~30%** never have. Average room: **5.94 sections, 18 content pages, 18.96 action items, 18.8 sessions, 2.9 stakeholders.** **7-day average** from creation to first view; **2-day** cadence between visits. **~60%** cite *reps not keeping rooms updated* as the primary problem. Market $1.2B (2024) → $6.5B (2033), 20.7% CAGR. Flowla explicitly states: *"No win rate impact, sales cycle length impact, or specific MAP findings provided in this research."*

**Tier 3 — widely repeated, NO published methodology. Attribute, don't rely on:**
- Trumpet: *"Deals that included a Mutual Action Plan were twice as likely to close… average win rates jumping from **29% to nearly 60%**."* Step bands: 6–10 steps → 84% win rate; 11–15 → 92%; **30+ → back to ~29%**; optimal 6–20. Basis: *"hundreds of Pods."* ⚠️ The "29% baseline" matches Ebsta's **2024** win rate, making this look like a cross-source comparison, not a controlled one.
- Outreach: *"a 26% higher win rate than those without"* — no source, sample, or method stated.
- GetAccept (via Aligned): *"90% of revenue leaders believe mutual action plans help them expedite deals"*; *"70%… experience an increased win rate."* ⚠️ These are **belief/perception items**, not outcome measurements.
- Dock: Nectar *"31% increase in win rates"*; *"97% chance of closing"* when prospects viewed the workspace **12+ times**.

**Buyer-side context:** Gartner — *"61% of B2B buyers prefer an overall rep-free buying experience"* (June 2025); a later Gartner survey (n=646 buyers, fielded Aug–Sep 2025, published Mar 2026) found **67% prefer rep-free** and **45% used AI** in a recent purchase. Buyers spend only **17%** of purchase time with suppliers. Gartner predicts **30% of B2B sales cycles managed through digital sales rooms by 2026**. *"86% of B2B deals stall"*; *"40% of stalled deals result from internal misalignment within buying committees."*

**No published industry benchmark for MAP adoption rate exists.** GetBruin poses the question (*"What percentage of deals above $50K have a mutual action plan created…"*) and does not answer it.
→ https://www.dock.us/library/mutual-action-plans · https://www.dock.us/templates/mutual-action-plan · https://alignedup.com/guides/mutual-action-plan-template/ · https://www.recapped.io/mutual-action-plans · https://www.flowla.com/blog/state-of-digital-sales-rooms-research · https://www.sendtrumpet.com/blog-posts/want-to-close-more-deals-start-using-a-mutual-action-plan · https://www.clari.com/blog/mutual-action-plan-best-practices/ · https://www.highspot.com/blog/mutual-action-plan/ · https://getbruin.com/use-cases/saas/enable-mutual-action-plan-completion/

---

## 7. Quoting and CPQ

| | |
|---|---|
| **Frequency** | Per-deal, multiple quote versions. Renewals run on a clock: CPQ generates *"quotes 90 days before contract end"* |
| **Trigger** | Opportunity hits proposal/negotiation → "New Quote"; or renewal job fires on contract end date; or customer requests mid-term change → **Amend** on Contract |
| **Frequency anchor** | Target **first-pass approval rate > 70%** — i.e. ~30% of quotes bounce back at least once |

**⚠️ Platform status change that reframes everything here.** Salesforce's own page:
> "Salesforce is **no longer selling new Salesforce CPQ licenses to new customers**."
> "Salesforce has not announced an end-of-life date for CPQ. It is currently in a **maintenance phase** — supported, but no longer receiving new feature development."
Successor: **Revenue Cloud Advanced**, *"now branded Agentforce Revenue Management as of the Spring '26 release."* Object-model break: **Transaction Line Items replace `SBQQ__QuoteLine__c`.** Migration *"3–6 months from discovery through go-live."*
→ https://www.salesforce.com/sales/cpq/end-of-life/

**The 12-step quote-to-cash chain:** Opportunity Creation → Quote Generation → Product Configuration (bundles/options) → Pricing Application → Quote Document Generation (PDF) → **Approval Submission if thresholds exceeded** → Customer Delivery (DocuSign/Adobe Sign/Salesforce Files) → Customer Signature → **Primary Quote Designation** → **Contract Creation converting Quote Lines to Subscription records** → Order Generation → Renewal Automation.
Five core objects: Quote · Quote Line · Quote Line Group · Product · Product Option.
**AI guardrail, verbatim:** *"Agents cannot bypass approval thresholds. Discounts above the threshold still need humans."*

**Salesforce CPQ Advanced Approvals mechanics** (Trailhead, primary):
> "Approval rules are the building blocks of the advanced approval process. Each rule defines an approver and one or more conditions for a record."
> Condition fields: **Tested Field, Operator, Filter Type, Filter Value** — e.g. *"Partner Discount > 20%."*
> "Approval variables are child objects of approval rules. They aggregate data from child records" — how you approve on *aggregate* quote-line data. Split into **summary** and **discount** approval variables.
> "An approval chain represents a series of approvals that must happen in a specific sequence." Worked 3-step: Finance Team → Finance Manager → VP of Finance.
> Parallel chains: *"Advanced Approvals initiates all chains for the record, even if they begin on different steps… The record isn't approved until all approvers in all chains have confirmed their approval."*
> Unanimous flag: every group member must approve; otherwise *"only one member of the group."*
> **Reps get a "Preview Approval" button** that *"shows a simplified flowchart of conditions and approvers"* — lets the AE see the chain **before** committing to a discount.
Worked examples: a **25% discount** routes Mina Manager → Serggio Sales; a **35% partner discount** routes manager → sales rep → CEO; **five managed-service teams when quote totals exceed $1,000,000.**
→ Trailhead: /discover-advanced-approvals · /manage-approval-logic-with-approval-rules-conditions-and-variables · /organize-approver-reviews-with-approval-chains

### Published discount approval matrices

**(a) Salesforce's own engineering blog — the best primary-vendor matrix:**

| Discount Band | Approver Chain | Informed |
|---|---|---|
| 5–10% | Sales Manager | Sales Operations |
| 10–20% | Sales Manager, Regional VP, CRO | Finance Director |
| 20%+ | Sales Manager, Regional VP, CRO, CFO | Finance Director |

Three layers: Configuration (Custom Metadata: *"scope, threshold bands, and assignees"*) → Resolution (Apex + Flow) → Lifecycle (Flow Orchestration, *"handling null checks to skip missing levels"*). Approvers addressed by field-path, user-attribute, or Queue. *"Adding a new band to an existing process is an admin task: create one metadata record, set the scope and thresholds, fill the approver and informed slots, and save."*
→ https://www.salesforce.com/blog/metadata-driven-approvals/

**(b) DealHub illustrative bands:** *"instantly approve a 5% discount on orders under $1,000"* · *"a 10% discount needing sales manager approval, while a 25% discount requires the VP of Sales"*. **DOA matrix** worked tiers: **Tier 1 Manager <$10,000 · Tier 2 Director up to $50,000 · Tier 3 VP/CFO over $50,000.** Multi-level example: deals **over $250,000** route **Sales Manager → Regional VP → CFO**. Guardrail fields named: *"Floor price, Maximum discount percentage, Minimum margin threshold, Average selling price (ASP) benchmarks, Cost of goods sold (COGS) baseline."* Seven-step quote approval: Quote creation → Validation → Automatic approval → Submission for review → **Multi-tier approval** → Approval decision → Quote sent. Structures: Sequential (*"Sales Manager → Finance → VP of Sales"*) / Parallel / Hybrid.
→ https://dealhub.io/glossary/discount-approval/ · /quote-approval/ · /doa-matrix/ · /deal-desk/

**(c) Practitioner default:** *"reps 0–10%, managers ~20%, desk/finance beyond that—with bands varying by segment and deal size."* (b2bprocess.com)

**(d) Full band+SLA matrix** — ⚠️ from `pulserevops.com`, AI-generated reference site, attributed to "Kory White, Fractional CRO." Internally coherent, not research:

| Tier | Band | Approver(s) | SLA |
|---|---|---|---|
| 0 | 0% (list) | AE direct | Immediate |
| 1 | <10% | AE + manager visibility | Immediate (CPQ auto) |
| 2 | 10–20% | Front-line mgr + regional deal-desk analyst | **4 business hours** |
| 3 | 20–30% | Regional VP + deal-desk lead | **8 business hours** |
| 4 | >30% | CRO + CFO (± GC) | **24 business hours** |

Governance detail worth stealing regardless of source: above-Tier-3 exceptions require *"a written 100-word strategic rationale embedded in the CPQ approval flow"* — claimed to cut requests **28%** via self-filtering.

**Deal desk — 8 steps, verbatim step names:** *"Define standard — so 'non-standard' means something"* → *"Set the approval matrix"* → *"Intake through one door"* → *"Review for economics, risk, and precedent"* → *"Counter-structure, don't just approve/deny"* → *"Decide within the SLA"* → *"Document every exception"* → *"Analyze and shrink the exception surface."*
SLAs: standard *"same or next business day"*; complex multi-approver *"2–3 business days with active shepherding."* Metric targets: approval turnaround **<1 business day** standard / **<3** complex; **first-pass approval >70%**; quarter-end cycle-time delta **<1.5×**. DealHub tiers it **24h standard / 48h complex / 72h strategic**.
→ https://b2bprocess.com/deal-desk

**PandaDoc CPQ conditional approvals** — most granular published condition taxonomy: *"line item discounts, section total discounts, total discounts, grand total discounts, and quote variables."* Two placement levels (template-level and workflow-level). *(Both doc URLs returned HTTP 429 on direct fetch; from indexed summaries.)*

**Qwilr — hard constraint AEs must know:** *"once a live Qwilr Page has been accepted it **CANNOT** be reversed, deleted, or edited."* Status flips Pending → Accepted; acceptance details (*"name, email, organization, and any custom form responses"*) land in the Audit Trail. Approval workflows are a **paid-tier gate** (Business plan, *"$65/user/month annually with a minimum of 10 users"*).

**Redlines / legal.** DocuSign CLM covers *"contract creation, negotiation, routing, approval/signature, and storage"* with *"100+ pre-configured contract management workflow steps."* Vendor ROI claims: **449% ROI**, **90% reduction** in contract generation time, **85% reduction** in errors. Routing by value: *"if contract value exceeds $100,000, route to senior counsel."*
A published **fallback clause ladder** (⚠️ pulserevops.com, but the only one found): Liability cap 1x fees → 2x → 5x (CRO/CFO); Termination for convenience Never → 90-day notice + full remaining term; SLA credits 99.5%/5% cap → 99.9%/10% cap; Auto-renewal 60-day opt-out → 90-day → annual opt-in (rare). Legal SLAs: standard redlines **24h**, non-standard **48 business hours**; Green/Yellow/Red path **4–8h / 24–48h / 48–72h**. *"Iteration continues typically 2–4 rounds for enterprise deals."*

**On signature → renewal.** Mechanical trigger in CPQ is the **Contracted checkbox on the Opportunity** — *"Check the Contracted checkbox and save"* generates the Contract, populates Subscriptions, and creates the **Renewal Opportunity**.
**Renewal Pricing Method** on the Account has three options: **Same** (net price from subscription) · **List** (price book) · **Uplift** (net price + markup from the subscription's **Renewal Uplift %**). *"The start date of the renewal quote begins one day after the end date of the previous contract."* Amendments use **delta pricing**: *"Salesforce CPQ calculates product quantity and price on the amendment opportunity based on the difference between the original quote and the amendment quote."* Blocker: *"Ensure the 'Preserve Bundle Structure' checkbox is checked on your contract. Otherwise, you won't be able to amend it."* Co-term: *"It is recommended those subscription line items to co-terminate…all lines renew at the same time."*
→ https://milomassimo.com/Salesforce-CPQ-Creating-an-Amendment-Opportunity-and-Quote.html · https://levelshift.com/blogs/managing-subscription-products-with-salesforce-cpq

⚠️ **Unverified:** "DocuSign envelope completion auto-flips the opportunity to Closed Won" — three candidate DocuSign URLs returned 404. Common implementation pattern, **not confirmed from a primary source.**

---

## 8. Handoffs

### 8a. SDR → AE

**Volume anchors — The Bridge Group, *2025 SDR Models, Motions & Metrics* (10th biennial ed., N=351 B2B companies, 78% NA, 83% B2B SaaS, median revenue $47M, median ASP $50K):**

| Metric | 2025 |
|---|---|
| Monthly quota, Stage 0 | **10** — *"down 40% since 2018"* |
| Daily quality conversations | **4.1** |
| Total daily activities | **112** (44 phone, 41 email, 19 LinkedIn, 8 text/other) |
| Reps at quota | **60%** — *"lowest on record"* |
| Ramp | **3.0 months** — *"lowest since 2010"* |
| Tenure | **1.9 years** — *"highest since early 2010s"* |
| Annual attrition | **40% median** (21–57% range) |
| Pipeline per SDR | **$3.78M** annually |
| **SDR-to-AE ratio** | **1 SDR : 2.4 AEs** |
| SDRs aligned to AE territories | **82%** |
| SDR OTE | **$80K** (unchanged since 2022), 68:32 split |

→ https://www.bridgegroupinc.com/research/2025-sdr-models-metrics-report-the-bridge-group

**The stage model, verbatim** (icebergops.com):
1. *"When a meeting is set, an SDR creates an opportunity in **stage 0**"* — to *"memorialize that the meeting is supposed to happen"*
2. *"If the meeting takes place and the prospect is qualified, the opportunity moves to **stage 1** and is labeled a held meeting"*
3. No-show: *"the meeting is labeled as such and **reassigned to the SDR**"*
4. Disqualified: *"the opportunity is set at close lost"*
5. *"Every opportunity that is performed and passes the SLA criteria falls under the AE's responsibility and is checked by their manager (VP) during 1:1 meetings."*
Capacity benchmark: an AE can carry *"10-15 small deals and 5-10 large deals at the same time without dropping the ball."* Conversion: *"the average appointment to opportunity conversion rate has been estimated at 38%."*

**Qualification criteria must be binary** (GTMnow). Good: *"They use Salesforce" / "They have at least 500 employees" / "They are an e-commerce company" / "The meeting is with a Director or above."* Explicitly rejected: *"prospect is interested"*, *"has pain/need."*

**Required handoff fields** (Default): *"the business problem (in the prospect's words when possible)," "why now (trigger event, urgency, or timeline driver)," "who is involved (decision-maker and key stakeholders)," "what success looks like (desired outcome and impact)."*

**Credit — the consequential design decision.** GTMnow names the failure mode: **SDRs don't get paid until the AE marks the opportunity "qualified," giving the AE a veto over the SDR's comp.** Their fix: opportunities meeting SLA criteria should **automatically** trigger SDR compensation. This is *why* the binary criteria matter — they make "did it meet SLA?" machine-checkable rather than a judgment by the party with the opposite financial incentive.

**Rejection / recycle.** Triggers: wrong ICP, no genuine interest, contact lacks authority, required info missing. Benchmark: *"Handoff rejection rate… with **above 15%** suggesting the SDR qualification standard and AE acceptance standard are misaligned."* Process: *"Log rejections with reasons; review monthly in joint SDR-AE sessions."* SLA breach → *"auto-alert to manager, reassignment to backup AE."* No-show tactic: *"3-way introduction emails"* rather than blind calendar invites; **target show rate >70%.**

**Published AE-response SLAs** (two independent sources converge):

| Lead type | Response window |
|---|---|
| Inbound demo requests / hot leads | **1–4 hours** |
| Outbound qualified meetings | **4–8 hours** |
| MQL → sales transition | **24 hours** |

Vendor-blog supporting claims (no methodology): *"25 to 40% of qualified leads receive no AE follow-up within 48 hours"*; *"Each hour of delay after a handoff reduces conversion probability by 10%"*; *"Implementing a 4-hour AE response SLA improved qualified-to-opportunity conversion by 34%."*

**Lead-response research — the well-sourced part, with an attribution correction:**
**MIT / InsideSales.com, 2007 (Oldroyd)** — 6 companies, **15,000+ leads, 100,000+ call attempts**:
> "The odds of contacting a lead if called in 5 minutes versus 30 minutes drop **100 times**. The odds of qualifying a lead if called in 5 minutes versus 30 minutes drop **21 times**."
> Best days: *"Wednesdays and Thursdays"*; best qualify windows *"8-9am and 4-5pm"*; best contact *"4-6pm."*
**⚠️ These 100x/21x figures are routinely miscited to HBR. They are MIT/InsideSales 2007.**
**HBR, March 2011 — "The Short Life of Online Sales Leads"** (n=**2,241 US companies**, audited with test web leads):
> "37% responded within 1 hour, 16% within 1-24 hours, 24% took more than 24 hours, and **23% never responded at all**."
> "Among companies that responded within 30 days, the average first response time was **42 hours**."
> "Firms that tried to contact potential customers within an hour… were nearly **7 times** as likely to qualify the lead as those that tried… even an hour later - and **more than 60 times** as likely as companies that waited 24 hours or longer."
**Drift 2017 secret-shopper** (n=433 B2B companies): *"Only 7% of the 433 companies responded within the optimal window"*; *"55% did not respond within 5 business days."*
**Velocify** (~3.5M leads): *"Calling within a minute of receiving a lead increases conversion rates by 391%"*; *"93% of converted leads are reached by the sixth call attempt."*
**Chili Piper** (vendor): routes and schedules *"in less than 60 seconds"*; customer result *"improved the conversion of highly qualified demo requests to opportunities by 61%."*

### 8b. AE → Customer Success

**Trigger:** contract signature / Closed-Won. *"The sales-to-customer-success handoff should begin at contract signature and be completed within five business days."* In DealHub's deal-desk model the final step is literally *"Handoff to fulfillment teams."*

**The best published day-by-day checklist** (Chaser) — each item has an owner and a day offset:

| # | Item (verbatim) | Owner | Timing |
|---|---|---|---|
| 1 | *"Handoff doc filled in (context, promises, stakeholders, risks)"* | AE | **2 days after close** |
| 2 | *"Internal handoff call held"* (~30 min AE↔CSM) | CSM | **4 days** |
| 3 | *"CSM reviews contract, recordings, and promised items"* | CSM | **5 days** |
| 4 | *"Warm intro sent to the customer"* | AE | **5 days** |
| 5 | *"Kickoff call with the customer held"* | CSM | **2 weeks** |
| 6 | *"Success plan drafted against the customer's criteria"* | CSM | **3 weeks** |
| 7 | *"Integration requirements handed to engineering"* | CSM | **3 weeks** |
| 8 | *"30-day check-in scheduled and held"* | CSM | **30 days** |

**⚠️ The kickoff SLA is contested — pin the definition or it's meaningless:**
- Rocketlane: *"Time-to-kickoff **under five business days** from contract signature"* (kickoff **held**)
- AskElephant: handoff doc to CSM *"Within **24 to 48 hours**"*; kickoff *"**scheduled** and confirmed"* within *"3 to 5 business days"*
- Chaser: kickoff **held** at **2 weeks**

**Kickoff agenda, 40 minutes** (AskElephant): Intro & confirmation 5 min → Success criteria alignment 10 min → Technical readiness 10 min → Onboarding plan walkthrough 10 min (*"Walk through the 30-day plan with named owners and milestone dates"*) → Commitment confirmation 5 min.

**What gets transferred** (Rocketlane's six): customer goals/success metrics · deal context and history (competitors, pricing terms) · relationship mapping (economic buyer, champion, end users, skeptics) · open risks and technical blockers · 30-day action plan · sales artifacts (call recordings, proposals, SOWs, email threads).
AskElephant field-level: *"Identified pain, economic buyer, champion, budget confirmation, competitors evaluated, success criteria"*; contract *"ARR, seats, term, renewal date"*; *"Commitments made."*

**On MEDDICC specifically — a useful nuance:** AskElephant *"references the MEDDIC sales methodology but does not mention MEDDICC/MEDDPICC specifically"*; Rocketlane doesn't reference it at all. These vendors document the **underlying fields** (economic buyer, champion, pain, decision criteria) without the acronym. The one tool that explicitly carries the acronym across the seam is **Recapped**, whose templates support MEDDPICC/MEDDIC/BANT/Sandler/Challenger.

**The step most orgs skip** (AskElephant): *"Confirm any custom commitments the AE made (implementation timelines, integration delivery dates, or **custom SLA terms**) and walk through the CS team's execution plan for each."* — the direct downstream consequence of §7's Tier 3/4 redline concessions.

**Role split** (Rocketlane): AE completes handoff doc, documents goals, creates stakeholder map, introduces CSM to champion. CSM reviews for gaps, runs internal kickoff, creates project plan, confirms success criteria. **RevOps** logs quality scores, updates CRM ownership, sets health baselines.

**Tools named:** Salesforce, HubSpot, Gong, Chorus, Zoom, Rocketlane, Slack, AskElephant, Chaser, Zapier, Workato.
**Gap:** no primary Gainsight / ChurnZero / Catalyst / Vitally documentation with published handoff SLAs was reachable.

---

## 9. Sales leader workflows

**The single best verbatim on the leader operating cadence** — Verkada, Director of Sales NYC, updated 2026-09-10:
> "**Run the operating cadence: weekly forecast calls, pipeline and deal inspection, monthly business reviews, quarterly territory and capacity planning.**"
> "Own the New York City office & the Northeast… the path past **$50M in annual revenue within two fiscal years** along with **the forecast accuracy behind it**."
> "Lead and develop a team of **5+ Regional Sales Managers (front line) and Account Executives (40+)**." → **~8 AEs per RSM**
> "**Deep command of forecasting, pipeline management, capacity planning, and territory design**"

**Coaching cadence — Gong's published recommendation (the hard number):**
> **"Listen to one call per direct report once a week."**
> *"Give feedback **as soon as possible** after the call happens, while the call is still fresh in the rep's mind."*
> *"Score calls as soon as possible after the call happens."*
→ https://help.gong.io/docs/coaching-for-frontline-managers.md

**Gong's AE-side cadence (mirror image):**
> **Daily:** *"Listen to your own calls once a day"*
> **Weekly:** request manager feedback · score own calls · listen to peer calls from top performers · score peer calls · add high-value calls to the library
> **Monthly:** score one of your calls · request manager feedback on overall performance · monitor personal stats vs team benchmarks (Insights > Team)
→ https://help.gong.io/docs/coaching-for-account-executives.md

**Scorecard mechanics.** Five question types: *"Range: Select from 0 to 50," "Multi-select," "Single-select," "Yes/No," "Open-ended."* Overall score = *"a customizable range question, from 0 to 100"*, manual or weighted-calculated. **AI Call Reviewer** can *"Score entire calls automatically, based on your scorecard criteria"* and *"score either the call host or selected participants based on your team hierarchy."* For manual reviews, *"Gong AI looks in the call transcript and suggests an answer. Scorers can keep the answer suggested by Gong, or change it."* Unavailable for voicemails or transcripts **under 100 words**. *"Apply to past calls"* within **90 days**. Learning resources can auto-surface when *"a score falls at or below a specified threshold."*
→ https://help.gong.io/docs/create-and-manage-scorecards.md

**Manager-coaching-of-managers metrics** (what a second-line leader inspects), verbatim:
> **"Calls listened"** — *"Total number of team calls the manager listened to (includes calls listened to live)"*
> **"Calls with feedback"** — *"Total number of team calls the manager gave any type of feedback for"*
> **"Calls with scorecards"** — *"Total number of team calls with scorecards filled out by the manager"*
Trend indicators green/red vs prior period; drill into cells to *"see which calls were included in the number"*; **monthly email digest** of manager coaching auto-sent to managers-of-managers.
Coaching inbox per rep shows: *"Coaching activity," "Last attended/listened," "Last feedback"* (last 30 days), *"Open requests"* (last 30 days), *"Recorded calls."* Reps ranked *"according to the amount feedback given"*; feedback-requested calls *"pinned to the top."*
→ https://help.gong.io/docs/review-manager-coaching.md · https://help.gong.io/docs/review-your-team-coaching-needs.md

**Dashboards watched.** Gong deal boards weekly *"particularly before 1:1s and pipeline reviews"*, with **weekly email digests** showing *"the board deals with the most risk."* Forecast analytics dashboards: rollup for selected + following periods, forecast/pipeline trends, *"Highest-value deals and highest-value deals at risk," "Changes by forecast category."* Salesforce Pipeline Inspection: week-to-week changes in *"close dates, amounts, stages, forecast categories."* Clari: CRM Score + sales activity, with the field-level time series *"every 15 minutes."*

**Manager coaching is time-starved — the data (Salesforce SoS 7th ed.):**
> *"It's not that sales managers don't want to coach their reps. It's that they lack the time."*
> Reps saying: *"I'm more likely to hit my targets with a coach or mentor"* **75%** · *"Traditional enablement doesn't provide the skills I need"* **52%** · *"I rarely get feedback on my sales conversations"* **46%** · *"I don't get enough opportunities to roleplay before customer calls"* **41%** · *"My manager's lack of time is an obstacle for enablement"* **40%**
> Obstacles to enabling reps: Lack of access to data/insights **40%** · **Managers' lack of time 38%** · Lack of enablement expertise 37% · Reps' lack of time 34% · Insufficient technology 30%
> **34%** of sales teams with agents use them for coaching (high performers 36% / moderate 34% / underperformers 26%); high performers **1.4x** more likely to use agents for coaching.

**Comp plan — what reps actually ask (Salesforce SoS 7th ed.):**
> *"I wish there were more transparency in how my compensation is calculated"* **76%**
> *"I'm aware of opportunities to increase my pay"* **76%**
> *"I know the commission amount for every deal I work"* **73%**
> **"32% of sales leaders say their tech stacks lack compensation management capabilities."**
Commission rate benchmark: **11.5% of ACV** (Bridge Group 2024 ed.). AE comp split **53:47 base:variable** (Bridge Group 2024). Top AI agent use case #4 across sales is *"Managing commissions."*
Tools referenced in postings/market: CaptivateIQ, Salesforce Spiff, QuotaPath, Everstage.

**Territory & capacity planning:** quarterly per the Verkada posting; Verkada AE postings also require *"Develop and implement a strategic territory plan."* *(Salesforce Enterprise Territory Management help URLs returned error pages; Fullcast/Varicent/Anaplan/Xactly not reached — open gap.)*

---

## 10. AE daily rhythm and real numbers

### ⚠️ Three metrics get conflated constantly — they are not contradictions

| Metric | Meaning | 2025–26 value |
|---|---|---|
| **% of reps at quota** | headcount hitting ≥100% | **48%** (Bridge Group 2026) |
| **Average quota attainment** | mean % of quota across all reps | **~43%** (RepVue 2025) |
| **% of sellers who missed quota** | opportunity-data derived | **78%** (Ebsta/Pavilion 2025) |

### The Bridge Group, *AE Models, Motions & Metrics*, 10th ed. — published **June 22, 2026**, N = **158 B2B companies**

| Metric | 2026 | Verbatim context |
|---|---|---|
| **Reps at quota** | **48%** (↓ from 51% in 2024) | *"Distribution has shifted — fewer companies in the 50–90% range; more in the 0–30% danger zone. Long-term trend is downward."* |
| **Median AE OTE** | **$200K** (↑ from $190K) | *"OTE has risen faster than quota over the same period. Median OTE was $167K in 2022."* |
| **Median AE quota** | **$960K**; **4.6× quota-to-OTE** | *"up from 4.2× in 2024. SaaS companies reported a median of $875K."* |
| **Ramp time** | **6.2 months** | *"Highest in study history… Reflects increasing deal complexity and buying committee size."* |
| **Experience at hire** | **3.7 yrs** (↑ from 2.7 in 2022) | *"At higher ASPs, **the era of the junior AE appears largely over**."* |
| **AE owns renewals/expansion** | **38%** | *"Nearly doubled since 2024… most pronounced below $25K ASP."* |
| **AI engagement vs attainment** | **57% vs 39%** | highest vs lowest AI-engagement tercile |

Bridge Group's own caveat, quote it if you cite them: *"This is observational survey data, not a controlled experiment. Self-selection into AI adoption is real… Subgroup comparisons should be interpreted as directional rather than definitive."*
**Quota trajectory:** $740K (2022) → $800K (2024) → **$960K (2026)**. OTE: $167K → $190K → $200K. **Quota is outrunning OTE.**
Historical (2024 ed.): commission **11.5% of ACV**; base:variable **53:47**; *"Quotas have risen modestly, at just a **2% compound annual growth rate**, since 2012"*; *"The difference in quota for a <$25K ACV seller and a $250K+ seller is nearly **2.5X**."*
Span of control: **7 AEs per sales leader** — *"consistent since 2015"* (2022 ed.). Confirmed by live postings: Samsara *"~8 account executives"*; Verkada 40+ AEs / 5+ RSMs.
→ https://www.bridgegroupinc.com/research/2026-ae-models-motions-metrics · https://blog.bridgegroupinc.com/2026-ae-compensation-quota-ai-metrics · https://blog.bridgegroupinc.com/2024-ae-metrics-compensation-benchmark

### RepVue Cloud Sales Index (rep-reported, quarterly; site returns HTTP 429 to fetchers)

| Quarter | Avg attainment | Sample |
|---|---|---|
| Q1 2025 | 43.3% | — |
| Q2 2025 | **42.69%** — *"57.31% of sales reps missed their quota"* | *"246 cloud and software companies and approximately 47,000 quota-carrying sales professionals"* |
| Q3 2025 | **43.24%** — *"the highest since mid-2023"* | *"249 companies, 49,000+ quota-carrying professionals, and over 2 million data points"* |
| Q4 2025 | 43.83% | — |

**Counterintuitive finding:** *"$200K+ ACV: **48.3%** of reps hit or exceeded quota"* — the largest-ACV sellers attain quota **best**. RepVue's framing: *"Bigger deals help you get to quota faster."*
ACVs (Q3 2025): Key Accounts **$324K** (*"20% YoY increase, first time breaking $300K"*); Mid-Market **$67K** (*"16% YoY increase"*).

### Ebsta × Pavilion, *2025 GTM Benchmarks* — read off the primary charts

Sample, verbatim: *"**655,000 Opportunities Analyzed / $48 Billion** Value of Opportunities Analyzed / **240,000+ Minutes** of Seller Discovery Calls / **349** High-Performing Companies Analyzed and **2,000+ CROs**"*

| Chart | Value |
|---|---|
| win rates | **−10%** |
| deal values | **+54%** |
| **sales cycles** | **−9% (shortened)** |
| sellers missed quota | **78%** |
| velocity delta | **11×** |
| deals slipped | **36%** |

Other Ebsta 2025 figures: new-logo win rate **19%** · expansion deals close in **52 days** · top performers' cycles **42% shorter** · **8 stakeholders** new-business / 5 expansion · early decision-maker involvement **+55%** win rate · engagement score >40 → **400%+ higher** win rate · **"44% of seller interactions are missing from CRM"** · **14% of sellers generate 80% of revenue** · top performers manage **2.64× more deals** · *"Active selling hours: under two daily average; A-players averaged four."*

### Gong — largest opportunity-level samples

*State of Revenue 2025* (**7.1M opportunities across 3,600+ companies**, plus 3,000+ revenue-leader survey):
- **Quota attainment fell 52% → 46%** YoY
- *"Sales representatives are managing fewer opportunities in 2025 than last year, with declines across all deal sizes"* — **no absolute per-rep count published**
- *"Win rates and deal duration remained consistent"* YoY
- *"Teams that regularly use AI tools generate **77% more revenue per representative**"* — *"a six-figure difference per salesperson annually"*
- *"Organizations that have embedded AI into their core go-to-market strategies are **65% more likely to increase their win rates**"*

Multi-threading study (**1.8M new-business deals closed in 2024**):
- **77%** of deals are multi-threaded; closed-won deals have *"twice as many buyer contacts"*
- *"Strategic enterprise deals average **17 contacts**"*
- *"Multi-threading boosts win rates by an average of **130%** in deals over $50K"*
- *"Selling teams for closed-won deals are **67% larger** than those for lost deals"*; *"By discovery completion, closed-won deals include an average of **6.7 members of the sales team**"*
- Sales engineer on the demo: *"increased their win rates by as much as **30%**"*
- AI Briefer teams: *"**42% increase** in average win rate"*, *"**26% decrease** in average deal duration"*
- SMB deals without decision-makers **80% less likely to close**; enterprise **233% less likely**; multiple seller participants **+258%** close likelihood

### Sales cycle by ACV band (Norwest 2024)
- **SMB (<$15K ACV): 14–30 days**
- **Mid-market ($15K–$100K): 30–90 days**
- **Enterprise (>$100K): 90–180+ days**
Cross-check from a live posting — DataGrail Mid-Market AE: *"a segment with strong win rates and fast, **30 to 40 day sales cycles**."*
Ebsta multi-year level: average B2B cycle *"6.5 months, up from 4.9 months in 2019."* Salesforce SoS 7th ed.: *"**57%** of sales professionals now say the sales cycle is getting longer"* and *"Customers take longer to decide than they used to **57%**."*

### Win rates & conversion
Average B2B win rate **20–21%** (Ebsta/Pavilion 2025); top performers **30%+**; 2025 new-logo **19%**; post-proposal **31–50%** (Norwest); HubSpot 2025 reports **28%**. Lead→MQL **31%** · MQL→SQL **13–21%** (aligned teams 30%+) · SQL→Opportunity **30–59%** · SAL→SQL **52.7%**.
Modifiers: *"Delayed deals reduce win rates by 113%"* · *"42% higher close rates when multiple contacts are engaged — and **78% of accounts are still single-threaded**."*

### Pipeline coverage — no large-sample benchmark exists
The hardest evidence is what companies **enforce in job postings**:
- DataGrail: *"Build and manage a self-sourced pipeline at **3x coverage** against quota"*
- Motive: *"maintain a healthy **3x–4x pipeline coverage**"*
- Kellblog: **3.0x to-go coverage** *"not a bad rule of thumb"*
- Clari's own case study implies ≈**2.7x** ($150M pipeline for $55M quota)
- Bridge Group 2026 reports *increases* in *"required pipeline coverage"* but publishes no ratio
**→ 3x is the floor; 3–4x is the stated norm; it's rising.**

### ⚠️ Where the data is genuinely thin — state this in the memo
**There is no current, credible, large-sample published benchmark for AE meetings/demos per week or calls/emails per day.** The Bridge Group dropped AE activity metrics from recent editions. The last published figure is ~2018: **6.8 demos/week, 6.3 quality conversations/day**. Gong has the opportunity-count data (7.1M opps) and **declines to publish the absolute per-rep number**. Ebsta gives only a ratio (top performers manage **2.64× more deals**). The closest live evidence is again a job posting — Verkada: *"Our Account Executives are responsible for maintaining **high activity standards; daily prospecting, pipeline growth, prospect qualification**, and delivering on assigned **quarterly** sales revenue targets."*

### ⚠️ Corrections to circulating claims
1. **"Ebsta 2025 says cycles lengthened 12%"** — **false.** Ebsta's own chart reads **−9%** (shortened). The "6.5 months vs 4.9 in 2019" is a multi-year *level*, not the 2025 YoY delta.
2. **"Win rate dropped 29% → 19%"** — Ebsta's chart shows a **−10% change**; 29%→19% is a −34% relative change. Don't repeat that framing without the full report.
3. **Bridge Group "66–67% quota attainment"** figures in circulation are from **pre-2020 editions**. Current is **48%**.
4. **"5 minutes → 100x contact / 21x qualify"** is **MIT/InsideSales 2007 (Oldroyd)**, not HBR.
5. **"MEDDIC lifts forecast accuracy 52% → 89%"** — vendor blog, no methodology. Do not cite.

---

## Real 2025–26 job descriptions (9 live postings, fetched Sept 2026)

**B1. Highspot — AE, Mid Market (Remote US), Lever.** OTE **$190K–$260K**, base $95K–$130K, 50/50.
> *"Maintain accurate account, opportunity, and forecast data within Salesforce and other internal forecasting tools."*
> *"Own the full sales cycle—from initial outreach, qualification, discovery, demo, proposal, to negotiation and close—while consistently driving new ARR."*
> *"Strong understanding and experience leveraging **MEDDPICC** framework as a sales qualification tool"*
> *"Proficient with Salesforce and experienced using modern sales tools such as **Clari, Gong, LinkedIn, Salesloft, or ZoomInfo**."*
→ https://jobs.lever.co/highspot/12b7f6f1-6582-4288-911b-746e9c502665

**B2. DataGrail — Mid Market AE (Remote US), Greenhouse.** *The richest posting in the set — explicit coverage ratio, cycle length, 90/180/365-day milestones.*
> *"Build and manage a self-sourced pipeline at **3x coverage** against quota, largely through your own outbound."*
> *"Run a challenger-style sales process: lead with insight, create urgency, and keep deals moving through a compressed **30 to 40 day cycle**."*
> *"Manage your full-cycle pipeline with disciplined forecasting and **CRM hygiene**, from first outreach through close."*
> *"Command of a modern sales methodology (**MEDDPICC, Command of the Message**, or similar) and the discipline to qualify rigorously and forecast accurately."*
> **90 days:** *"Build pipeline at 3x coverage against a prorated quota with 1 to 2 deals already closed."* **180 days:** *"Maintain 3x pipeline coverage against your full quota… demonstrate consistent, accurate forecasting."*
> On quota transparency: *"**Specific numbers seem like something we should discuss in initial interviews.**"*
→ https://job-boards.greenhouse.io/datagrail/jobs/7981434003

**B3. Motive — AE, Mid-Market MX (Mexico City, hybrid 2–3 days), Greenhouse.**
> *"**Maintain CRM & Forecast Accuracy:** Keep meticulous records of all sales activities, account intelligence, and opportunity stages in **Salesforce** to deliver accurate monthly and quarterly revenue forecasts."*
> *"**Build & Manage Pipeline:** Actively self-source new opportunities through targeted outbound outreach (phone, email, social) while effectively qualifying inbound interest to maintain a healthy **3x–4x pipeline coverage**."*
> *"Quantify Motive's ROI using structured sales methodologies (**MEDDPICC / BANT**)."*
> *"**$50K+ average deal size / ACV** experience preferred"*
→ https://job-boards.greenhouse.io/gomotive/jobs/8622282002

**B4. CaptivateIQ — AE, Enterprise, Lever.** OTE **$300,000**.
> *"Maintain a disciplined pipeline with accurate forecasting and clear deal progression"*
> *"Proven track record of exceeding quota and closing complex, multi-stakeholder deals in the **$250K+ range**"*
> *"**8+ years** of SaaS sales experience, including **4–5 years** owning net-new Enterprise deals"*
> *"Familiarity with sales tools like **Salesforce, Gong, and Outreach**"*
→ https://jobs.lever.co/captivateiq/30aca004-499e-43f4-a2ae-2106db33039d

**B5. Verkada — AE, Select (Mid-Market), Phoenix, Greenhouse.**
> *"Conduct strategic outbound prospecting through **phone calls, emails, in-person field events, and online outreach**"*
> *"Manage the complete sales cycle… with a focus on meeting or exceeding **quarterly** sales quotas."*
> *"Maintain accurate pipeline management and contribute to forecasting efforts"* · *"Develop and implement a strategic **territory plan**"*
> *"Experience with **Salesforce, LinkedIn, ZoomInfo & Outreach** is a plus."* · *"Knowledge and execution of **MEDDPICC** is preferred."*
→ https://job-boards.greenhouse.io/verkada/jobs/4247993007

**B6. Verkada — Director of Sales NYC (second-line), updated 2026-09-10.** OTE **$325K–$380K**. *(Quoted in full in §5 and §9.)* Also: *"Willingness to travel **~30%**"*, *"Must be willing and able to work onsite **five days per week**."*
→ https://job-boards.greenhouse.io/verkada/jobs/5221556007

**B7. Verkada — Regional Sales Manager, Mid-Market, Austin, updated 2026-09-10.** OTE **$189K–$260K**. *Names the four AE activity metrics explicitly:*
> *"Lead, coach, train, and motivate direct reports through **pipeline reviews, managing daily and weekly activities, forecasts and closed deals** to ensure individual and team quotas."*
> *"**Activity/prospecting consistently overachieves targets (calls, emails, demos, pipe)**"*
> Internal-promotion bar: *"**Minimum of $1.5M in Lifetime Bookings**"*, *"**12+ Months in role**"*
→ https://job-boards.greenhouse.io/verkada/jobs/5226851007

**B8. Gong — Manager, Commercial Sales (NYC, hybrid 3 days), updated 2026-08-27.** OTE **$200K–$240K**.
> *"Experience managing and improving **full cycle Account Executive KPIs**"* · *"Consistent track record of **100%+ of quota achievement** as a manager and individual contributor"*
→ https://job-boards.greenhouse.io/gongio/jobs/4643477006

**B9. Samsara — Manager, Mid Market (East), Remote US, updated 2026-09-09.** OTE **$176,460–$259,500**.
> *"Coach a team of **~8 account executives** on sales strategy, **pipeline reviews** and achieve **quarterly** targets"*
> *"Showcased ability to **analyze and accurately forecast existing pipeline**"* · *"Proficient in utilizing tools such as **SFDC, SalesLoft, Gong**"*
→ https://www.samsara.com/company/careers/roles/8132381

### Cross-posting patterns (n=9)

| Signal | Frequency |
|---|---|
| **Salesforce named** | 6/9 |
| **Gong named** | 5/9 |
| **MEDDPICC/MEDDIC** | 4 of 5 AE postings |
| **Outreach or Salesloft** | 4/9 |
| **Explicit "accurate forecast" duty** | 6/9 |
| **Explicit pipeline coverage ratio** | 2 of 5 AE postings (3x, 3–4x) |
| **Explicit quota $ number** | **0** — all deflect to deal size or OTE |
| **Span of control** | ~8 AEs/manager |

---

## Five cross-cutting observations for the memo

1. **The same SLA grammar appears three times.** 4h/8h/24h for discount tiers · 1–4h/4–8h/24h for SDR→AE · 24–48h/3–5 days for AE→CS. Orgs that publish one usually publish all three; orgs that publish none leak at all three seams.
2. **Two numbers are load-bearing and under-cited, and both say the same thing:** *"~48% of deal rooms created never receive any engagement"* (Flowla, n=30,000+ rooms) and *"44% of seller interactions are missing from CRM"* (Ebsta, n=655,000 opps). The artifact exists; the follow-through doesn't.
3. **Gong ships two contradictory answers to "who fills in MEDDICC."** AI Data Extractor: *"automatically fills out CRM fields **with no rep input required**"* and *"the previous value is overwritten."* Playbooks: AI *"generates suggested notes"* with a four-state colour scheme ending in *"validated by either the AE or manager."* Same vendor, same quarter, opposite posture on human-in-the-loop. This is the sharpest live tension in the 2026 AE workflow.
4. **The MAP win-rate literature is weak.** The circulating 26% (Outreach) and 29%→60% (Trumpet) figures have no published methodology. The defensible claims measure the *behaviour*, not the artifact: Gong's action-item-completion findings (**+50% win rate**, n=1M+ opps / 1,418 orgs; **−11% deal duration**, n=184 companies). Every workflow in this cluster — MAP, close plan, both handoffs — is fundamentally **an owner-plus-date list**, and the data rewards completing the list on time rather than the artifact existing.
5. **Salesforce CPQ is in managed decline.** Any 2026+ quoting workflow should assume Revenue Cloud Advanced / Agentforce Revenue Management, including the `SBQQ__QuoteLine__c` → Transaction Line Items object break and a **3–6 month** migration.

## Open gaps
- **AE meetings/demos per week, 2024–26** — no current large-sample source exists anywhere.
- **Open opportunities carried per AE** — Gong has the data and declines to publish the count.
- Gainsight / ChurnZero / Catalyst / Vitally primary docs on kickoff SLAs.
- Salesforce Enterprise Territory Management docs (help URLs errored); Fullcast / Varicent / Anaplan / Xactly not reached.
- Conga CPQ approval mechanics; DocuSign eSignature-for-Salesforce writeback (3 URLs → 404); PandaDoc CPQ approval pages (HTTP 429); RepVue's own site (HTTP 429 to all automated fetching — all RepVue figures above are second-hand quotes of their index).
- Chorus (ZoomInfo), Clari Copilot, Avoma primary docs on recording/summary mechanics — §3 is Gong- and Salesloft-weighted as a result.

---

## All URLs

**Primary vendor docs (Gong):** help.gong.io/docs/ — ai-data-extractor · understanding-playbooks · playbook-faqs · how-to-forecast-1 · understanding-configurable-forecast-boards · set-up-forecast-rollup-board-business-totals · build-your-own-metrics · analyze-forecast-analytics-dashboards · customize-your-deal-warning-settings · pipeline-review-stay-on-top-of-your-deals-with-warnings · warnings-faqs · review-your-pipeline-on-a-deal-board · understanding-deal-boards · understanding-gong-deals · recipe-focus-on-deals-that-need-your-attention · recipe-deal-board-for-swing-deals · monthly-updat · llms.txt · coaching-for-frontline-managers.md · coaching-for-account-executives.md · coaching-for-senior-managers-enablement.md · create-and-manage-scorecards.md · review-manager-coaching.md · review-your-team-coaching-needs.md · introduction-to-coaching.md · call-recording-and-consent-settings.md · get-ready-for-meetings-with-ai-powered-meeting-prep.md · set-up-automated-ai-briefs.md · generate-a-follow-up-email.md · export-data-as-salesforce-tasks-or-events.md · take-action-on-a-call.md
**Gong other:** https://www.gong.io/platform/ai-agents-for-revenue-teams · /blog/new-product-announcements-gong-revenue-ai-operating-system · /blog/sales-stats · /blog/the-best-sales-insights-of-2025 · /blog/data-shows-top-reps-dont-just-sell-they-orchestrate-with-ai · /blog/3-proven-ways-to-book-your-next-executive-meeting · /blog/4-ways-to-close-more-deals-in-2023-according-to-new-buying-data · /blog/we-measured-the-roi-of-ai-in-sales-heres-how-it-really-impacts-your-deals · /blog/pipeline-review/ · /blog/pipeline-data · https://visioneers.gong.io/deals-73 · https://visioneers.gong.io/sales-enablement-40/meddpicc-scorecards-1165
**Salesforce:** help.salesforce.com/s/articleView?id=sf.forecasts3_definitions.htm · .../forecasts3_adjustments_overview.htm · .../forecasts3_hierarchy_overview.htm · .../forecasts3_cumulative_columns_overview.htm · .../sales.pipeline_inspection.htm · https://www.salesforce.com/en-us/wp-content/uploads/sites/4/documents/reports/sales/salesforce-state-of-sales-report-2026.pdf · /sales/state-of-sales/sales-statistics/ · /news/stories/state-of-sales-report-announcement-2026/ · /news/stories/sales-research-2023/ · /blog/metadata-driven-approvals/ · /sales/cpq/end-of-life/ · trailhead.salesforce.com/content/learn/modules/advanced-approvals-for-admins/ (discover-advanced-approvals · manage-approval-logic-with-approval-rules-conditions-and-variables · organize-approver-reviews-with-approval-chains)
**Clari:** /blog/defining-sales-forecast-categories-to-drive-reliable-revenue/ · /blog/do-your-sales-reps-know-what-a-commit-really-means-1/ · /blog/maximize-sales-pipeline-and-forecast-accurately/ · /blog/sales-forecasting-accuracy/ · /blog/mutual-action-plan-best-practices/ · https://pages.clari.com/rs/866-BBG-005/images/ebook_newwaytorevconfidence.pdf
**Outreach:** support.outreach.io/hc/en-us/articles/39332047292315-Customize-Sales-Methodology-in-Outreach · .../25480928547611-Smart-Deal-Assist-Overview · .../19694632787867-Outreach-Deal-Overview · https://www.outreach.ai/resources/blog/how-to-use-mutual-action-plans
**Salesloft:** https://www.salesloft.com/platform/deal-management-software · /platform/conversation-intelligence · https://community.salesloft.com/fid-7/tid-157
**HubSpot:** https://knowledge.hubspot.com/deals/set-up-and-customize-your-deal-pipelines-and-deal-stages
**Methodology:** https://meddicc.com/meddpicc-sales-methodology-and-process · /what-is-meddpicc/metrics · /what-is-meddpicc/economic-buyer · /what-is-meddpicc/decision-criteria · https://winningbydesign.com/spiced-framework/ · https://winningbydesign.com/wp-content/uploads/2022/04/Winning-by-Design-Blueprint-The-SPICED-Framework-7.pdf · https://www.forcemanagement.com/blog/whats-the-meaning-of-command-of-the-message · /blog/what-is-a-value-framework · https://www.spotlight.ai/post/meddicc-implementation-guide-for-enterprise-sales-teams
**Benchmarks:** https://www.bridgegroupinc.com/research/2026-ae-models-motions-metrics · /research/2025-sdr-models-metrics-report-the-bridge-group · https://blog.bridgegroupinc.com/2026-ae-compensation-quota-ai-metrics · /2024-ae-metrics-compensation-benchmark · /saas-inside-sales-metrics · /sales-development-metrics · https://benchmarks.ebsta.com/2025-gtm-benchmarks (+ chart PNGs: win-rates-1, sales-cycles, sellers-missed-quota, deal-values, velocity-delta, deals-slipped) · https://www.repvue.com/cloud-index/2025/Q3 · https://www.quotapath.com/blog/saas-sales-reps-missed-quota/ · https://www.thequota.co/articles/the-state-of-cloud-sales-quota-attainment-finally-climbs · https://venturebeat.com/technology/gong-study-sales-teams-using-ai-generate-77-more-revenue-per-rep · https://www.gradient.works/blog/2025-b2b-sales-performance-benchmarks · https://konabayev.com/blog/b2b-sales-benchmarks/ · https://jiminny.com/blog/saas-sales-benchmarks · https://www.everstage.com/sales-productivity/sales-productivity-statistics · https://www.landbase.com/blog/sales-reps-30-percent-time-selling-2026 · https://www.benchmarkit.ai/2025benchmarks
**CPQ / deal desk:** https://dealhub.io/glossary/ (discount-approval · quote-approval · pricing-approval · doa-matrix · deal-desk) · /blog/cpq/5-automated-sales-approval-workflows-to-optimize-your-sales-process-across-teams/ · https://www.pandadoc.com/docs/cpq/ · https://help.qwilr.com/article/175-getting-documents-accepted · https://www.docusign.com/products/clm · https://b2bprocess.com/deal-desk · https://www.subskribe.com/blog/what-is-deal-desk · https://milomassimo.com/Salesforce-CPQ-Creating-an-Amendment-Opportunity-and-Quote.html · https://levelshift.com/blogs/managing-subscription-products-with-salesforce-cpq · https://salesforcedictionary.com/blogs/salesforce-cpq-complete-2026-guide-revenue-cloud · https://pulserevops.com/knowledge/q12605 ⚠️ · /q12608 ⚠️
**MAPs:** https://www.dock.us/library/mutual-action-plans · /templates/mutual-action-plan · https://alignedup.com/guides/mutual-action-plan-template/ · /blog/mutual-action-plan-example/ · https://www.recapped.io/mutual-action-plans · https://www.sendtrumpet.com/blog-posts/want-to-close-more-deals-start-using-a-mutual-action-plan · https://www.flowla.com/blog/state-of-digital-sales-rooms-research · https://www.highspot.com/blog/mutual-action-plan/ · https://getbruin.com/use-cases/saas/enable-mutual-action-plan-completion/ · https://inaccord.com/blog-posts/top-9-mutual-action-plan-tools-for-sales-teams-in-2026 · https://pitcher.com/gartner-digital-sales-rooms/
**Handoffs:** https://gtmnow.com/sdr-ae-handoff/ · https://icebergops.com/sdr-to-ae-handoff/ · https://www.smarte.pro/blog/sdr-ae-handoff · https://www.default.com/post/sdr-to-ae-handoff · https://optif.ai/glossary/sdr-to-ae-handoff-sla/ ⚠️ · https://hbr.org/2011/03/the-short-life-of-online-sales-leads (paywalled) · https://ainora.lt/blog/lead-response-time-statistics-every-study-2026 · https://www.chilipiper.com/inbound-lead-conversion · /products/handoff · https://www.rocketlane.com/blogs/sales-to-customer-success-handoff · https://www.askelephant.ai/blog/sales-to-customer-success-handoff-process · /sales-to-customer-success-handoff-guide · https://www.trychaser.com/blog/sales-to-customer-success-handoff
**Hygiene / tooling:** https://www.fastslowmotion.com/salesforce-opportunity-stages-pipeline-hygiene/ · https://www.demandfarm.com/blog/salesforce-opportunity-stages-best-practices-are-you-managing-deals-or-losing-them/ · https://www.scratchpad.com/ · /dooly-replacement
**Kellblog:** https://kellblog.com/2017/05/10/how-to-train-your-vp-of-sales-to-think-about-the-forecast/ · /2021/04/29/using-to-go-coverage-to-better-understand-pipeline-and-improve-forecasting/ · /2021/04/29/use-triangulation-forecasts-for-better-conversations-about-the-forecast/
**Job postings:** (9 URLs listed inline in the JD section above)

---

**Two housekeeping notes:** (1) No files were written. (2) The `claude.ai` and `Google Drive` MCP connectors require authorization and were unavailable in this non-interactive session — authorize them via claude.ai connector settings if you want them for the write-up stage.