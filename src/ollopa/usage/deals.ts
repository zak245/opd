import type { UsageItem } from "./model"

// Deals board: 66 items in 6 areas (specs/08-deals-board.md). Baseline numbers describe Meridian Software's AEs, CSMs and admin.
// Only "ae", "cs" and "admin" can open the page (nav.ts); SDRs and marketers get an explained gap, so they carry no numbers.
// Fathom overrides: the founders (admin) are the AEs; three people, one pipeline, no CRM, agents propose next steps.
// Halyard overrides: the agency ops lead (admin) reviews a small pipeline per client workspace weekly.
// Ridgeline overrides: two pipelines (Expansion, Renewals); CS creates and moves renewal deals, so CS numbers rise.
// Five stages only (Qualified, Discovery, Proposal, Negotiation, Closed won). A lost deal is archived with a reason:
// there is no "Closed lost" stage and no outcome flag (PLAN.md, 13 Sep 2026).
// "ae_plus" is an AE seat with direct reports (IA-MAP 6.4j): the sales manager at Meridian. No business declares a
// sixth seat, so the key appears only on the items where a leader's week genuinely differs from a rep's.

type O = NonNullable<UsageItem["overrides"]>
const f = (admin: number): O => ({ fathom: { admin } })
const h = (admin: number): O => ({ halyard: { admin } })
const r = (v: { ae?: number; ae_plus?: number; cs?: number; admin?: number }): O => ({ ridgeline: v })
const ov = (...parts: O[]): O => Object.assign({}, ...parts)

export const dealsItems: UsageItem[] = [
  // Board
  { id: "deals.board.columns", page: "deals", area: "Board", label: "Stage columns", weekly: { ae: 95, cs: 20, admin: 40 }, overrides: ov(f(90), h(35), r({ cs: 60 })) },
  { id: "deals.card.name", page: "deals", area: "Board", label: "Deal name and company", weekly: { ae: 95, cs: 20, admin: 40 }, overrides: ov(f(90), h(35), r({ cs: 60 })) },
  { id: "deals.card.amount", page: "deals", area: "Board", label: "Amount", weekly: { ae: 90, cs: 20, admin: 40 }, overrides: ov(f(85), h(30), r({ cs: 50 })) },
  { id: "deals.card.next-step", page: "deals", area: "Board", label: "Next step", weekly: { ae: 80, cs: 10, admin: 10 }, overrides: ov(f(70), h(25), r({ cs: 40 })), note: "The one thing an AE reads on every card: what moves the deal." },
  { id: "deals.card.close-date", page: "deals", area: "Board", label: "Close date", weekly: { ae: 75, cs: 20, admin: 25 }, overrides: ov(f(60), h(20), r({ cs: 55 })), note: "Renewal dates are the CS calendar at Ridgeline." },
  { id: "deals.card.owner", page: "deals", area: "Board", label: "Owner", weekly: { ae: 15, ae_plus: 60, cs: 10, admin: 60 }, overrides: ov(f(10), h(35), r({ cs: 15 })), note: "AEs open the board scoped to their own deals, so the owner is redundant for them and central for the admin. An AE with reports opens on My team, where the owner is the first thing she reads." },
  { id: "deals.card.days-in-stage", page: "deals", area: "Board", label: "Days in stage", weekly: { ae: 18, cs: 4, admin: 15 }, overrides: ov(f(8), r({ ae: 10 })) },
  { id: "deals.card.last-activity", page: "deals", area: "Board", label: "Last activity", weekly: { ae: 15, cs: 8, admin: 15 }, overrides: ov(f(8), h(8)) },
  { id: "deals.card.forecast", page: "deals", area: "Board", label: "Forecast category on the card", weekly: { ae: 15, cs: 3, admin: 15 }, overrides: ov(f(6), h(2)) },
  { id: "deals.card.probability", page: "deals", area: "Board", label: "Stage probability", weekly: { ae: 4, cs: 1, admin: 3 } },
  { id: "deals.card.contacts", page: "deals", area: "Board", label: "Contacts on the deal", weekly: { ae: 4, cs: 3, admin: 1 } },
  { id: "deals.card.currency", page: "deals", area: "Board", label: "Original currency when it differs", weekly: { ae: 3, admin: 2 }, overrides: r({ ae: 0, admin: 0 }), note: "Ridgeline bills in one currency; the item is removed there, not hidden." },
  { id: "deals.card.sync", page: "deals", area: "Board", label: "CRM sync error on the card", critical: true, weekly: { ae: 3, cs: 1, admin: 20 }, overrides: ov(f(0), h(0), r({ admin: 10 })), note: "A deal that is not reaching the CRM is data state the owner must see (rule 7). Removed where no CRM is connected." },
  { id: "deals.card.agent", page: "deals", area: "Board", label: "Agent-proposed next step awaiting approval", critical: true, weekly: { ae: 12, cs: 2, admin: 5 }, overrides: ov(f(35), r({ ae: 18, cs: 10 })), note: "A pending approval is always visible (rule 7). The deal's owner approves; the admin may approve for anyone (Settings, agent approvals). Fathom's founders lean on the agents most." },
  { id: "deals.card.warnings", page: "deals", area: "Board", label: "The six deal warnings, each printing its number against its threshold", weekly: { ae: 80, ae_plus: 85, cs: 15, admin: 40 }, overrides: ov(f(60), h(25), r({ ae: 50, cs: 30 })), note: "No activity · Ghosted · Overdue · Too few contacts · No senior sponsor · Stalled in stage. Text chips, never colour alone, each reading the observed number against the threshold set in Settings (rule 7: the state of a deal is what the AE answers for). This item replaces the old single stale marker, which said one of the six things and said it without its number." },
  { id: "deals.card.touch-reply", page: "deals", area: "Board", label: "Last touch and last reply, side by side", weekly: { ae: 45, ae_plus: 50, cs: 10, admin: 20 }, overrides: ov(f(35), h(15), r({ ae: 30, cs: 20 })), note: "\"Last touch 3d · last reply 19d\". A deal where only we have spoken is not the same as a deal that is moving, and one number could not say which it was." },
  { id: "deals.column.sum", page: "deals", area: "Board", label: "Count and sum per column", weekly: { ae: 85, cs: 15, admin: 40 }, overrides: ov(f(70), h(35), r({ cs: 30 })) },
  { id: "deals.column.weighted", page: "deals", area: "Board", label: "Weighted sum per column", weekly: { ae: 12, cs: 2, admin: 30 }, overrides: ov(f(2), h(3)) },
  { id: "deals.column.stale-count", page: "deals", area: "Board", label: "Stale deals per column", weekly: { ae: 4, admin: 12 } },
  { id: "deals.board.drag", page: "deals", area: "Board", label: "Drag a card to another stage", weekly: { ae: 70, cs: 8, admin: 10 }, overrides: ov(f(65), h(15), r({ cs: 30 })) },
  { id: "deals.board.move-menu", page: "deals", area: "Board", label: "Move to a stage from the card menu", weekly: { ae: 10, cs: 4, admin: 3 }, note: "The keyboard and touch route to the same move." },
  { id: "deals.board.closed-won-rail", page: "deals", area: "Board", label: "Closed won rail", weekly: { ae: 15, cs: 4, admin: 15 }, overrides: ov(f(10), h(10)), note: "One rail, because there are five stages and Closed won is the fifth. Lost deals are archived, so they are not a column." },
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
  { id: "deals.filter.owner", page: "deals", area: "Filters and search", label: "Owner", weekly: { ae: 4, ae_plus: 55, cs: 6, admin: 45 }, overrides: ov(f(2), h(30)), note: "For an AE with reports this is the control the 1:1s run on, so it sits in the header beside scope rather than in the filter door." },
  { id: "deals.filter.forecast", page: "deals", area: "Filters and search", label: "Forecast category", weekly: { ae: 12, cs: 2, admin: 35 }, overrides: ov(f(2), h(3)) },
  { id: "deals.filter.warnings", page: "deals", area: "Filters and search", label: "Filter by warning (the six, each with its count)", weekly: { ae: 80, ae_plus: 80, cs: 15, admin: 40 }, overrides: ov(f(45), h(25), r({ ae: 50, cs: 25 })), note: "The first filter in the door and the first thing the AE does on a Monday. It replaces the old \"No activity for 14 days\" filter, which was one of the six warnings with no name." },
  { id: "deals.filter.no-next-step", page: "deals", area: "Filters and search", label: "No next step (n), as a chip at level one", weekly: { ae: 60, ae_plus: 60, cs: 10, admin: 30 }, overrides: ov(f(35), h(20), r({ ae: 45, cs: 20 })), note: "A deal with no next step is a deal nobody is working. The chip carries its count, so the number is read without opening anything." },
  { id: "deals.filter.comments", page: "deals", area: "Filters and search", label: "Comments waiting for you (n)", weekly: { ae: 20, ae_plus: 55, cs: 6, admin: 10 }, overrides: ov(f(4), h(4), r({ ae: 12 })), note: "A comment is a note addressed to one teammate. The chip appears where the seat has reports or is on a team that comments; it is a count, never a bell interruption." },
  { id: "deals.filter.amount", page: "deals", area: "Filters and search", label: "Amount range", weekly: { ae: 3, cs: 1, admin: 3 } },
  { id: "deals.filter.company", page: "deals", area: "Filters and search", label: "Company", weekly: { ae: 4, cs: 8, admin: 3 }, overrides: r({ cs: 15 }) },
  { id: "deals.filter.created", page: "deals", area: "Filters and search", label: "Created date", weekly: { ae: 2, admin: 4 } },
  { id: "deals.filter.custom", page: "deals", area: "Filters and search", label: "Custom deal fields", weekly: { ae: 2, admin: 4 }, overrides: f(0), note: "Fathom has no custom deal fields, so the filter is removed there." },
  { id: "deals.filter.archived", page: "deals", area: "Filters and search", label: "Archived deals and the reason each was lost", weekly: { ae: 2, admin: 4 }, note: "Archived deals are off the board by default; this is how they come back into view." },

  // Actions
  { id: "deals.action.open-record", page: "deals", area: "Actions", label: "Open the deal record", weekly: { ae: 95, cs: 20, admin: 35 }, overrides: ov(f(90), h(30), r({ cs: 60 })) },
  { id: "deals.action.edit-inline", page: "deals", area: "Actions", label: "Edit amount, close date or next step in place", weekly: { ae: 55, cs: 8, admin: 10 }, overrides: ov(f(50), h(15), r({ cs: 30 })) },
  { id: "deals.action.new-deal", page: "deals", area: "Actions", label: "New deal", weekly: { ae: 15, cs: 4, admin: 4 }, overrides: ov(f(30), h(15), r({ ae: 18, cs: 30 })), note: "At Meridian most deals are created from a booked meeting on Home; here it is the fallback. At Ridgeline CS opens renewal deals." },
  { id: "deals.action.log", page: "deals", area: "Actions", label: "Log a call or note from the card", weekly: { ae: 15, cs: 6, admin: 2 }, overrides: ov(f(15), r({ ae: 8 })) },
  { id: "deals.action.change-forecast", page: "deals", area: "Actions", label: "Change forecast category", weekly: { ae: 10, cs: 1, admin: 3 } },
  { id: "deals.action.change-owner", page: "deals", area: "Actions", label: "Change owner", weekly: { ae: 3, cs: 2, admin: 12 }, overrides: ov(f(2), h(10)) },
  { id: "deals.action.close-won", page: "deals", area: "Actions", label: "Close won, showing what happens next", critical: true, weekly: { ae: 15, cs: 4, admin: 3 }, overrides: ov(f(20), r({ cs: 15 })), note: "Closing pushes to the CRM and hands the account to CS; that consequence is shown before the drop lands (rule 7)." },
  { id: "deals.action.mark-lost", page: "deals", area: "Actions", label: "Mark lost and archive, with a reason", critical: true, weekly: { ae: 18, cs: 3, admin: 3 }, overrides: ov(f(20), r({ cs: 10 })), note: "There is no Closed lost stage. The sheet says the deal leaves the board and the forecast and stays on the company; the reason is required (rule 7)." },
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
  { id: "deals.forecast.coverage", page: "deals", area: "Forecast", label: "Coverage against the coverage this team's win rate requires", weekly: { ae: 12, ae_plus: 70, cs: 1, admin: 15 }, overrides: ov(f(8), h(5), r({ ae: 10 })), note: "\"Coverage 3.1x · this team's 20% win rate needs 5.0x\": the observed figure and the required one on one line, because either alone is unreadable. Required coverage is 1 ÷ win rate (19§4.5). A rep reads it occasionally; a manager reads it every week, which is why the ae_plus number is the high one." },
  { id: "deals.forecast.omitted", page: "deals", area: "Forecast", label: "Omitted deals in the period", weekly: { ae: 3, admin: 4 }, note: "Shown only when the count is above zero (object state)." },

  // Shortcuts
  { id: "deals.kbd.shortcuts", page: "deals", area: "Shortcuts", label: "Keyboard shortcuts", weekly: { ae: 10, cs: 2, admin: 4 } },
  { id: "deals.kbd.palette", page: "deals", area: "Shortcuts", label: "Command palette", weekly: { ae: 8, cs: 3, admin: 4 }, overrides: f(6) },
]
