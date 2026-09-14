import type { UsageItem } from "./model"

// Lists: saved lists (static) and segments (filters that keep them current). Spec: specs/04-lists.md.
// Baseline numbers describe Meridian Software. Only SDR, marketer and admin see this page (nav.ts);
// AE and CS have no numbers here because they land on the no-access state.
// Fathom overrides: two founders (admin) and one SDR do outbound; agents build lists; no campaigns exist.
// Halyard overrides: the same list work ten times over, one workspace per client; clients want CSVs.
// Ridgeline overrides: almost no outbound; the marketer's lifecycle segments are the page.

export const listsItems: UsageItem[] = [
  // Lists table: what the row shows
  { id: "lists.col.name", page: "lists", area: "Lists table", label: "List name, kind and mode", weekly: { sdr: 90, marketer: 65, admin: 30 }, overrides: { fathom: { admin: 60 }, halyard: { admin: 50 }, ridgeline: { sdr: 15, marketer: 75, admin: 12 } }, note: "Kind is people or companies; mode is static or segment. The row is the page." },
  { id: "lists.col.records", page: "lists", area: "Lists table", label: "Records and new this week", weekly: { sdr: 80, marketer: 60, admin: 25 }, overrides: { fathom: { admin: 55 }, halyard: { admin: 45 }, ridgeline: { sdr: 12, marketer: 70, admin: 10 } } },
  { id: "lists.col.feeds", page: "lists", area: "Lists table", label: "Feeds (sequence or campaign)", weekly: { sdr: 55, marketer: 55, admin: 15 }, overrides: { fathom: { admin: 40 }, halyard: { admin: 25 }, ridgeline: { sdr: 8, marketer: 65, admin: 6 } }, note: "Which sequence or campaign the list feeds, and whether new matches are added automatically." },
  { id: "lists.col.owner-updated", page: "lists", area: "Lists table", label: "Owner and updated", weekly: { sdr: 18, marketer: 18, admin: 25 }, overrides: { fathom: { sdr: 8, admin: 12 }, halyard: { sdr: 35, admin: 40 }, ridgeline: { sdr: 6, marketer: 18 } }, note: "Fathom has three users; who owns what is obvious." },
  { id: "lists.col.visibility", page: "lists", area: "Lists table", label: "Visibility (everyone or only me)", weekly: { sdr: 4, marketer: 5, admin: 8 }, overrides: { fathom: { sdr: 0, admin: 0 }, halyard: { admin: 15 } }, note: "Halyard keeps client lists private per workspace and checks it." },
  { id: "lists.col.source", page: "lists", area: "Lists table", label: "Source (search, CSV, agent, by hand)", weekly: { sdr: 6, marketer: 8, admin: 6 }, overrides: { fathom: { sdr: 15, admin: 25 } }, note: "At Fathom the research agent builds most lists, so the founders check the source." },
  { id: "lists.col.created", page: "lists", area: "Lists table", label: "Created date", weekly: { sdr: 2, marketer: 2, admin: 3 } },

  // Lists table: find a list
  { id: "lists.search", page: "lists", area: "Find a list", label: "Search lists", weekly: { sdr: 30, marketer: 25, admin: 20 }, overrides: { fathom: { sdr: 8, admin: 8 }, halyard: { sdr: 45, admin: 40 }, ridgeline: { sdr: 5, marketer: 18, admin: 6 } }, note: "Fathom has five lists; nobody searches five rows." },
  { id: "lists.filter.kind", page: "lists", area: "Find a list", label: "Filter by kind: people or companies", weekly: { sdr: 15, marketer: 12, admin: 6 }, overrides: { fathom: { sdr: 3, admin: 3 } } },
  { id: "lists.filter.owner", page: "lists", area: "Find a list", label: "Filter by owner: mine or team", weekly: { sdr: 18, marketer: 15, admin: 22 }, overrides: { fathom: { sdr: 2, admin: 2 }, halyard: { sdr: 18, admin: 40 }, ridgeline: { sdr: 4, marketer: 12, admin: 10 } } },
  { id: "lists.filter.mode", page: "lists", area: "Find a list", label: "Filter by mode: static or segment", weekly: { sdr: 6, marketer: 12, admin: 4 }, overrides: { ridgeline: { marketer: 18 } } },
  { id: "lists.sort", page: "lists", area: "Find a list", label: "Sort by updated, records or name", weekly: { sdr: 12, marketer: 10, admin: 8 }, overrides: { halyard: { sdr: 15 } } },

  // Lists table: page actions
  { id: "lists.open", page: "lists", area: "Page actions", label: "Open a list", weekly: { sdr: 85, marketer: 60, admin: 25 }, overrides: { fathom: { admin: 55 }, halyard: { sdr: 90, admin: 45 }, ridgeline: { sdr: 15, marketer: 75, admin: 10 } } },
  { id: "lists.new-list", page: "lists", area: "Page actions", label: "New list (static)", weekly: { sdr: 30, marketer: 15, admin: 10 }, overrides: { fathom: { admin: 30 }, halyard: { sdr: 45, admin: 15 }, ridgeline: { sdr: 5, marketer: 10, admin: 3 } }, note: "An SDR at Meridian starts a new list most weeks; a marketer starts segments instead." },
  { id: "lists.new-segment", page: "lists", area: "Page actions", label: "New segment (from filters)", weekly: { sdr: 12, marketer: 35, admin: 8 }, overrides: { fathom: { admin: 15 }, halyard: { sdr: 15 }, ridgeline: { sdr: 3, marketer: 55, admin: 6 } } },
  { id: "lists.import-csv", page: "lists", area: "Page actions", label: "Import a CSV into a list", weekly: { sdr: 10, marketer: 15, admin: 8 }, overrides: { fathom: { sdr: 5, admin: 10 }, halyard: { sdr: 18, admin: 18 }, ridgeline: { sdr: 2, marketer: 12, admin: 4 } }, note: "Halyard's clients hand over spreadsheets every week." },

  // Lists table: row and bulk actions
  { id: "lists.row.add-to-sequence", page: "lists", area: "Row and bulk actions", label: "Add to sequence", weekly: { sdr: 60, marketer: 5, admin: 10 }, overrides: { fathom: { admin: 40 }, halyard: { sdr: 75, admin: 20 }, ridgeline: { sdr: 8, marketer: 2, admin: 2 } }, note: "People lists only. A companies list offers 'Find people at these companies' instead." },
  { id: "lists.row.add-to-campaign", page: "lists", area: "Row and bulk actions", label: "Add to campaign", weekly: { sdr: 3, marketer: 50, admin: 4 }, overrides: { fathom: { sdr: 0, admin: 0 }, halyard: { sdr: 0, admin: 0 }, ridgeline: { sdr: 2, marketer: 65, admin: 4 } }, note: "Fathom and Halyard run no campaigns, so the action is removed there, not hidden." },
  { id: "lists.row.export", page: "lists", area: "Row and bulk actions", label: "Export CSV", weekly: { sdr: 12, marketer: 15, admin: 10 }, overrides: { fathom: { sdr: 6, admin: 8 }, halyard: { sdr: 30, admin: 25 }, ridgeline: { sdr: 3, marketer: 15, admin: 6 } }, note: "Agency clients want the list as a file; that puts export at level one for Halyard." },
  { id: "lists.row.duplicate", page: "lists", area: "Row and bulk actions", label: "Duplicate", weekly: { sdr: 6, marketer: 8, admin: 3 }, overrides: { halyard: { sdr: 18, admin: 18 } }, note: "The same list structure ten times over, once per client workspace." },
  { id: "lists.row.rename", page: "lists", area: "Row and bulk actions", label: "Rename", weekly: { sdr: 5, marketer: 5, admin: 3 } },
  { id: "lists.row.visibility", page: "lists", area: "Row and bulk actions", label: "Change who can see it", weekly: { sdr: 3, marketer: 4, admin: 6 }, overrides: { fathom: { sdr: 0, admin: 0 }, halyard: { admin: 15 } } },
  { id: "lists.row.convert", page: "lists", area: "Row and bulk actions", label: "Convert to segment or freeze as static", weekly: { sdr: 3, marketer: 6, admin: 2 }, overrides: { ridgeline: { marketer: 8 } } },
  { id: "lists.row.archive", page: "lists", area: "Row and bulk actions", label: "Archive", weekly: { sdr: 4, marketer: 5, admin: 6 }, overrides: { halyard: { admin: 15 } }, note: "Halyard archives a client's lists when the engagement ends." },
  { id: "lists.row.delete", page: "lists", area: "Row and bulk actions", label: "Delete list (people stay in People)", critical: true, weekly: { sdr: 3, marketer: 3, admin: 4 }, note: "Destructive. What it deletes and what it keeps is written on the control (rule 7)." },

  // List detail: members and definition
  { id: "detail.members", page: "lists", area: "List detail", label: "Members table", weekly: { sdr: 85, marketer: 60, admin: 25 }, overrides: { fathom: { admin: 55 }, halyard: { sdr: 90, admin: 45 }, ridgeline: { sdr: 15, marketer: 70, admin: 10 } } },
  { id: "detail.filters", page: "lists", area: "List detail", label: "Segment filters (the definition)", weekly: { sdr: 15, marketer: 40, admin: 6 }, overrides: { halyard: { sdr: 15 }, ridgeline: { sdr: 3, marketer: 55, admin: 5 } }, note: "Shown on every segment because the filters are what the segment is (object state, rule 6)." },
  { id: "detail.new-since", page: "lists", area: "List detail", label: "New since your last visit", weekly: { sdr: 18, marketer: 35, admin: 8 }, overrides: { halyard: { sdr: 18 }, ridgeline: { sdr: 5, marketer: 45, admin: 6 } } },
  { id: "detail.add-members", page: "lists", area: "List detail", label: "Add people or companies", weekly: { sdr: 50, marketer: 15, admin: 10 }, overrides: { fathom: { admin: 30 }, halyard: { sdr: 60, admin: 15 }, ridgeline: { sdr: 6, marketer: 10, admin: 3 } }, note: "Static lists only. Segments add members through their filters." },
  { id: "detail.remove-members", page: "lists", area: "List detail", label: "Remove from list", weekly: { sdr: 15, marketer: 12, admin: 6 }, overrides: { fathom: { admin: 15 }, halyard: { sdr: 18 }, ridgeline: { sdr: 4, marketer: 8, admin: 2 } } },
  { id: "detail.credits", page: "lists", area: "List detail", label: "Credits this action will spend", critical: true, weekly: { sdr: 30, marketer: 10, admin: 15 }, overrides: { fathom: { sdr: 45, admin: 50 }, halyard: { sdr: 40, admin: 30 }, ridgeline: { sdr: 5, marketer: 12, admin: 8 } }, note: "Adding net-new emails to a sequence or enriching costs credits. Price before the click (rule 7)." },
  { id: "detail.in-other-sequence", page: "lists", area: "List detail", label: "Already in another sequence", critical: true, weekly: { sdr: 25, marketer: 5, admin: 5 }, overrides: { fathom: { admin: 20 }, halyard: { sdr: 45, admin: 15 }, ridgeline: { sdr: 3, marketer: 2, admin: 1 } }, note: "Double outreach is a consequence the SDR must see before enrolling (rule 7)." },
  { id: "detail.auto-feed", page: "lists", area: "List detail", label: "New matches added to the sequence or campaign automatically", critical: true, weekly: { sdr: 10, marketer: 30, admin: 8 }, overrides: { fathom: { admin: 12 }, ridgeline: { sdr: 2, marketer: 45, admin: 6 } }, note: "A segment that enrols people on its own is an ongoing consequence. Shown only on segments that feed something (object state)." },
  { id: "detail.refresh", page: "lists", area: "List detail", label: "Refresh now and last refreshed", weekly: { sdr: 8, marketer: 15, admin: 4 }, overrides: { ridgeline: { marketer: 25 } } },
  { id: "detail.alerts", page: "lists", area: "List detail", label: "Email me when the segment gains matches", weekly: { sdr: 5, marketer: 12, admin: 2 }, overrides: { ridgeline: { marketer: 15 } } },
  { id: "detail.columns", page: "lists", area: "List detail", label: "Choose columns", weekly: { sdr: 6, marketer: 8, admin: 4 } },
  { id: "detail.history", page: "lists", area: "List detail", label: "History: who added or removed what", weekly: { sdr: 4, marketer: 5, admin: 10 }, overrides: { halyard: { admin: 22 } }, note: "The agency ops lead audits what specialists did in each client workspace." },
  { id: "detail.enrich", page: "lists", area: "List detail", label: "Enrich members", weekly: { sdr: 10, marketer: 6, admin: 5 }, overrides: { fathom: { sdr: 15, admin: 20 }, ridgeline: { sdr: 2, marketer: 4, admin: 2 } } },
  { id: "detail.set-stage", page: "lists", area: "List detail", label: "Set stage for selected", weekly: { sdr: 8, marketer: 2, admin: 3 } },
  { id: "detail.assign-owner", page: "lists", area: "List detail", label: "Assign owner to selected", weekly: { sdr: 4, marketer: 2, admin: 12 }, overrides: { fathom: { admin: 2 }, halyard: { admin: 15 } } },
  { id: "detail.create-tasks", page: "lists", area: "List detail", label: "Create call tasks for selected", weekly: { sdr: 12, marketer: 0, admin: 2 }, overrides: { halyard: { sdr: 18 }, ridgeline: { sdr: 3 } } },
  { id: "detail.print", page: "lists", area: "List detail", label: "Print or expand everything", weekly: { sdr: 1, marketer: 2, admin: 2 } },

  // The long tail a real product accumulates. Kept reachable; reviewed twice a year (rule 8).
  { id: "lists.row.pin", page: "lists", area: "Row and bulk actions", label: "Pin to top", weekly: { sdr: 5, marketer: 6, admin: 3 } },
  { id: "lists.archived", page: "lists", area: "Find a list", label: "Show archived lists", weekly: { sdr: 2, marketer: 3, admin: 5 }, overrides: { halyard: { admin: 15 } } },
  { id: "detail.description", page: "lists", area: "List detail", label: "Description", weekly: { sdr: 3, marketer: 5, admin: 3 } },
  { id: "detail.share-link", page: "lists", area: "List detail", label: "Copy link to list", weekly: { sdr: 4, marketer: 6, admin: 3 } },
  { id: "detail.per-company-cap", page: "lists", area: "List detail", label: "Max people per company when adding", weekly: { sdr: 6, marketer: 2, admin: 2 }, overrides: { halyard: { sdr: 12 } } },
  { id: "detail.exclude", page: "lists", area: "List detail", label: "Use as an exclusion in People search", weekly: { sdr: 4, marketer: 3, admin: 2 } },
  { id: "detail.custom-field", page: "lists", area: "List detail", label: "Set a custom field for selected", weekly: { sdr: 3, marketer: 4, admin: 6 } },
  { id: "detail.dedupe", page: "lists", area: "List detail", label: "Find and merge duplicates in this list", weekly: { sdr: 3, marketer: 4, admin: 6 } },
  { id: "detail.push-crm", page: "lists", area: "List detail", label: "Push list to the CRM as a campaign", weekly: { sdr: 2, marketer: 8, admin: 8 }, overrides: { fathom: { sdr: 0, admin: 1 } } },
]
