import type { UsageItem } from "./model"

// Home: 38 items in 9 areas (specs/01-home.md). Baseline numbers describe Meridian Software.
// Actions are folded into the row they belong to (marking a task done is the same visit as reading the task);
// only actions that are a separate choice (snooze, skip, book a meeting, unsubscribe) are counted on their own.
// Fathom overrides: founders do outbound and are admins, so the admin carries the SDR's numbers as well.
// Halyard overrides: ten client workspaces, so sending health and sequence state are checked every day.
// Ridgeline overrides: little outbound; tasks are inbound follow-ups, replies are few, accounts and signals are high.

export const homeItems: UsageItem[] = [
  // Today: tasks
  { id: "home.tasks.due", page: "home", area: "Today", label: "Tasks due today", weekly: { sdr: 90, ae: 60, cs: 45, marketer: 4, admin: 10 }, overrides: { fathom: { admin: 60 }, ridgeline: { sdr: 55, cs: 50 } }, note: "Includes the Done action on each row. The SDR's and the AE's first screen (PRODUCT.md)." },
  { id: "home.tasks.overdue", page: "home", area: "Today", label: "Overdue tasks", weekly: { sdr: 50, ae: 30, cs: 20, admin: 4 }, overrides: { fathom: { admin: 35 }, ridgeline: { sdr: 25 } }, note: "Shown above today's tasks whenever the count is above zero; removed when it is zero." },
  { id: "home.tasks.snooze", page: "home", area: "Today", label: "Snooze to tomorrow", weekly: { sdr: 18, ae: 12, cs: 15, admin: 3 }, overrides: { fathom: { admin: 15 } } },
  { id: "home.tasks.skip", page: "home", area: "Today", label: "Skip task", weekly: { sdr: 12, ae: 6, cs: 5, admin: 2 } },
  { id: "home.tasks.from-sequence", page: "home", area: "Today", label: "Which sequence the task comes from", weekly: { sdr: 15, ae: 6, cs: 2, admin: 2 }, overrides: { halyard: { sdr: 30 } }, note: "Halyard specialists run several sequences per client and need the name to know which client they are working." },
  { id: "home.tasks.later", page: "home", area: "Today", label: "Tomorrow and later", weekly: { sdr: 22, ae: 10, cs: 15, admin: 3 }, overrides: { fathom: { admin: 15 } }, note: "A door, expanded in place under today's list." },

  // Replies
  { id: "home.replies.hot", page: "home", area: "Replies", label: "Interested and question replies", weekly: { sdr: 85, ae: 45, marketer: 3, cs: 2, admin: 4 }, overrides: { fathom: { admin: 55 }, ridgeline: { sdr: 40, ae: 25 } }, note: "Includes the Reply action on each row." },
  { id: "home.replies.book", page: "home", area: "Replies", label: "Book a meeting", weekly: { sdr: 55, ae: 30, admin: 2 }, overrides: { fathom: { admin: 40 }, ridgeline: { sdr: 30, ae: 20 } } },
  { id: "home.replies.not-interested", page: "home", area: "Replies", label: "Mark not interested", weekly: { sdr: 18, ae: 8, admin: 2 }, overrides: { ridgeline: { sdr: 6 } } },
  { id: "home.replies.unsubscribe", page: "home", area: "Replies", label: "Unsubscribe", weekly: { sdr: 8, ae: 3, admin: 1 }, note: "Destructive. In the row menu with its consequence stated; never hover-only." },
  { id: "home.replies.other", page: "home", area: "Replies", label: "Not now and out-of-office replies", weekly: { sdr: 15, ae: 6, admin: 2 }, overrides: { ridgeline: { sdr: 5 } }, note: "A door, expanded in place under the hot replies." },

  // Pipeline
  { id: "home.pipeline.mine", page: "home", area: "Pipeline", label: "Your open deals: total and count", weekly: { ae: 85, sdr: 4, cs: 6 }, overrides: { fathom: { admin: 65, sdr: 15 }, ridgeline: { ae: 85, cs: 10 } }, note: "Includes opening a deal from the row." },
  { id: "home.pipeline.team", page: "home", area: "Pipeline", label: "Team pipeline total", weekly: { ae: 30, admin: 30, cs: 15, sdr: 6, marketer: 10 }, overrides: { fathom: { admin: 40 }, halyard: { admin: 25, sdr: 4 }, ridgeline: { cs: 30 } } },
  { id: "home.pipeline.next-step", page: "home", area: "Pipeline", label: "Deals with no next step", weekly: { ae: 60, admin: 10 }, overrides: { fathom: { admin: 40 } }, note: "Only deals owned by the signed-in AE; the admin sees the team count." },
  { id: "home.pipeline.closing", page: "home", area: "Pipeline", label: "Closing in the next 30 days", weekly: { ae: 55, admin: 25, cs: 10 }, overrides: { fathom: { admin: 40 }, ridgeline: { cs: 15 } } },
  { id: "home.pipeline.stages", page: "home", area: "Pipeline", label: "Deals by stage and forecast category", weekly: { ae: 15, admin: 15, cs: 5, sdr: 2 }, note: "A door. The AE lives on the Deals board for this; on Home it is a rare glance." },

  // Agents
  { id: "home.agents.approvals", page: "home", area: "Agents", label: "Waiting for your approval", critical: true, weekly: { sdr: 55, ae: 25, marketer: 15, cs: 5, admin: 45 }, overrides: { fathom: { admin: 70, sdr: 60 }, halyard: { admin: 60, sdr: 55 }, ridgeline: { sdr: 20, ae: 20, cs: 20, marketer: 25 } }, note: "Includes Approve and Decline on each row. An agent about to send email or spend credits is a pending approval (rule 7)." },
  { id: "home.agents.credits", page: "home", area: "Agents", label: "Credits each approval will spend", critical: true, weekly: { sdr: 55, ae: 25, marketer: 15, cs: 5, admin: 45 }, overrides: { fathom: { admin: 70, sdr: 60 }, halyard: { admin: 60, sdr: 55 }, ridgeline: { sdr: 20, ae: 20, cs: 20, marketer: 25 } }, note: "Cost sits on the same row as the Approve button; never behind the detail door (rule 5, rule 7)." },
  { id: "home.agents.detail", page: "home", area: "Agents", label: "What the agent found", weekly: { sdr: 18, ae: 10, marketer: 8, cs: 3, admin: 18 }, overrides: { fathom: { admin: 30, sdr: 25 } }, note: "A per-row door: sources, confidence, the full draft. Most approvals are decided from the row." },
  { id: "home.agents.week", page: "home", area: "Agents", label: "What agents did this week", weekly: { sdr: 15, ae: 6, marketer: 8, cs: 2, admin: 25 }, overrides: { fathom: { admin: 40 }, halyard: { admin: 35 } }, note: "A door. The full ledger is the Agents page." },
  { id: "home.agents.paused", page: "home", area: "Agents", label: "Outreach an agent paused", critical: true, weekly: { sdr: 8, ae: 2, admin: 15 }, overrides: { halyard: { admin: 30, sdr: 20 }, ridgeline: { admin: 3, sdr: 2 } }, note: "Safety state: sending stopped without a human. Shown in the health strip whenever it applies." },

  // Sending and workspace health
  { id: "home.health.bounce", page: "home", area: "Health", label: "Bounce guard state", critical: true, weekly: { admin: 35, sdr: 12, ae: 3 }, overrides: { halyard: { admin: 60, sdr: 30 }, fathom: { admin: 30 }, ridgeline: { admin: 8, sdr: 3 } }, note: "Same number as the settings item mail.bounce-guard for the admin; the SDR sees it here, not in Settings." },
  { id: "home.health.mailboxes", page: "home", area: "Health", label: "Mailboxes near their daily limit", weekly: { sdr: 15, admin: 15, ae: 4 }, overrides: { halyard: { admin: 45, sdr: 40 }, fathom: { admin: 25 }, ridgeline: { sdr: 3, admin: 5 } } },
  { id: "home.health.sequences", page: "home", area: "Health", label: "Your sequences: active, replied, bounced", weekly: { sdr: 45, ae: 10, admin: 8 }, overrides: { halyard: { sdr: 60, admin: 30 }, fathom: { admin: 35, sdr: 45 }, ridgeline: { sdr: 8, ae: 3, admin: 2 } } },
  { id: "home.health.sync", page: "home", area: "Health", label: "CRM sync errors", weekly: { admin: 30, ae: 4, cs: 4 }, overrides: { fathom: { admin: 3 }, halyard: { admin: 25 } }, note: "Same number as the settings item int.error-log; Home shows the count, Settings shows the log." },
  { id: "home.health.credits", page: "home", area: "Health", label: "Credit burn against the monthly cap", critical: true, weekly: { admin: 55, sdr: 30, ae: 15, marketer: 20, cs: 5 }, overrides: { fathom: { admin: 60, sdr: 40 } }, note: "Balance and burn are in the top bar on every page; Home adds the projection: the date the cap is reached at this rate." },
  { id: "home.health.invites", page: "home", area: "Health", label: "Invitations not yet accepted", weekly: { admin: 15 }, overrides: { fathom: { admin: 3 }, halyard: { admin: 10 } } },
  { id: "home.health.setup", page: "home", area: "Health", label: "Setup steps remaining", weekly: { admin: 10 }, overrides: { fathom: { admin: 30 }, halyard: { admin: 20 } }, note: "A door. Removed, not disabled, once every step is done. Fathom and Halyard open new workspaces often." },

  // Campaigns
  { id: "home.campaigns.running", page: "home", area: "Campaigns", label: "Campaigns running", weekly: { marketer: 85, admin: 8, sdr: 3, ae: 3 }, overrides: { ridgeline: { marketer: 90, cs: 10 } }, note: "The marketer's first screen (PRODUCT.md)." },
  { id: "home.campaigns.results", page: "home", area: "Campaigns", label: "Results since yesterday", weekly: { marketer: 70, admin: 3 }, overrides: { ridgeline: { marketer: 80 } } },
  { id: "home.campaigns.audiences", page: "home", area: "Campaigns", label: "Audiences that changed", weekly: { marketer: 18, admin: 2 }, overrides: { ridgeline: { marketer: 25 } }, note: "A door. Audience size moves when lists and segments refresh overnight." },

  // Accounts
  { id: "home.accounts.renewals", page: "home", area: "Accounts", label: "Renewals in the next 60 days", weekly: { cs: 80, ae: 10, admin: 8 }, overrides: { ridgeline: { cs: 90, ae: 40, admin: 15 } }, note: "The CS role's first screen (PRODUCT.md)." },
  { id: "home.accounts.health", page: "home", area: "Accounts", label: "Accounts whose health dropped", weekly: { cs: 75, ae: 6, admin: 4 }, overrides: { ridgeline: { cs: 85, ae: 30 } } },
  { id: "home.accounts.expansion", page: "home", area: "Accounts", label: "Expansion signals", weekly: { cs: 40, ae: 15, admin: 3 }, overrides: { ridgeline: { cs: 70, ae: 60, marketer: 15 } }, note: "Ridgeline's expansion AE lives on this; elsewhere it is CS's weekly routine." },

  // Activity
  { id: "home.activity.week", page: "home", area: "Activity", label: "Your week: sent, calls, meetings booked", weekly: { sdr: 22, ae: 20, cs: 8, marketer: 3, admin: 6 }, overrides: { fathom: { admin: 20 }, ridgeline: { sdr: 10, ae: 8 } }, note: "One line of numbers, no chart. Charts are on Reports." },
  { id: "home.activity.leaderboard", page: "home", area: "Activity", label: "Team leaderboard", weekly: { sdr: 4, ae: 4, admin: 4, marketer: 1 }, note: "Removed from Home. Under 5% for every role at every business; it lives on Reports." },
  { id: "home.activity.funnel", page: "home", area: "Activity", label: "Email funnel", weekly: { sdr: 5, marketer: 8, admin: 4 }, overrides: { ridgeline: { sdr: 1, marketer: 4 } }, note: "Removed from Home; the sequence line carries sent, replied and bounced, and the funnel lives on Reports." },

  // Layout
  { id: "home.layout.edit", page: "home", area: "Layout", label: "Edit layout, add widgets, saved layouts", weekly: { sdr: 2, ae: 2, marketer: 3, cs: 2, admin: 3 }, note: "Removed. Fewer than 5% of users change a default (Spool, 2011); role and business decide the page instead." },
]
