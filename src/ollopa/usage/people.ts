import type { UsageItem } from "./model"

// People: the contacts table, the SDR's home. Baseline numbers describe Meridian Software (specs/02-people.md).
// A number is the share of active users in a role who touch the item in a typical week (USAGE-MODEL.md).
// Why the named prospecting filters sit mostly in the body: an SDR reopens a saved view that carries the
// combination; the individual filter is edited when the view is built or adjusted, not every week.
// Fathom overrides: the founder (admin) does outbound, so admin numbers follow the SDR's; three users, so owner is moot.
// Halyard overrides: ten client workspaces with ten ICPs, so company filters, views and exports are routine.
// Ridgeline overrides: inbound and product-led; signals replace sequences as the reason to open the page.
// Customer success is not in the People navigation (nav.ts), so it carries no numbers here.
// Destructive actions carry critical: true, so they are never hidden: they sit in the always-visible row menu with their
// consequence written into the label (the same treatment as lists.row.delete).

export const peopleItems: UsageItem[] = [
  // Search and views
  { id: "people.search", page: "people", area: "Search and views", label: "Search by name, title, company or email", weekly: { sdr: 85, ae: 60, marketer: 25, admin: 25 }, overrides: { ridgeline: { sdr: 60 } } },
  { id: "people.count", page: "people", area: "Search and views", label: "Result count for the current filters", weekly: { sdr: 90, ae: 60, marketer: 40, admin: 30 }, note: "Read before every bulk action; it is the number the selection bar repeats." },
  { id: "people.views.saved", page: "people", area: "Search and views", label: "Saved views", weekly: { sdr: 55, ae: 15, marketer: 25, admin: 10 }, overrides: { halyard: { sdr: 80, admin: 35 }, fathom: { sdr: 40, admin: 30 }, ridgeline: { sdr: 30 } }, note: "The view carries the filter combination, so the view is touched weekly and the filters inside it are not." },
  { id: "people.views.save", page: "people", area: "Search and views", label: "Save the current filters as a view", weekly: { sdr: 12, ae: 3, marketer: 8, admin: 5 }, overrides: { halyard: { sdr: 18, admin: 15 } } },
  { id: "people.views.share", page: "people", area: "Search and views", label: "Share a view with the team", weekly: { sdr: 4, ae: 1, marketer: 5, admin: 8 }, overrides: { halyard: { admin: 25 }, fathom: { admin: 0, sdr: 0 } } },
  { id: "people.views.default", page: "people", area: "Search and views", label: "Set a view as my default", weekly: { sdr: 3, ae: 2, marketer: 2, admin: 4 }, overrides: { halyard: { sdr: 10 } } },
  { id: "people.views.rename", page: "people", area: "Search and views", label: "Rename a view", weekly: { sdr: 3, ae: 1, marketer: 2, admin: 2 } },
  { id: "people.views.delete", page: "people", area: "Search and views", label: "Delete a view", weekly: { sdr: 2, ae: 1, marketer: 2, admin: 2 } },
  { id: "people.views.alerts", page: "people", area: "Search and views", label: "Email me when a view gains people", weekly: { sdr: 3, ae: 2, marketer: 4, admin: 1 }, overrides: { ridgeline: { sdr: 12, ae: 6 } } },

  // Filters: the head for the SDR
  { id: "people.f.title", page: "people", area: "Filters", label: "Title", weekly: { sdr: 45, ae: 20, marketer: 25, admin: 10 }, overrides: { ridgeline: { sdr: 20 }, fathom: { admin: 40 } } },
  { id: "people.f.email", page: "people", area: "Filters", label: "Email: verified only, any, none, bounced", weekly: { sdr: 40, ae: 12, marketer: 30, admin: 8 }, overrides: { fathom: { admin: 35 } }, note: "One filter with four values; 'has verified email' is its first value." },
  { id: "people.f.not-in-sequence", page: "people", area: "Filters", label: "Not in a sequence", weekly: { sdr: 45, ae: 8, marketer: 5, admin: 3 }, overrides: { ridgeline: { sdr: 6 }, fathom: { admin: 40 } } },
  { id: "people.f.stage", page: "people", area: "Filters", label: "Stage", weekly: { sdr: 25, ae: 30, marketer: 10, admin: 5 }, overrides: { ridgeline: { sdr: 35, ae: 35 } } },
  { id: "people.f.owner", page: "people", area: "Filters", label: "Owner", weekly: { sdr: 30, ae: 35, marketer: 10, admin: 20 }, overrides: { fathom: { sdr: 3, admin: 3 }, halyard: { admin: 25 } }, note: "'Me' is the first value. At Fathom three people share one workspace, so nobody filters by owner." },
  { id: "people.f.company", page: "people", area: "Filters", label: "Company", weekly: { sdr: 25, ae: 45, marketer: 10, admin: 8 }, overrides: { ridgeline: { sdr: 35 } }, note: "The AE's first filter: everyone at one account." },
  { id: "people.f.clear", page: "people", area: "Filters", label: "Clear all filters", weekly: { sdr: 35, ae: 25, marketer: 20, admin: 15 } },

  // Filters: the prospecting set, body at Meridian, head where a business changes the job
  { id: "people.f.seniority", page: "people", area: "Filters", label: "Seniority", weekly: { sdr: 15, ae: 8, marketer: 20, admin: 5 }, overrides: { halyard: { sdr: 15 } } },
  { id: "people.f.department", page: "people", area: "Filters", label: "Department", weekly: { sdr: 10, ae: 5, marketer: 15, admin: 3 } },
  { id: "people.f.company-size", page: "people", area: "Filters", label: "Company size", weekly: { sdr: 18, ae: 12, marketer: 25, admin: 5 }, overrides: { halyard: { sdr: 30 }, ridgeline: { sdr: 8 } } },
  { id: "people.f.industry", page: "people", area: "Filters", label: "Industry", weekly: { sdr: 15, ae: 8, marketer: 25, admin: 5 }, overrides: { halyard: { sdr: 28 }, ridgeline: { sdr: 6 } } },
  { id: "people.f.location", page: "people", area: "Filters", label: "Location", weekly: { sdr: 18, ae: 8, marketer: 15, admin: 5 }, overrides: { halyard: { sdr: 35 } } },
  { id: "people.f.technology", page: "people", area: "Filters", label: "Technology used by the company", weekly: { sdr: 8, ae: 4, marketer: 8, admin: 2 }, overrides: { halyard: { sdr: 15 } } },
  { id: "people.f.signals", page: "people", area: "Filters", label: "Signals", weekly: { sdr: 15, ae: 15, marketer: 12, admin: 3 }, overrides: { ridgeline: { sdr: 55, ae: 35 }, fathom: { sdr: 25, admin: 25 } }, note: "At Ridgeline a signal is the reason to open the page." },
  { id: "people.f.phone", page: "people", area: "Filters", label: "Has phone", weekly: { sdr: 12, ae: 10, marketer: 2, admin: 2 }, overrides: { halyard: { sdr: 15 } } },
  { id: "people.f.not-contacted", page: "people", area: "Filters", label: "Not contacted in the last N days", weekly: { sdr: 18, ae: 22, marketer: 5, admin: 3 }, overrides: { ridgeline: { sdr: 12 } } },
  { id: "people.f.list", page: "people", area: "Filters", label: "In list", weekly: { sdr: 15, ae: 5, marketer: 30, admin: 5 }, overrides: { halyard: { sdr: 18 } } },

  // Filters: the tail a real product accumulates
  { id: "people.f.last-activity", page: "people", area: "Filters", label: "Last activity date", weekly: { sdr: 8, ae: 15, marketer: 5, admin: 5 }, overrides: { ridgeline: { sdr: 20, ae: 25 } } },
  { id: "people.f.job-change", page: "people", area: "Filters", label: "Changed job recently", weekly: { sdr: 4, ae: 8, marketer: 3, admin: 2 } },
  { id: "people.f.email-replied", page: "people", area: "Filters", label: "Replied to an email", weekly: { sdr: 4, ae: 6, marketer: 4, admin: 1 } },
  { id: "people.f.email-opened", page: "people", area: "Filters", label: "Opened or clicked an email", weekly: { sdr: 3, ae: 4, marketer: 6, admin: 1 } },
  { id: "people.f.email-bounced", page: "people", area: "Filters", label: "Email bounced", weekly: { sdr: 4, ae: 2, marketer: 5, admin: 6 } },
  { id: "people.f.keywords", page: "people", area: "Filters", label: "Company keywords", weekly: { sdr: 3, ae: 2, marketer: 6, admin: 1 } },
  { id: "people.f.funding", page: "people", area: "Filters", label: "Funding stage", weekly: { sdr: 4, ae: 2, marketer: 4, admin: 1 }, overrides: { fathom: { sdr: 12, admin: 12 } } },
  { id: "people.f.revenue", page: "people", area: "Filters", label: "Company revenue", weekly: { sdr: 4, ae: 3, marketer: 4, admin: 1 } },
  { id: "people.f.headcount-growth", page: "people", area: "Filters", label: "Headcount growth", weekly: { sdr: 3, ae: 2, marketer: 3, admin: 1 } },
  { id: "people.f.time-in-role", page: "people", area: "Filters", label: "Time in current role", weekly: { sdr: 3, ae: 2, marketer: 2, admin: 1 } },
  { id: "people.f.timezone", page: "people", area: "Filters", label: "Time zone", weekly: { sdr: 3, ae: 2, marketer: 1, admin: 1 }, overrides: { halyard: { sdr: 8 } } },
  { id: "people.f.created", page: "people", area: "Filters", label: "Created date", weekly: { sdr: 4, ae: 2, marketer: 6, admin: 12 } },
  { id: "people.f.source", page: "people", area: "Filters", label: "Source", weekly: { sdr: 3, ae: 2, marketer: 8, admin: 15 } },
  { id: "people.f.synced-crm", page: "people", area: "Filters", label: "Synced to CRM", weekly: { sdr: 2, ae: 4, marketer: 3, admin: 20 }, overrides: { fathom: { admin: 2 } } },
  { id: "people.f.custom", page: "people", area: "Filters", label: "Custom fields", weekly: { sdr: 4, ae: 4, marketer: 6, admin: 10 } },
  { id: "people.f.languages", page: "people", area: "Filters", label: "Languages", weekly: { sdr: 1, ae: 1, marketer: 1, admin: 0.5 } },
  { id: "people.f.founded", page: "people", area: "Filters", label: "Founded year", weekly: { sdr: 1, ae: 0.5, marketer: 2, admin: 0.5 } },

  // Columns: the default set per role is what the role reads weekly
  { id: "people.col.name", page: "people", area: "Columns", label: "Name and title", weekly: { sdr: 95, ae: 80, marketer: 60, admin: 50 } },
  { id: "people.col.company", page: "people", area: "Columns", label: "Company", weekly: { sdr: 90, ae: 80, marketer: 60, admin: 50 } },
  { id: "people.col.email", page: "people", area: "Columns", label: "Email and its status", weekly: { sdr: 75, ae: 50, marketer: 45, admin: 30 } },
  { id: "people.col.stage", page: "people", area: "Columns", label: "Stage", weekly: { sdr: 45, ae: 40, marketer: 15, admin: 15 }, overrides: { fathom: { admin: 40 } } },
  { id: "people.col.sequence", page: "people", area: "Columns", label: "Sequence", weekly: { sdr: 45, ae: 15, marketer: 5, admin: 10 }, overrides: { ridgeline: { sdr: 12 }, fathom: { admin: 40 } } },
  { id: "people.col.last-contacted", page: "people", area: "Columns", label: "Last contacted", weekly: { sdr: 40, ae: 30, marketer: 8, admin: 5 }, overrides: { fathom: { admin: 35 } } },
  { id: "people.col.last-activity", page: "people", area: "Columns", label: "Last activity", weekly: { sdr: 15, ae: 40, marketer: 10, admin: 15 }, overrides: { ridgeline: { sdr: 45 } } },
  { id: "people.col.owner", page: "people", area: "Columns", label: "Owner", weekly: { sdr: 18, ae: 30, marketer: 10, admin: 30 }, overrides: { fathom: { sdr: 3, admin: 3 } } },
  { id: "people.col.phone", page: "people", area: "Columns", label: "Phone", weekly: { sdr: 15, ae: 25, marketer: 3, admin: 5 }, overrides: { halyard: { sdr: 15 }, fathom: { sdr: 25, admin: 25 } } },
  { id: "people.col.signals", page: "people", area: "Columns", label: "Signals", weekly: { sdr: 12, ae: 12, marketer: 8, admin: 3 }, overrides: { ridgeline: { sdr: 55, ae: 40 }, fathom: { sdr: 22, admin: 22 } } },
  { id: "people.col.location", page: "people", area: "Columns", label: "Location", weekly: { sdr: 12, ae: 10, marketer: 12, admin: 4 }, overrides: { halyard: { sdr: 18 } } },
  { id: "people.col.lists", page: "people", area: "Columns", label: "Lists", weekly: { sdr: 4, ae: 3, marketer: 20, admin: 3 } },
  { id: "people.col.seniority", page: "people", area: "Columns", label: "Seniority", weekly: { sdr: 4, ae: 5, marketer: 12, admin: 2 } },
  { id: "people.col.department", page: "people", area: "Columns", label: "Department", weekly: { sdr: 3, ae: 4, marketer: 10, admin: 2 } },
  { id: "people.col.company-size", page: "people", area: "Columns", label: "Company size", weekly: { sdr: 4, ae: 10, marketer: 15, admin: 3 } },
  { id: "people.col.industry", page: "people", area: "Columns", label: "Industry", weekly: { sdr: 4, ae: 8, marketer: 15, admin: 3 } },
  { id: "people.col.technologies", page: "people", area: "Columns", label: "Technologies", weekly: { sdr: 3, ae: 3, marketer: 4, admin: 2 }, overrides: { halyard: { sdr: 12 } } },
  { id: "people.col.linkedin", page: "people", area: "Columns", label: "LinkedIn", weekly: { sdr: 8, ae: 6, marketer: 2, admin: 1 } },
  { id: "people.col.email-activity", page: "people", area: "Columns", label: "Opens and replies", weekly: { sdr: 4, ae: 4, marketer: 6, admin: 1 } },
  { id: "people.col.job-change", page: "people", area: "Columns", label: "Job change", weekly: { sdr: 3, ae: 5, marketer: 2, admin: 1 } },
  { id: "people.col.source", page: "people", area: "Columns", label: "Source", weekly: { sdr: 2, ae: 2, marketer: 5, admin: 12 } },
  { id: "people.col.created", page: "people", area: "Columns", label: "Created", weekly: { sdr: 2, ae: 2, marketer: 5, admin: 8 } },
  { id: "people.col.crm", page: "people", area: "Columns", label: "CRM record and last sync", weekly: { sdr: 1, ae: 3, marketer: 1, admin: 10 }, overrides: { fathom: { admin: 1 } } },
  { id: "people.col.custom", page: "people", area: "Columns", label: "Custom fields", weekly: { sdr: 3, ae: 4, marketer: 4, admin: 6 } },
  { id: "people.col.timezone", page: "people", area: "Columns", label: "Time zone", weekly: { sdr: 2, ae: 2, marketer: 1, admin: 1 } },

  // Table controls
  { id: "people.sort", page: "people", area: "Table", label: "Sort by a column", weekly: { sdr: 25, ae: 25, marketer: 15, admin: 15 } },
  { id: "people.columns.choose", page: "people", area: "Table", label: "Choose and order columns", weekly: { sdr: 6, ae: 5, marketer: 10, admin: 8 } },
  { id: "people.columns.reset", page: "people", area: "Table", label: "Reset columns to the role default", weekly: { sdr: 1, ae: 1, marketer: 2, admin: 2 } },
  { id: "people.density", page: "people", area: "Table", label: "Row density", weekly: { sdr: 3, ae: 3, marketer: 3, admin: 3 } },
  { id: "people.page-size", page: "people", area: "Table", label: "Rows per page", weekly: { sdr: 3, ae: 2, marketer: 4, admin: 3 } },

  // Row actions
  { id: "people.row.quick-look", page: "people", area: "Row actions", label: "Quick look: the drawer beside the table", weekly: { sdr: 70, ae: 45, marketer: 20, admin: 15 }, overrides: { fathom: { admin: 55 }, halyard: { sdr: 75 }, ridgeline: { sdr: 60, ae: 40 } }, note: "Level one of the record: a flat drawer with the few fields a glance needs, the table still in view. Prospecting is a scanning task, so the SDR lives here (PLAN, 14 Sep 2026)." },
  { id: "people.row.open", page: "people", area: "Row actions", label: "Open the full contact record", weekly: { sdr: 45, ae: 60, marketer: 12, admin: 20 }, overrides: { fathom: { admin: 40 }, ridgeline: { ae: 55 } }, note: "Level two of the record: the page, from the shared record template. Research is a dwelling task, so the AE opens it more often than the SDR does." },
  { id: "people.row.sequence", page: "people", area: "Row actions", label: "Add to sequence", weekly: { sdr: 60, ae: 20, marketer: 3, admin: 5 }, overrides: { ridgeline: { sdr: 12, ae: 5 }, fathom: { admin: 50 } } },
  { id: "people.row.list", page: "people", area: "Row actions", label: "Add to list", weekly: { sdr: 30, ae: 10, marketer: 30, admin: 5 }, overrides: { fathom: { admin: 20 } } },
  { id: "people.row.call", page: "people", area: "Row actions", label: "Create a call task", weekly: { sdr: 22, ae: 25, marketer: 0, admin: 2 }, overrides: { ridgeline: { sdr: 10 }, fathom: { admin: 20 } } },
  { id: "people.row.stage", page: "people", area: "Row actions", label: "Change stage", weekly: { sdr: 18, ae: 20, marketer: 2, admin: 3 }, overrides: { ridgeline: { sdr: 30 } } },
  { id: "people.row.reveal-phone", page: "people", area: "Row actions", label: "Reveal phone (8 credits)", weekly: { sdr: 18, ae: 15, marketer: 1, admin: 2 }, overrides: { halyard: { sdr: 18 }, fathom: { sdr: 25, admin: 25 } } },
  { id: "people.row.enrich", page: "people", area: "Row actions", label: "Enrich (2 credits)", weekly: { sdr: 15, ae: 8, marketer: 5, admin: 5 }, overrides: { fathom: { sdr: 30, admin: 25 } } },
  { id: "people.row.email", page: "people", area: "Row actions", label: "Send a one-off email", weekly: { sdr: 12, ae: 18, marketer: 1, admin: 2 } },
  { id: "people.row.research-agent", page: "people", area: "Row actions", label: "Ask the research agent (12 credits)", weekly: { sdr: 10, ae: 8, marketer: 2, admin: 3 }, overrides: { fathom: { sdr: 30, admin: 30 } }, note: "Fathom has no time to research by hand; the agent does it." },
  { id: "people.row.view-company", page: "people", area: "Row actions", label: "Open the company", weekly: { sdr: 10, ae: 15, marketer: 3, admin: 3 } },
  { id: "people.row.edit", page: "people", area: "Row actions", label: "Edit fields", weekly: { sdr: 4, ae: 12, marketer: 3, admin: 8 } },
  { id: "people.row.note", page: "people", area: "Row actions", label: "Add a note", weekly: { sdr: 4, ae: 15, marketer: 1, admin: 1 } },
  { id: "people.row.copy-email", page: "people", area: "Row actions", label: "Copy email address", weekly: { sdr: 4, ae: 8, marketer: 2, admin: 2 } },
  { id: "people.row.add-to-deal", page: "people", area: "Row actions", label: "Add to a deal", weekly: { sdr: 3, ae: 12, marketer: 0, admin: 1 }, overrides: { ridgeline: { ae: 18 } } },
  { id: "people.row.dnc", page: "people", area: "Row actions", label: "Mark do not contact, with what it stops", critical: true, weekly: { sdr: 4, ae: 4, marketer: 3, admin: 4 }, note: "Safety state: it removes the person from every sequence and blocks outreach, so the consequence is on the control (rule 7)." },
  { id: "people.row.assign-owner", page: "people", area: "Row actions", label: "Assign owner", weekly: { sdr: 3, ae: 6, marketer: 2, admin: 15 }, overrides: { fathom: { sdr: 0, admin: 0 } } },
  { id: "people.row.push-crm", page: "people", area: "Row actions", label: "Push to CRM now", weekly: { sdr: 4, ae: 6, marketer: 2, admin: 10 }, overrides: { fathom: { admin: 1 } } },
  { id: "people.row.merge", page: "people", area: "Row actions", label: "Merge duplicate", weekly: { sdr: 1, ae: 1, marketer: 1, admin: 4 } },
  { id: "people.row.remove", page: "people", area: "Row actions", label: "Remove from workspace, with what it stops", critical: true, weekly: { sdr: 3, ae: 2, marketer: 2, admin: 6 } },

  // Bulk actions (appear when rows are selected)
  { id: "people.bulk.select", page: "people", area: "Bulk actions", label: "Select rows, page, or all matching", weekly: { sdr: 50, ae: 20, marketer: 30, admin: 15 }, overrides: { fathom: { admin: 40 } } },
  { id: "people.bulk.limit-per-company", page: "people", area: "Bulk actions", label: "Limit per company when selecting all", weekly: { sdr: 10, ae: 2, marketer: 5, admin: 1 }, note: "Lives inside 'select all matching'; never separated from it (rule 5)." },
  { id: "people.bulk.sequence", page: "people", area: "Bulk actions", label: "Add selected to sequence", weekly: { sdr: 45, ae: 10, marketer: 2, admin: 4 }, overrides: { ridgeline: { sdr: 8 }, fathom: { admin: 40 } } },
  { id: "people.bulk.list", page: "people", area: "Bulk actions", label: "Add selected to list", weekly: { sdr: 28, ae: 8, marketer: 35, admin: 5 }, overrides: { fathom: { admin: 20 } } },
  { id: "people.bulk.enrich", page: "people", area: "Bulk actions", label: "Enrich selected (2 credits each)", weekly: { sdr: 12, ae: 4, marketer: 8, admin: 8 }, overrides: { fathom: { sdr: 25, admin: 25 } } },
  { id: "people.bulk.export", page: "people", area: "Bulk actions", label: "Export selected to CSV", weekly: { sdr: 8, ae: 5, marketer: 25, admin: 15 }, overrides: { halyard: { sdr: 30, admin: 40 } }, note: "Halyard delivers lists to clients." },
  { id: "people.bulk.stage", page: "people", area: "Bulk actions", label: "Change stage of selected", weekly: { sdr: 4, ae: 8, marketer: 2, admin: 3 } },
  { id: "people.bulk.research-agent", page: "people", area: "Bulk actions", label: "Ask the research agent for selected (12 credits each)", weekly: { sdr: 4, ae: 4, marketer: 2, admin: 3 }, overrides: { fathom: { sdr: 25, admin: 25 } } },
  { id: "people.bulk.email", page: "people", area: "Bulk actions", label: "Email selected", weekly: { sdr: 3, ae: 6, marketer: 2, admin: 1 } },
  { id: "people.bulk.assign-owner", page: "people", area: "Bulk actions", label: "Assign owner to selected", weekly: { sdr: 2, ae: 3, marketer: 2, admin: 20 }, overrides: { fathom: { sdr: 0, admin: 0 }, halyard: { admin: 20 } } },
  { id: "people.bulk.push-crm", page: "people", area: "Bulk actions", label: "Push selected to CRM", weekly: { sdr: 3, ae: 3, marketer: 3, admin: 10 }, overrides: { fathom: { admin: 1 } } },
  { id: "people.bulk.merge", page: "people", area: "Bulk actions", label: "Merge selected duplicates", weekly: { sdr: 0.5, ae: 0.5, marketer: 1, admin: 3 } },
  { id: "people.bulk.remove", page: "people", area: "Bulk actions", label: "Remove selected, with what it stops", critical: true, weekly: { sdr: 1, ae: 1, marketer: 2, admin: 5 } },

  // Page actions and credit visibility
  { id: "people.credits.cost", page: "people", area: "Page", label: "Credit cost and balance before enrich, reveal or research", critical: true, weekly: { sdr: 25, ae: 15, marketer: 5, admin: 15 }, overrides: { fathom: { sdr: 35, admin: 40 } }, note: "Spending is a consequence; it is on the button, never one click away (rule 7)." },
  { id: "people.add", page: "people", area: "Page", label: "Add people", weekly: { sdr: 35, ae: 10, marketer: 15, admin: 10 }, overrides: { ridgeline: { sdr: 8 }, fathom: { admin: 40 } } },
  { id: "people.import", page: "people", area: "Page", label: "Import CSV", weekly: { sdr: 4, ae: 2, marketer: 15, admin: 10 }, overrides: { halyard: { sdr: 12, admin: 30 } } },
  { id: "people.palette", page: "people", area: "Page", label: "Command palette", weekly: { sdr: 15, ae: 10, marketer: 5, admin: 8 } },
  { id: "people.shortcuts", page: "people", area: "Page", label: "Keyboard shortcuts reference", weekly: { sdr: 4, ae: 3, marketer: 2, admin: 2 } },
  { id: "people.share-link", page: "people", area: "Page", label: "Copy a link to this view", weekly: { sdr: 4, ae: 3, marketer: 4, admin: 4 } },
  { id: "people.sync-crm", page: "people", area: "Page", label: "Sync from CRM now", weekly: { sdr: 1, ae: 2, marketer: 1, admin: 8 }, overrides: { fathom: { admin: 1 } } },
  { id: "people.print", page: "people", area: "Page", label: "Print the table", weekly: { sdr: 0.5, ae: 1, marketer: 1, admin: 1 } },
]
