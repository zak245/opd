import type { UsageItem } from "./model"

// Deal record: 68 items in 9 areas (specs/09-deal-record.md). Baseline numbers describe Meridian Software.
// "Touch" on a record page means the user reads the item to decide something or edits it. Reading the deal
// name to know where you are is not a touch; it is the page title.
// The AE is the resident role: their head is about a third of the page, above the shape's ceiling, and that
// is the density argument (PRODUCT.md). Admin and CS at Meridian fit the head-body-tail shape.
// Fathom overrides: founders (admin) work the deals; no CRM, one pipeline, one currency, no custom fields.
// Halyard overrides: the ops lead (admin) tracks hand-offs to ten client CRMs; custom fields and sync are daily.
// Ridgeline overrides: expansion and renewal deals; product signals and plan fields are the working set for AE and CS.
// SDR and marketer have no access to deals; their numbers are absent and the page names who has access.
// Five stages only; a lost deal is archived with a reason, so there is no "Closed lost" stage (PLAN.md, 13 Sep 2026).

export const dealItems: UsageItem[] = [
  // Header fields
  { id: "deal.stage", page: "deal", area: "Header fields", label: "Stage", weekly: { ae: 95, cs: 60, admin: 40 }, overrides: { fathom: { admin: 80 }, halyard: { admin: 70 }, ridgeline: { cs: 80 } }, note: "Moving the stage is the job. The stepper is the page's spine." },
  { id: "deal.amount", page: "deal", area: "Header fields", label: "Amount", weekly: { ae: 70, cs: 45, admin: 35 }, overrides: { fathom: { admin: 60 }, halyard: { admin: 30 } } },
  { id: "deal.close-date", page: "deal", area: "Header fields", label: "Close date", weekly: { ae: 75, cs: 60, admin: 35 }, overrides: { fathom: { admin: 55 }, halyard: { admin: 25 }, ridgeline: { cs: 80 } }, note: "At Ridgeline the close date of a renewal is the renewal date CS lives by." },
  { id: "deal.next-step", page: "deal", area: "Header fields", label: "Next step and its date", weekly: { ae: 85, cs: 55, admin: 30 }, overrides: { fathom: { admin: 70 }, halyard: { admin: 60 } } },
  { id: "deal.owner", page: "deal", area: "Header fields", label: "Owner", weekly: { ae: 15, cs: 10, admin: 30 }, overrides: { fathom: { admin: 10 }, halyard: { admin: 45 } }, note: "Admins reassign; AEs rarely give a deal away. Halyard moves deals between specialists as client work shifts." },
  { id: "deal.probability", page: "deal", area: "Header fields", label: "Probability", weekly: { ae: 15, cs: 10, admin: 18 }, overrides: { fathom: { admin: 6 }, halyard: { admin: 4 } }, note: "Set by the stage; overridden rarely. Below 20 nearly everywhere, but it never leaves the stage group (rule 5)." },
  { id: "deal.forecast", page: "deal", area: "Header fields", label: "Forecast category", weekly: { ae: 25, cs: 20, admin: 35 }, overrides: { fathom: { admin: 6 }, halyard: { admin: 4 }, ridgeline: { cs: 30 } }, note: "Set by the stage; the AE overrides it on commit. Stays with stage and probability wherever the number lands (rule 5)." },
  { id: "deal.last-activity", page: "deal", area: "Header fields", label: "Last activity", weekly: { ae: 40, cs: 35, admin: 40 }, overrides: { halyard: { admin: 50 } }, note: "The staleness check: how long since anyone touched this deal." },
  { id: "deal.created", page: "deal", area: "Header fields", label: "Created date and age", weekly: { ae: 10, cs: 6, admin: 15 } },
  { id: "deal.rename", page: "deal", area: "Header fields", label: "Rename deal", weekly: { ae: 5, cs: 3, admin: 3 } },
  { id: "deal.currency", page: "deal", area: "Header fields", label: "Currency", weekly: { ae: 6, cs: 2, admin: 3 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 0 }, ridgeline: { ae: 0, cs: 0, admin: 0 } }, note: "Only Meridian sells in more than one currency. Elsewhere the control is removed, not disabled (rule 4)." },
  { id: "deal.pipeline", page: "deal", area: "Header fields", label: "Pipeline", weekly: { ae: 4, cs: 4, admin: 6 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 0 }, ridgeline: { ae: 6, cs: 8, admin: 8 } }, note: "Fathom and Halyard have one pipeline; the field is removed." },

  // Closing
  { id: "close.won", page: "deal", area: "Closing", label: "Mark won", weekly: { ae: 45, cs: 35, admin: 15 }, overrides: { fathom: { admin: 30 }, halyard: { admin: 20 } }, note: "About half of Meridian's AEs close something in a given week." },
  { id: "close.lost", page: "deal", area: "Closing", label: "Mark lost and archive, with a reason", weekly: { ae: 35, cs: 25, admin: 15 }, overrides: { fathom: { admin: 25 }, halyard: { admin: 25 } }, note: "Archiving is how a deal is lost; the reason is required and the consequence is stated before it happens. Halyard archives 'client rejected' often." },
  { id: "close.reopen", page: "deal", area: "Closing", label: "Reopen a closed deal", weekly: { ae: 3, cs: 5, admin: 3 } },
  { id: "close.delete", page: "deal", area: "Closing", label: "Delete deal", critical: true, weekly: { ae: 1, cs: 0.5, admin: 3 }, note: "Destructive. The button and its consequence are visible without a click (rule 7)." },

  // Activity timeline
  { id: "timeline.list", page: "deal", area: "Activity timeline", label: "Activity timeline", weekly: { ae: 95, cs: 75, admin: 60 }, overrides: { fathom: { admin: 80 }, halyard: { admin: 70 } } },
  { id: "timeline.log-call", page: "deal", area: "Activity timeline", label: "Log a call", weekly: { ae: 70, cs: 35, admin: 12 }, overrides: { fathom: { admin: 55 }, halyard: { admin: 5 }, ridgeline: { ae: 50 } } },
  { id: "timeline.email", page: "deal", area: "Activity timeline", label: "Email a contact from the deal", weekly: { ae: 40, cs: 40, admin: 10 }, overrides: { fathom: { admin: 45 }, halyard: { admin: 8 } }, note: "Sent and received emails arrive on the timeline from the mailbox; this is writing one from here." },
  { id: "timeline.log-meeting", page: "deal", area: "Activity timeline", label: "Log a meeting", weekly: { ae: 15, cs: 12, admin: 8 }, overrides: { fathom: { admin: 20 } }, note: "Meetings arrive from the calendar; manual logging is the exception." },
  { id: "timeline.note", page: "deal", area: "Activity timeline", label: "Add a note", weekly: { ae: 60, cs: 55, admin: 25 }, overrides: { fathom: { admin: 50 }, halyard: { admin: 55 } } },
  { id: "timeline.filter", page: "deal", area: "Activity timeline", label: "Filter the timeline by kind", weekly: { ae: 30, cs: 20, admin: 25 } },
  { id: "timeline.full-email", page: "deal", area: "Activity timeline", label: "Show the full email", weekly: { ae: 25, cs: 20, admin: 10 }, note: "A door per timeline item, expanded in place. One level from the page." },
  { id: "timeline.pin", page: "deal", area: "Activity timeline", label: "Pin a note to the top", weekly: { ae: 8, cs: 10, admin: 3 } },
  { id: "timeline.edit-note", page: "deal", area: "Activity timeline", label: "Edit or delete a note", weekly: { ae: 8, cs: 6, admin: 3 } },
  { id: "timeline.load-older", page: "deal", area: "Activity timeline", label: "Load older activity", weekly: { ae: 20, cs: 15, admin: 15 } },

  // Tasks
  { id: "tasks.list", page: "deal", area: "Tasks", label: "Open tasks on this deal", weekly: { ae: 45, cs: 40, admin: 15 }, overrides: { fathom: { admin: 40 }, halyard: { admin: 30 } } },
  { id: "tasks.create", page: "deal", area: "Tasks", label: "Create a task", weekly: { ae: 45, cs: 35, admin: 10 }, overrides: { fathom: { admin: 35 }, halyard: { admin: 25 } } },
  { id: "deal.tasks.done", page: "deal", area: "Tasks", label: "Mark a task done", weekly: { ae: 20, cs: 20, admin: 5 }, note: "Most tasks are closed from the Tasks page; here it is the one you notice while reading the deal." },

  // Contacts and company
  { id: "contacts.list", page: "deal", area: "Contacts and company", label: "Contacts on the deal, with roles", weekly: { ae: 70, cs: 55, admin: 35 }, overrides: { fathom: { admin: 60 }, halyard: { admin: 45 } } },
  { id: "contacts.add", page: "deal", area: "Contacts and company", label: "Add a contact", weekly: { ae: 18, cs: 12, admin: 10 }, overrides: { fathom: { admin: 20 } } },
  { id: "contacts.role", page: "deal", area: "Contacts and company", label: "Set a contact's role", weekly: { ae: 15, cs: 8, admin: 5 } },
  { id: "contacts.remove", page: "deal", area: "Contacts and company", label: "Remove a contact", weekly: { ae: 4, cs: 2, admin: 2 } },
  { id: "company.card", page: "deal", area: "Contacts and company", label: "Company summary", weekly: { ae: 50, cs: 60, admin: 30 }, overrides: { fathom: { admin: 45 }, halyard: { admin: 35 } } },
  { id: "company.related-deals", page: "deal", area: "Contacts and company", label: "Other deals at this company", weekly: { ae: 12, cs: 30, admin: 10 }, overrides: { ridgeline: { ae: 30, cs: 45 } }, note: "Renewal and expansion run side by side at Ridgeline, so the other deal is always relevant there." },
  { id: "company.signals", page: "deal", area: "Contacts and company", label: "Company signals and news", weekly: { ae: 15, cs: 10, admin: 5 }, overrides: { fathom: { admin: 30 }, ridgeline: { ae: 45, cs: 50 } }, note: "Product usage signals at Ridgeline; agent research at Fathom. A door at Meridian, a card at both." },
  { id: "enrich.run", page: "deal", area: "Contacts and company", label: "Enrich company and contacts (credits)", weekly: { ae: 6, cs: 3, admin: 8 }, overrides: { fathom: { admin: 20 } }, note: "Shows the credit cost on the button (rule 7)." },

  // Details behind doors
  { id: "fields.custom", page: "deal", area: "Details", label: "Custom fields", weekly: { ae: 12, cs: 10, admin: 15 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 65 }, ridgeline: { ae: 40, cs: 45, admin: 20 } }, note: "Meridian: six fields, a door. Fathom: none, door removed. Halyard: hand-off status is the job, so the fields sit in the header. Ridgeline: plan and seats, same." },
  { id: "fields.all", page: "deal", area: "Details", label: "All fields", weekly: { ae: 6, cs: 4, admin: 12 }, overrides: { fathom: { admin: 4 } }, note: "Deal type, source, campaign, CRM id and the rest of the tail below." },
  { id: "history.changes", page: "deal", area: "Details", label: "History of stage and field changes", weekly: { ae: 12, cs: 8, admin: 25 }, overrides: { halyard: { admin: 25 }, fathom: { admin: 6 } }, note: "Admins audit; Halyard checks when a client moved a deal. Open by default for them, a door for the AE." },
  { id: "files.list", page: "deal", area: "Details", label: "Files", weekly: { ae: 12, cs: 15, admin: 5 }, overrides: { halyard: { admin: 3 }, fathom: { admin: 8 } } },
  { id: "files.upload", page: "deal", area: "Details", label: "Upload a file", weekly: { ae: 8, cs: 10, admin: 3 } },
  { id: "files.delete", page: "deal", area: "Details", label: "Delete a file", weekly: { ae: 1, cs: 1, admin: 1 } },

  // Sync and agents
  { id: "sync.status", page: "deal", area: "Sync and agents", label: "CRM sync status and link", weekly: { ae: 20, cs: 10, admin: 35 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 55 }, ridgeline: { ae: 15, cs: 10, admin: 25 } }, note: "Shown only when a CRM is connected (object state). Fathom has none. Halyard hands every deal to a client CRM." },
  { id: "sync.history", page: "deal", area: "Sync and agents", label: "Sync history and errors for this deal", weekly: { ae: 4, cs: 2, admin: 15 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 20 } } },
  { id: "agent.proposal", page: "deal", area: "Sync and agents", label: "Pending agent proposal (approve or dismiss)", weekly: { ae: 20, cs: 10, admin: 10 }, overrides: { fathom: { admin: 40 }, ridgeline: { ae: 25, cs: 15 } }, note: "Appears only while a proposal exists (object state, rule 6). The deal's owner approves; the admin may approve for anyone. Approving may send email, spend credits or move the stage, so the consequence is written on the card and the item waits for a task boundary rather than interrupting (Settings, agent approvals)." },
  { id: "agent.research", page: "deal", area: "Sync and agents", label: "Ask the research agent (credits)", weekly: { ae: 10, cs: 5, admin: 5 }, overrides: { fathom: { admin: 35 } } },

  // All fields: the tail every deal record accumulates
  { id: "field.deal-type", page: "deal", area: "All fields", label: "Deal type", weekly: { ae: 4, cs: 4, admin: 6 }, overrides: { ridgeline: { cs: 8 } } },
  { id: "field.source", page: "deal", area: "All fields", label: "Lead source", weekly: { ae: 3, cs: 1, admin: 8 } },
  { id: "field.campaign", page: "deal", area: "All fields", label: "Campaign attribution", weekly: { ae: 2, cs: 1, admin: 6 }, note: "The marketer reads attribution in Reports, not here." },
  { id: "field.competitor", page: "deal", area: "All fields", label: "Competitor", weekly: { ae: 8, cs: 3, admin: 4 } },
  { id: "field.contract-term", page: "deal", area: "All fields", label: "Contract term", weekly: { ae: 8, cs: 12, admin: 4 }, overrides: { ridgeline: { cs: 18 } } },
  { id: "field.payment-terms", page: "deal", area: "All fields", label: "Payment terms", weekly: { ae: 4, cs: 3, admin: 3 } },
  { id: "field.discount", page: "deal", area: "All fields", label: "Discount", weekly: { ae: 6, cs: 4, admin: 4 } },
  { id: "field.proposal-link", page: "deal", area: "All fields", label: "Proposal link", weekly: { ae: 8, cs: 3, admin: 1 } },
  { id: "field.esign", page: "deal", area: "All fields", label: "Signature status", weekly: { ae: 6, cs: 4, admin: 2 } },
  { id: "field.split", page: "deal", area: "All fields", label: "Split owners", weekly: { ae: 3, cs: 2, admin: 4 }, overrides: { fathom: { admin: 0 } } },
  { id: "field.tags", page: "deal", area: "All fields", label: "Tags", weekly: { ae: 4, cs: 4, admin: 4 } },
  { id: "field.priority", page: "deal", area: "All fields", label: "Priority flag", weekly: { ae: 5, cs: 5, admin: 3 } },
  { id: "field.weighted", page: "deal", area: "All fields", label: "Weighted amount", weekly: { ae: 3, cs: 1, admin: 6 } },
  { id: "field.line-items", page: "deal", area: "All fields", label: "Line items", weekly: { ae: 4, cs: 6, admin: 2 }, overrides: { ridgeline: { cs: 12, ae: 8 } } },
  { id: "field.crm-id", page: "deal", area: "All fields", label: "CRM record id", weekly: { ae: 1, cs: 1, admin: 4 }, overrides: { fathom: { admin: 0 } } },

  // Accelerators and rare actions
  { id: "acc.shortcuts", page: "deal", area: "Accelerators", label: "Keyboard shortcuts and command palette", weekly: { ae: 18, cs: 8, admin: 6 }, overrides: { fathom: { admin: 10 } }, note: "The palette shows every shortcut so the resident stops needing it (rule 8)." },
  { id: "acc.expand-all", page: "deal", area: "Accelerators", label: "Expand all sections and print", weekly: { ae: 3, cs: 3, admin: 5 } },
  { id: "acc.share", page: "deal", area: "Accelerators", label: "Copy link to deal", weekly: { ae: 8, cs: 6, admin: 5 }, overrides: { halyard: { admin: 15 } } },
  { id: "acc.follow", page: "deal", area: "Accelerators", label: "Follow deal for notifications", weekly: { ae: 5, cs: 8, admin: 10 } },
  { id: "acc.duplicate", page: "deal", area: "Accelerators", label: "Duplicate deal", weekly: { ae: 2, cs: 3, admin: 1 } },
  { id: "acc.export", page: "deal", area: "Accelerators", label: "Export this deal", weekly: { ae: 2, cs: 1, admin: 4 } },
]
