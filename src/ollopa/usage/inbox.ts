import type { UsageItem } from "./model"

// Inbox: replies from sequences grouped by what the person meant. 63 items in 8 areas (specs/06-inbox.md).
// Baseline numbers describe Meridian Software, where the SDR sees replies to their own mailbox and hands
// interested people to an AE.
// Fathom overrides: no AE exists, so "hand to AE" is removed; the founder (admin seat) does outbound, and the
//   workspace profile (Founder-led outbound) puts the Inbox in that sidebar. The seat does not grant the page; the
//   declared profile does (RULES.md, the declared sidebar).
// Halyard overrides: ten client workspaces, forty sequences; which sequence a reply came from is routine,
// saved replies and bulk clean-up are daily.
// Ridgeline overrides: two sequences, little outbound; the inbound SDR and expansion AE see few replies,
// and the AE turns replies into deals.

export const inboxItems: UsageItem[] = [
  // Groups (the tabs across the top; each is a view of the open replies)
  { id: "inbox.group.interested", page: "inbox", area: "Groups", label: "Interested", weekly: { sdr: 95, ae: 60 }, overrides: { fathom: { sdr: 90, admin: 80 }, ridgeline: { sdr: 60, ae: 40 } }, note: "The group the page opens on. A person who said yes and is waiting." },
  { id: "inbox.group.question", page: "inbox", area: "Groups", label: "Question", weekly: { sdr: 80, ae: 40 }, overrides: { fathom: { admin: 70 }, ridgeline: { sdr: 50, ae: 25 } } },
  { id: "inbox.group.not-now", page: "inbox", area: "Groups", label: "Not now", weekly: { sdr: 35, ae: 10 }, overrides: { fathom: { admin: 30 }, ridgeline: { sdr: 20, ae: 6 } } },
  { id: "inbox.group.out-of-office", page: "inbox", area: "Groups", label: "Out of office", weekly: { sdr: 12, ae: 3 }, overrides: { fathom: { admin: 10 }, halyard: { sdr: 15 }, ridgeline: { sdr: 4, ae: 1 } }, note: "The sequence pauses and resumes on the return date by itself, so most weeks nobody needs to look." },
  { id: "inbox.group.unsubscribe", page: "inbox", area: "Groups", label: "Unsubscribe", critical: true, weekly: { sdr: 25, ae: 4 }, overrides: { fathom: { admin: 25 }, halyard: { sdr: 40 }, ridgeline: { sdr: 10, ae: 2 } }, note: "A person asked to stop. Emailing them again is a compliance consequence, so the count is always visible (rule 7)." },
  { id: "inbox.group.handled", page: "inbox", area: "Groups", label: "Handled", weekly: { sdr: 12, ae: 8 }, overrides: { fathom: { admin: 12 }, halyard: { sdr: 15 } }, note: "Replies marked done. Looked at to find something from last week." },

  // List (the table)
  { id: "inbox.list.row", page: "inbox", area: "List", label: "Reply row: waiting time, who, what they meant, first line", weekly: { sdr: 95, ae: 60 }, overrides: { fathom: { admin: 85 }, ridgeline: { sdr: 60, ae: 40 } } },
  { id: "inbox.agent-class", page: "inbox", area: "List", label: "\"Read as: Interested · by the reply agent · change\"", weekly: { sdr: 70, ae: 40 }, overrides: { fathom: { admin: 65 }, halyard: { sdr: 75 }, ridgeline: { sdr: 45, ae: 30 } }, note: "The classifier reads every reply first, so the meaning on the row is an agent's answer and says so. Read on almost every reply the SDR opens; the correction control behind it is the existing inbox.act.change-meaning at 12." },
  { id: "inbox.list.sequence-step", page: "inbox", area: "List", label: "Sequence and step column", weekly: { sdr: 18, ae: 8 }, overrides: { fathom: { sdr: 15, admin: 15 }, halyard: { sdr: 60 }, ridgeline: { sdr: 5, ae: 2 } }, note: "Five sequences per SDR at Meridian; forty across Halyard's clients, where the sequence names the client." },
  { id: "inbox.list.owner", page: "inbox", area: "List", label: "Owner column", weekly: { sdr: 4, ae: 12 }, overrides: { fathom: { sdr: 4, admin: 4 } }, note: "The AE wants to see which SDR handed a reply over. Shown in the thread header instead." },
  { id: "inbox.list.sort", page: "inbox", area: "List", label: "Sort by column", weekly: { sdr: 3, ae: 3 }, note: "Default order is longest waiting first; almost nobody changes it." },
  { id: "inbox.list.show-more", page: "inbox", area: "List", label: "Show more rows", weekly: { sdr: 4, ae: 4 }, overrides: { fathom: { admin: 4 }, halyard: { sdr: 8 } } },

  // Filters and search
  { id: "inbox.filter.search", page: "inbox", area: "Filters and search", label: "Search by name, company or text", weekly: { sdr: 20, ae: 10 }, overrides: { fathom: { admin: 15 }, halyard: { sdr: 18 } } },
  { id: "inbox.filter.sequence", page: "inbox", area: "Filters and search", label: "Filter by sequence", weekly: { sdr: 12, ae: 5 }, overrides: { fathom: { admin: 8 }, halyard: { sdr: 30 }, ridgeline: { sdr: 4, ae: 1 } } },
  { id: "inbox.filter.owner", page: "inbox", area: "Filters and search", label: "Filter by owner", weekly: { sdr: 3, ae: 10 }, overrides: { fathom: { sdr: 4, admin: 4 } } },
  { id: "inbox.filter.date", page: "inbox", area: "Filters and search", label: "Filter by date received", weekly: { sdr: 3, ae: 3 }, overrides: { halyard: { sdr: 4 } } },
  { id: "inbox.filter.mailbox", page: "inbox", area: "Filters and search", label: "Filter by mailbox", weekly: { sdr: 4, ae: 2 }, overrides: { fathom: { admin: 3 } }, note: "Only a person with more than one linked mailbox ever needs it." },

  // Row actions (also in the thread panel header and the "…" menu)
  { id: "inbox.act.reply", page: "inbox", area: "Row actions", label: "Reply in place", weekly: { sdr: 85, ae: 50 }, overrides: { fathom: { admin: 75 }, ridgeline: { sdr: 50, ae: 35 } } },
  { id: "inbox.act.book-meeting", page: "inbox", area: "Row actions", label: "Book meeting (send calendar link)", weekly: { sdr: 60, ae: 40 }, overrides: { fathom: { admin: 55 }, halyard: { sdr: 0 }, ridgeline: { sdr: 35, ae: 30 } }, note: "Meridian, Ridgeline and Fathom have a calendar connected. Halyard has none, so the action is replaced by a line that says how to connect one, not disabled (rule 4)." },
  { id: "inbox.act.hand-to-ae", page: "inbox", area: "Row actions", label: "Hand to an AE", weekly: { sdr: 45, ae: 0 }, overrides: { fathom: { sdr: 0, admin: 0 }, halyard: { sdr: 0 }, ridgeline: { sdr: 25, ae: 0 } }, note: "Zero where the business has no AE seat; the action is removed there, not disabled (rule 4)." },
  { id: "inbox.act.done", page: "inbox", area: "Row actions", label: "Mark done", weekly: { sdr: 40, ae: 25 }, overrides: { fathom: { admin: 40 }, halyard: { sdr: 55 }, ridgeline: { sdr: 30, ae: 20 } } },
  { id: "inbox.act.not-interested", page: "inbox", area: "Row actions", label: "Mark not interested", weekly: { sdr: 30, ae: 15 }, overrides: { fathom: { admin: 30 }, halyard: { sdr: 40 }, ridgeline: { sdr: 12, ae: 6 } } },
  { id: "inbox.act.follow-up", page: "inbox", area: "Row actions", label: "Follow up on a date (Not now)", weekly: { sdr: 30, ae: 10 }, overrides: { fathom: { admin: 25 }, ridgeline: { sdr: 15, ae: 6 } } },
  { id: "inbox.act.resume", page: "inbox", area: "Row actions", label: "Resume sequence now or on return date (Out of office)", weekly: { sdr: 10, ae: 2 }, overrides: { fathom: { admin: 4 }, halyard: { sdr: 15 }, ridgeline: { sdr: 3, ae: 0 } } },
  { id: "inbox.act.confirm-unsubscribe", page: "inbox", area: "Row actions", label: "Confirm unsubscribe", critical: true, weekly: { sdr: 20, ae: 3 }, overrides: { fathom: { admin: 20 }, halyard: { sdr: 35 }, ridgeline: { sdr: 8, ae: 1 } }, note: "Adds the address to the do-not-contact list and ends every sequence. The consequence is written on the button's confirmation (rule 7)." },
  { id: "inbox.act.create-deal", page: "inbox", area: "Row actions", label: "Create deal from this reply", weekly: { sdr: 4, ae: 35 }, overrides: { fathom: { sdr: 20, admin: 35 }, ridgeline: { ae: 45 } }, note: "The AE's hand-off target where there is no AE to hand to." },
  { id: "inbox.act.open-contact", page: "inbox", area: "Row actions", label: "Open contact", weekly: { sdr: 15, ae: 25 }, overrides: { fathom: { admin: 15 }, ridgeline: { ae: 30 } } },
  { id: "inbox.act.change-meaning", page: "inbox", area: "Row actions", label: "Change what they meant", weekly: { sdr: 12, ae: 5 }, overrides: { fathom: { admin: 10 } }, note: "The classifier is right about nine times in ten; this is the tenth." },
  { id: "inbox.act.remove-from-sequence", page: "inbox", area: "Row actions", label: "Remove from sequence, keep history", weekly: { sdr: 4, ae: 2 }, overrides: { fathom: { admin: 3 } }, note: "A reply already stops the sequence; this is for the rare ruleset that keeps sending." },
  { id: "inbox.act.add-note", page: "inbox", area: "Row actions", label: "Add a note to the contact", weekly: { sdr: 4, ae: 15 }, overrides: { fathom: { admin: 4 } } },
  { id: "inbox.act.forward", page: "inbox", area: "Row actions", label: "Forward thread to a colleague", weekly: { sdr: 3, ae: 6 }, overrides: { fathom: { admin: 3 } } },
  { id: "inbox.act.open-in-mailbox", page: "inbox", area: "Row actions", label: "Open in Gmail or Outlook", weekly: { sdr: 5, ae: 8 }, overrides: { fathom: { admin: 4 } } },
  { id: "inbox.act.assign", page: "inbox", area: "Row actions", label: "Assign to another SDR", weekly: { sdr: 4, ae: 1 }, overrides: { fathom: { admin: 2 }, halyard: { sdr: 12 } } },
  { id: "inbox.act.add-to-list", page: "inbox", area: "Row actions", label: "Add to list", weekly: { sdr: 3, ae: 1 } },
  { id: "inbox.act.mark-unread", page: "inbox", area: "Row actions", label: "Mark unread", weekly: { sdr: 4, ae: 3 }, overrides: { fathom: { admin: 4 } } },
  { id: "inbox.act.mark-spam", page: "inbox", area: "Row actions", label: "Mark as spam or bot reply", weekly: { sdr: 2, ae: 1 } },
  { id: "inbox.act.report-misread", page: "inbox", area: "Row actions", label: "Report a misread reply", weekly: { sdr: 2, ae: 1 } },

  // Thread panel
  { id: "inbox.thread.panel", page: "inbox", area: "Thread panel", label: "Thread panel: the reply in full, contact header, actions", weekly: { sdr: 90, ae: 55 }, overrides: { fathom: { admin: 80 }, ridgeline: { sdr: 55, ae: 35 } } },
  { id: "inbox.thread.earlier-messages", page: "inbox", area: "Thread panel", label: "Earlier messages in this thread (the steps we sent)", weekly: { sdr: 18, ae: 30 }, overrides: { fathom: { admin: 15 }, ridgeline: { sdr: 10, ae: 30 } }, note: "The SDR wrote the steps; the AE receiving a hand-off did not and reads them." },
  { id: "inbox.agent-draft", page: "inbox", area: "Thread panel", label: "Agent draft door beside the composer", critical: true, weekly: { sdr: 55, ae: 30 }, overrides: { fathom: { admin: 50 }, halyard: { sdr: 60 }, ridgeline: { sdr: 30, ae: 20 } }, note: "Sending is the approval, so the recipient and the whole text are on screen before the click (rule 7). Critical at every business, including Ridgeline's 20% AE." },
  { id: "inbox.thread.saved-replies", page: "inbox", area: "Thread panel", label: "Insert a saved reply", weekly: { sdr: 18, ae: 6 }, overrides: { fathom: { admin: 18 }, halyard: { sdr: 35 }, ridgeline: { sdr: 6, ae: 2 } } },
  { id: "inbox.thread.contact-details", page: "inbox", area: "Thread panel", label: "Contact details: title, email status, phone, open deal", weekly: { sdr: 12, ae: 25 }, overrides: { fathom: { admin: 12 }, ridgeline: { ae: 30 } } },
  { id: "inbox.thread.schedule-send", page: "inbox", area: "Thread panel", label: "Schedule send", weekly: { sdr: 4, ae: 5 }, overrides: { fathom: { admin: 4 } } },
  { id: "inbox.thread.cc", page: "inbox", area: "Thread panel", label: "Cc and Bcc", weekly: { sdr: 3, ae: 8 }, overrides: { fathom: { admin: 3 } } },
  { id: "inbox.thread.attach", page: "inbox", area: "Thread panel", label: "Attach a file", weekly: { sdr: 2, ae: 4 } },
  { id: "inbox.thread.activity", page: "inbox", area: "Thread panel", label: "Opens, clicks and earlier replies", weekly: { sdr: 4, ae: 3 }, overrides: { fathom: { admin: 3 } } },
  { id: "inbox.thread.crm-sync", page: "inbox", area: "Thread panel", label: "CRM sync status of this thread", weekly: { sdr: 1, ae: 3 }, overrides: { fathom: { sdr: 0, admin: 0 } }, note: "Fathom has no CRM connected; the line is removed." },
  { id: "inbox.thread.diagnostics", page: "inbox", area: "Thread panel", label: "Delivery diagnostics and headers", weekly: { sdr: 2, ae: 1 } },
  { id: "inbox.thread.translate", page: "inbox", area: "Thread panel", label: "Translate reply", weekly: { sdr: 1, ae: 1 } },
  { id: "inbox.thread.print", page: "inbox", area: "Thread panel", label: "Print thread", weekly: { sdr: 1, ae: 1 } },
  { id: "inbox.thread.signature", page: "inbox", area: "Thread panel", label: "Include signature", weekly: { sdr: 2, ae: 2 } },

  // Meeting and handoff (X-meeting, owned here and rendered by Tasks and the deal record)
  { id: "inbox.meeting-panel", page: "inbox", area: "Meeting and handoff", label: "Meeting panel: state, times, attendees, prep brief, summary, follow-up", weekly: { sdr: 45, ae: 35, cs: 20 }, overrides: { fathom: { admin: 40 }, halyard: { sdr: 0 }, ridgeline: { sdr: 25, ae: 30, cs: 25 } }, note: "One node, three parents: this page, a meeting task row and the deal record. The CS number describes the same panel opened from Tasks and the deal record, where a kickoff and a business review are meetings; customer success has no Inbox area. Zero at Halyard, where no calendar is connected and the panel is replaced by the connect line, not disabled." },
  { id: "inbox.handoff-block", page: "inbox", area: "Meeting and handoff", label: "Handoff block: four fields in the buyer's words, checklist, Create the deal and assign", critical: true, weekly: { sdr: 40, ae: 10 }, overrides: { fathom: { sdr: 20, admin: 20 }, halyard: { sdr: 12 }, ridgeline: { sdr: 20, ae: 8 } }, note: "\"Create the deal and assign\" names the owner and the territory before the click (rule 7). Where no AE seat exists the assignment half is removed and the control creates the deal for the person clicking, which is why Fathom and Halyard are lower rather than zero." },
  { id: "inbox.acceptance-rate", page: "inbox", area: "Meeting and handoff", label: "Your handoffs accepted this quarter", weekly: { sdr: 20, ae: 4 }, overrides: { fathom: { sdr: 0, admin: 0 }, halyard: { sdr: 0 }, ridgeline: { sdr: 12 } }, note: "The number the SDR is paid on, so it sits beside the control that produces it and never behind a door. Zero where there is no AE to accept a handoff." },

  // Bulk (appears once a row is selected)
  { id: "inbox.bulk.select", page: "inbox", area: "Bulk", label: "Select rows", weekly: { sdr: 15, ae: 3 }, overrides: { fathom: { admin: 15 }, halyard: { sdr: 18 } } },
  { id: "inbox.bulk.done", page: "inbox", area: "Bulk", label: "Mark selected done", weekly: { sdr: 12, ae: 2 }, overrides: { fathom: { admin: 12 }, halyard: { sdr: 18 } } },
  { id: "inbox.bulk.not-interested", page: "inbox", area: "Bulk", label: "Mark selected not interested", weekly: { sdr: 4, ae: 2 }, overrides: { fathom: { admin: 4 }, halyard: { sdr: 12 } } },
  { id: "inbox.bulk.hand-to-ae", page: "inbox", area: "Bulk", label: "Hand selected to an AE", weekly: { sdr: 3, ae: 0 }, overrides: { fathom: { sdr: 0, admin: 0 }, halyard: { sdr: 0 } } },
  { id: "inbox.bulk.unsubscribe", page: "inbox", area: "Bulk", label: "Confirm selected unsubscribes", weekly: { sdr: 6, ae: 1 }, overrides: { fathom: { admin: 6 }, halyard: { sdr: 15 } } },
  { id: "inbox.bulk.export", page: "inbox", area: "Bulk", label: "Export selected as CSV", weekly: { sdr: 2, ae: 1 }, overrides: { halyard: { sdr: 4 } } },

  // Keyboard
  { id: "inbox.key.shortcuts", page: "inbox", area: "Keyboard", label: "Row shortcuts (j, k, Enter, r, b, d, n, h, u)", weekly: { sdr: 15, ae: 6 }, overrides: { fathom: { admin: 15 }, ridgeline: { sdr: 4, ae: 2 } }, note: "Shown next to each menu item so the number can grow (rule 8)." },
  { id: "inbox.key.sheet", page: "inbox", area: "Keyboard", label: "Shortcut sheet (?)", weekly: { sdr: 4, ae: 3 }, overrides: { fathom: { admin: 4 } } },
  { id: "inbox.key.palette", page: "inbox", area: "Keyboard", label: "Command palette", weekly: { sdr: 4, ae: 5 }, overrides: { fathom: { admin: 5 } } },
]
