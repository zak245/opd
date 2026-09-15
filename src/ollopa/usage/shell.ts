import type { UsageItem } from "./model"

// Cross-cutting surfaces: sign-in, the app shell (sidebar, top bar, account menu, no-access page, phone bar,
// shortcuts), the ⌘K palette and notifications. Spec: specs/00-shell-signin-palette-notifications.md.
// The Page type has no "shell" value, so these carry page: "home" and area: "shell"; the spec's shape check reads
// shellItems directly rather than itemsFor("home"), which would also return Home's items. Baseline numbers describe Meridian.
// The sidebar is declared: the seat (at invite) plus the workspace profile (at set-up). Nothing here is inferred from use.
// Fathom overrides: three people, everyone watches credits, sign-in is rare because sessions persist.
// Halyard overrides: ten client workspaces and no switcher yet, so sign-in and "Switch account" are daily.
// Ridgeline overrides: little outbound, so replies, sequences and add-to-sequence fall; companies and deals rise.

const all = (n: number) => ({ sdr: n, ae: n, marketer: n, cs: n, admin: n })

export const shellItems: UsageItem[] = [
  // Sign-in
  { id: "signin.workspace", page: "home", area: "shell", label: "Sign-in: choose workspace", weekly: all(30), overrides: { halyard: { sdr: 90, admin: 90 }, fathom: { sdr: 20, admin: 20 } }, note: "Sessions persist 30 days, so a Meridian user signs in about once a month or on a new device. Halyard signs in to a different client workspace several times a day until the switcher exists." },
  { id: "signin.seat", page: "home", area: "shell", label: "Sign-in: choose seat", weekly: all(30), overrides: { halyard: { sdr: 90, admin: 90 }, fathom: { sdr: 20, admin: 20 } }, note: "A demo affordance: in a real deployment the seat comes with the account. Same frequency as choosing the workspace." },
  { id: "signin.submit", page: "home", area: "shell", label: "Sign-in: sign in", weekly: all(30), overrides: { halyard: { sdr: 90, admin: 90 }, fathom: { sdr: 20, admin: 20 } } },
  { id: "signin.forgot", page: "home", area: "shell", label: "Sign-in: forgot password", weekly: all(2) },

  // Sidebar, one item per page. The seat decides which pages a person may open; the workspace profile decides which of
  // those are listed. A page the seat cannot open carries no number (0); a page the profile left out still opens by link
  // and offers "Add to sidebar" (shell.add-to-sidebar).
  { id: "nav.home", page: "home", area: "shell", label: "Sidebar: Home", weekly: all(95) },
  { id: "nav.people", page: "home", area: "shell", label: "Sidebar: People", weekly: { sdr: 95, ae: 60, marketer: 30, admin: 25 }, overrides: { ridgeline: { sdr: 60, ae: 40, marketer: 20 } } },
  { id: "nav.companies", page: "home", area: "shell", label: "Sidebar: Companies", weekly: { sdr: 50, ae: 55, cs: 70, admin: 20 }, overrides: { ridgeline: { sdr: 40, ae: 70, cs: 90 } } },
  { id: "nav.lists", page: "home", area: "shell", label: "Sidebar: Lists", weekly: { sdr: 45, marketer: 60, admin: 15 }, overrides: { ridgeline: { sdr: 20, marketer: 45 } } },
  { id: "nav.sequences", page: "home", area: "shell", label: "Sidebar: Sequences", weekly: { sdr: 90, ae: 35, admin: 25 }, overrides: { ridgeline: { sdr: 25, ae: 10, admin: 5 }, halyard: { sdr: 95, admin: 60 } } },
  { id: "nav.inbox", page: "home", area: "shell", label: "Sidebar: Inbox", weekly: { sdr: 95, ae: 80 }, overrides: { ridgeline: { sdr: 50, ae: 40 }, fathom: { admin: 85 }, halyard: { admin: 25 } }, note: "The Fathom founder seat and the Halyard ops-lead seat carry the SDR's areas as well as the admin's, so Inbox is theirs. At Fathom the Founder-led outbound profile left Inbox out at set-up; the first reply exposed it for two weeks and the founder kept it." },
  { id: "nav.tasks", page: "home", area: "shell", label: "Sidebar: Tasks", weekly: { sdr: 90, ae: 75, cs: 60 }, overrides: { fathom: { admin: 80 }, halyard: { admin: 40 } }, note: "Same seat overlay: both Fathom seats and both Halyard seats work call and LinkedIn tasks." },
  { id: "nav.deals", page: "home", area: "shell", label: "Sidebar: Deals", weekly: { ae: 95, cs: 40, admin: 30 }, overrides: { fathom: { admin: 60 } } },
  { id: "nav.campaigns", page: "home", area: "shell", label: "Sidebar: Campaigns", weekly: { marketer: 95, admin: 15 }, overrides: { ridgeline: { marketer: 95, admin: 20 } }, note: "Fathom and Halyard run no campaigns; the item still shows for the marketer role, which those businesses do not have." },
  { id: "nav.accounts", page: "home", area: "shell", label: "Sidebar: Accounts", weekly: { cs: 95, ae: 30, admin: 15 }, overrides: { ridgeline: { cs: 95, ae: 70, admin: 30 } } },
  { id: "nav.reports", page: "home", area: "shell", label: "Sidebar: Reports", weekly: { ae: 25, marketer: 60, cs: 35, admin: 55 } },
  { id: "nav.agents", page: "home", area: "shell", label: "Sidebar: Agents", weekly: { sdr: 60, ae: 25, marketer: 20, admin: 45 }, overrides: { fathom: { sdr: 75, admin: 80 } } },
  { id: "nav.settings", page: "home", area: "shell", label: "Sidebar: Settings", weekly: { sdr: 20, ae: 10, marketer: 12, cs: 8, admin: 90 }, overrides: { fathom: { sdr: 45, admin: 90 }, halyard: { sdr: 40, admin: 95 } } },

  // The declared sidebar: adding a page the workspace profile left out, and the two-week exposure that teaches one
  { id: "shell.add-to-sidebar", page: "home", area: "shell", label: "Page header: Add to sidebar", weekly: { sdr: 3, ae: 3, marketer: 3, cs: 3, admin: 4 }, overrides: { fathom: { sdr: 6, admin: 6 }, halyard: { sdr: 5, admin: 5 } }, note: "A page the profile left out opens as normal; its header offers this. Added items go at the end of their group and stay. Rare by design: most people take the profile as it came." },
  { id: "shell.exposure-keep", page: "home", area: "shell", label: "Sidebar: keep this page? after a two-week exposure", weekly: all(1), overrides: { fathom: { sdr: 3, admin: 3 } }, note: "When a strong signal arrives for a page the profile left out (a founder's first reply, with no Inbox), the page sits in the sidebar for two weeks and then asks. One exposure per period; the answer is final until a new signal." },

  // Top bar
  { id: "top.search", page: "home", area: "shell", label: "Top bar: search or jump to (⌘K)", weekly: { sdr: 60, ae: 50, marketer: 35, cs: 30, admin: 55 }, overrides: { halyard: { sdr: 80, admin: 75 } } },
  { id: "top.credits", page: "home", area: "shell", label: "Top bar: credits pill (balance and weekly burn)", critical: true, weekly: { sdr: 30, ae: 15, marketer: 20, cs: 5, admin: 55 }, overrides: { fathom: { sdr: 40, admin: 60 } }, note: "Same numbers as Settings › Credit balance and burn rate; the pill is where most of those looks happen." },
  { id: "top.bell", page: "home", area: "shell", label: "Top bar: notifications bell", weekly: { sdr: 85, ae: 80, marketer: 40, cs: 50, admin: 70 }, overrides: { ridgeline: { sdr: 50, ae: 55 } } },
  { id: "top.account", page: "home", area: "shell", label: "Top bar: account menu", weekly: all(15), overrides: { halyard: { sdr: 80, admin: 80 } } },
  { id: "top.account.profile", page: "home", area: "shell", label: "Account menu: your profile", weekly: all(6) },
  { id: "top.account.credit-usage", page: "home", area: "shell", label: "Account menu: credit usage", weekly: { sdr: 8, ae: 3, marketer: 5, cs: 2, admin: 15 } },
  { id: "top.account.switch", page: "home", area: "shell", label: "Account menu: switch account", weekly: all(4), overrides: { halyard: { sdr: 80, admin: 80 } }, note: "At Halyard this is the stand-in for the workspace switcher until that case is built." },
  { id: "top.account.signout", page: "home", area: "shell", label: "Account menu: sign out", weekly: all(4), overrides: { halyard: { sdr: 20, admin: 20 } } },
  { id: "top.account.theme", page: "home", area: "shell", label: "Account menu: theme (light, dark, system)", weekly: all(2) },
  { id: "top.account.security", page: "home", area: "shell", label: "Account menu: password and MFA", weekly: all(1) },
  { id: "top.account.devices", page: "home", area: "shell", label: "Account menu: sign out other devices", weekly: all(0.5) },
  { id: "top.account.shortcuts", page: "home", area: "shell", label: "Account menu: keyboard shortcuts", weekly: all(2) },
  { id: "top.account.help", page: "home", area: "shell", label: "Account menu: help and docs", weekly: all(4), overrides: { fathom: { sdr: 8, admin: 8 } } },
  { id: "top.account.support", page: "home", area: "shell", label: "Account menu: contact support", weekly: all(2) },
  { id: "top.account.whats-new", page: "home", area: "shell", label: "Account menu: what changed this month", weekly: all(5) },

  // Shell states, keyboard, phone
  { id: "shell.no-access", page: "home", area: "shell", label: "No-access page", weekly: { sdr: 3, ae: 3, marketer: 4, cs: 4, admin: 0 }, note: "Reached by a shared link or a bookmark to a page outside the role. Never from the sidebar." },
  { id: "shell.toast", page: "home", area: "shell", label: "Interrupting toast (bounce guard, sync error, credits low)", critical: true, weekly: { sdr: 15, ae: 5, marketer: 3, cs: 2, admin: 35 }, overrides: { fathom: { sdr: 40, admin: 50 }, halyard: { sdr: 30, admin: 55 }, ridgeline: { sdr: 3, admin: 15 } } },
  { id: "shell.goto", page: "home", area: "shell", label: "Keyboard: g then a letter to jump to a page", weekly: { sdr: 15, ae: 10, marketer: 4, cs: 4, admin: 12 }, note: "Assumes the hint has been on screen in the palette for months (rule 8). New workspaces start lower." },
  { id: "shell.shortcut-list", page: "home", area: "shell", label: "Keyboard: ? shows the shortcut list", weekly: all(3) },
  { id: "shell.skip-link", page: "home", area: "shell", label: "Keyboard: skip to content", weekly: all(1) },
  { id: "shell.phone.bar", page: "home", area: "shell", label: "Phone: bottom bar", weekly: { sdr: 15, ae: 30, marketer: 10, cs: 20, admin: 10 }, note: "AEs and CS check deals and accounts between meetings; SDRs work at a desk." },
  { id: "shell.phone.all-pages", page: "home", area: "shell", label: "Phone: All pages sheet", weekly: { sdr: 5, ae: 10, marketer: 4, cs: 8, admin: 4 } },
  { id: "shell.collapse-sidebar", page: "home", area: "shell", label: "Collapse the sidebar to icons", weekly: all(4), note: "Persists per user. Labels return as tooltips on hover and focus; the full sidebar is one click back." },
  { id: "shell.session-expiry", page: "home", area: "shell", label: "Session about to expire notice", weekly: all(3), overrides: { fathom: { sdr: 1, admin: 1 } }, note: "Meridian and Ridgeline enforce a session timeout; Fathom does not." },

  // ⌘K palette
  { id: "palette.recent", page: "home", area: "shell", label: "Palette: recent items", weekly: { sdr: 35, ae: 30, marketer: 20, cs: 20, admin: 30 } },
  { id: "palette.pages", page: "home", area: "shell", label: "Palette: jump to a page", weekly: { sdr: 25, ae: 20, marketer: 15, cs: 15, admin: 30 }, note: "The sidebar is the plain path; the palette is the accelerator, so it stays below the sidebar numbers." },
  { id: "palette.settings", page: "home", area: "shell", label: "Palette: jump to a setting", weekly: { sdr: 15, ae: 5, marketer: 8, cs: 3, admin: 45 }, overrides: { halyard: { sdr: 30, admin: 70 }, fathom: { sdr: 25, admin: 40 } } },
  { id: "palette.contacts", page: "home", area: "shell", label: "Palette: find a contact", weekly: { sdr: 45, ae: 35, marketer: 10, cs: 20, admin: 15 }, overrides: { ridgeline: { sdr: 30, ae: 30 } } },
  { id: "palette.companies", page: "home", area: "shell", label: "Palette: find a company", weekly: { sdr: 25, ae: 30, marketer: 8, cs: 45, admin: 12 }, overrides: { ridgeline: { cs: 60, ae: 45 } } },
  { id: "palette.deals", page: "home", area: "shell", label: "Palette: find a deal", weekly: { sdr: 5, ae: 55, cs: 20, admin: 15 }, overrides: { ridgeline: { ae: 60 } } },
  { id: "palette.sequences", page: "home", area: "shell", label: "Palette: find a sequence", weekly: { sdr: 30, ae: 10, admin: 12 }, overrides: { ridgeline: { sdr: 6, ae: 2, admin: 2 }, halyard: { sdr: 55, admin: 40 } } },
  { id: "palette.lists", page: "home", area: "shell", label: "Palette: find a list", weekly: { sdr: 12, marketer: 25, admin: 6 }, overrides: { ridgeline: { sdr: 6 } } },
  { id: "palette.campaigns", page: "home", area: "shell", label: "Palette: find a campaign", weekly: { marketer: 45, admin: 8 } },
  { id: "palette.show-all", page: "home", area: "shell", label: "Palette: show all results on the page", weekly: { sdr: 15, ae: 10, marketer: 5, cs: 10, admin: 8 } },
  { id: "palette.action.add-to-sequence", page: "home", area: "shell", label: "Palette action: add to sequence…", weekly: { sdr: 30, ae: 10 }, overrides: { ridgeline: { sdr: 5, ae: 2 }, halyard: { sdr: 45 } } },
  { id: "palette.action.add-to-list", page: "home", area: "shell", label: "Palette action: add to list…", weekly: { sdr: 15, marketer: 15, ae: 4 } },
  { id: "palette.action.new-list", page: "home", area: "shell", label: "Palette action: new list", weekly: { sdr: 8, marketer: 10, admin: 2 } },
  { id: "palette.action.new-sequence", page: "home", area: "shell", label: "Palette action: new sequence", weekly: { sdr: 6, admin: 3 }, overrides: { halyard: { sdr: 15, admin: 10 } } },
  { id: "palette.action.approvals", page: "home", area: "shell", label: "Palette action: agent items waiting for approval", weekly: { sdr: 10, ae: 4, marketer: 3, admin: 10 }, overrides: { fathom: { sdr: 20, admin: 25 } } },
  { id: "palette.action.switch-account", page: "home", area: "shell", label: "Palette action: switch account", weekly: all(2), overrides: { halyard: { sdr: 60, admin: 60 } } },
  { id: "palette.reports", page: "home", area: "shell", label: "Palette: find a report", weekly: { ae: 6, marketer: 15, cs: 8, admin: 15 } },
  { id: "palette.action.new-deal", page: "home", area: "shell", label: "Palette action: new deal", weekly: { ae: 6, admin: 2 }, overrides: { fathom: { admin: 8 } } },
  { id: "palette.action.new-task", page: "home", area: "shell", label: "Palette action: new task", weekly: { sdr: 8, ae: 6, cs: 5 } },
  { id: "palette.action.notifications", page: "home", area: "shell", label: "Palette action: open notifications", weekly: all(2) },
  { id: "palette.action.theme", page: "home", area: "shell", label: "Palette action: change theme", weekly: all(1) },
  { id: "palette.action.sign-out", page: "home", area: "shell", label: "Palette action: sign out", weekly: all(1), overrides: { halyard: { sdr: 8, admin: 8 } } },

  // Notifications (inside the bell panel)
  { id: "bell.reply", page: "home", area: "shell", label: "Notification: replies, grouped by sequence", weekly: { sdr: 85, ae: 70 }, overrides: { ridgeline: { sdr: 30, ae: 20 }, halyard: { sdr: 90 } } },
  { id: "bell.meeting", page: "home", area: "shell", label: "Notification: meeting booked", weekly: { sdr: 35, ae: 40, cs: 12 }, overrides: { ridgeline: { sdr: 20, ae: 30, cs: 25 } } },
  { id: "bell.approval", page: "home", area: "shell", label: "Notification: agent approvals waiting, one batch per agent per day", weekly: { sdr: 45, ae: 20, marketer: 15, admin: 40 }, overrides: { fathom: { sdr: 60, admin: 70 }, ridgeline: { sdr: 20, marketer: 30 } }, note: "The owner of the object approves; the admin may approve for anyone. Batched at a task boundary, never an interruption mid-task; low-cost reversible agent work is logged, not queued." },
  { id: "bell.bounce-guard", page: "home", area: "shell", label: "Notification: bounce guard tripped", critical: true, weekly: { sdr: 15, admin: 20 }, overrides: { halyard: { sdr: 35, admin: 55 }, ridgeline: { sdr: 2, admin: 3 }, fathom: { sdr: 20, admin: 20 } }, note: "Safety state: a paused mailbox or sequence is level one whatever the frequency (rule 7)." },
  { id: "bell.sync-error", page: "home", area: "shell", label: "Notification: CRM sync error", weekly: { admin: 35 }, overrides: { fathom: { admin: 5, sdr: 5 }, halyard: { admin: 30 }, ridgeline: { admin: 20 } } },
  { id: "bell.credits-low", page: "home", area: "shell", label: "Notification: credits low", critical: true, weekly: { sdr: 8, ae: 3, marketer: 5, cs: 1, admin: 25 }, overrides: { fathom: { sdr: 50, admin: 60 }, halyard: { sdr: 15, admin: 40 } } },
  { id: "bell.mark-all-read", page: "home", area: "shell", label: "Bell: mark all read", weekly: { sdr: 30, ae: 25, marketer: 15, cs: 15, admin: 25 } },
  { id: "bell.unread-filter", page: "home", area: "shell", label: "Bell: unread only", weekly: { sdr: 12, ae: 10, marketer: 5, cs: 5, admin: 8 } },
  { id: "bell.older", page: "home", area: "shell", label: "Bell: show older than seven days", weekly: all(4) },
  { id: "bell.snooze", page: "home", area: "shell", label: "Bell: snooze a notification until tomorrow", weekly: { sdr: 6, ae: 6, marketer: 2, cs: 3, admin: 4 } },
  { id: "bell.delivery", page: "home", area: "shell", label: "Notification delivery: daily email digest", weekly: all(3), overrides: { halyard: { sdr: 5, admin: 6 } } },
  { id: "bell.delivery.slack", page: "home", area: "shell", label: "Notification delivery: Slack direct message", weekly: all(2), overrides: { fathom: { sdr: 0, admin: 0 } }, note: "Only when the Slack integration is connected; the row is removed, not disabled, otherwise (rule 4)." },
  { id: "bell.delivery.push", page: "home", area: "shell", label: "Notification delivery: browser push for interrupting kinds", weekly: all(2) },
  { id: "bell.delivery.mute", page: "home", area: "shell", label: "Notification delivery: mute a digestible kind", weekly: { sdr: 2, ae: 2, marketer: 2, cs: 2, admin: 1 }, note: "Interrupting kinds cannot be muted; they are safety state." },
  { id: "bell.delivery.quiet-hours", page: "home", area: "shell", label: "Notification delivery: quiet hours", weekly: all(1) },
]
