import type { UsageItem } from "./model"

// Settings inventory: ten areas (PRODUCT.md, plus "How your team works" from the declared-sidebar decision,
// PLAN.md 14 Sep 2026). Baseline numbers describe Meridian Software.
// Plan gating (PLAN.md, 13 Sep 2026): Fathom on Starter, Halyard and Ridgeline on Growth, Meridian on Scale.
// A gated item is visible where it would live with a lock and the plan name, never removed and never moved, and a
// lock does not change its number (gated-features pattern rules 1 and 9). 0 still means removed: the item does not
// exist for that business at any price.
// Halyard overrides: the agency switches between ten client workspaces daily, so workspace-level items are routine.
// Fathom overrides: everyone is an admin and the founders do outbound; only "sdr" and "admin" roles exist there.
// Ridgeline overrides: product-led, little outbound; sequences low, context and signals high.

const h = (admin: number, sdr?: number) => ({ halyard: { admin, ...(sdr !== undefined ? { sdr } : {}) } })

export const settingsItems: UsageItem[] = [
  // You (personal)
  { id: "me.notify-delivery", page: "settings", area: "You", label: "Where notifications go: digest or as they happen, Slack, push, mute, quiet hours", weekly: { admin: 4, sdr: 6, ae: 4, marketer: 3, cs: 3 }, overrides: { fathom: { admin: 8, sdr: 8 }, halyard: { admin: 6, sdr: 8 } }, note: "One row for delivery, because digest, channel, mute and quiet hours are read and changed together (rule 5). What you are notified about stays on the thing that notifies: Agents, Inbox, the CRM error log. This row is what the shell's notification panel links to." },

  // Workspace
  { id: "ws.name", page: "settings", area: "Workspace", label: "Workspace name", weekly: { admin: 2 }, overrides: h(40), note: "Halyard renames and checks workspaces as clients come and go." },
  { id: "ws.logo", page: "settings", area: "Workspace", label: "Logo", weekly: { admin: 1 }, overrides: h(15) },
  { id: "ws.timezone", page: "settings", area: "Workspace", label: "Timezone", weekly: { admin: 3 }, overrides: h(35) },
  { id: "ws.currency", page: "settings", area: "Workspace", label: "Default currency", weekly: { admin: 2, ae: 1 }, overrides: h(25) },
  { id: "ws.language", page: "settings", area: "Workspace", label: "Language", weekly: { admin: 1 } },

  // How your team works (the declared sidebar: seat plus workspace profile, both declared, both editable here)
  { id: "work.profile", page: "settings", area: "How your team works", label: "Workspace profile and the three answers behind it", weekly: { admin: 3 }, overrides: { halyard: { admin: 25 }, fathom: { admin: 2 }, ridgeline: { admin: 2 } }, note: "Declared at set-up (spec 16), never inferred. Halyard declares one per client workspace, so it is read most weeks." },
  { id: "work.seats", page: "settings", area: "How your team works", label: "Which seats exist in this workspace", weekly: { admin: 8 }, overrides: { halyard: { admin: 20 }, fathom: { admin: 3 }, ridgeline: { admin: 4 } }, note: "The seat is declared at invite; this row says which of the five exist here, and the usage model returns zero for the rest." },
  { id: "work.left-out", page: "settings", area: "How your team works", label: "Pages the profile leaves out, with how many signals have arrived for each", weekly: { admin: 6 }, overrides: { halyard: { admin: 12 }, fathom: { admin: 10 }, ridgeline: { admin: 4 } }, note: "A left-out page still opens and still offers 'Add to sidebar'. The signal count is the input to the exposure rule, shown so nothing happens invisibly." },
  { id: "work.exposure", page: "settings", area: "How your team works", label: "Two-week exposure: which page is showing now, until when, and keep or drop it", weekly: { admin: 4 }, overrides: { halyard: { admin: 6 }, fathom: { admin: 9 }, ridgeline: { admin: 3 } }, note: "Hints do not teach; temporary exposure does (sweep 09). One exposure per period, and the answer is final until a new signal." },

  // Team and access
  { id: "team.users", page: "settings", area: "Team and access", label: "Users", weekly: { admin: 45 }, overrides: { halyard: { admin: 30 }, fathom: { admin: 6 } }, note: "At 300 people someone joins or leaves most weeks." },
  { id: "team.teams", page: "settings", area: "Team and access", label: "Teams", weekly: { admin: 10 }, overrides: { fathom: { admin: 1 } }, note: "Growth and Scale. Locked on Starter, so Fathom sees the row with the plan name and a price, not a gap." },
  { id: "team.profiles", page: "settings", area: "Team and access", label: "Permission profiles", weekly: { admin: 8 }, overrides: { fathom: { admin: 1 } }, note: "Growth and Scale; locked on Starter." },
  { id: "sec.mfa", page: "settings", area: "Team and access", label: "Multi-factor authentication", weekly: { admin: 3 } },
  { id: "sec.sso", page: "settings", area: "Team and access", label: "Single sign-on", weekly: { admin: 2 }, overrides: { fathom: { admin: 1 } }, note: "Scale only, so it is locked at Fathom, Halyard and Ridgeline." },
  { id: "sec.ip", page: "settings", area: "Team and access", label: "IP allowlist", weekly: { admin: 1 }, note: "Scale only; locked everywhere but Meridian." },
  { id: "sec.password", page: "settings", area: "Team and access", label: "Password policy", weekly: { admin: 1 } },
  { id: "sec.session", page: "settings", area: "Team and access", label: "Session timeout", weekly: { admin: 1 } },

  // Email sending
  { id: "mail.mailboxes", page: "settings", area: "Email sending", label: "Mailboxes", weekly: { sdr: 60, ae: 25, admin: 40 }, overrides: { halyard: { admin: 70, sdr: 65 }, fathom: { admin: 50, sdr: 60 }, ridgeline: { sdr: 20, ae: 10, admin: 15 } }, note: "Deliverability score and sent-versus-limit are checked weekly by anyone sending volume." },
  { id: "mail.warmup", page: "settings", area: "Email sending", label: "Warm-up", weekly: { sdr: 30, admin: 25 }, overrides: { halyard: { admin: 55, sdr: 40 }, ridgeline: { sdr: 5, admin: 5 } } },
  { id: "mail.limits", page: "settings", area: "Email sending", label: "Daily and hourly sending limits", weekly: { sdr: 20, admin: 30 }, overrides: { halyard: { admin: 50, sdr: 30 }, ridgeline: { sdr: 4, admin: 6 } } },
  { id: "mail.signature", page: "settings", area: "Email sending", label: "Email signature", weekly: { sdr: 5, ae: 5, marketer: 2, cs: 3, admin: 2 } },
  { id: "mail.domains", page: "settings", area: "Email sending", label: "Sending domains", weekly: { admin: 20 }, overrides: { halyard: { admin: 45 }, fathom: { admin: 10 }, ridgeline: { admin: 6 } } },
  { id: "mail.tracking-subdomain", page: "settings", area: "Email sending", label: "Tracking subdomain", weekly: { admin: 2 } },
  { id: "mail.bounce-guard", page: "settings", area: "Email sending", label: "Bounce guard: warns at 4%, pauses at 6%", critical: true, weekly: { admin: 35, sdr: 15 }, note: "The one pair for the whole product (PLAN.md, 14 Sep 2026), owned here and adjustable by the admin. Sequences, Campaigns, Reports, Agents, Home and the shell read these two numbers and show the observed rate beside them. An auto-pause threshold that stops sending is safety state (rule 7)." },
  { id: "mail.catch-all", page: "settings", area: "Email sending", label: "Block catch-all domains", weekly: { admin: 5 } },
  { id: "mail.unsubscribe-text", page: "settings", area: "Email sending", label: "Unsubscribe text", weekly: { admin: 3, sdr: 2 } },
  { id: "mail.unsubscribe-permission", page: "settings", area: "Email sending", label: "Users may disable the unsubscribe text", weekly: { admin: 2 }, note: "Depends on the unsubscribe text; never separated from it (rule 5)." },
  { id: "mail.tracking", page: "settings", area: "Email sending", label: "Open and click tracking", weekly: { sdr: 8, ae: 6, marketer: 10, admin: 4 } },

  // Prospecting rules
  { id: "pros.gdpr", page: "settings", area: "Prospecting rules", label: "GDPR restrictions by region", weekly: { admin: 4 } },
  { id: "pros.dnc", page: "settings", area: "Prospecting rules", label: "Do-not-call screening", weekly: { admin: 3 } },
  { id: "pros.primary-email", page: "settings", area: "Prospecting rules", label: "Primary email type", weekly: { admin: 2, sdr: 3 } },
  { id: "pros.duplicates", page: "settings", area: "Prospecting rules", label: "Duplicate handling", weekly: { admin: 6 } },
  { id: "pros.in-progress", page: "settings", area: "Prospecting rules", label: "In-progress limit per account", weekly: { admin: 8, sdr: 6 } },
  { id: "pros.territories", page: "settings", area: "Prospecting rules", label: "Territories", weekly: { admin: 12 }, overrides: { fathom: { admin: 1 }, halyard: { admin: 4 } }, note: "Growth and Scale; locked on Starter, so Fathom sees the row and its price." },

  // Pipeline and data
  { id: "pipe.stages", page: "settings", area: "Pipeline and data", label: "Pipelines and stages", weekly: { admin: 10, ae: 6 }, overrides: { fathom: { admin: 12 } } },
  { id: "pipe.contact-stages", page: "settings", area: "Pipeline and data", label: "Contact and account stages", weekly: { admin: 6 } },
  { id: "pipe.fields", page: "settings", area: "Pipeline and data", label: "Custom fields", weekly: { admin: 15, ae: 4, marketer: 4 } },
  { id: "pipe.currency", page: "settings", area: "Pipeline and data", label: "Deal currency", weekly: { admin: 2 } },
  { id: "pipe.enrichment-order", page: "settings", area: "Pipeline and data", label: "Enrichment provider order", weekly: { admin: 12, sdr: 4 }, overrides: { ridgeline: { admin: 5 } }, note: "Changed when credit spend spikes." },

  // Sequences
  { id: "seq.schedules", page: "settings", area: "Sequences", label: "Sending schedules", weekly: { sdr: 12, admin: 8 }, overrides: { ridgeline: { sdr: 4, admin: 2 }, halyard: { sdr: 20, admin: 15 } } },
  { id: "seq.rulesets", page: "settings", area: "Sequences", label: "Sequence rulesets", weekly: { admin: 6, sdr: 4 }, overrides: { ridgeline: { admin: 1 } } },
  { id: "seq.priority", page: "settings", area: "Sequences", label: "Sequence priority", weekly: { sdr: 3 } },

  // Agents and AI
  { id: "ai.context", page: "settings", area: "Agents and AI", label: "Company context", weekly: { marketer: 20, admin: 10 }, overrides: { ridgeline: { marketer: 30 }, fathom: { admin: 15 } } },
  { id: "ai.agents", page: "settings", area: "Agents and AI", label: "Agents on or off", weekly: { admin: 25, sdr: 10 }, overrides: { fathom: { admin: 40 } } },
  { id: "ai.approvals", page: "settings", area: "Agents and AI", label: "What agents may do without approval", critical: true, weekly: { admin: 30, sdr: 8 }, note: "Sending email and spending credits without a human is a consequence the admin must always see (rule 7)." },
  { id: "ai.credit-caps", page: "settings", area: "Agents and AI", label: "Agent credit caps", critical: true, weekly: { admin: 35 } },
  { id: "ai.second-approval", page: "settings", area: "Agents and AI", label: "Second approval above 1,000 recipients or 500 credits in one action", critical: true, weekly: { admin: 10, sdr: 4 }, overrides: { fathom: { admin: 4, sdr: 2 }, halyard: { admin: 12, sdr: 6 }, ridgeline: { admin: 5 } }, note: "The threshold an agent action must pass before an admin has to approve it as well as its owner (PLAN.md, 14 Sep 2026). Agents and Campaigns read it; neither sets it. A send limit is safety state (rule 7)." },
  { id: "ai.own-key", page: "settings", area: "Agents and AI", label: "Bring your own model key", weekly: { admin: 2 }, note: "Scale only; locked at Fathom, Halyard and Ridgeline." },

  // Integrations
  { id: "int.crm", page: "settings", area: "Integrations", label: "CRM sync", weekly: { admin: 40 }, overrides: { fathom: { admin: 5 }, halyard: { admin: 25 } } },
  { id: "int.field-mapping", page: "settings", area: "Integrations", label: "CRM field mapping", weekly: { admin: 15 }, overrides: { fathom: { admin: 2 } } },
  { id: "int.error-log", page: "settings", area: "Integrations", label: "Sync error log", weekly: { admin: 30 }, overrides: { fathom: { admin: 3 } } },
  { id: "int.calendar", page: "settings", area: "Integrations", label: "Calendar", weekly: { ae: 5, sdr: 5, cs: 4, admin: 3 } },
  { id: "int.slack", page: "settings", area: "Integrations", label: "Slack", weekly: { admin: 5 } },
  { id: "int.enrichment", page: "settings", area: "Integrations", label: "Enrichment provider", weekly: { admin: 6 } },
  { id: "int.api-keys", page: "settings", area: "Integrations", label: "API keys", weekly: { admin: 6 }, overrides: { fathom: { admin: 1 } }, note: "Growth and Scale; locked on Starter." },
  { id: "int.webhooks", page: "settings", area: "Integrations", label: "Webhooks", weekly: { admin: 4 }, overrides: { fathom: { admin: 1 } }, note: "Growth and Scale; locked on Starter, which is why Fathom's founder asked the price once and built nothing." },

  // Plan, billing and usage
  { id: "plan.seats", page: "settings", area: "Plan, billing and usage", label: "Plan and seats", weekly: { admin: 20 }, overrides: { halyard: { admin: 30 }, fathom: { admin: 15 } } },
  { id: "plan.price", page: "settings", area: "Plan, billing and usage", label: "Price and renewal date", critical: true, weekly: { admin: 25 } },
  { id: "plan.credits", page: "settings", area: "Plan, billing and usage", label: "Credit balance and burn rate", critical: true, weekly: { admin: 55, sdr: 30, ae: 15, marketer: 20, cs: 5 }, overrides: { fathom: { admin: 60, sdr: 40 } }, note: "The thing reviewers say surprises them at the end of the month." },
  { id: "plan.upgrade-requests", page: "settings", area: "Plan, billing and usage", label: "Upgrade requests from teammates", critical: true, weekly: { admin: 6 }, overrides: { fathom: { admin: 12 }, halyard: { admin: 10 }, ridgeline: { admin: 4 } }, note: "Each request names the person, the feature, the plan, the monthly cost and where the request came from. The approver is making a price decision, so rule 7 applies to their screen too (gated-features pattern rule 5; Figma ships the same six fields). Highest at Fathom, where Starter locks the most." },
  { id: "plan.invoices", page: "settings", area: "Plan, billing and usage", label: "Invoices", weekly: { admin: 8 } },
  { id: "plan.tax-id", page: "settings", area: "Plan, billing and usage", label: "Tax ID", weekly: { admin: 1 } },
  { id: "plan.cancel", page: "settings", area: "Plan, billing and usage", label: "Cancel plan", critical: true, weekly: { admin: 1 } },
  { id: "plan.export", page: "settings", area: "Plan, billing and usage", label: "Export all data", weekly: { admin: 2 } },
  { id: "plan.delete", page: "settings", area: "Plan, billing and usage", label: "Delete workspace", critical: true, weekly: { admin: 0.5 } },
]
