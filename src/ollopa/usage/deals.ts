import type { UsageItem } from "./model"

// Deals board: 62 items in 6 areas (specs/08-deals-board.md). Baseline numbers describe Meridian Software's AEs, CSMs and admin.
// Only "ae", "cs" and "admin" can open the page (nav.ts); SDRs and marketers get an explained gap, so they carry no numbers.
// Fathom overrides: the founders (admin) are the AEs; three people, one pipeline, no CRM, agents propose next steps.
// Halyard overrides: the agency ops lead (admin) reviews a small pipeline per client workspace weekly.
// Ridgeline overrides: two pipelines (Expansion, Renewals); CS creates and moves renewal deals, so CS numbers rise.

type O = NonNullable<UsageItem["overrides"]>
const f = (admin: number): O => ({ fathom: { admin } })
const h = (admin: number): O => ({ halyard: { admin } })
const r = (v: { ae?: number; cs?: number; admin?: number }): O => ({ ridgeline: v })
const ov = (...parts: O[]): O => Object.assign({}, ...parts)

export const dealsItems: UsageItem[] = [
  // Board
  { id: "deals.board.columns", page: "deals", area: "Board", label: "Stage columns", weekly: { ae: 95, cs: 20, admin: 40 }, overrides: ov(f(90), h(35), r({ cs: 60 })) },
  { id: "deals.card.name", page: "deals", area: "Board", label: "Deal name and company", weekly: { ae: 95, cs: 20, admin: 40 }, overrides: ov(f(90), h(35), r({ cs: 60 })) },
  { id: "deals.card.amount", page: "deals", area: "Board", label: "Amount", weekly: { ae: 90, cs: 20, admin: 40 }, overrides: ov(f(85), h(30), r({ cs: 50 })) },
  { id: "deals.card.next-step", page: "deals", area: "Board", label: "Next step", weekly: { ae: 80, cs: 10, admin: 10 }, overrides: ov(f(70), h(25), r({ cs: 40 })), note: "The one thing an AE reads on every card: what moves the deal." },
  { id: "deals.card.close-date", page: "deals", area: "Board", label: "Close date", weekly: { ae: 75, cs: 20, admin: 25 }, overrides: ov(f(60), h(20), r({ cs: 55 })), note: "Renewal dates are the CS calendar at Ridgeline." },
  { id: "deals.card.owner", page: "deals", area: "Board", label: "Owner", weekly: { ae: 15, cs: 10, admin: 60 }, overrides: ov(f(10), h(35), r({ cs: 15 })), note: "AEs open the board scoped to their own deals, so the owner is redundant for them and central for the admin." },
  { id: "deals.card.days-in-stage", page: "deals", area: "Board", label: "Days in stage", weekly: { ae: 18, cs: 4, admin: 15 }, overrides: ov(f(8), r({ ae: 10 })) },
  { id: "deals.card.last-activity", page: "deals", area: "Board", label: "Last activity", weekly: { ae: 15, cs: 8, admin: 15 }, overrides: ov(f(8), h(8)) },
  { id: "deals.card.forecast", page: "deals", area: "Board", label: "Forecast category on the card", weekly: { ae: 15, cs: 3, admin: 15 }, overrides: ov(f(6), h(2)) },
  { id: "deals.card.probability", page: "deals", area: "Board", label: "Stage probability", weekly: { ae: 4, cs: 1, admin: 3 } },
  { id: "deals.card.contacts", page: "deals", area: "Board", label: "Contacts on the deal", weekly: { ae: 4, cs: 3, admin: 1 } },
  { id: "deals.card.currency", page: "deals", area: "Board", label: "Original currency when it differs", weekly: { ae: 3, admin: 2 }, overrides: r({ ae: 0, admin: 0 }), note: "Ridgeline bills in one currency; the item is removed there, not hidden." },
  { id: "deals.card.sync", page: "deals", area: "Board", label: "CRM sync error on the card", critical: true, weekly: { ae: 3, cs: 1, admin: 20 }, overrides: ov(f(0), h(0), r({ admin: 10 })), note: "A deal that is not reaching the CRM is data state the owner must see (rule 7). Removed where no CRM is connected." },
  { id: "deals.card.agent", page: "deals", area: "Board", label: "Agent-proposed next step awaiting approval", critical: true, weekly: { ae: 12, cs: 2, admin: 5 }, overrides: ov(f(35), r({ ae: 18, cs: 10 })), note: "A pending approval is always visible (rule 7). Fathom's founders lean on the agents most." },
  { id: "deals.card.stale", page: "deals", area: "Board", label: "Stale marker (no activity for 14 days)", weekly: { ae: 18, cs: 5, admin: 15 }, note: "Shown by object state on the card; the filter is a separate item." },
  { id: "deals.column.sum", page: "deals", area: "Board", label: "Count and sum per column", weekly: { ae: 85, cs: 15, admin: 40 }, overrides: ov(f(70), h(35), r({ cs: 30 })) },
  { id: "deals.column.weighted", page: "deals", area: "Board", label: "Weighted sum per column", weekly: { ae: 12, cs: 2, admin: 30 }, overrides: ov(f(2), h(3)) },
  { id: "deals.column.stale-count", page: "deals", area: "Board", label: "Stale deals per column", weekly: { ae: 4, admin: 12 } },
  { id: "deals.board.drag", page: "deals", area: "Board", label: "Drag a card to another stage", weekly: { ae: 70, cs: 8, admin: 10 }, overrides: ov(f(65), h(15), r({ cs: 30 })) },
  { id: "deals.board.move-menu", page: "deals", area: "Board", label: "Move to a stage from the card menu", weekly: { ae: 10, cs: 4, admin: 3 }, note: "The keyboard and touch route to the same move." },
  { id: "deals.board.closed-columns", page: "deals", area: "Board", label: "Closed won and closed lost columns", weekly: { ae: 15, cs: 4, admin: 15 }, overrides: ov(f(10), h(10)) },
  { id: "deals.board.collapse-column", page: "deals", area: "Board", label: "Collapse a stage column", weekly: { ae: 4, cs: 1, admin: 2 } },
  { id: "deals.board.sort-in-column", page: "deals", area: "Board", label: "Order cards within a column", weekly: { ae: 3, admin: 3 } },
  { id: "deals.board.expand-cards", page: "deals", area: "Board", label: "Expand or collapse all cards", weekly: { ae: 4, cs: 2, admin: 4 } },

  // Views
  { id: "deals.view.toggle", page: "deals", area: "Views", label: "Board or table", weekly: { ae: 18, cs: 8, admin: 15 }, overrides: ov(f(6), h(10), r({ cs: 12 })) },
  { id: "deals.view.table-sort", page: "deals", area: "Views", label: "Sort the table", weekly: { ae: 12, cs: 5, admin: 15 }, overrides: f(4) },
  { id: "deals.view.table-columns", page: "deals", area: "Views", label: "Choose table columns", weekly: { ae: 4, cs: 2, admin: 8 } },
  { id: "deals.view.saved", page: "deals", area: "Views", label: "Saved views", weekly: { ae: 4, cs: 1, admin: 4 }, overrides: ov(f(1), h(12)), note: "Halyard keeps one view per client." },
  { id: "deals.view.pipeline", page: "deals", area: "Views", label: "Pipeline picker", weekly: { ae: 6, cs: 12, admin: 10 }, overrides: ov(f(0), h(0), r({ ae: 45, cs: 45, admin: 20 })), note: "Removed where a workspace has one pipeline. Ridgeline switches between Expansion and Renewals daily." },
  { id: "deals.view.density", page: "deals", area: "Views", label: "Card density", weekly: { ae: 2, admin: 1 } },

  // Filters and search
  { id: "deals.filter.scope", page: "deals", area: "Filters and search", label: "Mine, my team or all", weekly: { ae: 65, cs: 25, admin: 45 }, overrides: ov(f(6), h(15), r({ cs: 35 })), note: "Three people at Fathom: the default is all and the control is rarely touched." },
  { id: "deals.filter.search", page: "deals", area: "Filters and search", label: "Search", weekly: { ae: 40, cs: 15, admin: 25 }, overrides: ov(f(15), h(25)) },
  { id: "deals.filter.period", page: "deals", area: "Filters and search", label: "Closing: any time, this month, this quarter, next quarter, overdue", weekly: { ae: 55, cs: 15, admin: 35 }, overrides: ov(f(30), h(6), r({ cs: 30 })) },
  { id: "deals.filter.owner", page: "deals", area: "Filters and search", label: "Owner", weekly: { ae: 4, cs: 6, admin: 45 }, overrides: ov(f(2), h(30)) },
  { id: "deals.filter.forecast", page: "deals", area: "Filters and search", label: "Forecast category", weekly: { ae: 12, cs: 2, admin: 35 }, overrides: ov(f(2), h(3)) },
  { id: "deals.filter.stale", page: "deals", area: "Filters and search", label: "No activity for 14 days", weekly: { ae: 18, cs: 6, admin: 15 }, overrides: f(10) },
  { id: "deals.filter.amount", page: "deals", area: "Filters and search", label: "Amount range", weekly: { ae: 3, cs: 1, admin: 3 } },
  { id: "deals.filter.company", page: "deals", area: "Filters and search", label: "Company", weekly: { ae: 4, cs: 8, admin: 3 }, overrides: r({ cs: 15 }) },
  { id: "deals.filter.created", page: "deals", area: "Filters and search", label: "Created date", weekly: { ae: 2, admin: 4 } },
  { id: "deals.filter.custom", page: "deals", area: "Filters and search", label: "Custom deal fields", weekly: { ae: 2, admin: 4 }, overrides: f(0), note: "Fathom has no custom deal fields, so the filter is removed there." },
  { id: "deals.filter.lost-reason", page: "deals", area: "Filters and search", label: "Lost reason", weekly: { ae: 2, admin: 4 } },

  // Actions
  { id: "deals.action.open-record", page: "deals", area: "Actions", label: "Open the deal record", weekly: { ae: 95, cs: 20, admin: 35 }, overrides: ov(f(90), h(30), r({ cs: 60 })) },
  { id: "deals.action.edit-inline", page: "deals", area: "Actions", label: "Edit amount, close date or next step in place", weekly: { ae: 55, cs: 8, admin: 10 }, overrides: ov(f(50), h(15), r({ cs: 30 })) },
  { id: "deals.action.new-deal", page: "deals", area: "Actions", label: "New deal", weekly: { ae: 15, cs: 4, admin: 4 }, overrides: ov(f(30), h(15), r({ ae: 18, cs: 30 })), note: "At Meridian most deals are created from a booked meeting on Home; here it is the fallback. At Ridgeline CS opens renewal deals." },
  { id: "deals.action.log", page: "deals", area: "Actions", label: "Log a call or note from the card", weekly: { ae: 15, cs: 6, admin: 2 }, overrides: ov(f(15), r({ ae: 8 })) },
  { id: "deals.action.change-forecast", page: "deals", area: "Actions", label: "Change forecast category", weekly: { ae: 10, cs: 1, admin: 3 } },
  { id: "deals.action.change-owner", page: "deals", area: "Actions", label: "Change owner", weekly: { ae: 3, cs: 2, admin: 12 }, overrides: ov(f(2), h(10)) },
  { id: "deals.action.close-won", page: "deals", area: "Actions", label: "Close won, showing what happens next", critical: true, weekly: { ae: 15, cs: 4, admin: 3 }, overrides: ov(f(20), r({ cs: 15 })), note: "Closing pushes to the CRM and hands the account to CS; that consequence is shown before the drop lands (rule 7)." },
  { id: "deals.action.close-lost", page: "deals", area: "Actions", label: "Close lost, with reason", critical: true, weekly: { ae: 18, cs: 3, admin: 3 }, overrides: ov(f(20), r({ cs: 10 })) },
  { id: "deals.action.reopen", page: "deals", area: "Actions", label: "Reopen a closed deal", weekly: { ae: 2, admin: 2 } },
  { id: "deals.action.bulk-owner", page: "deals", area: "Actions", label: "Bulk: change owner", weekly: { ae: 1, admin: 12 }, overrides: ov(f(2), h(8)), note: "Territory changes and departures; an admin errand." },
  { id: "deals.action.bulk-stage", page: "deals", area: "Actions", label: "Bulk: move to a stage", weekly: { ae: 3, admin: 4 } },
  { id: "deals.action.bulk-close-date", page: "deals", area: "Actions", label: "Bulk: change close date", weekly: { ae: 3, admin: 4 }, note: "Quarter-end pushes." },
  { id: "deals.action.export", page: "deals", area: "Actions", label: "Export CSV", weekly: { ae: 4, cs: 2, admin: 12 }, overrides: ov(f(3), h(10)) },
  { id: "deals.action.import", page: "deals", area: "Actions", label: "Import CSV", weekly: { admin: 1 }, overrides: f(2) },
  { id: "deals.action.delete", page: "deals", area: "Actions", label: "Delete deal, showing what is lost", critical: true, weekly: { ae: 2, admin: 3 }, note: "The destructive action and its consequence are visible without a click (rule 7); the confirmation names the activity and CRM link that go with it." },
  { id: "deals.action.edit-stages", page: "deals", area: "Actions", label: "Edit stages (opens Settings)", weekly: { ae: 2, admin: 4 }, overrides: f(8) },
  { id: "deals.action.print", page: "deals", area: "Actions", label: "Print the board", weekly: { ae: 1, admin: 2 } },

  // Forecast
  { id: "deals.forecast.strip", page: "deals", area: "Forecast", label: "Forecast for the period: commit, best case, pipeline, closed won", weekly: { ae: 45, cs: 6, admin: 40 }, overrides: ov(f(30), h(8), r({ ae: 40, cs: 15 })), note: "The four sums the AE reports on Monday; a door for CS and for Halyard." },
  { id: "deals.forecast.omitted", page: "deals", area: "Forecast", label: "Omitted deals in the period", weekly: { ae: 3, admin: 4 }, note: "Shown only when the count is above zero (object state)." },

  // Shortcuts
  { id: "deals.kbd.shortcuts", page: "deals", area: "Shortcuts", label: "Keyboard shortcuts", weekly: { ae: 10, cs: 2, admin: 4 } },
  { id: "deals.kbd.palette", page: "deals", area: "Shortcuts", label: "Command palette", weekly: { ae: 8, cs: 3, admin: 4 }, overrides: f(6) },
]
