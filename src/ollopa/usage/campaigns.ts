import type { UsageItem } from "./model"

// Campaigns: the marketer's page. Audiences built from lists and segments; email campaigns (one send to an
// audience) and lifecycle campaigns (a trigger that sends while it runs). Spec: specs/10-campaigns.md.
// Baseline numbers describe Meridian (12 campaigns, 8 email and 4 lifecycle, one demand-generation team).
// Ridgeline overrides: 8 lifecycle campaigns and almost no one-off sends, so trigger, sends-by-day and
//   conversion items rise and scheduling, testing and duplicating fall.
// Fathom and Halyard overrides: no campaigns exist (counts.campaigns = 0) and neither has a marketer, so the
//   page is an empty state; the admin glances at it and leaves. Only "sdr" and "admin" exist at both.
// SDR, AE and CS have no Campaigns entry in the navigation; the page names who can see it (PRODUCT.md).

const none = { fathom: { admin: 0, sdr: 0 }, halyard: { admin: 0, sdr: 0 } }
const glance = { fathom: { admin: 2, sdr: 0 }, halyard: { admin: 3, sdr: 0 } }

export const campaignsItems: UsageItem[] = [
  // Campaign list: the columns
  { id: "camp.list.name", page: "campaigns", area: "Campaign list", label: "Campaign name, kind and subject", weekly: { marketer: 95, admin: 30 }, overrides: glance },
  { id: "camp.list.status", page: "campaigns", area: "Campaign list", label: "Status (draft, scheduled, sending, sent, running, paused)", weekly: { marketer: 95, admin: 30 }, overrides: glance, note: "Head by usage at 95%, not by rule 7: the consequence about to happen is stated on the send itself, where the decision is made." },
  { id: "camp.list.audience", page: "campaigns", area: "Campaign list", label: "Audience and its size", weekly: { marketer: 80, admin: 15 }, overrides: none, note: "Head by usage at 80%. The rule 7 obligation sits on the send dialog and the detail block, which name recipients and suppressions before anything goes out." },
  { id: "camp.list.delivery", page: "campaigns", area: "Campaign list", label: "Sent, delivered and bounced", critical: true, weekly: { marketer: 85, admin: 25 }, overrides: none, note: "Bounce rate is safety state: the guard warns at 4% and pauses at 6%, and the cell shows the observed rate against those two numbers. Sent and delivered are shown with it (rule 5)." },
  { id: "camp.list.opens-clicks", page: "campaigns", area: "Campaign list", label: "Opened and clicked", weekly: { marketer: 85, admin: 10 }, overrides: none },
  { id: "camp.list.replies", page: "campaigns", area: "Campaign list", label: "Replied", weekly: { marketer: 35, admin: 5 }, overrides: { ...none, ridgeline: { marketer: 25 } }, note: "Most campaigns send from a shared mailbox; replies matter for the few that ask a question." },
  { id: "camp.list.conversions", page: "campaigns", area: "Campaign list", label: "Converted, with the goal it counts", weekly: { marketer: 75, admin: 20 }, overrides: { ...none, ridgeline: { marketer: 90, admin: 25 } } },
  { id: "camp.list.unsubscribes", page: "campaigns", area: "Campaign list", label: "Unsubscribed", critical: true, weekly: { marketer: 45, admin: 20 }, overrides: none, note: "Opt-outs are the cost of a send; visible without a click (rule 7)." },
  { id: "camp.list.send-time", page: "campaigns", area: "Campaign list", label: "Scheduled send time or next send", weekly: { marketer: 60, admin: 10 }, overrides: { ...none, ridgeline: { marketer: 30 } } },
  { id: "camp.list.trigger", page: "campaigns", area: "Campaign list", label: "Lifecycle trigger", weekly: { marketer: 15, admin: 4 }, overrides: { ...none, ridgeline: { marketer: 80, admin: 15 } }, note: "Four lifecycle campaigns at Meridian; eight of eight at Ridgeline." },
  { id: "camp.list.last-send", page: "campaigns", area: "Campaign list", label: "Last send", weekly: { marketer: 15, admin: 6 }, overrides: { ...none, ridgeline: { marketer: 35 } } },
  { id: "camp.list.owner", page: "campaigns", area: "Campaign list", label: "Owner", weekly: { marketer: 12, admin: 25 }, overrides: none },
  { id: "camp.list.from", page: "campaigns", area: "Campaign list", label: "From name and mailbox", weekly: { marketer: 4, admin: 10 }, overrides: none },
  { id: "camp.list.tags", page: "campaigns", area: "Campaign list", label: "Tags", weekly: { marketer: 3, admin: 2 }, overrides: none },
  { id: "camp.list.variants", page: "campaigns", area: "Campaign list", label: "A/B variant marker", weekly: { marketer: 4 }, overrides: { ...none, ridgeline: { marketer: 3 } } },
  { id: "camp.list.created", page: "campaigns", area: "Campaign list", label: "Created and last edited", weekly: { marketer: 3, admin: 3 }, overrides: none },

  // Search, filters, sort, columns, views
  { id: "camp.view.switch", page: "campaigns", area: "Search, filters and views", label: "Campaigns / Audiences view", weekly: { marketer: 40, admin: 10 }, overrides: none },
  { id: "camp.filter.search", page: "campaigns", area: "Search, filters and views", label: "Search", weekly: { marketer: 40, admin: 20 }, overrides: none },
  { id: "camp.filter.status", page: "campaigns", area: "Search, filters and views", label: "Status filter", weekly: { marketer: 45, admin: 20 }, overrides: none },
  { id: "camp.filter.kind", page: "campaigns", area: "Search, filters and views", label: "Kind filter (email, lifecycle)", weekly: { marketer: 12, admin: 5 }, overrides: { ...none, ridgeline: { marketer: 3 } } },
  { id: "camp.filter.owner", page: "campaigns", area: "Search, filters and views", label: "Owner filter", weekly: { marketer: 4, admin: 22 }, overrides: none },
  { id: "camp.filter.date", page: "campaigns", area: "Search, filters and views", label: "Date range", weekly: { marketer: 4, admin: 8 }, overrides: none },
  { id: "camp.filter.audience", page: "campaigns", area: "Search, filters and views", label: "Audience filter", weekly: { marketer: 3 }, overrides: none },
  { id: "camp.sort", page: "campaigns", area: "Search, filters and views", label: "Sort by column", weekly: { marketer: 18, admin: 8 }, overrides: none },
  { id: "camp.columns", page: "campaigns", area: "Search, filters and views", label: "Choose columns", weekly: { marketer: 3, admin: 3 }, overrides: none },
  { id: "camp.compare", page: "campaigns", area: "Search, filters and views", label: "Compare two campaigns", weekly: { marketer: 4 }, overrides: none },

  // Actions
  { id: "camp.act.open", page: "campaigns", area: "Actions", label: "Open campaign", weekly: { marketer: 90, admin: 30 }, overrides: none },
  { id: "camp.act.new", page: "campaigns", area: "Actions", label: "New campaign", weekly: { marketer: 25, admin: 4 }, overrides: { ...none, ridgeline: { marketer: 12 } }, note: "Lifecycle campaigns are set up once and run." },
  { id: "camp.act.edit", page: "campaigns", area: "Actions", label: "Edit draft", weekly: { marketer: 45, admin: 4 }, overrides: { ...none, ridgeline: { marketer: 25 } } },
  { id: "camp.act.send-test", page: "campaigns", area: "Actions", label: "Send test", weekly: { marketer: 30, admin: 3 }, overrides: { ...none, ridgeline: { marketer: 15 } } },
  { id: "camp.act.schedule", page: "campaigns", area: "Actions", label: "Schedule send", weekly: { marketer: 30, admin: 3 }, overrides: { ...none, ridgeline: { marketer: 8 } } },
  { id: "camp.act.pause", page: "campaigns", area: "Actions", label: "Pause or resume", critical: true, weekly: { marketer: 12, admin: 8 }, overrides: none, note: "The path to stop a send is never longer than the path to start it (rule 7)." },
  { id: "camp.act.duplicate", page: "campaigns", area: "Actions", label: "Duplicate", weekly: { marketer: 15, admin: 2 }, overrides: { ...none, ridgeline: { marketer: 6 } } },
  { id: "camp.act.archive", page: "campaigns", area: "Actions", label: "Archive", weekly: { marketer: 4, admin: 4 }, overrides: none },
  { id: "camp.act.delete-draft", page: "campaigns", area: "Actions", label: "Delete draft", critical: true, weekly: { marketer: 3, admin: 1 }, overrides: none, note: "Destructive, so the control and what it removes are visible without a click (rule 7). Drafts only; sent campaigns are archived, never deleted, so results stay." },
  { id: "camp.act.bulk", page: "campaigns", area: "Actions", label: "Bulk pause, archive, change owner", weekly: { marketer: 3, admin: 6 }, overrides: none },
  { id: "camp.act.export", page: "campaigns", area: "Actions", label: "Export results", weekly: { marketer: 4, admin: 5 }, overrides: none },
  { id: "camp.act.approval", page: "campaigns", area: "Actions", label: "Request or give the second approval before a large send", weekly: { marketer: 10, admin: 12 }, overrides: { ...none, ridgeline: { marketer: 3, admin: 3 } }, note: "A second, admin approval above the threshold set in Settings (default 1,000 recipients or 500 credits in one action). The sender approves their own ordinary sends; nothing below the threshold is queued." },

  // Campaign detail
  { id: "camp.detail.funnel", page: "campaigns", area: "Campaign detail", label: "Results: sent to converted, with rates", weekly: { marketer: 90, admin: 25 }, overrides: none },
  { id: "camp.detail.audience", page: "campaigns", area: "Campaign detail", label: "Audience, size and who is suppressed", critical: true, weekly: { marketer: 60, admin: 15 }, overrides: none, note: "Size and the suppressed counts are one fact; they are never split (rule 5)." },
  { id: "camp.detail.content", page: "campaigns", area: "Campaign detail", label: "Subject, preview text, from, body preview", weekly: { marketer: 70, admin: 8 }, overrides: none },
  { id: "camp.detail.schedule", page: "campaigns", area: "Campaign detail", label: "Schedule, timezone and send speed", weekly: { marketer: 25, admin: 6 }, overrides: { ...none, ridgeline: { marketer: 15 } } },
  { id: "camp.detail.trigger", page: "campaigns", area: "Campaign detail", label: "Trigger, delay and exit rule", weekly: { marketer: 15, admin: 4 }, overrides: { ...none, ridgeline: { marketer: 70, admin: 12 } } },
  { id: "camp.detail.sends-by-day", page: "campaigns", area: "Campaign detail", label: "Sends by day", weekly: { marketer: 15, admin: 4 }, overrides: { ...none, ridgeline: { marketer: 55 } } },
  { id: "camp.detail.recipients", page: "campaigns", area: "Campaign detail", label: "Recipients and what each did", weekly: { marketer: 18, admin: 5 }, overrides: none },
  { id: "camp.detail.links", page: "campaigns", area: "Campaign detail", label: "Links clicked", weekly: { marketer: 15, admin: 2 }, overrides: none },
  { id: "camp.detail.variants", page: "campaigns", area: "Campaign detail", label: "A/B variant results", weekly: { marketer: 4 }, overrides: { ...none, ridgeline: { marketer: 3 } } },
  { id: "camp.detail.goal", page: "campaigns", area: "Campaign detail", label: "Goal definition and attribution window", weekly: { marketer: 12, admin: 4 }, overrides: none },
  { id: "camp.detail.activity", page: "campaigns", area: "Campaign detail", label: "Activity log", weekly: { marketer: 4, admin: 10 }, overrides: none },
  { id: "camp.detail.delivery-settings", page: "campaigns", area: "Campaign detail", label: "Tracking, reply-to, unsubscribe text, footer", weekly: { marketer: 4, admin: 4 }, overrides: none },
  { id: "camp.detail.resend", page: "campaigns", area: "Campaign detail", label: "Resend to people who did not open", weekly: { marketer: 4 }, overrides: none },
  { id: "camp.detail.timezone-send", page: "campaigns", area: "Campaign detail", label: "Send in each recipient's timezone", weekly: { marketer: 3 }, overrides: none },
  { id: "camp.detail.seed-test", page: "campaigns", area: "Campaign detail", label: "Inbox placement test", weekly: { marketer: 3, admin: 4 }, overrides: none },
  { id: "camp.detail.plain-text", page: "campaigns", area: "Campaign detail", label: "Plain-text version", weekly: { marketer: 3 }, overrides: none },
  { id: "camp.detail.notes", page: "campaigns", area: "Campaign detail", label: "Notes", weekly: { marketer: 2, admin: 2 }, overrides: none },
  { id: "camp.detail.crm-push", page: "campaigns", area: "Campaign detail", label: "Push results to CRM", weekly: { marketer: 4, admin: 6 }, overrides: none },

  // Audiences
  { id: "aud.list", page: "campaigns", area: "Audiences", label: "Audience name, type, size, last rebuilt", weekly: { marketer: 50, admin: 10 }, overrides: none },
  { id: "aud.sources", page: "campaigns", area: "Audiences", label: "Source lists and segment filters", weekly: { marketer: 15, admin: 4 }, overrides: none },
  { id: "aud.suppressed", page: "campaigns", area: "Audiences", label: "Suppressed: six counts \u2014 two always applied, four chosen", critical: true, weekly: { marketer: 45, admin: 15 }, overrides: { ...none, ridgeline: { marketer: 55 } }, note: "Who will not receive the send is part of the decision to send (rule 7). Six counts on one line: unsubscribed and bounced marked \"always applied\", and customers, open deals, closed-lost and in-sequence as the four the marketer chooses. Three counts said nothing about which rules were on." },
  { id: "aud.mode", page: "campaigns", area: "Audiences", label: "Live or frozen, the refresh cadence, and what it feeds", critical: true, weekly: { marketer: 45, admin: 8 }, overrides: { ...none, ridgeline: { marketer: 60 } }, note: "A live audience keeps adding people to a running campaign. Whether it is live, how often it refreshes and which campaign the new matches land in are the send's commitment, so all three sit at level one with Freeze beside them (rule 7)." },
  { id: "aud.new", page: "campaigns", area: "Audiences", label: "New audience", weekly: { marketer: 12, admin: 2 }, overrides: none },
  { id: "aud.rebuild", page: "campaigns", area: "Audiences", label: "Rebuild now", weekly: { marketer: 12, admin: 2 }, overrides: none },
  { id: "aud.used-by", page: "campaigns", area: "Audiences", label: "Campaigns using this audience", weekly: { marketer: 15, admin: 4 }, overrides: none },
  { id: "aud.suppression-upload", page: "campaigns", area: "Audiences", label: "Upload a suppression list", weekly: { marketer: 4, admin: 3 }, overrides: none },
  { id: "aud.frequency-cap", page: "campaigns", area: "Audiences", label: "Frequency cap per person", weekly: { marketer: 4, admin: 5 }, overrides: none },
  { id: "aud.delete", page: "campaigns", area: "Audiences", label: "Delete audience", weekly: { marketer: 2, admin: 1 }, overrides: none, note: "Blocked while a campaign uses it; the row says which one." },

  // QA (X-qa: eight checks on the campaign record, flat, no doors)
  { id: "camp.qa.run", page: "campaigns", area: "QA", label: "Run the eight pre-send checks", weekly: { marketer: 55, admin: 8 }, overrides: { ...none, ridgeline: { marketer: 60 } }, note: "Run before every send, so it is the marketer's most-used control after opening the campaign." },
  { id: "camp.qa.failures", page: "campaigns", area: "QA", label: "The failures in words, each with a Fix link that navigates", critical: true, weekly: { marketer: 35, admin: 6 }, overrides: { ...none, ridgeline: { marketer: 40 } }, note: "A failed check is what is about to go wrong to a few thousand people. It is stated in words, never as a red dot, and the Fix link goes to the thing that is wrong (rules 4 and 7)." },
  { id: "camp.qa.who", page: "campaigns", area: "QA", label: "Who ran the checks and when", weekly: { marketer: 30, admin: 10 }, overrides: { ...none, ridgeline: { marketer: 30 } }, note: "A run by the person who built the campaign is a weaker check than a run by someone else, so the panel says which it was." },

  // Forms (R-form: an object with enrichment on submission and a credit cap)
  { id: "form.row", page: "campaigns", area: "Forms", label: "Form row: status, submissions, enrichment spend, routes to, reports to", weekly: { marketer: 25, admin: 10 }, overrides: { ...none, ridgeline: { marketer: 85 } }, note: "Forms are the third object on this page (Campaigns 12 \u00b7 Audiences 6 \u00b7 Forms 4). Meridian's marketer checks four forms weekly; Ridgeline is a product-led business, where the form is where the pipeline starts and the row is read daily. The Meridian baselines are deliberately half the Ridgeline ones for every Forms item." },
  { id: "form.submissions", page: "campaigns", area: "Forms", label: "Submissions in the last 7 days", weekly: { marketer: 25, admin: 10 }, overrides: { ...none, ridgeline: { marketer: 90 } } },
  { id: "form.cap", page: "campaigns", area: "Forms", label: "Enrichment cap, used today, and how many submissions matched", critical: true, weekly: { marketer: 18, admin: 12 }, overrides: { ...none, ridgeline: { marketer: 75 } }, note: "\"Enrichment cap 400 credits a day \u00b7 312 used today \u00b7 46 of 61 submissions matched\". Spend against a cap is a price commitment, so the three numbers sit together at level one (rules 5 and 7)." },
  { id: "form.unrouted", page: "campaigns", area: "Forms", label: "Submissions that could not be routed", critical: true, weekly: { marketer: 15, admin: 10 }, overrides: { ...none, ridgeline: { marketer: 45 } }, note: "A person who filled in a form and reached nobody is the most expensive failure on the page, so the count is never behind a door." },
  { id: "form.fields", page: "campaigns", area: "Forms", label: "Field editor: each field marked asked or enriched (n credits)", weekly: { marketer: 10, admin: 4 }, overrides: { ...none, ridgeline: { marketer: 35 } }, note: "A field already known for a returning visitor is removed, not pre-filled invisibly, and the form tells the visitor in one line (rule 4)." },
  { id: "form.routing", page: "campaigns", area: "Forms", label: "Where submissions go, and the rule that decides", weekly: { marketer: 12, admin: 12 }, overrides: { ...none, ridgeline: { marketer: 50 } } },

  // Sending policy, shown as one line above the table
  { id: "pol.bounce-guard", page: "campaigns", area: "Sending policy", label: "Bounce guard (warn 4%, pause 6%) with the observed rate", critical: true, weekly: { marketer: 15, admin: 30 }, overrides: { fathom: { admin: 5, sdr: 0 }, halyard: { admin: 5, sdr: 0 } }, note: "One pair for the whole product, owned by Settings and adjustable by the admin; this page reads it and prints the observed rate beside it (rule 7)." },
  { id: "pol.daily-cap", page: "campaigns", area: "Sending policy", label: "Daily campaign send cap and sends used today", weekly: { marketer: 12, admin: 15 }, overrides: none },
  { id: "pol.domain", page: "campaigns", area: "Sending policy", label: "Marketing domain health", weekly: { marketer: 4, admin: 20 }, overrides: none },
  { id: "pol.consent", page: "campaigns", area: "Sending policy", label: "Consent rules by region", weekly: { marketer: 3, admin: 4 }, overrides: none },
]
