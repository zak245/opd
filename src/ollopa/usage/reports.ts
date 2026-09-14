import type { UsageItem } from "./model"

// Reports: four fixed reports (Activity, Pipeline, Sequences, Campaign results) with one date range and one team filter.
// Spec: specs/12-reports.md. Baseline numbers describe Meridian Software. The SDR has no Reports entry, so no sdr numbers.
// Fathom overrides: only the founder (admin) uses it; no campaigns and no teams, so those items are 0 and removed from the page.
// Halyard overrides: the ops lead (admin) produces the client report weekly, so export, print and sequence detail are routine.
// Ridgeline overrides: product-led; pipeline is renewals and expansion, campaigns are lifecycle, sequences are nearly idle.

export const reportsItems: UsageItem[] = [
  // Reports
  { id: "rep.overview", page: "reports", area: "Reports", label: "Overview strip", weekly: { ae: 45, marketer: 55, cs: 30, admin: 60 }, overrides: { fathom: { admin: 55 }, halyard: { admin: 70 }, ridgeline: { ae: 35, marketer: 60, cs: 45, admin: 50 } }, note: "The page visit itself: the tile row of every report the role uses." },
  { id: "rep.activity", page: "reports", area: "Reports", label: "Activity report", weekly: { ae: 8, marketer: 12, cs: 10, admin: 45 }, overrides: { fathom: { admin: 40 }, halyard: { admin: 65 }, ridgeline: { cs: 20, admin: 30 } } },
  { id: "rep.pipeline", page: "reports", area: "Reports", label: "Pipeline report", weekly: { ae: 45, marketer: 10, cs: 22, admin: 40 }, overrides: { fathom: { admin: 50 }, halyard: { admin: 15 }, ridgeline: { ae: 35, cs: 40 } }, note: "Ridgeline renewals are deals, so CS lives here. Halyard's own pipeline is small; clients' pipelines are not in Ollopa." },
  { id: "rep.sequences", page: "reports", area: "Reports", label: "Sequences report", weekly: { ae: 4, marketer: 4, cs: 1, admin: 25 }, overrides: { fathom: { admin: 40 }, halyard: { admin: 65 }, ridgeline: { admin: 4, marketer: 2 } } },
  { id: "rep.campaigns", page: "reports", area: "Reports", label: "Campaign results", weekly: { ae: 2, marketer: 55, cs: 4, admin: 12 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 0 }, ridgeline: { marketer: 60, cs: 12, admin: 22 } }, note: "Removed, not disabled, where the business has no campaigns." },

  // Controls
  { id: "ctl.range", page: "reports", area: "Controls", label: "Date range presets", weekly: { ae: 35, marketer: 50, cs: 22, admin: 55 }, overrides: { fathom: { admin: 50 }, halyard: { admin: 65 } } },
  { id: "ctl.custom-range", page: "reports", area: "Controls", label: "Custom date range", weekly: { ae: 4, marketer: 12, cs: 3, admin: 8 }, overrides: { halyard: { admin: 18 } }, note: "Inside the date-range menu. Halyard matches client billing periods." },
  { id: "ctl.team", page: "reports", area: "Controls", label: "Team filter", weekly: { ae: 10, marketer: 18, cs: 6, admin: 40 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 0 }, ridgeline: { admin: 30 } }, note: "Removed where there are no teams; a scoped AE sees a sentence naming the admin instead." },
  { id: "ctl.person", page: "reports", area: "Controls", label: "Person filter", weekly: { ae: 15, marketer: 4, cs: 12, admin: 18 }, overrides: { fathom: { admin: 35 }, halyard: { admin: 50 } }, note: "Inside the team menu, beneath the team list. Small teams look at people." },
  { id: "ctl.compare", page: "reports", area: "Controls", label: "Compare with previous period", weekly: { ae: 15, marketer: 30, cs: 8, admin: 15 }, overrides: { ridgeline: { marketer: 35 } }, note: "Depends on the range, so it lives in the date-range menu when under 20 (rule 5)." },
  { id: "ctl.export-csv", page: "reports", area: "Controls", label: "Export CSV", weekly: { ae: 6, marketer: 22, cs: 5, admin: 25 }, overrides: { fathom: { admin: 10 }, halyard: { admin: 70 }, ridgeline: { marketer: 18 } }, note: "Halyard's client report. The menu states that report exports spend no credits." },
  { id: "ctl.print", page: "reports", area: "Controls", label: "Print or save as PDF", weekly: { ae: 2, marketer: 8, cs: 2, admin: 4 }, overrides: { halyard: { admin: 30 } } },
  { id: "ctl.link", page: "reports", area: "Controls", label: "Copy link with filters", weekly: { ae: 4, marketer: 12, cs: 3, admin: 10 }, overrides: { halyard: { admin: 15 } } },
  { id: "ctl.schedule", page: "reports", area: "Controls", label: "Email this report weekly", weekly: { ae: 1, marketer: 4, cs: 1, admin: 4 }, overrides: { halyard: { admin: 15 } } },
  { id: "ctl.columns", page: "reports", area: "Controls", label: "Choose columns", weekly: { ae: 2, marketer: 3, cs: 2, admin: 4 } },
  { id: "ctl.chart-table", page: "reports", area: "Controls", label: "Chart or table for the trend", weekly: { ae: 2, marketer: 4, cs: 2, admin: 4 } },
  { id: "ctl.grain", page: "reports", area: "Controls", label: "Time grain (day, week, month)", weekly: { ae: 2, marketer: 4, cs: 2, admin: 4 } },

  // Details on demand
  { id: "det.records", page: "reports", area: "Details on demand", label: "Records behind a number", weekly: { ae: 30, marketer: 18, cs: 18, admin: 30 }, overrides: { halyard: { admin: 40 }, ridgeline: { cs: 30 } }, note: "The main door: a count in a cell opens the drawer listing the records." },
  { id: "det.weeks", page: "reports", area: "Details on demand", label: "Week by week for one row", weekly: { ae: 8, marketer: 10, cs: 5, admin: 8 }, note: "First section of the records drawer." },
  { id: "det.open-record", page: "reports", area: "Details on demand", label: "Open the record from the drawer", weekly: { ae: 18, marketer: 4, cs: 10, admin: 4 }, note: "Navigation to a page, not a third level; Back restores the drawer." },
  { id: "det.steps", page: "reports", area: "Details on demand", label: "Step by step for a sequence", weekly: { ae: 2, marketer: 3, cs: 1, admin: 18 }, overrides: { fathom: { admin: 30 }, halyard: { admin: 55 }, ridgeline: { admin: 2 } }, note: "Expands in place under the sequence row. Apollo's documented gap." },
  { id: "det.audience", page: "reports", area: "Details on demand", label: "Audience breakdown for a campaign", weekly: { ae: 1, marketer: 35, cs: 2, admin: 3 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 0 }, ridgeline: { marketer: 40 } } },
  { id: "det.definitions", page: "reports", area: "Details on demand", label: "How these numbers are counted", weekly: { ae: 4, marketer: 4, cs: 4, admin: 4 }, note: "Holds the counting toggles too, so definitions and what changes them stay together." },

  // Pipeline report
  { id: "pipe.forecast", page: "reports", area: "Pipeline report", label: "Weighted forecast", critical: true, weekly: { ae: 45, marketer: 4, cs: 12, admin: 35 }, overrides: { halyard: { admin: 10 }, ridgeline: { ae: 35, cs: 30 } }, note: "A commitment reported upward; the method sits under the number (rule 7)." },
  { id: "pipe.breakdown", page: "reports", area: "Pipeline report", label: "By stage or by rep switch", weekly: { ae: 25, marketer: 4, cs: 12, admin: 18 } },
  { id: "pipe.conversion", page: "reports", area: "Pipeline report", label: "Stage-to-stage conversion", weekly: { ae: 10, marketer: 3, cs: 3, admin: 12 }, note: "Expands in place under the by-stage table it depends on." },
  { id: "pipe.lost-reasons", page: "reports", area: "Pipeline report", label: "Lost reasons", weekly: { ae: 8, marketer: 3, cs: 6, admin: 8 }, overrides: { ridgeline: { cs: 15 } }, note: "Expands in place next to the Lost tile." },
  { id: "pipe.unweighted", page: "reports", area: "Pipeline report", label: "Unweighted forecast toggle", weekly: { ae: 3, marketer: 1, cs: 2, admin: 4 } },

  // Activity report
  { id: "act.sort", page: "reports", area: "Activity report", label: "Sort reps", weekly: { ae: 5, marketer: 4, cs: 6, admin: 18 }, overrides: { halyard: { admin: 50 } } },
  { id: "act.trend", page: "reports", area: "Activity report", label: "Weekly activity trend", weekly: { ae: 5, marketer: 10, cs: 6, admin: 15 } },
  { id: "act.meetings", page: "reports", area: "Activity report", label: "Meetings booked", weekly: { ae: 8, marketer: 10, cs: 4, admin: 35 }, overrides: { fathom: { admin: 40 } }, note: "A contact moved to stage Meeting booked; Ollopa has no booking tool. Founders count meetings." },

  // Sequences report
  { id: "seq.bounce", page: "reports", area: "Sequences report", label: "Bounce rate", critical: true, weekly: { ae: 1, marketer: 2, cs: 1, admin: 15 }, overrides: { fathom: { admin: 30 }, halyard: { admin: 50 }, ridgeline: { admin: 3 } }, note: "Safety state: at the bounce-guard threshold sending pauses (rule 7)." },
  { id: "seq.sort", page: "reports", area: "Sequences report", label: "Sort sequences by reply rate", weekly: { ae: 2, marketer: 4, cs: 1, admin: 15 }, overrides: { halyard: { admin: 45 } } },
  { id: "seq.bots", page: "reports", area: "Sequences report", label: "Include bot opens", weekly: { ae: 1, marketer: 2, cs: 1, admin: 3 } },
  { id: "seq.archived", page: "reports", area: "Sequences report", label: "Show archived sequences", weekly: { ae: 1, marketer: 1, cs: 1, admin: 3 } },

  // Campaign results
  { id: "camp.conversion", page: "reports", area: "Campaign results", label: "Conversion to pipeline", weekly: { ae: 4, marketer: 40, cs: 3, admin: 10 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 0 }, ridgeline: { marketer: 50 } } },
  { id: "reports.camp.sort", page: "reports", area: "Campaign results", label: "Sort campaigns", weekly: { ae: 1, marketer: 25, cs: 2, admin: 3 }, overrides: { fathom: { admin: 0 }, halyard: { admin: 0 } } },
  { id: "camp.internal", page: "reports", area: "Campaign results", label: "Exclude internal contacts", weekly: { ae: 1, marketer: 2, cs: 1, admin: 2 } },

  // Freshness
  { id: "data.asof", page: "reports", area: "Freshness", label: "Data as of", critical: true, weekly: { ae: 12, marketer: 20, cs: 8, admin: 25 }, note: "A stale number acted on is a wrong decision (rule 7)." },
]
