import type { UsageItem } from "./model"

// Connect an integration: 29 items in 2 areas (specs/15-connect-integration.md). Baseline numbers describe Meridian Software.
// Halyard overrides: the agency connects a client's CRM whenever a client is onboarded, so the wizard is routine there.
// Fathom overrides: no CRM at all (PLAN.md, 13 Sep 2026 — Ollopa is Fathom's CRM); a calendar and an enrichment
// provider are the whole list. Only "sdr" and "admin" roles exist there.
// Ridgeline overrides: HubSpot, a calendar, Slack and enrichment; little outbound, so Slack is about deals and agents.
// Non-admin roles reach the wizard only to connect their own calendar.
// Plan gating (PLAN.md, 13 Sep 2026): CRM sync is one-way on Starter, two-way on Growth, two-way plus custom objects
// on Scale; webhooks and API keys are Growth and above. Every lock sits on the card or the row at the entry point,
// never after the admin has mapped fields or built a condition (gated-features pattern rule 7).

export const connectItems: UsageItem[] = [
  // Wizard
  { id: "wiz.choose", page: "connect", area: "Wizard", label: "Choose what to connect", weekly: { sdr: 4, ae: 5, marketer: 1, cs: 4, admin: 5 }, overrides: { fathom: { admin: 5 }, halyard: { admin: 25 }, ridgeline: { admin: 3 } }, note: "Non-admins connect their own calendar only. Halyard connects a client CRM most months." },
  { id: "wiz.authorise", page: "connect", area: "Wizard", label: "Authorise (sign in, key, test event)", weekly: { sdr: 4, ae: 5, marketer: 1, cs: 4, admin: 6 }, overrides: { fathom: { admin: 5 }, halyard: { admin: 25 }, ridgeline: { admin: 3 } } },
  { id: "wiz.sandbox", page: "connect", area: "Wizard", label: "Salesforce: production or sandbox", weekly: { admin: 2 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 4 }, ridgeline: { admin: 0 } }, note: "Fathom and Ridgeline have no Salesforce." },
  { id: "wiz.objects", page: "connect", area: "Wizard", label: "Choose what syncs (objects and direction)", weekly: { admin: 5 }, overrides: { fathom: { admin: 5 }, halyard: { admin: 25 }, ridgeline: { admin: 3 } } },
  { id: "wiz.mapping", page: "connect", area: "Wizard", label: "Map fields (pairs and write rule)", weekly: { admin: 5 }, overrides: { fathom: { admin: 5 }, halyard: { admin: 22 }, ridgeline: { admin: 3 } }, note: "The write rule sits in the pair's row; never on another step (rule 5)." },
  { id: "wiz.stage-mapping", page: "connect", area: "Wizard", label: "Map stages", weekly: { admin: 3 }, overrides: { fathom: { admin: 2 }, halyard: { admin: 12 }, ridgeline: { admin: 2 } }, note: "Only when deals sync." },
  { id: "wiz.pull-conditions", page: "connect", area: "Wizard", label: "Pull conditions", weekly: { admin: 3 }, overrides: { fathom: { admin: 2 }, halyard: { admin: 15 }, ridgeline: { admin: 2 } } },
  { id: "wiz.push-conditions", page: "connect", area: "Wizard", label: "Push conditions, unverified emails, source value", weekly: { admin: 3 }, overrides: { fathom: { admin: 2 }, halyard: { admin: 15 }, ridgeline: { admin: 2 } } },
  { id: "wiz.deletion", page: "connect", area: "Wizard", label: "Deletion behaviour", critical: true, weekly: { admin: 3 }, overrides: { fathom: { admin: 2 }, halyard: { admin: 10 }, ridgeline: { admin: 2 } }, note: "What a mirrored deletion does to the CRM is a destructive consequence (rule 7)." },
  { id: "wiz.merge", page: "connect", area: "Wizard", label: "Merge behaviour", critical: true, weekly: { admin: 3 }, overrides: { fathom: { admin: 2 }, halyard: { admin: 10 }, ridgeline: { admin: 2 } }, note: "A mirrored merge changes the system of record (rule 7)." },
  { id: "wiz.matching-key", page: "connect", area: "Wizard", label: "Matching key for duplicates", weekly: { admin: 3 }, overrides: { fathom: { admin: 2 }, halyard: { admin: 5 }, ridgeline: { admin: 2 } } },
  { id: "wiz.review", page: "connect", area: "Wizard", label: "Review, consequence statement, start syncing", critical: true, weekly: { admin: 5 }, overrides: { fathom: { admin: 5 }, halyard: { admin: 25 }, ridgeline: { admin: 3 } }, note: "States what the first sync will pull, push, delete and merge. Nothing syncs until this button (rule 7)." },
  { id: "wiz.save-exit", page: "connect", area: "Wizard", label: "Save and exit, resume, discard", weekly: { admin: 3 }, overrides: { fathom: { admin: 2 }, halyard: { admin: 8 }, ridgeline: { admin: 2 } } },
  { id: "wiz.slack-channels", page: "connect", area: "Wizard", label: "Slack: events to channels", weekly: { admin: 3 }, overrides: { fathom: { admin: 2 }, halyard: { admin: 3 }, ridgeline: { admin: 4 } } },
  { id: "wiz.calendar-pick", page: "connect", area: "Wizard", label: "Calendar: which calendars, busy time only", weekly: { sdr: 4, ae: 5, marketer: 1, cs: 4, admin: 2 }, overrides: { fathom: { admin: 4 }, halyard: { admin: 2 }, ridgeline: { admin: 2 } } },
  { id: "wiz.enrichment", page: "connect", area: "Wizard", label: "Enrichment provider: key, fields, order", weekly: { admin: 3 }, overrides: { fathom: { admin: 2 }, halyard: { admin: 3 }, ridgeline: { admin: 2 } } },
  { id: "wiz.webhook", page: "connect", area: "Wizard", label: "Webhook: URL, secret, events, test", weekly: { admin: 2 }, overrides: { fathom: { admin: 1 }, halyard: { admin: 3 }, ridgeline: { admin: 2 } }, note: "Fathom's founder would build her own automations, but webhooks start at Growth: the card carries the lock, the plan and the price, and she has opened it once." },
  { id: "wiz.custom-objects", page: "connect", area: "Wizard", label: "Custom CRM objects", weekly: { admin: 3 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 2 }, ridgeline: { admin: 1 } }, note: "Scale only. The lock sits in step 3's object list, where the objects are chosen, so nobody maps fields for an object they cannot sync (gated-features pattern rule 7). Removed at Fathom, which has no CRM." },
  { id: "wiz.template", page: "connect", area: "Wizard", label: "Save as or start from a setup template", weekly: { admin: 1 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 22 }, ridgeline: { admin: 0 } }, note: "Halyard's accelerator (rule 8): the same CRM choices, ten times over." },

  // Integration page
  { id: "int.status", page: "connect", area: "Integration page", label: "Status, last and next sync, records today, errors today", critical: true, weekly: { sdr: 3, ae: 3, cs: 2, admin: 40 }, overrides: { fathom: { admin: 5 }, halyard: { admin: 25 }, ridgeline: { admin: 30 } }, note: "Matches Settings item int.crm. Sync state is safety state (rule 7)." },
  { id: "int.errors", page: "connect", area: "Integration page", label: "Error log with message and fix in the row", weekly: { admin: 30 }, overrides: { fathom: { admin: 3 }, halyard: { admin: 25 }, ridgeline: { admin: 25 } }, note: "Matches Settings item int.error-log. Shown at level one when errors exist (object state)." },
  { id: "int.retry", page: "connect", area: "Integration page", label: "Retry one or all", weekly: { admin: 20 }, overrides: { fathom: { admin: 2 }, halyard: { admin: 18 }, ridgeline: { admin: 15 } } },
  { id: "int.pause", page: "connect", area: "Integration page", label: "Pause or resume syncing", critical: true, weekly: { admin: 5 }, overrides: { fathom: { admin: 1 }, halyard: { admin: 4 }, ridgeline: { admin: 3 } }, note: "Safety state (rule 7)." },
  { id: "int.edit-mapping", page: "connect", area: "Integration page", label: "Edit field mapping in place", weekly: { admin: 15 }, overrides: { fathom: { admin: 2 }, halyard: { admin: 10 }, ridgeline: { admin: 10 } }, note: "Matches Settings item int.field-mapping. Never through the wizard." },
  { id: "int.apply-mapping", page: "connect", area: "Integration page", label: "Apply mapping to existing records", weekly: { admin: 8 }, overrides: { fathom: { admin: 2 }, halyard: { admin: 6 }, ridgeline: { admin: 5 } } },
  { id: "int.pull-push-now", page: "connect", area: "Integration page", label: "Pull now, push now", weekly: { admin: 20 }, overrides: { fathom: { admin: 3 }, halyard: { admin: 12 }, ridgeline: { admin: 12 } }, note: "After a CRM field change or a stuck record." },
  { id: "int.edit-rules", page: "connect", area: "Integration page", label: "Edit sync rules in place", weekly: { admin: 6 }, overrides: { fathom: { admin: 2 }, halyard: { admin: 6 }, ridgeline: { admin: 4 } } },
  { id: "int.reauthorise", page: "connect", area: "Integration page", label: "Re-authorise, change sync user", weekly: { sdr: 2, ae: 2, cs: 2, admin: 5 }, overrides: { fathom: { admin: 3 }, halyard: { admin: 4 }, ridgeline: { admin: 4 } }, note: "Tokens and passwords expire." },
  { id: "int.history", page: "connect", area: "Integration page", label: "Sync history", weekly: { admin: 20 }, overrides: { fathom: { admin: 3 }, halyard: { admin: 8 }, ridgeline: { admin: 12 } } },
  { id: "int.disconnect", page: "connect", area: "Integration page", label: "Disconnect, with what happens", critical: true, weekly: { admin: 1 }, overrides: { fathom: { admin: 1 }, halyard: { admin: 4 }, ridgeline: { admin: 1 } }, note: "The path to disconnect is as short as the path to connect (rule 7)." },
]
