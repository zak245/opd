import type { UsageItem } from "./model"

// Workspace set-up: the fifteenth page (specs/16-workspace-setup.md). Three questions on one screen, one button.
// It runs once per workspace, so only the person who creates the workspace sees it: the admin seat. Every other
// seat is 0, and the page says who set the workspace up and where the answers now live.
// Baseline numbers describe Meridian Software, where set-up happened once and is touched again only when the ops
// team revisits the profile. Halyard overrides carry the page: the agency onboards a client workspace most months,
// so the same screen that is a once-ever event elsewhere is a monthly routine there.
// Fathom and Ridgeline ran it once each and have not been back.
// The answers are declared, never inferred, and stay visible and editable in Settings under "How your team works"
// (usage/settings.ts, area "How your team works"; PLAN.md, 14 Sep 2026).

export const setupItems: UsageItem[] = [
  // The three questions
  { id: "setup.job", page: "setup", area: "The three questions", label: "What are you here to do first (find and reach new companies, work replies and book meetings, grow existing accounts, run campaigns)", weekly: { admin: 3 }, overrides: { halyard: { admin: 25 }, fathom: { admin: 2 }, ridgeline: { admin: 2 } }, note: "The job to be done, not the job title (Airtable 2023: routing by declared function cost 10% of sharing and collaboration until it was re-cut around the shape of the work)." },
  { id: "setup.people", page: "setup", area: "The three questions", label: "How many people will use it", weekly: { admin: 3 }, overrides: { halyard: { admin: 25 }, fathom: { admin: 2 }, ridgeline: { admin: 2 } } },
  { id: "setup.seats", page: "setup", area: "The three questions", label: "Which seats exist here", weekly: { admin: 3 }, overrides: { halyard: { admin: 25 }, fathom: { admin: 2 }, ridgeline: { admin: 2 } }, note: "Sits directly under 'how many people' because the two are read together (rule 5); the seat list is what the usage model later reads as SEATS." },
  { id: "setup.seat-cost", page: "setup", area: "The three questions", label: "What these seats cost on this plan, as one total for the period", critical: true, weekly: { admin: 3 }, overrides: { halyard: { admin: 25 }, fathom: { admin: 2 }, ridgeline: { admin: 2 } }, note: "Price is decision-critical (rule 7), and a seat answer is a price answer. One total, never a component breakdown (gated-features pattern rule 4). Starter stops at three seats, so the limit is stated here, at the entry point, not after the names are typed (pattern rule 7)." },

  // What the answers decide
  { id: "setup.profile", page: "setup", area: "What the answers decide", label: "The profile the answers produce, named: Founder-led outbound, Separated sales team, Agency or Product-led growth", weekly: { admin: 3 }, overrides: { halyard: { admin: 25 }, fathom: { admin: 2 }, ridgeline: { admin: 2 } }, note: "Named after the shape of the work, never after a level of skill (rule 3). Shown on the same screen as the answers, so the person sees what their answers caused." },
  { id: "setup.sidebar-preview", page: "setup", area: "What the answers decide", label: "The sidebar this produces, per seat, before anything is committed", weekly: { admin: 3 }, overrides: { halyard: { admin: 22 }, fathom: { admin: 2 }, ridgeline: { admin: 2 } }, note: "Asking a question and visibly using the answer is the difference between personalisation and a survey (Growth.Design on Blinkist: unmet expectations backfire)." },
  { id: "setup.left-out", page: "setup", area: "What the answers decide", label: "Pages this profile leaves out, and the two ways they come back", weekly: { admin: 2 }, overrides: { halyard: { admin: 18 }, fathom: { admin: 3 }, ridgeline: { admin: 1 } }, note: "A left-out page still opens, still has a deep link, and its header offers 'Add to sidebar'. Stated here so nothing is discovered as an absence." },
  { id: "setup.other-profiles", page: "setup", area: "What the answers decide", label: "The other three profiles and what each would give you", weekly: { admin: 2 }, overrides: { halyard: { admin: 6 }, fathom: { admin: 3 }, ridgeline: { admin: 2 } }, note: "The one door on the page. It exists so the machine's choice can be checked against the alternatives without leaving the screen." },
  { id: "setup.what-changes", page: "setup", area: "What the answers decide", label: "What these answers change, and that Settings changes them again at any time", critical: true, weekly: { admin: 3 }, overrides: { halyard: { admin: 25 }, fathom: { admin: 2 }, ridgeline: { admin: 2 } }, note: "A commitment the person is making about their workspace, so rule 7 puts it on screen. Reversibility is an acceptance condition for any layout a product chooses for you (ReLay, IUI 2026)." },

  // The workspace itself
  { id: "setup.name", page: "setup", area: "The workspace itself", label: "Workspace name, carried from sign-up and shown for correction", weekly: { admin: 3 }, overrides: { halyard: { admin: 25 }, fathom: { admin: 1 }, ridgeline: { admin: 1 } }, note: "Shown, not asked: an answer the product already has is a step to eliminate (ProductLed's Eliminate). Halyard types a client's name every time." },
  { id: "setup.locale", page: "setup", area: "The workspace itself", label: "Timezone and currency, guessed from the browser and shown for correction", weekly: { admin: 2 }, overrides: { halyard: { admin: 12 }, fathom: { admin: 1 }, ridgeline: { admin: 1 } }, note: "Also shown, not asked. Halyard corrects it whenever a client is not in London." },

  // Finishing
  { id: "setup.start", page: "setup", area: "Finishing", label: "Start: the workspace opens on the first screen the profile and seat name", weekly: { admin: 3 }, overrides: { halyard: { admin: 25 }, fathom: { admin: 2 }, ridgeline: { admin: 2 } } },
  { id: "setup.invite", page: "setup", area: "Finishing", label: "Invite the people you counted, each with a seat", weekly: { admin: 2 }, overrides: { halyard: { admin: 20 }, fathom: { admin: 1 }, ridgeline: { admin: 1 } }, note: "The seat half of the declared sidebar is declared here, at invite, not guessed later." },
  { id: "setup.skip", page: "setup", area: "Finishing", label: "Skip: every page for your seat, nothing left out", weekly: { admin: 1 }, overrides: { halyard: { admin: 3 }, fathom: { admin: 1 }, ridgeline: { admin: 1 } }, note: "Skipping gives more, never less: no profile means no page is left out. A person who will not answer must not be punished with a smaller product." },
  { id: "setup.resume", page: "setup", area: "Finishing", label: "Leave and come back; the answers are kept", weekly: { admin: 1 }, overrides: { halyard: { admin: 4 }, fathom: { admin: 1 }, ridgeline: { admin: 1 } }, note: "Every answer is saved as it is made, as in the connect wizard." },
]
