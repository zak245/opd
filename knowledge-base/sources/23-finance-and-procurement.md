# 23. Finance and procurement

A domain audit against the working model in `CHAINS-BRIEF.md` (H1–H5). Two domains: accounts payable with the ERP behind it, and procurement and supply chain. What the work looks like one level above screens, and what it costs when software is organised by object. No proposals.

## Note on sourcing

Everything quoted here was fetched; the bibliography lists it. **Could not fetch, so absent from the argument:** APQC measures (403); SAP Help Portal (empty body) and SAP Community (403); Reddit; Tipalti's help centre (403); BILL's help centre (TLS failure), including four sync-error articles whose titles surfaced but whose bodies I could not read and so do not quote; `docs.coupa.com`, which holds Coupa's release notes; G2, TrustRadius and Gartner Peer Insights (403). Two search engines returned CAPTCHAs and the web-search budget ran out partway through.

Review quotes were extracted by fetching the review pages; spelling is reproduced as found, and anything that came back looking paraphrased was dropped. Tiers: 1 peer-reviewed, 2 industry research with a stated method, 3 vendor documentation and dated practitioner accounts. The BPI reports sit between 1 and 2 — committee-reviewed contest submissions measuring a real transaction log rather than recalled work. Almost all changelog evidence is NetSuite's, which is fetchability rather than a judgement. NetSuite page ids are short forms of URLs in the bibliography.

---

## Domain 1: Accounts payable and the ERP

### Objects and relations

**Vendor** (bank details, tax identity, terms) · **purchase order**, a header over **lines** each with its own quantity, price and schedule · **receipt** (goods receipt, item receipt, service entry sheet) · **invoice**, also a header over lines · **GL coding lines** on the invoice · **approval**, not one object but a chain of steps each pointing at a person · **exception** (block, hold, dispute, tolerance hold) · **payment run**, a batch over selected invoices · **payment** · **credit memo** · **accounting period** · **journal entry** and **accrual**.

Three features of the relations matter more than the list itself.

*The match is set-valued, not pairwise.* The BPI log's documentation says so: "several goods receipt declarations and invoices can be recorded for individual items… This makes it difficult to compare the amounts, whose sum must match in the end" (BPI Challenge 2019 submission 7). The three-way match reconciles three *sets* whose sums must agree within a tolerance.

*Arrival order is not guaranteed.* "We observed that the activities 'Record Goods Receipt' and 'Record Invoice Receipt' can occur in any order despite the specifications in the 3-way match item-category" (KPMG Netherlands). Ninety-five per cent of that company's complete items are "3-way match, invoice before goods receipt": normally the invoice arrives before the thing it is for.

*The rule that decides a match lives elsewhere.* NetSuite has six tolerance fields on the vendor or subsidiary record (`section_1504284393`); SAP's are in a customizing transaction, OMR6. In both, the rule is on a different screen from the comparison.

### Scale, from a real log

> "comprised of 76,349 purchase documents containing 251,734 line items (cases)… a total of 1,595,923 events and 42 unique activities… This averages to 6.3 events per PO item, with the largest number of activities in a case being 990, and the smallest being 2."
> — KPMG Netherlands, BPI Challenge 2019

One multinational in coatings and paints, "some of its 60 subsidiaries", "99.85% occurring in 2018". Divided by ~250 working days (my arithmetic): about **1,000 PO line items opened and 6,400 events recorded per working day** group-wide. The log also shows how thinly the chain spreads over people: in the dominant category 179,429 items were touched by **557 distinct users**, about one item per user per working day. Most participants are not AP clerks but requesters and approvers rebuilding context each time.

### The chains

Moves from H2, shapes from H3. Each frequency says what it rests on; where I have no measurement I say so. Verbatim evidence for the cuts is gathered in the next section.

**1. Intake and re-keying.** *Read* a PDF; *verify* the vendor; *create from context*; *mutate* header fields by typing what is in front of you. **Hop, inbox into form.** Ardent: **48.6% of invoices still submitted manually** ("slightly more than half (51.4%) of all invoices are submitted electronically", 204 respondents, March–May 2025) — half of all volume. NetSuite's manual bill procedure is sixteen numbered field steps in Primary Information alone, twenty more across Expenses and Items, then four further subtabs (`article_161968486146`).

**2. The three-way match.** *Read* invoice; *traverse* to PO; *compare*; *traverse* to receipts (plural); *compare* sums; *decide*. **Fork: gather from PO and receipts, act on the invoice.** Ardent: **65.4% of invoices linked to a PO**; ~1,000 a day group-wide in the BPI log. NetSuite's route starts not from the invoice but from a list page, and "you can create bills for only one vendor at a time" (`section_N2403862`); the other documented path, Enter Vendor Bill, has no PO-matching step at all.

**3. Price variance and the block.** *Compare* fails; the machine creates a block; *communicate outward* to the buyer; *wait*; *verify*; *release*. **Relay: it leaves your hands and must return to the exact point.** Measured: "This occurs in 20% of order items (49,246 order items). For 17% of them it takes an average of 22 days between the recording of the invoice receipt and the removal of the payment block." About **200 new blocks a working day** group-wide (my division). The flag is set in a second and cleared in three weeks — in SAP, in a different transaction (MRBR), with authorization objects gating which blocking reasons a user may delete. Seeing the block and being allowed to clear it are separate rights.

**4. Quantity variance.** *Compare* invoiced quantity against the sum of receipts; *decide* part-pay, accrue or hold. Ardent's **exception rate 18.4%** (2025; 14% in 2024), Best-in-Class 11.1%, All Others 20.9% — roughly one invoice in five.

**5. Missing receipt.** Invoice exists, goods do not. *Park*; *wait*; *resume*. **Chain over time, resume trigger outside the software.** The normal case in the BPI log (95% of items); SAP gives it three transaction codes, MIRO, MIR7 and MIR4.

**6. GL coding.** *Read*; *decide* account and cost centre; *mutate* coding lines; often *communicate outward* to ask the requester what it was for; *wait*; *mutate*. **Detour across a person.** Every non-PO invoice, roughly a third of the total — and each is routed regardless: "A bill that is created without a purchase order is automatically set to have a Pending Approval status and added to the approval queue" (`section_N2376194`).

**7. Approval routing.** *Configure a rule* once; thereafter *handoff* down a chain of people who each *read*, *verify*, *decide*. **Handoff, repeated.** "The top challenge for AP this year, called out by 49% of AP executives, is the length of time it takes to approve invoices and payments" (Ardent 2025); exceptions second at 48%. Time to process one invoice **8.2 days** at **$9.84**; Best-in-Class 2.9 days / $2.65, All Others 13.5 days / $12.42. The match takes seconds; the days are waiting and re-finding. The chain's order is often an artifact of data entry — BILL: "The order in which the users are added is the sequence of approvals required" — and its rule bites at the last screen: exceeding a policy threshold means "attempting to pay the bill results in an error" (16 January 2026), while policy edits are "not retroactive", so in-flight invoices keep the old chain.

**8. Chasing approvers.** *Collect a set* of aged invoices; for each, *communicate outward*; *mutate* nothing. **Lap that changes no object.** Daily to weekly; frequency otherwise unsourced.

**9. Approving without the object.** The approver *reads* a notification, *decides*, never opens the record. Tipalti sells this: approvers "approve, update GL accounts, reroute, or dispute without logging into a separate portal". NetSuite's Employee Center step list makes seeing the bill optional: "3. Optionally, click the date of a bill to open the bill details" (`section_157528153371`). The highest-indirection move in the domain, and vendors present it as the feature.

**10. Vendor master change.** *Read* a bank-change request; *verify* out of band by phone; *mutate*; *handoff* for a second approval. **Detour whose critical move happens outside the software.**

**11. Payment run.** *Collect a set*; *verify* cash; *decide*; *execute*; *handoff* to the bank; later *verify*; the run *ripples* onto hundreds of invoices. One to five times a week; unsourced. NetSuite's run includes polling a screen — "Click **Refresh** until the value in the **File Processed?** field changes from **Queued** to **Processed**" — and ends outside the ERP, saving "a copy of the payment file to your local drive" (`section_N1666511`). Batches cap at 10 per bank record and 5,000 lines, so volume forces splitting.

**12. Supplier inquiry — "where is my payment".** *Read* an email; *traverse* to the vendor; *collect* open invoices; *traverse* each to approval state and payment; *communicate outward*. **Fork, then communicate.** Measured and enormous: "Staff time spent managing supplier inquiries 21.9%" (Ardent 2025 table; 21.8% in 2024), which the report says is "in no small part caused by exceptions".

**13. Rework.** *Unlink* a receipt or invoice; *mutate*; *re-create*. "Approximately 7.54% of complete order items (14,295 PO items) have rework activities such as the cancellation of goods and invoice receipts" — about **57 a working day** group-wide.

**14. Month-end close.** *Collect* received-but-not-invoiced items; *compute* an accrual; *create* a journal entry; *reconcile* subledger to GL; *verify*; *handoff*. **A lap of forks under a deadline, on objects about to be frozen.** Monthly, several days. NetSuite documents a sixteen-step page crawl with gating: "Icons in the **Go To Task** column provide links to individual task pages… some task actions may be inaccessible until prerequisite tasks are completed. These actions display lock icons", and "you must complete revaluation for each subsidiary… you may revisit this page multiple times" (`section_N1455781`). SAP puts the residue of failed matches in MR11, whose precondition cannot be answered from the screen: "establish that no further GRs or IRs are expected for the PO item".

**15. Audit or control sample, and the spreadsheet chain it ends in.** For each of N invoices, *collect* invoice, PO, receipts, approval trail and payment; *verify*; *export*; then *mutate* and *compare* in Excel, sometimes re-keying the conclusion back. **Lap of forks ending in a spreadsheet.** Nardi and Miller (tier 1) on why non-specialists build their own tool: "Non-programmers can be responsible for most of the development of a spreadsheet, implementing large applications that they would not undertake if they had to use conventional programming techniques" (CSCW '90).

### Where the software documentedly cuts these chains

**The reason for the exception is behind a button, and the record is frozen while you look at it.** NetSuite's three-way-match workflow runs five validation states before a human sees the bill, then "The **Bill Exception** button is enabled on the vendor bill record"; "when you click **Bill Exception**, the vendor bill enters the Show Exceptions state… all identified discrepancies are retrieved and displayed". Same page: "The record is locked for editing, when waiting for the supervisor's approval or rejection", and "If you resubmit the vendor bill, it goes through Bill Validation again and the rest of the validation states" (`section_4096454192`). The approver can see the discrepancy and cannot fix it; fixing it restarts the validation. Approval is one-way too — "After a bill is approved, the status can't later be changed to Pending Approval or Canceled" (`section_N2374450`) — and a controller names the consequence: "the process must be restart from scratch" (Capterra/Tipalti, 22 June 2026).

**The tolerance rule and the standard exceptions fight each other.** NetSuite tells administrators to "Disable the following exception fields that may conflict with tolerance checking", because otherwise "the vendor bill is routed for approval, even if it has not exceeded the quantity difference limit" (`section_4212033610`) — a documented false-positive approval hop, fixable only from Customization > Scripting > Workflows.

**Exceptions are resolved by leaving the software.** Coupa on tolerance holds: "your invoiced amount differs from the PO by more than your customer allows without manual approval", and "If an invoice has been on hold for awhile, ask your customer to review it." Correcting a submitted invoice: "Ask your customer to dispute or void the existing invoice. You can then create a new one." Voided: "Contact your customer to get the invoice back on track." (1 September 2025; 18 February 2026.)

**The approval chain cannot be seen or corrected from inside.** "You can't find a submitted request easily to see who has the next step in the approval process" (Capterra/Coupa, 14 April 2020); "you are not able to let the approver know that the request has been cancelled" (AP Specialist, Capterra/Tipalti, 6 November 2020). So the chase runs on email, and sometimes the whole approval does: "we have to export the transactions to Excel, attach them to our legacy approval form, and send them through DocuSign" (Accounting Manager, Capterra/Tipalti, 8 November 2025).

**State is lost mid-chain, in counts.** "continual adding the same piece of information several times only when you update for it to be gone and start again. Then after 5 attempts the page reloads by kicking you off" (Director, Capterra/SAP Ariba, 5 December 2022); "it often takes 4-5 tries to get them into the system" (Controller, 28 April 2025). The lap is over failed attempts at one invoice, not over invoices.

**The working set cannot be held open.** "seiten müssen immer wieder aktualisiert werden, man kann keine mehreren Tabs aufmachen" — pages must constantly be refreshed, you cannot open several tabs (Capterra/SAP Ariba, 9 January 2026). On losing what is behind you: "Alte Vorgänge kann ich nicht mehr einsehen, weil sofort die Berechtigung weg ist, wenn mein Schritt abgeschlossen ist" — old transactions become unviewable the moment my step completes (Capterra/Coupa, 11 June 2026). On a queue with no exit for a false positive: "If an invoice is listed as a duplicate and it is not, there is no easy way to get it processed anyways" (Capterra/AvidXchange, 6 May 2024). And per-screen cost against volume: "navigating between screens sometimes requires more clicks than expected… particularly when handling high volumes" (Accounts Payable, Capterra/NetSuite, 26 March 2026).

**A changelog shows the cut being bought back, then partly resold.** NetSuite's Bill Capture put document and form on one surface: "a split view with the scanned file on the left side and the potential vendor bill on the right side… Select any field on the potential vendor bill on the right, to highlight the corresponding field in the scanned file on the left" (`article_1021105256`). August 2026 withdrew part: "**Document Highlighting Tool Removed from Bill Capture.** … You may have a business process that depends on document highlighting… update that process to remove the dependency" (`article_1175030259`). The same release added a bulk action in the language of the cut it removes — payment runs process "multiple vendor payments together instead of paying each bill individually" (`section_4316106140`) — and moved payment creation into the reconciliation screen with the approval boundary exempted: "Previously, users reviewed and submitted these suggestions manually"; "Bill payments requiring approval must be created outside this workflow because pending-approval transactions can't be matched".
## Domain 2: Procurement and supply chain

### Objects and relations

**Requisition** → **purchase order** (header, line, delivery schedule) → **order confirmation** → **shipment or ASN** → **receipt** → the invoice in domain 1. Alongside: **supplier**, **contract or price agreement**, **item** with **inventory** positions, **demand**, and **exception** — here usually a machine-generated message rather than a flag on a document.

The asymmetry with AP is that much of this graph lives in another company. The confirmation, the promised date and the delay originate at the supplier and arrive by email, phone, portal, or not at all. Oracle builds a page for precisely that: "Buyers can use the Manage PO Acknowledgements page (PO_SS_POA_SEARCH) to accept and create acknowledgements for the supplier against a purchase order. For example, the supplier called a buyer with changes and the buyer wants to log them as acknowledgements" (PeopleSoft FSCM 9.2). The vendor documents the swivel chair as a feature: the supplier phones, and the buyer's job is to re-key the call.

### The chains

**1. Requisition to PO.** *Collect* approved requisitions; *compare* suppliers and prices; *link* or *mutate* supplier; *create from context*. **Lap.** Oracle: "eProcurement > Buyer Center > Expedite Requisitions", then "define requisition search criteria… click the Search button", then "you can change or add a supplier or create a PO", then a *different* page — "Staged Purchase Order page (PV_PO_REQ_CREATE)" — to "review and change the staged PO".

**2. The open-order lap.** *Collect* open PO lines; *compare* promised against need date; *decide* whether to chase. **Lap, daily.** JD Edwards shows the cost: eleven fields "to locate open detail lines", four further fields "to narrow the search", then per line "Access Order Detail Information", where the quantities "ordered… open… received, and the quantity for which vouchers have been created" finally appear. Fifteen filter fields to assemble the set; the match state visible one line at a time. Coupa has a filter that exists because the join is hard: "select 'Orders not invoiced' from the View dropdown".

**3. Chasing confirmations.** *Collect* POs awaiting acknowledgement; *communicate outward*; *wait*; *mutate* on reply. **Lap of stalls.** Oracle: "the buyer will search for POAs with an *Awaiting Acknowledgement* status." Coupa gates submission — "You can't submit until you have accepted or rejected all lines in an order" — and afterwards status is only a banner link, "Click to view confirmation" (6 October 2025).

**4. Reminder and urging runs.** SAP splits one intent — is my order confirmed, and if not, nag — across four transaction codes by document type (ME92, ME92F, ME92K, ME92L), plus ME91F for "Purchase Orders: Urging/Reminders" (third-party SAP documentation, undated; SAP's own pages were unreachable, so rank lower). The person divides this work by supplier and date; the software divides it by document class.

**5. Expediting a late line.** *Read* an exception; *traverse* to the PO line; *traverse* to the demand it covers; *communicate outward*; *mutate* the promised date; the change *ripples* into planning and to the requester, out of sight of where you acted. Frequency unsourced.

**6. Change, and its downstream cost.** *Mutate* a PO line; the approval resets; weeks later the invoice does not match. Measured: change rate **11.43%** of complete cases, and where the approval loop occurs "it is repeated approximately 32% of the time, average 2.1 times per case", producing "higher throughput times and hence increased costs" — and it is human-only: "'Change Approval for Purchase Order' is executed only by manual users." A user on the ceiling: "the system can't cope with changes to POs after they have initially been created" (Capterra/SAP Ariba, 20 June 2023). In Coupa's portal the supplier cannot change it at all: "You cannot change a price on a PO through the CSP… talk to your customer about their policies."

**7. Shortage firefight.** *Read* a shortage; *traverse* to stock and requirements; *compare* against open orders; *decide* expedite, substitute or reschedule; *communicate outward* twice, to the supplier and to whoever is waiting. **Fork under time pressure.**

**8. Receiving discrepancy.** *Compare* delivered against ordered; *decide* over-receipt, under-receipt or reject; *create* a hold. Sometimes the receipt is not visible: "Can't upload invoices or see a clients Goods received notification" (Capterra/SAP Ariba, 28 December 2022) — the third leg of the match, missing.

**9. Maverick-buy discovery.** *Read* an invoice with no PO; *verify*; *create* a retrospective PO. Measured: "approximately 56% of the purchase order items begin with the activity 'Vendor Creates Invoice'… Maverick buying constitutes a total of 2.97 million euros for this item category."

**10. Cancel a line.** The log's valid endings are "'Clear invoice' (96% of cases)" and "'Delete Purchase Order Item' (4% of cases)". One line in twenty-five ends by being deleted rather than fulfilled.

**11. Status assembly for a stakeholder.** *Fork* across PO, confirmation, shipment and receipt; *communicate outward* — AP's supplier-inquiry chain run the other way. Coupa documents three exits to email or phone for it, including "You need to contact your customer directly for information about adding a carriage line" and "Your customer can provide you with information on closed purchase orders."

**12. The export.** *Collect a set*; export; work in Excel; often send the sheet to the supplier as the agenda for a call. A procurement manager's channel comparison: "Sending a tender document to suppliers by email takes 5 min vs sending by ariba which takes anything between 5 hours to set up to 5 days depending on approval gateways", and on where the click path lives: "You literally have to memorise the series of tabs and drop down cells to run a tender" (Software Advice/SAP Ariba, July 2021).

**13–16.** Contract and price verification before issuing a PO; supplier onboarding; the periodic on-time-delivery review; and the MRP exception queue. On the last I have no fetched source and will not guess at message volumes (see "Still unknown").
### Where the software cuts these chains

By **document type** (four SAP transactions for one question). By **page** (search → list → preview → a different page to edit). By **company boundary** (the promised date arrives by phone, and the vendor ships a page for typing phone calls in). By **one line at a time** (ordered/open/received/vouchered per line, when the question is about a hundred lines). And by **status taxonomy in place of state**: Coupa's PO statuses include Buyer Hold, Currency Hold, Soft Closed and Supplier Window Hold (11 November 2025), each a waiting room whose exit is a person outside the system.

---

## The model, hypothesis by hypothesis

### H1. The work is a graph, the software is a tree — **holds, needs strengthening**

It holds, and the finance case is stronger than "graph versus tree" allows, because the graph is **many-to-many with partials**: n receipts and m invoices against one PO line, sums that must agree within a tolerance — and the BPI log's own documentation says this is what makes the amounts hard to compare. A tree of screens cannot hold that in principle.

Amendment: the tree is not only a tree of *object types*. It is also a tree of **document types** (SAP's four ME92 variants; NetSuite's two disjoint bill-entry paths, only one of which matches to a PO), of **periods** (a closed month makes a mutation illegal), of **permissions** (the Coupa user who loses sight of a transaction when their step completes), and of **organisations** (Coupa's answer to three separate buyer questions is "contact your customer").

### H2. The moves — **holds for most of the work; the list is incomplete**

Read, traverse, compare, link, mutate, create from context, collect a set, communicate outward, verify, decide, configure a rule: all eleven appear in nearly every chain above, and the mapping was easy. Where the list is too weak:

- **"Compare two things" cannot express the three-way match.** The real move is *reconcile n sets against a tolerance* — three-sided, set-valued, partial, with a configured rule deciding what counts as agreement.
- **No move for waiting.** Twenty-two days for a block; 81 days average end to end; "In 77% of the cases, there is a 44 day delay between the payment of the invoice after the invoice receipt message is recorded." *Chain over time* is a shape in H3; the move — park this, wake me when the receipt arrives — has no name, though SAP gives it three transaction codes.
- **No move for chasing.** AP chain 8 and procurement chain 3 are nothing but repeated outward communication that mutates nothing and escalates.
- **Release or unblock is not "decide".** Clearing a payment block removes a machine-set flag: overriding a rule for one case. H2 has "configure a rule that governs many objects" and nothing for "exempt this object from it" — which is what MRBR and NetSuite's Show Exceptions state are for.
- **Apportion, delegate, evidence.** Coding one invoice across many GL lines is neither mutate nor link. BILL's non-retroactive policies and Coupa's priority-50 hierarchy show the *chain* being mutated, not any object in it. And much of close and audit work produces a readable trail for a stranger rather than any change to an object.

### H3. The chain shapes — **holds, with three additions**

Hop, lap, fork, detour, ripple, chain over time and handoff all appear repeatedly. Three recurring shapes are unnamed:

- **The queue.** The exception list, the blocked-invoice list, the awaiting-acknowledgement list. It resembles a lap, but the set is machine-generated, shared with colleagues, and not of the person's making. Its failure mode is contention, re-triage, and false positives with no exit.
- **The stall.** A chain over time whose resume trigger is another person's *silence*: nothing arrives, and the person must notice an absence. This is the shape behind the 49% who name approval latency as their top problem.
- **The relay.** A handoff that must come back. A detour stays in your hands; a handoff leaves them for good; a price-variance query leaves your hands and must return to the exact point weeks later. The 22-day block clearance is an unassisted relay return.

### H4. Indirection is the cost — **holds, needs two more dimensions**

Predictive power is good: the costliest moves have the greatest distance between reason and act. Approving from an email, where NetSuite marks opening the object as "optional". Clearing a block three weeks later in a different transaction. Reading a discrepancy through a button that leaves the record "locked for editing". Two dimensions to add to Beaudouin-Lafon's spatial and temporal ones:

- **Organisational distance.** The object belongs to another company and the only channel is email or a portal — 21.9% of AP staff time.
- **Authority distance.** The person can see the object and may not act on it: SAP's authorization objects on blocking reasons, segregation of duties, approval thresholds, a closed period. Indirection theory assumes the obstacle is distance; here it is permission, and the cost is a handoff rather than a hop.

The temporal dimension also needs taking more seriously than "latency": these costs are days and weeks, not the 100 ms / 1 s / 10 s bands. A 22-day gap does not slow a chain; it destroys the working set and forces a full reconstruction.

### H5. The properties of perfect — **mostly holds; two need qualifying, one is missing**

Cost proportional to cognitive weight; the working set stays visible; reason and act on one surface; effects appear where the cause was; a detour returns to the exact point; no move destroys state the chain still needs — every one is violated above. The strongest confirmation is a vendor building a property then removing it: Bill Capture's split view with cross-highlighting is "reason and act on one surface" implemented, and the August 2026 removal note concedes customers had built process on it.

Two qualifications. **"No move destroys state the chain still needs"**: some destruction is required by control — changing a PO *must* invalidate its approval, and the 2.1-times-per-case re-approval loop is the control working. The property should separate state destroyed incidentally from state destroyed by design, asking only that the second be legible and resumable. **"No modes"**: the accounting period is a mode enforced by law, and NetSuite's lock icons exist to express one; the testable version is that a person must see which mode they are in before acting, not after.

One property the domain demands and H5 does not state: **the chain's cost should land where it is caused.** AP absorbs procurement's errors — a wrong price on a PO line becomes a blocked invoice in someone else's queue three weeks later — and nothing shows the buyer the downstream cost of the change they just made.
## Outside the model

1. **Irreversibility with money attached.** A payment leaves the building; verification here is expensive by design, not a cheap move.
2. **Segregation of duties.** Some moves must be done by a *different* person for control reasons. The model treats handoff as a cost; here it is a requirement, and a chain that could be one person's is deliberately cut.
3. **The period as a container.** Objects freeze at the close; a mutation legal yesterday is illegal today.
4. **Tolerances and single-case exemption.** A machine rule decides whether a comparison counts as a match; the human work is releasing one item despite the rule, and recording why.
5. **The counterparty.** Half of each procurement chain runs inside another company at a different tempo, with no shared object, and the documented resolution for several exceptions is "ask your customer".
6. **Aging as an attribute.** An invoice becomes more expensive to leave alone: discount lost, late fee, supplier goodwill.
7. **Silence as a state.** Nothing arriving is the signal; the software represents events, not absences.
8. **Batch atomicity.** A payment run acts on hundreds of objects at once; "collect a set" then "mutate" says nothing about partial failure.
9. **Occasional participants.** 557 users over 179,429 items. The model assumes a practitioner who knows the software; most people in an approval chain do not, and one has to "memorise the series of tabs and drop down cells".
10. **A status taxonomy standing in for state.** Tolerance Hold, Buyer Hold, Currency Hold, Soft Closed, Supplier Window Hold, Disputed, Abandoned, Voided — each a waiting room with its own exit.

---

## Still unknown

- **Touches or clicks per invoice.** APQC returned 403 and IOFM is behind membership. I have cost and days per invoice but no click count, so no per-screen cost of the kind the clinical click-burden literature provides — and I found no AP or procurement equivalent of that literature. The largest gap here.
- **Invoices per AP FTE per day**, and **days to close** (APQC, not fetched).
- **Dated forum accounts.** Reddit and SAP Community were unreachable, and the quantified practitioner detail I wanted — tabs open, invoices keyed per hour, reminder emails per week — lives there.
- **Vendor changelogs other than NetSuite's**, and BILL's four sync-error articles.
- **MRP exception message volumes per planner per day**, and what share planners ignore.
- **Number of approvers per invoice**, and any measured comparison of error rates between approving from an email and approving in context.
- Whether the BPI company's 22-day block clearance is typical. One company, one year, one industry.

---

## Bibliography

**Tier 1.** Nardi, B. A. and Miller, J. R. "An Ethnographic Study of Distributed Problem Solving in Spreadsheet Development." *CSCW '90 Proceedings*, October 1990. http://darrouzet-nardi.net/bonnie/pdf/Nardi_spreadsheet.pdf

**Tier 2 (measured, stated method).**

- KPMG Netherlands. "Dissecting the Purchase-to-Pay Process." BPI Challenge 2019, ICPM 2019. https://icpmconference.org/wp-content/uploads/BPI-Challenge-Submission-3.pdf — 76,349 purchase documents, 251,734 line items, 1,595,923 events, one multinational, data overwhelmingly 2018.
- BPI Challenge 2019 submission 7. https://icpmconference.org/wp-content/uploads/BPI-Challenge-Submission-7.pdf
- IEEE Task Force on Process Mining, BPI Challenge 2019 dataset description. https://www.tf-pm.org/competitions-awards/bpi-challenge/2019
- Ardent Partners. *The State of ePayables 2025*. 204 AP and finance leaders surveyed March–May 2025; 47% AP, 20% procurement; 54% above $1bn revenue; 58% North America; 24+ industries, none above 12%. https://d15fjz85703yz4.cloudfront.net/1517/5157/1685/Ardent_Partners_-_State_of_ePayables_2025_-_Bottomline_-_FINAL.pdf
- Ardent Partners. *Accounts Payable Metrics that Matter in 2025* (2024 data: 9.2 days, $9.40, 14% exceptions, 32.6% touchless, 21.8% of staff time on inquiries). https://www.datocms-assets.com/80283/1744404602-ardent-partners-ap-metrics-that-matter-in-2025-pagero-final.pdf

**Tier 3 — vendor documentation.** NetSuite pages are under `https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/` and carry no date; ids cited above are `section_1504284393`, `section_N2403862`, `article_161968486146`, `section_N2374450`, `section_157528153371`, `section_4096454192`, `section_4212033610`, `section_N2376194`, `section_N1665332`, `section_N1666511`, `section_N1455781`, `article_1021105256`, plus the 2026.2 release notes (August 2026) `article_1175030259` and `section_4316106140`.

- SAP Learning, *Invoice Verification in SAP S/4HANA* — https://learning.sap.com/courses/invoice-verification-in-sap-s-4hana (lessons on MRBR, tolerance keys/OMR6, GR/IR maintenance/MR11, parking/MIR7 and MIR4).
- Coupa, under https://compass.coupa.com/en-us/products/product-documentation/ — invoices FAQ / Tolerance Hold (1 Sep 2025); view and manage invoices (18 Feb 2026); create or edit an invoice (19 Jan 2026); view invoice lines (22 Oct 2025); view and manage POs (11 Nov 2025); PO collaboration with buyers (6 Oct 2025); orders FAQ (28 Mar 2025); approval chain import.
- BILL — https://www.bill.com/product/payment-approvals; developer docs (16 Jan 2026) https://developer.bill.com/v2/docs/bill-approval-workflows
- Tipalti invoice flow (product page, undated) — https://tipalti.com/ap-automation/invoice-management/invoice-flow/
- Oracle PeopleSoft FSCM 9.2 https://docs.oracle.com/cd/G47724_01/fscm92pbr55/eng/fscm/sesp/RespondingonBehalfoftheSupplierBuyers-9f1a81.html · eProcurement 9.2 https://docs.oracle.com/cd/F96358_01/fscm92pbr51/eng/fscm/sepv/ExpeditingRequisitions-9f1911.html · JD Edwards EnterpriseOne 9.4 https://docs.oracle.com/cd/E59116_01/doc.94/e58762/ww_purch_ord_info.htm
- erplingo (third-party, undated; used only for the SAP transaction-code list) — https://www.erplingo.com/sap-transaction-code/en/ME92F

**Tier 3 — dated practitioner reviews**, each quoted above with role and date. Capterra (https://www.capterra.com): SAP Ariba `/p/227334`, Coupa `/p/115928`, NetSuite `/p/135757`, Tipalti `/p/236980`, Stampli `/p/147301`, AvidXchange `/p/144102`, each with `/reviews/`. Software Advice: https://www.softwareadvice.com/ca/ecommerce/sap-ariba-profile/reviews/

**Second-hand, ranked low.** Stampli (undated blog page) — cited only for APQC's four-day median receipt-to-approval time, Stampli/Probolski Research 2023 (67.7% under one week), and a 2021 Stampli survey of 282 finance leaders. https://www.stampli.com/blog/accounts-payable/handling-slow-internal-invoice-approvals/

**Attempted and not fetched:** as listed under "Note on sourcing".
