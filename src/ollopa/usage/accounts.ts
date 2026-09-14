import type { UsageItem } from "./model"

// Accounts inventory: the customer success page (specs/11-accounts.md). Baseline numbers describe Meridian Software,
// where four customer success managers own about ten client accounts each and account executives hand accounts over after closed-won.
// Only "cs", "ae" and "admin" can open the page (nav.ts); "sdr" and "marketer" carry no number.
// Ridgeline overrides: product-led, so seats, usage and expansion signals are daily reading for CS and the expansion AE.
// Fathom overrides: no CS role; the founder (admin) keeps the accounts herself, and there is no AE to hand off from.
// Halyard overrides: the agency's ten clients are workspaces, not accounts; the page only holds each client's own
// customers, kept out of sequences, so nearly everything is tail.

const r = (cs: number, ae?: number, admin?: number) => ({ ridgeline: { cs, ...(ae !== undefined ? { ae } : {}), ...(admin !== undefined ? { admin } : {}) } })
const hal = { halyard: { admin: 3 } }

export const accountsItems: UsageItem[] = [
  // Account list
  { id: "acct.name", page: "accounts", area: "Account list", label: "Account name and domain", weekly: { cs: 95, ae: 30, admin: 20 }, overrides: { ridgeline: { ae: 45 }, fathom: { admin: 35 }, halyard: { admin: 5 } } },
  { id: "acct.health", page: "accounts", area: "Account list", label: "Health score and band", weekly: { cs: 90, ae: 20, admin: 12 }, overrides: { ridgeline: { ae: 40, admin: 20 }, fathom: { admin: 30 }, halyard: { admin: 3 } }, note: "The one number a CSM reads first every day." },
  { id: "acct.health-trend", page: "accounts", area: "Account list", label: "Health change over 30 days", weekly: { cs: 18, ae: 5, admin: 3 }, overrides: r(18, 15) },
  { id: "acct.renewal", page: "accounts", area: "Account list", label: "Renewal date and days left", critical: true, weekly: { cs: 85, ae: 20, admin: 15 }, overrides: { fathom: { admin: 30 }, halyard: { admin: 3 } }, note: "Commitment date: decision-critical (rule 7)." },
  { id: "acct.value", page: "accounts", area: "Account list", label: "Contract value per year", critical: true, weekly: { cs: 40, ae: 25, admin: 15 }, overrides: { fathom: { admin: 25 }, halyard: { admin: 2 } }, note: "Price is never behind a door (rule 7)." },
  { id: "acct.seats", page: "accounts", area: "Account list", label: "Seats bought and seats active", weekly: { cs: 15, ae: 8, admin: 5 }, overrides: r(60, 35, 10), note: "Meridian sells annual seat blocks; Ridgeline sells by the seat, so utilisation is the expansion trigger." },
  { id: "acct.usage", page: "accounts", area: "Account list", label: "Usage, last 30 days", weekly: { cs: 18, ae: 6, admin: 4 }, overrides: r(85, 35, 15), note: "Product-led Ridgeline lives on this column." },
  { id: "acct.owner", page: "accounts", area: "Account list", label: "Owner", weekly: { cs: 12, ae: 10, admin: 25 }, overrides: { fathom: { admin: 5 }, ...hal } },
  { id: "acct.risks", page: "accounts", area: "Account list", label: "Open risks", critical: true, weekly: { cs: 80, ae: 12, admin: 10 }, overrides: { fathom: { admin: 25 }, halyard: { admin: 3 } }, note: "Safety state for the account (rule 7)." },
  { id: "acct.signals", page: "accounts", area: "Account list", label: "Expansion signals", weekly: { cs: 18, ae: 18, admin: 5 }, overrides: { ridgeline: { cs: 70, ae: 65 }, fathom: { admin: 10 } }, note: "At Meridian expansion is the AE's job and arrives monthly; at Ridgeline it is daily." },
  { id: "acct.last-touch", page: "accounts", area: "Account list", label: "Last touch", weekly: { cs: 60, ae: 8, admin: 5 }, overrides: { fathom: { admin: 20 } } },
  { id: "acct.next-step", page: "accounts", area: "Account list", label: "Next step and date", weekly: { cs: 55, ae: 6, admin: 3 }, overrides: { fathom: { admin: 20 } }, note: "Read and set in place; one item, not two (rule 5)." },
  { id: "acct.champion", page: "accounts", area: "Account list", label: "Champion", weekly: { cs: 15, ae: 8, admin: 2 } },
  { id: "acct.plan", page: "accounts", area: "Account list", label: "Plan", weekly: { cs: 4, ae: 8, admin: 3 }, overrides: r(15, 20) },
  { id: "acct.forecast", page: "accounts", area: "Account list", label: "Renewal forecast (Commit, Likely, At risk, Lost)", weekly: { cs: 15, ae: 5, admin: 6 } },
  { id: "acct.terms", page: "accounts", area: "Account list", label: "Notice period and auto-renew", weekly: { cs: 4, ae: 3, admin: 3 }, note: "Read in the week before notice is due." },
  { id: "acct.ae", page: "accounts", area: "Account list", label: "Account executive of record", weekly: { cs: 4, ae: 4, admin: 2 } },
  { id: "acct.stage", page: "accounts", area: "Account list", label: "Account stage", weekly: { cs: 4, ae: 4, admin: 6 }, note: "Nearly every row is Current client; the column earns its place only when churned accounts are included." },
  { id: "acct.contacts-held", page: "accounts", area: "Account list", label: "Contacts held", weekly: { cs: 4, ae: 4, admin: 2 } },
  { id: "acct.industry-size", page: "accounts", area: "Account list", label: "Industry and employees", weekly: { cs: 2, ae: 3, admin: 1 } },
  { id: "acct.parent", page: "accounts", area: "Account list", label: "Parent account", weekly: { cs: 2, ae: 2, admin: 2 } },
  { id: "acct.crm-sync", page: "accounts", area: "Account list", label: "CRM sync status", weekly: { cs: 3, ae: 2, admin: 12 }, overrides: { fathom: { admin: 1 }, halyard: { admin: 2 } } },

  // Renewals
  { id: "ren.window", page: "accounts", area: "Renewals", label: "Renewals due in 30, 60 and 90 days", weekly: { cs: 80, ae: 12, admin: 15 }, overrides: { ridgeline: { ae: 25 }, fathom: { admin: 30 }, halyard: { admin: 3 } }, note: "Counters that are also the filter." },
  { id: "ren.value-at-risk", page: "accounts", area: "Renewals", label: "Contract value at risk", critical: true, weekly: { cs: 18, ae: 8, admin: 15 }, overrides: { fathom: { admin: 15 }, halyard: { admin: 2 } }, note: "Renewing value on accounts marked At risk. Money plus safety state (rule 7)." },
  { id: "ren.create-deal", page: "accounts", area: "Renewals", label: "Create renewal deal", weekly: { cs: 12, ae: 10, admin: 1 }, overrides: r(15, 25) },
  { id: "ren.lapsed", page: "accounts", area: "Renewals", label: "Lapsed renewals", weekly: { cs: 4, ae: 2, admin: 4 }, note: "Appears only when one exists (object state, rule 6)." },

  // Hand-offs
  { id: "ho.waiting", page: "accounts", area: "Hand-offs", label: "Hand-offs waiting for you", critical: true, weekly: { cs: 25, ae: 25, admin: 4 }, overrides: { ridgeline: { cs: 15, ae: 20 }, fathom: { admin: 0 }, halyard: { admin: 0 } }, note: "A pending approval; visible while one exists. Removed at Fathom and Halyard: nobody hands off there." },
  { id: "ho.accept", page: "accounts", area: "Hand-offs", label: "Accept hand-off", weekly: { cs: 18, ae: 2, admin: 2 }, overrides: { ridgeline: { cs: 12 }, fathom: { admin: 0 }, halyard: { admin: 0 } } },
  { id: "ho.send", page: "accounts", area: "Hand-offs", label: "Send hand-off to customer success", weekly: { cs: 1, ae: 25, admin: 2 }, overrides: { ridgeline: { ae: 18 }, fathom: { admin: 0 }, halyard: { admin: 0 } }, note: "Usually started from the closed-won deal; also here for the AE who forgot." },
  { id: "ho.notes", page: "accounts", area: "Hand-offs", label: "Why they bought and what was promised", weekly: { cs: 18, ae: 20, admin: 2 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 0 } }, note: "Kept with the hand-off it belongs to (rule 5)." },
  { id: "ho.checklist", page: "accounts", area: "Hand-offs", label: "Hand-off checklist", weekly: { cs: 4, ae: 4, admin: 2 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 0 } } },

  // Risks and signals
  { id: "risk.add", page: "accounts", area: "Risks and signals", label: "Add risk (type, note, owner)", weekly: { cs: 30, ae: 4, admin: 1 }, overrides: { fathom: { admin: 10 } } },
  { id: "risk.resolve", page: "accounts", area: "Risks and signals", label: "Resolve risk", weekly: { cs: 15, ae: 2, admin: 1 }, overrides: { fathom: { admin: 6 } } },
  { id: "risk.churn-notice", page: "accounts", area: "Risks and signals", label: "Churn notice received", critical: true, weekly: { cs: 4, ae: 2, admin: 3 }, note: "Rare, but the one risk that must never sit behind a door (rule 7)." },
  { id: "sig.detail", page: "accounts", area: "Risks and signals", label: "What fired, when, and from where", weekly: { cs: 15, ae: 15, admin: 2 }, overrides: r(60, 55) },
  { id: "sig.website", page: "accounts", area: "Risks and signals", label: "Pricing and docs page visits", weekly: { cs: 4, ae: 8, admin: 1 }, overrides: r(18, 40) },
  { id: "sig.create-expansion", page: "accounts", area: "Risks and signals", label: "Create expansion deal", weekly: { cs: 4, ae: 20, admin: 1 }, overrides: r(15, 50), note: "At Meridian the AE opens expansion deals; CS only flags them." },
  { id: "sig.dismiss", page: "accounts", area: "Risks and signals", label: "Dismiss signal", weekly: { cs: 4, ae: 6, admin: 1 }, overrides: r(12, 18) },
  { id: "sig.rules", page: "accounts", area: "Risks and signals", label: "Which signals fire (opens Settings)", weekly: { cs: 2, ae: 1, admin: 5 } },

  // Working an account
  { id: "work.log-touch", page: "accounts", area: "Working an account", label: "Log a touch (call, email, meeting)", weekly: { cs: 75, ae: 10, admin: 2 }, overrides: { fathom: { admin: 15 } } },
  { id: "work.note", page: "accounts", area: "Working an account", label: "Add note", weekly: { cs: 35, ae: 8, admin: 2 }, overrides: { fathom: { admin: 10 } } },
  { id: "work.email", page: "accounts", area: "Working an account", label: "Email the champion", weekly: { cs: 15, ae: 6, admin: 1 } },
  { id: "work.meeting", page: "accounts", area: "Working an account", label: "Book a review meeting", weekly: { cs: 12, ae: 5, admin: 1 } },
  { id: "work.timeline", page: "accounts", area: "Working an account", label: "Activity timeline", weekly: { cs: 18, ae: 12, admin: 4 }, note: "Read when a score has moved, not every day." },
  { id: "work.health-drivers", page: "accounts", area: "Working an account", label: "What makes up the score", weekly: { cs: 18, ae: 5, admin: 8 }, overrides: r(50, 15), note: "Never a number without its reasons; the drivers sum to the score." },
  { id: "work.usage-chart", page: "accounts", area: "Working an account", label: "Usage over 90 days", weekly: { cs: 15, ae: 5, admin: 2 }, overrides: r(60, 25) },
  { id: "work.seat-list", page: "accounts", area: "Working an account", label: "Who has a seat and last sign-in", weekly: { cs: 12, ae: 5, admin: 2 }, overrides: r(45, 20) },
  { id: "work.contacts", page: "accounts", area: "Working an account", label: "Contacts at the account", weekly: { cs: 18, ae: 10, admin: 2 } },
  { id: "work.deals", page: "accounts", area: "Working an account", label: "Deals at the account", weekly: { cs: 12, ae: 25, admin: 4 } },
  { id: "work.campaign", page: "accounts", area: "Working an account", label: "Add contacts to a lifecycle campaign", weekly: { cs: 4, ae: 2, admin: 1 }, overrides: r(18), note: "Ridgeline's marketer runs lifecycle campaigns; CS feeds them." },
  { id: "work.agent", page: "accounts", area: "Working an account", label: "Agent-proposed next step (approve or decline)", weekly: { cs: 15, ae: 5, admin: 5 }, overrides: { ridgeline: { cs: 18 }, fathom: { admin: 25 } }, note: "Fathom has no time; the scoring agent drafts the next step." },
  { id: "work.files", page: "accounts", area: "Working an account", label: "Files", weekly: { cs: 4, ae: 2, admin: 1 } },
  { id: "work.all-fields", page: "accounts", area: "Working an account", label: "All fields, including custom fields", weekly: { cs: 4, ae: 2, admin: 6 } },
  { id: "work.owner", page: "accounts", area: "Working an account", label: "Change owner", weekly: { cs: 4, ae: 3, admin: 12 }, overrides: { fathom: { admin: 1 }, halyard: { admin: 2 } } },
  { id: "work.churned", page: "accounts", area: "Working an account", label: "Mark churned", weekly: { cs: 3, ae: 1, admin: 2 }, note: "Its consequence is written on the confirm step, never one door further (rule 7)." },
  { id: "work.remove", page: "accounts", area: "Working an account", label: "Remove account", weekly: { cs: 1, ae: 0.5, admin: 2 }, note: "Same rule as Mark churned; undo lives in the notification." },
  { id: "work.push-crm", page: "accounts", area: "Working an account", label: "Push to CRM now", weekly: { cs: 3, ae: 2, admin: 6 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 1 } } },

  // Views and filters
  { id: "view.search", page: "accounts", area: "Views and filters", label: "Search", weekly: { cs: 65, ae: 30, admin: 20 }, overrides: { fathom: { admin: 25 }, halyard: { admin: 5 } } },
  { id: "view.health", page: "accounts", area: "Views and filters", label: "Filter by health band", weekly: { cs: 45, ae: 12, admin: 8 }, overrides: { fathom: { admin: 15 } } },
  { id: "view.owner", page: "accounts", area: "Views and filters", label: "Filter by owner", weekly: { cs: 12, ae: 8, admin: 25 }, overrides: { fathom: { admin: 2 }, ...hal } },
  { id: "view.risk", page: "accounts", area: "Views and filters", label: "Filter by risk type", weekly: { cs: 10, ae: 3, admin: 2 } },
  { id: "view.plan", page: "accounts", area: "Views and filters", label: "Filter by plan", weekly: { cs: 4, ae: 5, admin: 2 }, overrides: r(15, 12) },
  { id: "view.churned", page: "accounts", area: "Views and filters", label: "Include churned accounts", weekly: { cs: 3, ae: 2, admin: 3 } },
  { id: "view.sort", page: "accounts", area: "Views and filters", label: "Sort by renewal, health or value", weekly: { cs: 40, ae: 12, admin: 10 }, overrides: { fathom: { admin: 15 } } },
  { id: "view.saved", page: "accounts", area: "Views and filters", label: "Saved views", weekly: { cs: 4, ae: 3, admin: 4 }, note: "Fewer than 5% of users customise anything (Spool); the default views must be right." },
  { id: "view.columns", page: "accounts", area: "Views and filters", label: "Choose columns", weekly: { cs: 4, ae: 2, admin: 4 } },
  { id: "view.group", page: "accounts", area: "Views and filters", label: "Group by owner", weekly: { cs: 3, ae: 1, admin: 8 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 1 } } },
  { id: "view.export", page: "accounts", area: "Views and filters", label: "Export CSV", weekly: { cs: 4, ae: 2, admin: 6 }, overrides: { halyard: { admin: 2 } } },
  { id: "view.bulk-owner", page: "accounts", area: "Views and filters", label: "Bulk assign owner", weekly: { cs: 2, ae: 1, admin: 8 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 2 } } },
  { id: "view.bulk-campaign", page: "accounts", area: "Views and filters", label: "Bulk add to campaign", weekly: { cs: 3, ae: 1, admin: 1 }, overrides: r(12) },
  { id: "view.health-model", page: "accounts", area: "Views and filters", label: "Health score model (opens Settings)", weekly: { cs: 2, ae: 1, admin: 5 }, overrides: { halyard: { admin: 1 } } },
]
