import type { UsageItem } from "./model"

// Tasks page: 48 items in 8 areas (specs/07-tasks.md). Baseline numbers describe Meridian Software.
// Fathom overrides: everyone is an admin and the founders do outbound, so the admin numbers look like an SDR's.
// Halyard overrides: outbound specialists work ten client queues; the ops lead reassigns and reports weekly.
// Ridgeline overrides: little outbound; tasks are renewal and expansion follow-ups, so CS and AE rise, SDR falls.
// The SDR at Meridian has a head near 40% of items: this is an operate-all-day screen, the density case in PRODUCT.md.
// The marketer seat has no access to the area, so it carries no number; the page shows the no-access state naming who does.
// At Fathom and Halyard the admin seat works tasks because the workspace profile (Founder-led outbound, Agency) puts
// Tasks in that sidebar, not because the role title grants it.
// The page opens in queue mode for the SDR and AE seats and on the list for CS and admin (the S1 walk decision,
// 15 Sep 2026); "tasks.mode-switch" is the one labelled control that swaps the two, in either direction.
// The call, LinkedIn and meeting panels are level-2 nodes opened from a row or from the queue body, never from
// inside the row door. The meeting panel carries its number in inbox.ts, which owns X-meeting for the product.

export const tasksItems: UsageItem[] = [
  // Rows
  { id: "tasks.rows", page: "tasks", area: "Rows", label: "Task rows: due, type, contact, what to do, from", weekly: { sdr: 95, ae: 55, cs: 20, admin: 20 }, overrides: { fathom: { admin: 90 }, halyard: { admin: 45 }, ridgeline: { sdr: 45, ae: 40, cs: 40, admin: 10 } }, note: "The page's own content, at 95% for the SDR: head by usage, not by rule 7. The overdue count above it carries the safety state." },
  { id: "tasks.summary", page: "tasks", area: "Rows", label: "Due today and overdue counts", critical: true, weekly: { sdr: 95, ae: 50, cs: 20, admin: 25 }, overrides: { fathom: { admin: 90 }, halyard: { admin: 55 }, ridgeline: { sdr: 45, ae: 35, cs: 40 } }, note: "Safety state (rule 7): an overdue sequence task means a contact is stuck at that step and the sequence is waiting. Level one for every seat that has the page, including the Ridgeline admin at 10." },
  { id: "tasks.owner-column", page: "tasks", area: "Rows", label: "Owner column", weekly: { admin: 20 }, overrides: { fathom: { admin: 60, sdr: 30 }, halyard: { admin: 50 }, ridgeline: { admin: 8 } }, note: "Appears when the owner filter is not 'Me'. At Fathom everyone sees everyone." },
  { id: "tasks.row-score", page: "tasks", area: "Rows", label: "Fit or intent score with its previous value", weekly: {}, overrides: { ridgeline: { sdr: 35, ae: 15 } }, note: "Only Ridgeline scores contacts; the chip is removed elsewhere, not shown empty (rule 4). Text and an arrow, never colour alone, and the row never moves when a score changes (rule 6)." },
  { id: "tasks.dnc-badge", page: "tasks", area: "Rows", label: "Phone with its do-not-call badge", critical: true, weekly: { sdr: 60, ae: 20, cs: 6 }, overrides: { fathom: { admin: 55 }, halyard: { sdr: 70 }, ridgeline: { sdr: 12, ae: 8 } }, note: "Calling a flagged person is a compliance consequence, so the flag sits on the number it applies to and never across a door from it (rule 7)." },
  { id: "tasks.details", page: "tasks", area: "Rows", label: "Row door: step history and contact details", weekly: { sdr: 55, ae: 25, cs: 12, admin: 5 }, overrides: { ridgeline: { sdr: 25, cs: 30 } } },
  { id: "tasks.local-time", page: "tasks", area: "Rows", label: "Contact local time", weekly: { sdr: 15, ae: 8, cs: 4 }, overrides: { halyard: { sdr: 40 }, ridgeline: { sdr: 3 } }, note: "Halyard calls across time zones all day, so it moves from the door into the Due cell." },

  // Actions
  { id: "tasks.done", page: "tasks", area: "Actions", label: "Done", weekly: { sdr: 95, ae: 55, cs: 20, admin: 15 }, overrides: { fathom: { admin: 85 }, halyard: { admin: 30 }, ridgeline: { sdr: 45, ae: 40, cs: 40, admin: 6 } } },
  { id: "tasks.outcome", page: "tasks", area: "Actions", label: "Call outcome on done", weekly: { sdr: 50, ae: 20, cs: 6, admin: 5 }, overrides: { fathom: { admin: 45 }, ridgeline: { sdr: 12, ae: 10, cs: 10 } } },
  { id: "tasks.snooze", page: "tasks", area: "Actions", label: "Snooze to tomorrow", weekly: { sdr: 65, ae: 35, cs: 12, admin: 8 }, overrides: { fathom: { admin: 60 }, halyard: { sdr: 70 }, ridgeline: { sdr: 25, ae: 25, cs: 25 } } },
  { id: "tasks.snooze-date", page: "tasks", area: "Actions", label: "Snooze until a chosen date", weekly: { sdr: 15, ae: 12, cs: 8, admin: 3 }, overrides: { ridgeline: { ae: 15, cs: 20 } } },
  { id: "tasks.skip", page: "tasks", area: "Actions", label: "Skip: the contact moves to the next step", critical: true, weekly: { sdr: 35, ae: 10, cs: 3, admin: 4 }, overrides: { fathom: { admin: 30 }, ridgeline: { sdr: 8 } }, note: "The consequence is written on the control (rule 7)." },
  { id: "tasks.write-email", page: "tasks", area: "Actions", label: "Write the email", weekly: { sdr: 70, ae: 25, cs: 12, admin: 5 }, overrides: { fathom: { admin: 65 }, ridgeline: { sdr: 30, ae: 20, cs: 30 } } },
  { id: "tasks.open-contact", page: "tasks", area: "Actions", label: "Open contact", weekly: { sdr: 18, ae: 30, cs: 15, admin: 5 }, overrides: { ridgeline: { cs: 30 } }, note: "The row door shows the contact essentials, so the full page is opened less than expected." },
  { id: "tasks.new", page: "tasks", area: "Actions", label: "New task", weekly: { sdr: 25, ae: 30, cs: 15, admin: 6 }, overrides: { fathom: { admin: 30 }, ridgeline: { sdr: 15, ae: 35, cs: 35 } } },
  { id: "tasks.note", page: "tasks", area: "Actions", label: "Add a note to a task", weekly: { sdr: 15, ae: 20, cs: 10, admin: 2 }, overrides: { ridgeline: { cs: 25 } } },
  { id: "tasks.edit", page: "tasks", area: "Actions", label: "Change a task's due date, type or title", weekly: { sdr: 8, ae: 12, cs: 5, admin: 3 } },
  { id: "tasks.reassign", page: "tasks", area: "Actions", label: "Reassign", weekly: { admin: 12 }, overrides: { fathom: { admin: 8 }, halyard: { admin: 35 }, ridgeline: { admin: 4 } }, note: "Halyard rotates specialists between clients weekly." },
  { id: "tasks.delete", page: "tasks", area: "Actions", label: "Delete a manual task", critical: true, weekly: { sdr: 4, ae: 5, cs: 2, admin: 3 }, note: "Destructive: the control and what it removes are visible without a click, like every other delete in the product (rule 7)." },

  // Work the queue
  { id: "tasks.queue", page: "tasks", area: "Work the queue", label: "Work the queue", weekly: { sdr: 85, ae: 15, cs: 5, admin: 5 }, overrides: { fathom: { admin: 75 }, halyard: { sdr: 90 }, ridgeline: { sdr: 30, ae: 8, cs: 10, admin: 2 } } },
  { id: "tasks.mode-switch", page: "tasks", area: "Work the queue", label: "Switch between the queue and \"All tasks (n)\"", weekly: { sdr: 45, ae: 35, cs: 25, admin: 30 }, overrides: { fathom: { admin: 50 }, halyard: { sdr: 55, admin: 45 }, ridgeline: { sdr: 30, ae: 30, cs: 35, admin: 15 } }, note: "One labelled control, used in both directions: the SDR and AE open in the queue and switch out to look something up; CS and admin open on the list and switch in. It replaces the body rather than nesting, so the list's doors stay level two." },
  { id: "tasks.queue-sort-score", page: "tasks", area: "Work the queue", label: "Sort the queue by call score", weekly: { sdr: 20, ae: 5 }, overrides: { fathom: { admin: 15 }, halyard: { sdr: 25 }, ridgeline: { sdr: 8 } }, note: "Due is the default and stays it; the agent's ranking is never applied unless a person chooses it, and the choice persists (rule 6)." },
  { id: "tasks.queue-keys", page: "tasks", area: "Work the queue", label: "Keyboard shortcuts in the queue", weekly: { sdr: 30, ae: 5, cs: 1, admin: 1 }, overrides: { halyard: { sdr: 50 }, ridgeline: { sdr: 8 } }, note: "Shown next to every action label so people graduate to them (rule 8)." },

  // The call (X-calllog: one node, four parents — a task row, the queue body, the contact record, the deal record)
  { id: "tasks.call-disposition", page: "tasks", area: "The call", label: "Disposition, with what each one does to the sequence", critical: true, weekly: { sdr: 90, ae: 35, cs: 8, admin: 8 }, overrides: { fathom: { admin: 80 }, halyard: { sdr: 92 }, ridgeline: { sdr: 12, ae: 15, cs: 10 } }, note: "Connected and Connected, not interested end the sequence for that contact; the others let it continue. The consequence line is above the control, always (rule 5, rule 7)." },
  { id: "tasks.call-notes", page: "tasks", area: "The call", label: "Call notes", weekly: { sdr: 70, ae: 30, cs: 12 }, overrides: { fathom: { admin: 65 }, halyard: { sdr: 75 }, ridgeline: { sdr: 12, ae: 15, cs: 15 } } },
  { id: "tasks.call-purpose", page: "tasks", area: "The call", label: "Call purpose", weekly: { sdr: 55, ae: 20 }, overrides: { fathom: { admin: 50 }, halyard: { sdr: 60 }, ridgeline: { sdr: 10, ae: 10 } }, note: "Prefilled from the sequence step where there is one." },
  { id: "tasks.call-duration", page: "tasks", area: "The call", label: "Duration timer, correctable by hand", weekly: { sdr: 40, ae: 15 }, overrides: { fathom: { admin: 35 }, halyard: { sdr: 45 }, ridgeline: { sdr: 6, ae: 8 } } },
  { id: "tasks.call-read", page: "tasks", area: "The call", label: "Read a logged call someone else made", weekly: { sdr: 8, ae: 12, ae_plus: 70, cs: 10, admin: 4 }, overrides: { fathom: { admin: 15 }, halyard: { admin: 25 }, ridgeline: { cs: 15 } }, note: "The owner logs; anyone who can see the record reads. This is how a manager coaches without a second surface, and why the panel has a read mode rather than a call library." },
  { id: "tasks.call-coaching-note", page: "tasks", area: "The call", label: "Coaching note: what went well, what to change, one behaviour", weekly: { sdr: 12, ae: 4, ae_plus: 60, admin: 2 }, overrides: { halyard: { admin: 20, sdr: 18 }, ridgeline: { sdr: 4 } }, note: "Written by the manager inside the call, read by the rep. An agent may suggest the three answers with a state chip; nothing reaches the rep until a person accepts it (rule 7)." },
  { id: "tasks.call-transcript", page: "tasks", area: "The call", label: "Transcript, where an integration supplied one", weekly: { sdr: 6, ae: 10, ae_plus: 35, cs: 6 }, overrides: { fathom: { sdr: 0, admin: 0 }, halyard: { sdr: 0 }, ridgeline: { ae: 12, cs: 8 } }, note: "ollopA does not record; an integration may supply a transcript. Where none did, the block is removed, not disabled (rule 4). Zero at Fathom and Halyard, which have no such integration." },

  // The LinkedIn step (X-linkedin)
  { id: "tasks.linkedin-message", page: "tasks", area: "The LinkedIn step", label: "The message text, editable for this send", weekly: { sdr: 55, ae: 8 }, overrides: { fathom: { admin: 40 }, halyard: { sdr: 60 }, ridgeline: { sdr: 8 } }, note: "Written once on the sequence step and rendered here; editing here changes this send only." },
  { id: "tasks.linkedin-copy", page: "tasks", area: "The LinkedIn step", label: "Copy message and open the profile", weekly: { sdr: 55, ae: 8 }, overrides: { fathom: { admin: 40 }, halyard: { sdr: 60 }, ridgeline: { sdr: 8 } }, note: "ollopA cannot see LinkedIn; marking complete records that the person sent it, and the line above the button says so (rule 4)." },
  { id: "tasks.invite-counter", page: "tasks", area: "The LinkedIn step", label: "Invites this week, against about 100", critical: true, weekly: { sdr: 25, ae: 3 }, overrides: { fathom: { admin: 18 }, halyard: { sdr: 40 }, ridgeline: { sdr: 4 } }, note: "A cap invisible until it is hit is a limit hidden from the person it punishes. The cap is LinkedIn's, not ollopA's, and the counter says so (rule 7)." },

  // Find
  { id: "tasks.search", page: "tasks", area: "Find", label: "Search", weekly: { sdr: 15, ae: 10, cs: 6, admin: 15 }, overrides: { halyard: { sdr: 18, admin: 30 } } },
  { id: "tasks.filter-type", page: "tasks", area: "Find", label: "Filter by type", weekly: { sdr: 30, ae: 10, cs: 4, admin: 8 }, overrides: { halyard: { sdr: 40 }, ridgeline: { sdr: 8 } } },
  { id: "tasks.filter-due", page: "tasks", area: "Find", label: "Filter by due: overdue, today, this week, all", weekly: { sdr: 25, ae: 15, cs: 8, admin: 15 }, overrides: { halyard: { admin: 30 } } },
  { id: "tasks.filter-source", page: "tasks", area: "Find", label: "Filter by source: a sequence, manual, an agent", weekly: { sdr: 12, ae: 4, cs: 2, admin: 8 }, overrides: { halyard: { sdr: 25 }, ridgeline: { sdr: 2 } }, note: "Halyard filters by client sequence." },
  { id: "tasks.filter-owner", page: "tasks", area: "Find", label: "Filter by owner", weekly: { admin: 25 }, overrides: { fathom: { admin: 50, sdr: 20 }, halyard: { admin: 55 }, ridgeline: { admin: 10 } } },
  { id: "tasks.filter-status", page: "tasks", area: "Find", label: "Filter by status: open, snoozed, done, skipped", weekly: { sdr: 10, ae: 8, cs: 4, admin: 15 }, overrides: { halyard: { admin: 30 } } },
  { id: "tasks.sort", page: "tasks", area: "Find", label: "Sort by due, type or contact", weekly: { sdr: 6, ae: 4, cs: 2, admin: 5 } },

  // Bulk
  { id: "tasks.bulk-done", page: "tasks", area: "Bulk", label: "Bulk done", weekly: { sdr: 12, ae: 4, cs: 1, admin: 3 }, overrides: { halyard: { sdr: 18 } } },
  { id: "tasks.bulk-snooze", page: "tasks", area: "Bulk", label: "Bulk snooze", weekly: { sdr: 10, ae: 4, cs: 1, admin: 3 }, overrides: { halyard: { sdr: 18 } } },
  { id: "tasks.bulk-skip", page: "tasks", area: "Bulk", label: "Bulk skip", weekly: { sdr: 6, ae: 2, cs: 0.5, admin: 3 }, overrides: { halyard: { sdr: 12 } } },
  { id: "tasks.bulk-reassign", page: "tasks", area: "Bulk", label: "Bulk reassign", weekly: { admin: 5 }, overrides: { halyard: { admin: 25 } } },

  // Housekeeping
  { id: "tasks.export", page: "tasks", area: "Housekeeping", label: "Export CSV", weekly: { sdr: 1, ae: 1, cs: 1, admin: 3 }, overrides: { halyard: { admin: 10 } }, note: "Halyard reports activity to clients." },
  { id: "tasks.columns", page: "tasks", area: "Housekeeping", label: "Show or hide columns", weekly: { sdr: 3, ae: 2, cs: 1, admin: 2 } },
  { id: "tasks.expand-all", page: "tasks", area: "Housekeeping", label: "Expand all row details", weekly: { sdr: 5, ae: 3, cs: 2, admin: 2 } },
  { id: "tasks.shortcut-list", page: "tasks", area: "Housekeeping", label: "Shortcut list", weekly: { sdr: 4, ae: 2, cs: 1, admin: 1 } },
]
