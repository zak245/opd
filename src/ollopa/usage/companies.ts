import type { UsageItem } from "./model"

// Companies: the accounts table and the light company record. Baseline numbers describe Meridian Software.
// Roles that see the page: SDR, AE, CS, admin (nav.ts). The marketer has no access and gets the no-access page.
// A column counts as "touched" when the role reads it to decide something or sorts by it in a typical week.
// Fathom overrides: only "sdr" and "admin" exist; the admin is a founder doing outbound, so prospecting items are high.
// Halyard overrides: ten client workspaces; lists arrive from clients, views and the in-sequence column are daily.
// Ridgeline overrides: product-led, almost no outbound; finding new companies is rare, current-client work is high.
// A record has two levels: the quick-look drawer (co.act.quick-look) and the full record page (co.act.open); the drawer
// shows the same fields in the same order as the top of the page, and nothing collapses inside it.
// A company and an account are one object with a customer state (PLAN.md, 15 Sep 2026), so the record's header, its
// sections and its side cards switch on Company.stage: the customer-state items below are rendered here and owned by
// specs/09 section 6.8 and specs/11 section 3. Behind the sections sit the eight doors specs/09 section 6.8 names, one
// of which is the Enrichment drawer (D-co-enrich in IA-MAP 2.4).
// Destructive actions carry critical: true: they live in the always-visible row menu with their consequence in the label.

export const companiesItems: UsageItem[] = [
  // Search and filters
  { id: "co.search", page: "companies", area: "Search and filters", label: "Search by company, domain or a contact's name", weekly: { sdr: 90, ae: 60, cs: 70, admin: 30 }, overrides: { fathom: { admin: 80 }, ridgeline: { sdr: 60 } }, note: "Searching a person's name finds the company that holds them; the table is about the contacts held at each account." },
  { id: "co.filter.stage", page: "companies", area: "Search and filters", label: "Stage filter", weekly: { sdr: 55, ae: 30, cs: 60, admin: 15 }, overrides: { fathom: { admin: 45 } } },
  { id: "co.filter.industry", page: "companies", area: "Search and filters", label: "Industry filter", weekly: { sdr: 40, ae: 10, cs: 8, admin: 8 }, overrides: { fathom: { admin: 35 }, ridgeline: { sdr: 12 } } },
  { id: "co.filter.owner", page: "companies", area: "Search and filters", label: "Owner filter", weekly: { sdr: 15, ae: 25, cs: 18, admin: 20 }, overrides: { fathom: { sdr: 3, admin: 3 } }, note: "At Fathom three people share 640 companies; nobody filters by owner." },
  { id: "co.filter.employees", page: "companies", area: "Search and filters", label: "Employees filter", weekly: { sdr: 25, ae: 6, cs: 4, admin: 4 }, overrides: { fathom: { admin: 25 }, ridgeline: { sdr: 6 } } },
  { id: "co.filter.location", page: "companies", area: "Search and filters", label: "Location filter", weekly: { sdr: 8, ae: 4, cs: 3, admin: 3 }, overrides: { halyard: { sdr: 25 } }, note: "Halyard's clients buy by region; the specialist filters by country every day." },
  { id: "co.filter.last-activity", page: "companies", area: "Search and filters", label: "Last activity filter", weekly: { sdr: 8, ae: 6, cs: 18, admin: 4 }, overrides: { ridgeline: { cs: 30 } }, note: "Ridgeline CS looks for clients that have gone quiet." },
  { id: "co.filter.list", page: "companies", area: "Search and filters", label: "In list filter", weekly: { sdr: 8, ae: 3, cs: 4, admin: 3 }, overrides: { halyard: { sdr: 18 } } },
  { id: "co.filter.signals", page: "companies", area: "Search and filters", label: "Signals filter (hiring, funding, intent)", weekly: { sdr: 12, ae: 4, cs: 3, admin: 2 }, overrides: { fathom: { sdr: 25, admin: 22 }, ridgeline: { cs: 12 } } },
  { id: "co.filter.in-sequence", page: "companies", area: "Search and filters", label: "Has contacts in a sequence filter", weekly: { sdr: 10, ae: 3, cs: 1, admin: 2 }, overrides: { halyard: { sdr: 22 }, ridgeline: { sdr: 1 } } },
  { id: "co.filter.open-deals", page: "companies", area: "Search and filters", label: "Has open deals filter", weekly: { sdr: 4, ae: 15, cs: 12, admin: 3 } },
  { id: "co.filter.technology", page: "companies", area: "Search and filters", label: "Technology filter", weekly: { sdr: 3, ae: 1, cs: 1, admin: 1 } },
  { id: "co.filter.funding", page: "companies", area: "Search and filters", label: "Funding filter", weekly: { sdr: 4, ae: 2, cs: 1, admin: 1 }, overrides: { fathom: { sdr: 12, admin: 10 } } },
  { id: "co.filter.revenue", page: "companies", area: "Search and filters", label: "Revenue filter", weekly: { sdr: 4, ae: 3, cs: 1, admin: 1 } },
  { id: "co.filter.founded", page: "companies", area: "Search and filters", label: "Founded year filter", weekly: { sdr: 2, ae: 1, cs: 0.5, admin: 0.5 } },
  { id: "co.filter.keywords", page: "companies", area: "Search and filters", label: "Keywords filter", weekly: { sdr: 4, ae: 1, cs: 1, admin: 1 } },
  { id: "co.filter.parent", page: "companies", area: "Search and filters", label: "Parent company filter", weekly: { sdr: 1, ae: 2, cs: 3, admin: 2 } },
  { id: "co.filter.custom", page: "companies", area: "Search and filters", label: "Custom field filter", weekly: { sdr: 3, ae: 3, cs: 4, admin: 6 } },
  { id: "co.filter.source", page: "companies", area: "Search and filters", label: "Source filter (found, imported, CRM)", weekly: { sdr: 2, ae: 1, cs: 1, admin: 6 }, overrides: { halyard: { admin: 15 } } },
  { id: "co.filter.added", page: "companies", area: "Search and filters", label: "Added on filter", weekly: { sdr: 3, ae: 1, cs: 1, admin: 5 } },

  // Columns
  { id: "co.col.company", page: "companies", area: "Columns", label: "Company and domain", weekly: { sdr: 95, ae: 60, cs: 75, admin: 30 }, overrides: { fathom: { admin: 80 } } },
  { id: "co.col.contacts", page: "companies", area: "Columns", label: "Contacts held", weekly: { sdr: 80, ae: 40, cs: 50, admin: 20 }, overrides: { fathom: { admin: 70 } }, note: "The reason the page exists: how many people we hold at each account." },
  { id: "co.col.stage", page: "companies", area: "Columns", label: "Stage", weekly: { sdr: 70, ae: 45, cs: 70, admin: 20 }, overrides: { fathom: { admin: 60 } } },
  { id: "co.col.last-activity", page: "companies", area: "Columns", label: "Last activity", weekly: { sdr: 60, ae: 40, cs: 65, admin: 15 }, overrides: { fathom: { admin: 50 } } },
  { id: "co.col.industry", page: "companies", area: "Columns", label: "Industry", weekly: { sdr: 25, ae: 8, cs: 10, admin: 8 }, overrides: { fathom: { admin: 25 }, ridgeline: { sdr: 10 } } },
  { id: "co.col.employees", page: "companies", area: "Columns", label: "Employees", weekly: { sdr: 18, ae: 12, cs: 8, admin: 6 }, overrides: { fathom: { admin: 18 } }, note: "Filtered on more than read; once the filter is set the column is rarely consulted." },
  { id: "co.col.owner", page: "companies", area: "Columns", label: "Owner", weekly: { sdr: 25, ae: 30, cs: 30, admin: 25 }, overrides: { fathom: { sdr: 4, admin: 4 } } },
  { id: "co.col.in-sequence", page: "companies", area: "Columns", label: "Contacts in a sequence", weekly: { sdr: 35, ae: 8, cs: 3, admin: 5 }, overrides: { halyard: { sdr: 50, admin: 25 }, ridgeline: { sdr: 3, admin: 1 }, fathom: { admin: 30 } } },
  { id: "co.col.open-deals", page: "companies", area: "Columns", label: "Open deals", weekly: { sdr: 8, ae: 30, cs: 25, admin: 6 }, overrides: { fathom: { sdr: 15, admin: 22 } } },
  { id: "co.col.last-reply", page: "companies", area: "Columns", label: "Last reply", weekly: { sdr: 15, ae: 8, cs: 6, admin: 2 }, overrides: { halyard: { sdr: 22 } } },
  { id: "co.col.location", page: "companies", area: "Columns", label: "Location", weekly: { sdr: 6, ae: 5, cs: 5, admin: 3 }, overrides: { halyard: { sdr: 22 } } },
  { id: "co.col.signals", page: "companies", area: "Columns", label: "Signals", weekly: { sdr: 8, ae: 4, cs: 4, admin: 2 }, overrides: { fathom: { sdr: 20, admin: 18 }, ridgeline: { cs: 15 } } },
  { id: "co.col.score", page: "companies", area: "Columns", label: "Fit score", weekly: { sdr: 5, ae: 3, cs: 2, admin: 2 }, overrides: { fathom: { sdr: 15, admin: 12 } } },
  { id: "co.col.parent", page: "companies", area: "Columns", label: "Parent company", weekly: { sdr: 1, ae: 3, cs: 4, admin: 2 } },
  { id: "co.col.added", page: "companies", area: "Columns", label: "Added on", weekly: { sdr: 3, ae: 2, cs: 2, admin: 8 } },
  { id: "co.col.source", page: "companies", area: "Columns", label: "Source", weekly: { sdr: 2, ae: 1, cs: 1, admin: 8 }, overrides: { halyard: { admin: 15 } } },
  { id: "co.col.revenue", page: "companies", area: "Columns", label: "Revenue", weekly: { sdr: 3, ae: 3, cs: 1, admin: 1 } },
  { id: "co.col.founded", page: "companies", area: "Columns", label: "Founded", weekly: { sdr: 1, ae: 0.5, cs: 0.5, admin: 0.5 } },
  { id: "co.col.phone", page: "companies", area: "Columns", label: "Company phone", weekly: { sdr: 3, ae: 2, cs: 3, admin: 1 } },
  { id: "co.col.enriched", page: "companies", area: "Columns", label: "Enriched on", weekly: { sdr: 2, ae: 1, cs: 1, admin: 5 } },

  // Row and bulk actions
  { id: "co.act.find-people", page: "companies", area: "Row and bulk actions", label: "Find people at this company", weekly: { sdr: 85, ae: 30, cs: 20, admin: 10 }, overrides: { fathom: { admin: 65 }, ridgeline: { sdr: 30, cs: 10 } }, note: "The main move on this page: from the account to the people at it." },
  { id: "co.act.quick-look", page: "companies", area: "Row and bulk actions", label: "Quick look: the drawer beside the table", weekly: { sdr: 55, ae: 30, cs: 45, admin: 12 }, overrides: { fathom: { admin: 45 }, halyard: { sdr: 65 }, ridgeline: { cs: 55 } }, note: "Level one of the record: a flat drawer holding the header fields and the contacts held, the table still in view. Scanning a filtered set is the SDR's and the CS's daily move (PLAN, 14 Sep 2026)." },
  { id: "co.act.open", page: "companies", area: "Row and bulk actions", label: "Open the full company record", weekly: { sdr: 35, ae: 45, cs: 55, admin: 20 }, overrides: { fathom: { admin: 40 } }, note: "Level two of the record: the page, from the shared record template. The drawer took the glances; what is left is the dwelling visit." },
  { id: "co.act.add-list", page: "companies", area: "Row and bulk actions", label: "Add to list", weekly: { sdr: 50, ae: 10, cs: 12, admin: 6 }, overrides: { fathom: { admin: 40 }, ridgeline: { sdr: 15 }, halyard: { sdr: 60, admin: 20 } } },
  { id: "co.act.research", page: "companies", area: "Row and bulk actions", label: "Research with the agent, credit cost shown", critical: true, weekly: { sdr: 30, ae: 10, cs: 8, admin: 8 }, overrides: { fathom: { sdr: 50, admin: 40 } }, note: "Spends credits, so the cost is on the control itself (rule 7)." },
  { id: "co.act.select", page: "companies", area: "Row and bulk actions", label: "Select rows and the bulk bar", weekly: { sdr: 40, ae: 10, cs: 15, admin: 15 }, overrides: { ridgeline: { sdr: 10 }, fathom: { admin: 30 } } },
  { id: "co.act.stage", page: "companies", area: "Row and bulk actions", label: "Change stage", weekly: { sdr: 12, ae: 20, cs: 25, admin: 6 } },
  { id: "co.act.owner", page: "companies", area: "Row and bulk actions", label: "Change owner", weekly: { sdr: 5, ae: 6, cs: 10, admin: 25 }, overrides: { fathom: { sdr: 0, admin: 2 } } },
  { id: "co.act.edit", page: "companies", area: "Row and bulk actions", label: "Edit company", weekly: { sdr: 4, ae: 5, cs: 8, admin: 10 } },
  { id: "co.act.push-crm", page: "companies", area: "Row and bulk actions", label: "Push to CRM, with what it overwrites", weekly: { sdr: 5, ae: 12, cs: 5, admin: 15 }, overrides: { fathom: { sdr: 0, admin: 0 } }, note: "Removed, not disabled, when no CRM is connected (rule 4). Fathom has none." },
  { id: "co.act.export", page: "companies", area: "Row and bulk actions", label: "Export CSV", weekly: { sdr: 4, ae: 3, cs: 8, admin: 15 }, overrides: { halyard: { admin: 30 } } },
  { id: "co.act.remove", page: "companies", area: "Row and bulk actions", label: "Remove from workspace, with what it stops", critical: true, weekly: { sdr: 3, ae: 1, cs: 2, admin: 4 }, note: "The consequence (lists left, sequences stopped) is on the control and the undo is one click (rule 7)." },
  { id: "co.act.merge", page: "companies", area: "Row and bulk actions", label: "Merge duplicates", weekly: { sdr: 1, ae: 1, cs: 1, admin: 5 } },
  { id: "co.act.flag", page: "companies", area: "Row and bulk actions", label: "Flag data as wrong", weekly: { sdr: 2, ae: 1, cs: 1, admin: 1 } },

  // Page actions
  { id: "co.page.find", page: "companies", area: "Page actions", label: "Find companies in the database", weekly: { sdr: 70, ae: 15, cs: 3, admin: 10 }, overrides: { fathom: { admin: 55 }, halyard: { sdr: 75, admin: 30 }, ridgeline: { sdr: 10, admin: 3 } } },
  { id: "co.find.exclude-owned", page: "companies", area: "Page actions", label: "Exclude companies I already own, with the count it removes", critical: true, weekly: { sdr: 55, ae: 12, cs: 2, admin: 10 }, overrides: { fathom: { admin: 45 }, halyard: { sdr: 60, admin: 25 }, ridgeline: { sdr: 8 } }, note: "On by default for the SDR and level one in the Find companies drawer. Buying a company you already own is a charge for a mistake the product could have named, so the exclusion and the count it removes sit above the database filters (rule 7)." },
  { id: "co.find.exclude-in-sequence", page: "companies", area: "Page actions", label: "Exclude companies with a contact in a sequence, with the count it removes", critical: true, weekly: { sdr: 50, ae: 10, cs: 2, admin: 8 }, overrides: { fathom: { admin: 40 }, halyard: { sdr: 55, admin: 22 }, ridgeline: { sdr: 6 } }, note: "Same argument, and the one that stops two reps working the same account in the same week. Removed, not disabled, for a seat that owns nothing." },
  { id: "co.page.import", page: "companies", area: "Page actions", label: "Import a CSV (opens the import wizard page)", weekly: { sdr: 5, ae: 2, cs: 3, admin: 12 }, overrides: { halyard: { admin: 35, sdr: 15 } }, note: "Every new Halyard client arrives with a spreadsheet. The entry point is here; the wizard itself is a page with its own steps and its own job record (spec 18), not a drawer on this one." },
  { id: "co.page.views", page: "companies", area: "Page actions", label: "Saved views", weekly: { sdr: 18, ae: 12, cs: 25, admin: 8 }, overrides: { halyard: { sdr: 45, admin: 25 } }, note: "Most people set one default view and stay in it; Halyard keeps one per client." },
  { id: "co.page.sort", page: "companies", area: "Page actions", label: "Sort by a column", weekly: { sdr: 12, ae: 20, cs: 18, admin: 10 } },
  { id: "co.page.columns", page: "companies", area: "Page actions", label: "Choose columns", weekly: { sdr: 4, ae: 4, cs: 6, admin: 6 } },
  { id: "co.page.alert", page: "companies", area: "Page actions", label: "Alert me when a view gains companies", weekly: { sdr: 4, ae: 1, cs: 2, admin: 1 } },
  { id: "co.page.palette", page: "companies", area: "Page actions", label: "Command palette and shortcuts", weekly: { sdr: 15, ae: 10, cs: 8, admin: 10 }, overrides: { halyard: { sdr: 30 } } },

  // Company record
  { id: "rec.header", page: "companies", area: "Company record", label: "Name, domain, stage, owner, last activity", weekly: { sdr: 60, ae: 50, cs: 70, admin: 20 }, overrides: { fathom: { admin: 50 } } },
  { id: "rec.contacts", page: "companies", area: "Company record", label: "Contacts at this company", weekly: { sdr: 60, ae: 45, cs: 65, admin: 15 }, overrides: { fathom: { admin: 50 } } },
  { id: "rec.activity", page: "companies", area: "Company record", label: "Recent activity, last five", weekly: { sdr: 40, ae: 40, cs: 60, admin: 10 }, overrides: { fathom: { admin: 35 } } },
  { id: "rec.deals", page: "companies", area: "Company record", label: "Open deals", weekly: { sdr: 15, ae: 50, cs: 45, admin: 10 }, overrides: { fathom: { sdr: 25, admin: 30 } } },
  { id: "rec.in-sequence", page: "companies", area: "Company record", label: "Contacts in sequences here", weekly: { sdr: 25, ae: 6, cs: 2, admin: 3 }, overrides: { halyard: { sdr: 45 }, ridgeline: { sdr: 3 }, fathom: { admin: 25 } } },
  { id: "rec.notes", page: "companies", area: "Company record", label: "Notes", weekly: { sdr: 8, ae: 20, cs: 30, admin: 3 } },
  { id: "rec.tasks", page: "companies", area: "Company record", label: "Open tasks here", weekly: { sdr: 12, ae: 18, cs: 18, admin: 3 }, note: "Tasks are worked from the Tasks page; here they are context." },

  // The customer state: header fields and sections that appear when Company.stage is Current client or Churned,
  // and disappear again when it is not (specs/03 section 6; defined in specs/09 section 6.8, described in specs/11 section 3).
  // This page renders them and adds nothing of its own. Ridgeline is product-led, so its CS and its expansion AE
  // live on this block; the Meridian SDR almost never opens a current client, and Halyard's clients are workspaces,
  // not accounts, so the agency's ops lead reads almost none of it.
  { id: "rec.health", page: "companies", area: "Company record", label: "Health score with its band and 30-day change", weekly: { sdr: 2, ae: 18, cs: 45, admin: 8 }, overrides: { ridgeline: { cs: 60, ae: 40 }, fathom: { admin: 20 }, halyard: { admin: 2 } }, note: "A header field, not a door: the customer-state header switches on the stage and the score never sits behind anything." },
  { id: "rec.health-drivers", page: "companies", area: "Company record", label: "Health drivers: the four numbers that sum to the score, read directly under it", weekly: { sdr: 1, ae: 8, cs: 25, admin: 5 }, overrides: { ridgeline: { cs: 45, ae: 20 }, fathom: { admin: 10 }, halyard: { admin: 1 } }, note: "A section directly under the health field and flat lines in the quick look, never a door: a score always travels with its reasons (rule 5). The number describes how often the block is read, not where it lives." },
  { id: "rec.renewal", page: "companies", area: "Company record", label: "Renewal terms: date, days left and contract value", critical: true, weekly: { sdr: 1, ae: 20, cs: 40, admin: 10 }, overrides: { ridgeline: { cs: 25, ae: 25 }, fathom: { admin: 18 }, halyard: { admin: 2 } }, note: "A commitment date and the money attached to it: decision-critical, so it is level one whatever the usage (rule 7)." },
  { id: "rec.next-step", page: "companies", area: "Company record", label: "Next step with its date", weekly: { sdr: 2, ae: 18, cs: 40, admin: 5 }, overrides: { ridgeline: { cs: 40, ae: 30 }, fathom: { admin: 12 }, halyard: { admin: 1 } }, note: "The one editable field in the customer-state quick look, which is why the record carries it in the same place with the same label." },
  { id: "rec.risks", page: "companies", area: "Company record", label: "Open risks", critical: true, weekly: { sdr: 1, ae: 12, cs: 35, admin: 6 }, overrides: { ridgeline: { cs: 45, ae: 25 }, fathom: { admin: 12 }, halyard: { admin: 2 } }, note: "Safety state for the account (rule 7)." },
  { id: "rec.first-value", page: "companies", area: "Company record", label: "First value and the goals agreed at the start", weekly: { sdr: 0.5, ae: 5, cs: 22, admin: 3 }, overrides: { ridgeline: { cs: 18, ae: 8 }, fathom: { admin: 6 }, halyard: { admin: 0.5 } }, note: "Kept as one section because a business review has nothing to measure against without both (rule 5)." },
  { id: "rec.expansion", page: "companies", area: "Company record", label: "Expansion signals", weekly: { sdr: 2, ae: 12, cs: 15, admin: 3 }, overrides: { ridgeline: { cs: 40, ae: 45 }, fathom: { admin: 8 }, halyard: { admin: 1 } }, note: "At Meridian expansion is the AE's job and arrives monthly; at Ridgeline it is the daily read for both seats." },
  { id: "rec.handoff", page: "companies", area: "Company record", label: "The hand-off brief: why they bought and what was promised", weekly: { sdr: 0.5, ae: 10, cs: 18, admin: 2 }, overrides: { ridgeline: { cs: 12, ae: 15 }, fathom: { admin: 0 }, halyard: { admin: 0 } }, note: "Removed, not emptied, where nobody hands off: Fathom has no AE to hand over from and Halyard's clients are workspaces." },
  { id: "rec.touches", page: "companies", area: "Company record", label: "Touches: the logged calls, emails and meetings with this customer", weekly: { sdr: 3, ae: 12, cs: 30, admin: 3 }, overrides: { ridgeline: { cs: 18, ae: 12 }, fathom: { admin: 8 }, halyard: { admin: 1 } } },
  { id: "rec.usage-90", page: "companies", area: "Company record", label: "Usage over 90 days", weekly: { sdr: 0.5, ae: 5, cs: 15, admin: 2 }, overrides: { ridgeline: { cs: 35, ae: 25 }, fathom: { admin: 4 }, halyard: { admin: 0.5 } }, note: "Product-led Ridgeline reads the curve before anything else; at Meridian it is read when a score has moved." },
  { id: "rec.seats", page: "companies", area: "Company record", label: "Seats and last sign-in", weekly: { sdr: 0.5, ae: 4, cs: 12, admin: 2 }, overrides: { ridgeline: { cs: 18, ae: 20 }, fathom: { admin: 3 }, halyard: { admin: 0.5 } }, note: "Ridgeline sells by the seat, so utilisation is the expansion trigger; Meridian sells annual blocks and reads it quarterly." },

  { id: "rec.research", page: "companies", area: "Company record", label: "Agent research: runs, each with agent, date, sources and cost", weekly: { sdr: 18, ae: 10, cs: 6, admin: 6 }, overrides: { fathom: { sdr: 45, admin: 40 } }, note: "The provenance line is words, not an icon: which agent, when, how many sources, how many credits." },
  { id: "rec.brief", page: "companies", area: "Company record", label: "Open the brief from the latest run", weekly: { sdr: 25, ae: 15, cs: 5, admin: 8 }, overrides: { fathom: { sdr: 50, admin: 45 }, ridgeline: { sdr: 10, ae: 20 } }, note: "A record page with no doors, built from the template in spec 09 §6.8. Every generated line carries its source link, and the run cost is on the record rather than in a billing screen." },
  { id: "rec.brief.again", page: "companies", area: "Company record", label: "Research again · 12 credits", critical: true, weekly: { sdr: 12, ae: 6, cs: 3, admin: 5 }, overrides: { fathom: { sdr: 30, admin: 25 } }, note: "Prices itself before the click, like every other control that spends (rule 7)." },
  { id: "rec.details", page: "companies", area: "Company record", label: "Company details: industry, size, location, founded, description", weekly: { sdr: 18, ae: 15, cs: 12, admin: 8 }, overrides: { fathom: { admin: 20 } } },

  // The eight record doors specs/09 section 6.8 names, in the order that spec lists them. Similar companies was removed
  // rather than kept as a door onto a guess, and Locations with it. Custom fields, full history and files are ONE door,
  // "Full history, custom fields and files", and the three items below are the three things a person opens it for —
  // the usage model counts them one at a time, which is why the door is one node and three rows.
  { id: "rec.all-activity", page: "companies", area: "Company record", label: "All activity", weekly: { sdr: 10, ae: 15, cs: 18, admin: 4 } },
  { id: "rec.signals", page: "companies", area: "Company record", label: "Signals and news", weekly: { sdr: 8, ae: 6, cs: 8, admin: 2 }, overrides: { fathom: { sdr: 18, admin: 15 }, ridgeline: { cs: 15 } } },
  { id: "rec.crm", page: "companies", area: "Company record", label: "CRM sync status and last error", weekly: { sdr: 4, ae: 8, cs: 6, admin: 20 }, overrides: { fathom: { sdr: 0, admin: 0 } }, note: "Removed when no CRM is connected." },
  { id: "rec.hierarchy", page: "companies", area: "Company record", label: "Parent and subsidiaries", weekly: { sdr: 1, ae: 3, cs: 4, admin: 2 } },
  { id: "rec.fields", page: "companies", area: "Company record", label: "Full history, custom fields and files: custom fields", weekly: { sdr: 3, ae: 5, cs: 8, admin: 10 } },
  { id: "rec.files", page: "companies", area: "Company record", label: "Full history, custom fields and files: files", weekly: { sdr: 1, ae: 4, cs: 5, admin: 1 } },
  { id: "rec.lists", page: "companies", area: "Company record", label: "Full history, custom fields and files: lists this company is in", weekly: { sdr: 4, ae: 3, cs: 5, admin: 3 }, overrides: { halyard: { sdr: 15 } }, note: "List membership is read from the same door as the history and the fields; Halyard's specialist checks which client list an account arrived on." },
  { id: "rec.enrich", page: "companies", area: "Company record", label: "Enrichment: each field, where it came from and when", weekly: { sdr: 6, ae: 4, cs: 3, admin: 15 }, overrides: { fathom: { sdr: 12, admin: 12 }, halyard: { admin: 20 }, ridgeline: { sdr: 3 } }, note: "A drawer, not an in-place door (specs/09 §6.8), because the provenance table is wider than the record column. The admin is the seat that answers \"where did this number come from\"; at Halyard every client arrives with a spreadsheet, so it is a weekly read." },
  { id: "rec.enrich.refresh", page: "companies", area: "Company record", label: "Re-enrich this company · credit estimate shown", critical: true, weekly: { sdr: 4, ae: 2, cs: 1, admin: 8 }, overrides: { fathom: { sdr: 10, admin: 10 }, halyard: { admin: 15 } }, note: "Spends credits, so the estimate is on the control inside the drawer (rule 7); it opens the same X-enrich panel the tables use." },
]
