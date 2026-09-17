// Deterministic seed data for Ollopa. Same business, same rows, every time.
//
// One random stream per business, drawn in a fixed order, so a page renders the same rows on every
// reload and two pages reading the same object agree. Everything the specs read lives here: the 31
// objects of JOURNEYS.md section 1, generated from the stream rather than hand-written.
//
// Owner: the data builder (BUILD-BRIEF.md). Page builders read the seed and send additions; they
// never invent rows inline. Names, numbers and companies are invented.
import type { Business, Role } from "../usage/model"
import { businessById } from "./businesses"

/* ------------------------------------------------------------------ the stream and its helpers */

function rng(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}
type R = () => number

function pick<T>(r: R, arr: readonly T[]): T { return arr[Math.floor(r() * arr.length)] }
function pickN<T>(r: R, arr: readonly T[], n: number): T[] {
  const left = [...arr], out: T[] = []
  for (let i = 0; i < n && left.length; i++) out.push(left.splice(Math.floor(r() * left.length), 1)[0])
  return out
}
function chance(r: R, p: number): boolean { return r() < p }
function int(r: R, min: number, max: number): number { return min + Math.floor(r() * (max - min + 1)) }
function many<T>(n: number, fn: (i: number) => T): T[] { return Array.from({ length: Math.max(0, n) }, (_, i) => fn(i)) }

/**
 * A total split over N weeks on a fixed profile taken from `salt`, so the weeks add back up to the
 * total exactly and the same row draws the same shape on every reload.
 */
function overWeeks(total: number, weeks: number, salt: number): number[] {
  if (weeks <= 0) return []
  if (total === 0) return new Array(weeks).fill(0)
  const weights = Array.from({ length: weeks }, (_, i) => 0.6 + 0.8 * Math.abs(Math.sin(i * 1.7 + salt)))
  const sum = weights.reduce((a, b) => a + b, 0)
  const out = weights.map((w) => Math.round((w / sum) * total))
  out[out.length - 1] += total - out.reduce((a, b) => a + b, 0)
  return out
}

/** The seed's fixed today. Every relative date on every page is measured from it. */
export const TODAY = "2026-09-13"
const TODAY_MS = Date.UTC(2026, 8, 13)
function shift(days: number): string { return new Date(TODAY_MS + days * 86_400_000).toISOString().slice(0, 10) }
function dateBack(r: R, maxDays: number): string { return shift(-Math.floor(r() * maxDays)) }
function plusDays(iso: string, days: number): string { return new Date(Date.parse(iso) + days * 86_400_000).toISOString().slice(0, 10) }
/** The Monday of the week a date falls in: the bucket every weekly series in the product uses. */
function weekStartOf(iso: string): string {
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z")
  return plusDays(iso.slice(0, 10), -((d.getUTCDay() + 6) % 7))
}
/** The Mondays of the last `n` weeks, oldest first, ending with the week today sits in. */
function lastWeeks(n: number): string[] {
  const thisWeek = weekStartOf(TODAY)
  return many(n, (k) => plusDays(thisWeek, -(n - 1 - k) * 7))
}
function dateAhead(r: R, maxDays: number): string { return shift(Math.floor(r() * maxDays)) }
function clockTime(r: R): string { return `${String(int(r, 7, 18)).padStart(2, "0")}:${String(int(r, 0, 59)).padStart(2, "0")}` }
function money(r: R, bands: readonly number[]): number { return pick(r, bands) }

/* ------------------------------------------------------------------------- quarters, for targets */

/** "2026-Q3" for any day in it. */
function quarterOf(iso: string): string {
  return `${iso.slice(0, 4)}-Q${Math.floor((Number(iso.slice(5, 7)) - 1) / 3) + 1}`
}
/** The quarter `back` quarters before this one. */
function quarterBack(period: string, back: number): string {
  const [year, q] = period.split("-Q").map(Number)
  const n = year * 4 + (q - 1) - back
  return `${Math.floor(n / 4)}-Q${(n % 4) + 1}`
}
/** The first and last day of a quarter. */
function quarterWindow(period: string): { from: string; to: string } {
  const [year, q] = period.split("-Q").map(Number)
  const from = Date.UTC(year, (q - 1) * 3, 1)
  const to = Date.UTC(q === 4 ? year + 1 : year, q === 4 ? 0 : q * 3, 1) - 86_400_000
  return { from: new Date(from).toISOString().slice(0, 10), to: new Date(to).toISOString().slice(0, 10) }
}

/* ---------------------------------------------------------------------------------- name pools */

const FIRST = ["Amara","Ben","Chloe","Dev","Elif","Farid","Greta","Hugo","Ines","Jamal","Kai","Lena","Mateo","Nadia","Omar","Petra","Quinn","Rosa","Sami","Tara","Umar","Vera","Wen","Ximena","Yusuf","Zara","Anders","Bianca","Cyrus","Dalia","Emil","Freya","Gael","Hiro","Ivy","Joel","Kira","Luca","Maya","Nils","Orla","Paulo","Rhea","Soren","Tomas","Una","Viktor","Willa","Yara","Zev"]
const LAST = ["Okonkwo","Fischer","Moreau","Patel","Yilmaz","Haddad","Lindgren","Silva","Costa","Nakamura","Ivanova","Schmidt","Rossi","Kowalski","Andersen","Novak","Murphy","Bakker","Larsen","Castillo","Nguyen","Kim","Sato","Abebe","Mensah","Dubois","Meyer","Romano","Jensen","Berg","Fontaine","Ortiz","Popescu","Varga","Horvat","Dimitrov","Petrov","Ahmed","Khan","Osei","Reyes","Torres","Vogel","Weiss","Zimmer","Brennan","Doyle","Walsh","Byrne","Quinn"]
const COMPANIES = ["Northwind Analytics","Bluefin Logistics","Kestrel Health","Orchard Payments","Tidewater Energy","Sable Robotics","Lumen Security","Copperline Retail","Granite Insurance","Vantage Legal","Harbor Foods","Ironwood Manufacturing","Pinecrest Media","Quartz Biotech","Redwood Learning","Summit Telecom","Trellis HR","Umber Studios","Verdant Agritech","Willow Finance","Atlas Freight","Beacon Software","Cobalt Mining","Delta Textiles","Ember Hospitality","Falcon Aerospace","Glacier Water","Horizon Travel","Indigo Fashion","Juniper Pharma","Keystone Construction","Lantern Publishing","Meridian Dental","Nimbus Cloud","Obsidian Gaming","Prism Optics","Quill Legal","Ridge Outdoor","Sierra Solar","Terra Realty"]
const CO_A = ["Alder","Bramble","Cedar","Dovetail","Elmwood","Fernway","Gatehouse","Hollow","Inlet","Jetty","Kiln","Larkspur","Millrace","Nettle","Oakline","Pebble","Quarry","Rookery","Saltmarsh","Thistle","Upland","Vellum","Wayfare","Yardarm","Zephyr","Anvil","Brindle","Chalkhill","Drift","Everdeen"]
const CO_B = ["Systems","Partners","Group","Labs","Works","Holdings","Industries","Networks","Collective","Union","Foundry","Supply","Dynamics","Interactive","Logistics","Ventures","Clinics","Press"]
const TITLES: { title: string; seniority: Seniority; department: string }[] = [
  { title: "VP Sales", seniority: "VP", department: "Sales" },
  { title: "Head of Growth", seniority: "Director", department: "Marketing" },
  { title: "Revenue Operations Manager", seniority: "Manager", department: "Revenue operations" },
  { title: "Sales Director", seniority: "Director", department: "Sales" },
  { title: "CMO", seniority: "C-level", department: "Marketing" },
  { title: "VP Marketing", seniority: "VP", department: "Marketing" },
  { title: "Founder", seniority: "C-level", department: "Executive" },
  { title: "CEO", seniority: "C-level", department: "Executive" },
  { title: "Head of Demand Generation", seniority: "Director", department: "Marketing" },
  { title: "Sales Enablement Lead", seniority: "Manager", department: "Sales" },
  { title: "Account Executive", seniority: "Individual", department: "Sales" },
  { title: "SDR Manager", seniority: "Manager", department: "Sales" },
  { title: "Chief Revenue Officer", seniority: "C-level", department: "Executive" },
  { title: "Director of Partnerships", seniority: "Director", department: "Sales" },
  { title: "Head of Customer Success", seniority: "Director", department: "Customer success" },
  { title: "IT Security Manager", seniority: "Manager", department: "Technology" },
  { title: "Procurement Lead", seniority: "Manager", department: "Finance" },
  { title: "CFO", seniority: "C-level", department: "Finance" },
]
const INDUSTRIES = ["Software","Logistics","Healthcare","Fintech","Energy","Manufacturing","Media","Retail","Insurance","Legal"]
const PLACES = [
  { city: "Berlin", country: "Germany", tz: "Europe/Berlin", eu: true, dial: "+49 30", languages: ["German", "English"] },
  { city: "Munich", country: "Germany", tz: "Europe/Berlin", eu: true, dial: "+49 89", languages: ["German", "English"] },
  { city: "Paris", country: "France", tz: "Europe/Paris", eu: true, dial: "+33 1", languages: ["French", "English"] },
  { city: "Amsterdam", country: "Netherlands", tz: "Europe/Amsterdam", eu: true, dial: "+31 20", languages: ["Dutch", "English"] },
  { city: "Madrid", country: "Spain", tz: "Europe/Madrid", eu: true, dial: "+34 91", languages: ["Spanish", "English"] },
  { city: "Stockholm", country: "Sweden", tz: "Europe/Stockholm", eu: true, dial: "+46 8", languages: ["Swedish", "English"] },
  { city: "London", country: "United Kingdom", tz: "Europe/London", eu: false, dial: "+44 20", languages: ["English"] },
  { city: "Manchester", country: "United Kingdom", tz: "Europe/London", eu: false, dial: "+44 161", languages: ["English"] },
  { city: "New York", country: "United States", tz: "America/New_York", eu: false, dial: "+1 212", languages: ["English"] },
  { city: "Austin", country: "United States", tz: "America/Chicago", eu: false, dial: "+1 512", languages: ["English", "Spanish"] },
  { city: "San Francisco", country: "United States", tz: "America/Los_Angeles", eu: false, dial: "+1 415", languages: ["English"] },
  { city: "Toronto", country: "Canada", tz: "America/Toronto", eu: false, dial: "+1 416", languages: ["English", "French"] },
]
const TECHS = ["Salesforce","HubSpot","Snowflake","Segment","Marketo","Zendesk","Okta","Stripe","Looker","Workday"]
const KEYWORDS = ["pipeline","automation","compliance","logistics","onboarding","analytics","payments","scheduling"]

/* ------------------------------------------------------------- vocabularies the product reads */

const STAGES = ["Cold","Approaching","Replied","Interested","Meeting booked","Not interested","Unresponsive"] as const
const EMAIL_STATUS = ["Verified","Verified","Verified","Guessed","Unverified","Bounced"] as const
const DEAL_STAGES = ["Qualified","Discovery","Proposal","Negotiation","Closed won"] as const
/** The five account stages, owned by Settings (`pipe.contact-stages`) and read everywhere else. */
export const ACCOUNT_STAGES = ["Cold","Active opportunity","Current client","Churned","Do not prospect"] as const
export const FORECAST_CATEGORIES = ["Omitted","Pipeline","Best case","Commit","Closed"] as const
export const SURFACES = ["app","automation","api","mcp","cli","agent"] as const
export const QUAL_ELEMENTS = ["Metrics","Economic buyer","Decision criteria","Decision process","Paper process","Identified pain","Champion","Competition"] as const
export const DISPOSITIONS = ["Connected","Connected, not interested","Left voicemail","No answer","Busy","Gatekeeper","Wrong number","Bad number","Callback booked"] as const
export const CALL_PURPOSES = ["Cold call","Follow-up","Qualification","Discovery","Check-in","Renewal"] as const
export { STAGES, EMAIL_STATUS, DEAL_STAGES }

export const STAGE_PROBABILITY: Record<DealStage, number> = { Qualified: 10, Discovery: 25, Proposal: 50, Negotiation: 75, "Closed won": 100 }
export const STAGE_FORECAST: Record<DealStage, ForecastCategory> = { Qualified: "Pipeline", Discovery: "Pipeline", Proposal: "Best case", Negotiation: "Commit", "Closed won": "Closed" }

/** The product's single bounce-guard pair (PLAN.md, 14 Sep 2026). Settings owns it; every page reads it. */
export const BOUNCE_GUARD = { warnPercent: 4, pausePercent: 6 }
/** The second, admin approval threshold (PLAN.md). A business may lower it; Fathom does. */
export const SECOND_APPROVAL = { recipients: 1_000, credits: 500 }
function secondApprovalOf(business: Business): { recipients: number; credits: number } {
  return business === "fathom" ? { recipients: 400, credits: 200 } : SECOND_APPROVAL
}
/** The three agents, in the order the page reads them. */
const AGENT_ORDER = ["Research agent", "Outreach agent", "Scoring agent"] as const
/** What a metered action costs. Defined once and read by every page that spends credits. */
export const CREDITS = { enrich: 2, revealEmail: 1, revealPhone: 8, research: 12, draft: 4, score: 1, export: 0 }
/** The six deal warnings and their default thresholds. Admin-set in Settings › Pipeline and data. */
export const DEAL_WARNING_DEFAULTS = { noActivityDays: 14, ghostedDays: 21, minContacts: 3, stalledDays: 30 }
/** Published API limits, the same on every plan. */
export const API_LIMITS = { perMinute: 200, perHour: 6_000, perDay: 50_000 }
export const ENDPOINT_COSTS: EndpointCost[] = [
  { endpoint: "GET /v1/people/search", typical: "0", maximum: "0" },
  { endpoint: "GET /v1/people/{id}", typical: "0", maximum: "0" },
  { endpoint: "PATCH /v1/people/{id}", typical: "0", maximum: "0" },
  { endpoint: "POST /v1/people/enrich", typical: "1–9", maximum: "+8 if a mobile is returned" },
  { endpoint: "POST /v1/enrich/email", typical: "1–4", maximum: "20+" },
  { endpoint: "POST /v1/enrich/phone", typical: "8–25", maximum: "45+" },
]
export const CLI_EXIT_CODES = [
  { code: 0, meaning: "Done" }, { code: 2, meaning: "Bad arguments" }, { code: 3, meaning: "Not authorised" },
  { code: 4, meaning: "Outside your seat" }, { code: 5, meaning: "Credit cap reached" },
  { code: 6, meaning: "Rate limited, retry after the header says when" }, { code: 7, meaning: "Interrupted, resume with the token printed" },
]

/* --------------------------------------------------------------------------------------- types */

export type ContactStage = (typeof STAGES)[number]
export type EmailStatus = (typeof EMAIL_STATUS)[number]
export type DealStage = (typeof DEAL_STAGES)[number]
export type AccountStage = (typeof ACCOUNT_STAGES)[number]
export type ForecastCategory = (typeof FORECAST_CATEGORIES)[number]
export type Surface = (typeof SURFACES)[number]
export type QualElementName = (typeof QUAL_ELEMENTS)[number]
export type Disposition = (typeof DISPOSITIONS)[number]
export type Seniority = "C-level" | "VP" | "Director" | "Manager" | "Individual"
export type WriteState = "suggested" | "edited" | "validated"

/** Something that happened at this person's company, the day it happened, and what it says. */
export interface ContactSignal { kind: string; on: string; detail: string }

/** A human you can reach. JOURNEYS §1 row 1. */
export interface Contact {
  id: string; name: string; title: string; seniority: Seniority; department: string
  company: string; companyId: string; email: string; emailStatus: EmailStatus
  phone: boolean; phoneNumber: string | null; phoneRevealed: boolean
  doNotCall: boolean; doNotCallSource: string | null; dncCheckedOn: string | null; doNotContact: boolean
  stage: ContactStage; lastActivity: string; lastContacted: string | null; owner: string
  inSequence: string | null; lists: string[]
  source: "Found" | "Imported" | "CRM" | "Form" | "Agent"; addedOn: string; enrichedOn: string | null
  location: { city: string; country: string }; tz: string; linkedin: string
  /** The day they started in this job, which is what "time in role" is measured from. */
  roleStartedOn: string
  /** The languages they work in, most confident first. */
  languages: string[]
  persona: string; score: number; scorePrevious: number; scoredAt: string; scoreReasons: string[]
  signals: ContactSignal[]; opens: number; replies: number
  crmId: string | null; crmSyncedAt: string | null; custom: Record<string, string>
  /** What the last enrichment actually filled in on this person. Empty where nothing was enriched. */
  lastEnrichedFields: string[]
  restrictedBy: string | null
  jobChange: { firedOn: string; source: string; previousCompany: string; previousEmail: string; newCompanyId: string } | null
}

/** An organisation, prospect or customer. Carries its customer state; `accounts` carries the rest. */
export interface Company {
  id: string; name: string; industry: string; employees: number; domain: string; contacts: number
  /** The switchboard number, as the enrichment provider returns it. */
  phone: string
  stage: AccountStage; owner: string; lastActivity: string
  location: { city: string; country: string }; founded: number; description: string; revenue: string
  signals: string[]; source: "Found" | "Imported" | "CRM"; addedOn: string; enrichedOn: string | null
  parent: string | null; lists: string[]; notes: { by: string; on: string; text: string }[]
  crm: { synced: boolean; lastError: string | null } | null; custom: Record<string, string>
  technologies: string[]; funding: string | null; headcountGrowth: number; keywords: string[]
  fitScore: number | null
  /** Customer state, present on current clients and churned accounts; the full record is in `accounts`. */
  health: number | null; healthDelta7d: number; renewalDate: string | null; arr: number | null; expansionSignal: string | null
}

export interface AccountRisk { id: string; type: string; opened: string; owner: string; note: string; resolved: string | null }
export interface AccountSignal { id: string; kind: string; fired: string; source: string; detail: string; dismissed: boolean; routedTo: string; dueBy: string; outcome: "acted" | "no conversation" | "not real" | null }
export interface Handoff {
  from: string; signer: string; sent: string; accepted: string | null
  whyTheyBought: string; promised: string[]; users: string; risks: string[]; dissenters: string[]
  deadline: string; deadlineWhy: string; checklist: { item: string; done: boolean }[]
  writtenBy: { section: string; by: string }[]
}
export interface Play { id: string; name: string; why: string; dueBy: string; owner: string; state: "suggested" | "running" | "done" | "dropped" }
/** One week of an account's use of the product: who signed in and how much they did. */
export interface AccountWeek { week: string; activeSeats: number; events: number }
/** A person holding a seat at the account, and when they were last in the product. */
export interface AccountSeat { name: string; lastSignIn: string }
/** The customer state of a company: health and its drivers, renewal, seats and usage, risks, plays. */
export interface Account {
  id: string; companyId: string; name: string; domain: string; stage: AccountStage; owner: string; ae: string
  plan: string; seatsBought: number; seatsActive: number; usage30: number; usageDelta30: number
  /** Thirteen weeks of use, oldest first: the last week is the one that ends today. */
  usage90: AccountWeek[]
  /** Everyone holding a seat, and when each was last in the product. */
  seats: AccountSeat[]
  health: number; band: "Healthy" | "Watch" | "At risk"; healthDelta30: number; drivers: { label: string; points: number }[]
  renewal: string; value: number; billing: "monthly" | "annual"; noticeDays: number; autoRenew: boolean
  forecast: "Commit" | "Likely" | "At risk" | "Lost"
  champion: string; lastTouch: string; nextStep: { text: string; due: string }
  risks: AccountRisk[]; signals: AccountSignal[]; handoff: Handoff | null; plays: Play[]
  firstValue: { definition: string; target: string; confirmedOn: string | null; confirmedBy: string | null }
  goals: { text: string; agreedOn: string; source: string }[]
  crmSync: "synced" | "error" | "Not connected"
}

export interface ListFeed { target: "sequence" | "campaign"; name: string; auto: boolean }
export interface ListFilter { field: string; op: string; value: string }
/** A named set, static or filter-backed. The marketer's segment is the same object in `segment` mode. */
export interface List {
  id: string; name: string; kind: "people" | "companies"; mode: "static" | "segment"
  memberIds: string[]; newThisWeek: number; feeds: ListFeed[]; filters: ListFilter[]
  suppressions: string[]; owner: string; visibility: "everyone" | "me"
  source: "search" | "csv" | "agent" | "manual"; createdAt: string; updated: string
  lastRefreshed: string | null; alert: "off" | "daily" | "weekly"
  history: { when: string; who: string; what: string }[]; archived: boolean
}

export interface SequenceStepVariant { label: string; subject: string; body: string; sent: number; replied: number }
export interface SequenceStep {
  id: string; sequenceId: string; order: number; kind: "Email" | "Call task" | "LinkedIn task" | "Wait"
  on: number; subject: string; body: string; templateId: string | null; variants: SequenceStepVariant[]
  linkedinKind: "Connect" | "Message" | "View profile" | null; waitDays: number; businessDaysOnly: boolean
  stats: { sent: number; delivered: number; opened: number; replied: number; bounced: number; unsubscribed: number; created: number; done: number; skipped: number; overdue: number; waitingNow: number }
}
export interface Enrollment {
  id: string; sequenceId: string; contactId: string
  status: "Active" | "Paused" | "Finished" | "Replied" | "Bounced" | "Not sent"
  stepOrder: number; nextAt: string | null; addedAt: string; addedBy: string; mailbox: string
  notSentReason: "No email" | "Unverified email" | "Do not contact" | "Already in another sequence" | "Mailbox limit reached" | null
}
/** One week of a sequence's sending. The twelve weeks add up to the sequence's own totals. */
export interface SequenceWeek { week: string; sent: number; delivered: number; opened: number; replied: number; bounced: number }
/** A cadence with a schedule and rules. */
export interface Sequence {
  id: string; name: string; steps: number; active: number; replied: number; bounced: number
  /** Twelve weeks, oldest first, summing to `sent`, `delivered`, `opened`, `replied` and `bounced`. */
  series: SequenceWeek[]
  owner: string; status: "Active" | "Paused" | "Draft"
  paused: number; finished: number; notSent: number; sent: number; delivered: number; opened: number
  interested: number; meetings: number; bounceRate7d: number
  guardState: "ok" | "warning" | "auto-paused"; pausedBy: string | null
  mailbox: string; mailboxRotation: string[]; dailyCap: number; schedule: string; ruleset: string
  priority: "Normal" | "High" | "Low"; tracking: { opens: boolean; clicks: boolean }; sharedWith: string
  createdAt: string; updatedAt: string; archivedAt: string | null
}
export interface Schedule { id: string; name: string; timezone: string; days: string[]; hours: string; isDefault: boolean }
export interface Ruleset { id: string; name: string; stopOnReply: boolean; stopOnAccountReply: boolean; excludeStages: string[]; maxEmailsPerPersonPerDay: number; isDefault: boolean }
export interface SequenceChange { id: string; sequenceId: string; when: string; who: string; what: string }

export interface Template { id: string; name: string; folder: string; owner: string; subject: string; body: string; variables: string[]; snippets: string[]; usedBy: string[]; linked: boolean; createdAt: string; updatedAt: string }
export interface Snippet { id: string; name: string; folder: string; owner: string; body: string; variables: string[]; usedBy: string[] }

export interface ThreadMessage { from: "us" | "them"; sent: string; subject: string; body: string }
/** One reply and the thread behind it. The Inbox row and the thread are one object. */
export interface Reply {
  id: string; contactId: string; contact: string; company: string; sequence: string
  step: { n: number; of: number }; mailbox: string
  outcome: "Interested" | "Not now" | "Question" | "Out of office" | "Unsubscribe"
  received: string; snippet: string; body: string; messages: ThreadMessage[]
  status: "open" | "handled"; handled: boolean; handedTo: string | null
  /** Who put the outcome on it: the reply agent, a person by name, or nobody yet. */
  classifiedBy: "reply agent" | string | null
  followUpOn: string | null; returnsOn: string | null; dealId: string | null
  draft: { subject: string; body: string; by: string; state: "suggested" | "edited" | "sent" } | null
}

/** Due work with an owner. A call task is the instruction; the `Call` is what happened. */
export interface Task {
  id: string; kind: "Call" | "LinkedIn" | "Email" | "Follow-up" | "Meeting"
  contact: string; contactId: string; company: string; due: string; sequence: string | null
  title: string; step: { n: number; of: number; title: string } | null
  createdBy: "sequence" | "manual" | "agent"; creator: string; owner: string
  status: "Open" | "Snoozed" | "Done" | "Skipped"; snoozedUntil: string | null; doneAt: string | null
  outcome: "Connected" | "Voicemail" | "No answer" | "Wrong number" | null
  priority: "Normal" | "High"; dealId: string | null
  message: string | null; messageEdited: boolean; linkedinKind: "Connect" | "Message" | null
  history: { step: number; kind: string; when: string; result: string }[]
  notes: { who: string; when: string; text: string }[]
}
export interface CoachingNote { id: string; callId: string; author: string; at: string; wentWell: string; toChange: string; oneBehaviour: string; state: "suggested" | "edited" | "accepted" }
/** One dial and its outcome. A connected disposition stops the contact advancing. */
export interface Call {
  id: string; taskId: string | null; contactId: string; contact: string; company: string; dealId: string | null
  purpose: string; disposition: Disposition; connected: boolean; startedAt: string; durationSec: number
  notes: string; loggedBy: string; sentiment: "positive" | "neutral" | "negative"; advancedSequence: boolean
  /** What the recorder returned, where a workspace has one connected. Null everywhere else. */
  transcript: string | null
  coachingNote: CoachingNote | null
}
/** A scheduled conversation and what became of it. */
export interface Meeting {
  id: string; taskId: string | null; contactId: string; contact: string; company: string; dealId: string | null
  host: string; attendees: string[]; at: string; durationMin: number
  state: "booked" | "held" | "no-show" | "cancelled"
  prepBriefId: string | null; followUpDraft: string | null; summary: string | null; actionItems: string[]
  bookedFrom: "reply" | "call" | "form" | "manual"
}

export interface QualElement { value: string; state: WriteState; source: string; updatedBy: string; at: string }
export interface QualEvidence { id: string; dealId: string; element: QualElementName; quote: string; sourceKind: "call" | "email" | "meeting" | "note"; sourceId: string; at: string }
export interface DealContact { dealId: string; contactId: string; name: string; title: string; role: "Champion" | "Economic buyer" | "Technical" | "User" | "Blocker" | "Other"; engaged: boolean }
export interface DealActivity { id: string; dealId: string; kind: "email" | "call" | "meeting" | "note" | "stage" | "field" | "task" | "agent" | "file"; at: string; by: string; summary: string; detail?: string; meta?: Record<string, string | number | boolean> }
export interface DealFile { id: string; dealId: string; name: string; size: number; uploadedBy: string; at: string }
/** An opportunity. Renewals and expansions are deals, typed (JOURNEYS §1, modelling call 2). */
export interface Deal {
  id: string; name: string; company: string; companyId: string; amount: number; currency: string
  stage: DealStage; probability: number; closeDate: string; owner: string; lastActivity: string
  nextStep: string | null; nextStepDue: string | null
  dealType: "New" | "Renewal" | "Expansion"; pipeline: string; forecast: ForecastCategory
  createdAt: string; stageEnteredAt: string; archivedAt: string | null; lostReason: string | null
  syncState: "synced" | "error" | null; crmId: string | null; crmSyncedAt: string | null; crmError: string | null
  agentProposal: string | null; lastProspectActivityAt: string | null
  contactCount: number; seniorSponsor: boolean
  source: string; campaign: string | null; competitor: string | null; contractTerm: string
  paymentTerms: string; discount: number; proposalLink: string | null; esign: "not sent" | "sent" | "signed"
  splitOwners: string[]; tags: string[]; priority: "Normal" | "High"
  lineItems: { name: string; qty: number; unit: number }[]
  custom: Record<string, string | number | boolean>
  qualification: Record<QualElementName, QualElement>
  scoreAtFirstContact: { score: number; modelVersion: string; stampedOn: string }
}
export interface DealWarning { kind: string; observed: string; threshold: string; text: string }

export interface Audience {
  id: string; name: string; type: "Static" | "Segment"; size: number
  /** People gained or lost since yesterday's rebuild. Zero on a frozen audience. */
  sizeDelta: number
  lastRebuilt: string; sources: string[]
  mode: "live" | "frozen"; refreshAt: string | null; frozenAt: string | null; feeds: string[]
  rules: ListFilter[]
  suppressed: { unsubscribed: number; bounced: number; customers: number; openDeals: number; closedLost: number; inSequence: number }
  suppressionsOn: { customers: boolean; openDeals: boolean; closedLost: boolean; inSequence: boolean }
  usedBy: string[]
}
/** The eight checks a campaign passes before it goes out, in the order the panel prints them. */
export const CAMPAIGN_CHECKS = [
  "Every merge field resolves for every recipient",
  "Every link works and is tracked",
  "The unsubscribe link is present and points at the workspace footer",
  "The plain-text version exists",
  "The from mailbox is warmed and under its daily cap",
  "The subject renders under 60 characters on a phone",
  "The audience's suppressions are applied and its mode is what the sender expects",
  "No recipient has had another campaign in the frequency-cap window",
] as const
export interface CampaignCheck { name: string; state: "pass" | "fail" | "not run" }

export interface Campaign {
  id: string; name: string; kind: "Email" | "Lifecycle"
  status: "Draft" | "Scheduled" | "Sending" | "Sent" | "Running" | "Paused" | "Archived"; pausedBy: string | null
  subject: string; previewText: string; fromName: string; fromMailbox: string
  audienceId: string; audienceSize: number; sendAt: string | null
  trigger: string | null; delayDays: number | null; exitRule: string | null
  sent: number; delivered: number; bounced: number; opened: number; clicked: number; replied: number
  converted: number; unsubscribed: number; complaints: number
  goal: string; owner: string
  qa: {
    by: string | null; on: string | null; checklist: { item: string; done: boolean }[]
    /** The eight pre-send checks by name, each pass, fail or not run. */
    checks: CampaignCheck[]
  }
  /** Every link in the body and how many people clicked it. */
  links: { url: string; clicks: number }[]
  /** How long after a click a deal still counts as this campaign's. */
  attributionDays: number
  sendsByDay: { day: string; sent: number }[]
  variants: { label: string; subject: string; sent: number; opened: number; replied: number }[]
  activity: { at: string; by: string; what: string }[]
  dealsCreated: number; pipelineAmount: number; pipelineInfluenced: number
}
export interface Form {
  id: string; name: string; status: "Live" | "Draft" | "Off"
  fields: { label: string; kind: "asked" | "enriched"; credits: number }[]
  enrichOnSubmit: boolean; enrichCapDaily: number; enrichUsedToday: number; matched: number
  submissions7d: number; routesTo: string; reportsTo: string; lastSubmission: string; unrouted: number
  submissions: { id: string; at: string; contactId: string; name: string; email: string; enriched: boolean; routedTo: string | null }[]
}

export interface Persona { id: string; name: string; title: string; seniority: Seniority; department: string; industry: string; size: string; geography: string; sizeCount: number; retired: boolean }
export interface SignalDef { id: string; name: string; definition: string; source: "Product" | "Website" | "Research agent" | "CRM" | "News"; freshnessDays: number; tips: string; matches: number; retired: boolean }
export interface ScoreModel {
  id: string; name: string; kind: "fit" | "engagement" | "risk"; primary: boolean
  inputs: { name: string; weight: number }[]; decayDays: number
  published: string; publishedBy: string; version: string
  threshold: number; shareAbove: number; distribution: { band: string; count: number }[]; retired: boolean
}

export interface EnrichmentJob {
  id: string; source: "import" | "reveal" | "api" | "job-change" | "form"; sourceLabel: string
  startedBy: string; startedAt: string; keyId: string | null; fields: string[]; providers: string[]
  rows: number; matched: number; credits: number; byField: { field: string; hit: number; cost: number }[]
  unmatchedIds: string[]; charging: { chargedRows: number; freeRows: number; note: string }
  status: "done" | "running" | "paused" | "failed"
}
export interface ImportDraft { id: string; file: string; rows: number; uploadedBy: string; uploadedAt: string; step: number; answers: Record<string, string>; mapping: Record<string, string | null>; preview: Record<string, string>[]; progress: { done: number; total: number; credits: number; stoppedAt: string | null } }
export interface ImportMapping { id: string; name: string; workspace: string; mapping: Record<string, string | null>; lastUsedOn: string }

export interface CreditState {
  balance: number; monthlyCap: number; burnPerWeek: number; cycleEnds: string; runsOutOn: string
  perRunCap: number; perUserLimit: number | null
  bySurface: Record<Surface, number>; byFeature: { feature: string; credits: number }[]
  byUser: { user: string; used: number; limit: number | null }[]
  teamBudgets: { team: string; credits: number; used: number }[]
  spikeAlert: { multiple: number; todayMultiple: number }
}

export interface Agent {
  id: "research" | "outreach" | "scoring"; name: string; on: boolean; owner: string; model: string
  can: string[]; needsApprovalFor: string[]
  capPerRun: number; capPerDay: number; capPerMonth: number; spentToday: number; spentThisWeek: number
  pausedReason: string | null
}
/** One unit of agent work, its cost and its consequence. */
export interface AgentEvent {
  id: string; agent: "Research agent" | "Outreach agent" | "Scoring agent"; when: string; at: string
  summary: string; detail: string; needsApproval: boolean
  kind: "researched" | "drafted" | "scored" | "proposed" | "sent" | "paused" | "capped" | "skipped"
  credits: number; surface: Surface; actorUser: string; ownerId: string
  trigger: string; contactId: string | null; contact: string | null; company: string | null
  companyId: string | null; dealId: string | null; sequence: string | null
  status: "waiting" | "waiting-second" | "approved" | "declined" | "done" | "paused" | "snoozed"
  decidedBy: string | null; decidedAt: string | null; decidedAsAdmin: boolean
  needsSecondApproval: boolean; approvalTier: "logged" | "owner" | "admin"
  batchKey: string; to: string | null; draft: string | null
  sources: string[]; inputs: { label: string; href: string }[]
  decision: "approved" | "declined" | null
  ifApproved: { action: "send" | "enrol" | "stage" | "spend"; mailbox?: string; sequence?: string; stage?: string; sendsAt?: string; recipients?: number; credits: number } | null
  steps: { at: string; text: string; credits: number; source?: string }[]
  undoable: boolean; undoneAt: string | null; undoneBy: string | null
  skipReason: "suppressed" | "unsubscribed" | "region restricted" | "do not call" | null
  expiresOn: string | null
  /** The buyer's words behind a proposed stage change. A proposal without one is not checkable. */
  sourceQuote: string | null
}

export interface Workflow {
  id: string; name: string; owner: string; status: "on" | "off"; statusChangedBy: string; statusChangedOn: string
  createdOn: string; editedBy: string; editedOn: string; folder: string | null
  trigger: string; enrolment: ListFilter[]
  rules: { id: string; condition: string; action: string; config: string }[]
  routing: { kind: "round-robin" | "weighted" | "territory"; pool: string[]; weights: number[] | null; skipAway: boolean } | null
  sla: { windows: { hot: string; warm: string }; reassignTo: string; notifyFirst: boolean; running: number; breachedToday: number } | null
  ceiling: { perDay: number; perRun: number; spentToday: number }
  limits: { perDay: number; reEnrol: boolean; maxPerPerson: number }
  hours: { from: string; to: string; days: string[]; clockPauses: boolean }
  suppress: string[]
}
export interface WorkflowRun { id: string; workflowId: string; at: string; personId: string; person: string; outcome: "enrolled" | "not-routed" | "errored"; ruleId: string | null; reason: string | null; createdTaskId: string | null; assignedTo: string | null; credits: number }
export interface WorkflowEdit { id: string; workflowId: string; at: string; by: string; what: string }

export interface Mailbox {
  id: string; address: string; owner: string; provider: string; signature: string
  dailyLimit: number; hourlyLimit: number; sentToday: number
  warmup: { on: boolean; day: number; of: number }; deliverability: number; bounceRate7d: number
  paused: boolean; pausedReason: string | null; sequences: string[]
}
export interface MailDomain { id: string; domain: string; spf: boolean; dkim: boolean; dmarc: boolean; bounceRate7d: number; mailboxes: number; trackingSubdomain: string }

export interface User { id: string; name: string; title: string; role: Role; profile: string; team: string; territory: string | null; status: "active" | "invited" | "deactivated"; availability: "available" | { awayUntil: string }; creditLimit: number | null; creditsUsed: number; lastActive: string; mailbox: string | null; reports: string[]; grants: string[]; seat: boolean }
export interface Team { id: string; name: string; lead: string; members: number }
export interface Territory { id: string; name: string; rule: string; owner: string; accounts: number }
export interface PermissionProfile { id: string; name: string; users: number; canSee: string[]; cannotSee: string[]; editsOwnOnly: boolean }

export interface FieldDef { id: string; object: "person" | "company" | "deal"; label: string; kind: "text" | "number" | "date" | "picklist" | "checkbox" | "multi-line"; values: string[]; requiredAtStage: string | null; crmField: string | null; group: string; retired: boolean }
export interface Pipeline { id: string; name: string; stages: { name: DealStage; probability: number; forecast: ForecastCategory; requiredFields: string[] }[]; isDefault: boolean }

export interface CrmField { object: string; name: string; kind: string; required: boolean; values: string[] }
export interface Integration {
  id: string; kind: string; name: string; environment: string | null
  status: "syncing" | "paused" | "setting up" | "needs attention" | "not connected"
  auth: { user: string; validUntil: string } | null
  objects: { object: string; direction: "both" | "pull" | "push" | "off" }[]
  mappings: { ollopa: string; remote: string; direction: "both" | "pull" | "push"; writeRule: string }[]
  stageMap: { ollopa: string; remote: string }[]
  rules: { pullWhen: string; pushWhen: string; pushUnverified: boolean; sourceValue: string; onDelete: string; onMerge: string; matchKey: string }
  remoteCounts: Record<string, number>
  lastSync: string; nextSync: string; recordsToday: number; errorsToday: number; pausedBy: string | null
  pollMinutes: number; errorDigest: "immediately" | "daily" | "weekly"
  calendars: string[]; channels: { event: string; channel: string }[]
  enrichment: { key: string; fields: string[]; order: string[] } | null
  webhook: { url: string; secretSetOn: string; events: string[]; lastTest: string } | null
  creditsThisCycle: number
}
export interface IntegrationError { id: string; integrationId: string; at: string; object: string; record: string; direction: "pull" | "push"; message: string; fix: string; attempts: number; groupKey: string }
export interface SyncRun { id: string; integrationId: string; started: string; object: string; direction: "pull" | "push"; pulled: number; pushed: number; failed: number }
export interface SetupDraft { id: string; kind: string; step: number; of: number; answers: Record<string, string>; savedOn: string; startedBy: string }

export interface ApiKey { id: string; name: string; createdOn: string; createdBy: string; lastUsedAt: string | null; scopes: string[]; expiresOn: string | null; revokedOn: string | null; creditsThisCycle: number; alertAt: number; alertOwner: string; jobs: string[] }
export interface EndpointCost { endpoint: string; typical: string; maximum: string }
export interface Webhook { id: string; url: string; events: string[]; secretSetOn: string; state: "delivering" | "failing" | "paused"; failingSince: string | null; lastDeliveryAt: string }
export interface WebhookDelivery { id: string; webhookId: string; at: string; event: string; recordId: string; attemptNumber: number; status: "delivered" | "failed"; cause: string | null }
export interface McpToken { id: string; userId: string; user: string; tier: "read" | "write_safe" | "write_destructive"; actions: Record<string, "allow" | "approve" | "block">; client: string; authorisedOn: string; lastUsedAt: string | null; requestedTier: "read" | "write_safe" | "write_destructive" | null }
export interface CliDevice { id: string; userId: string; user: string; label: string; workspace: string; authorisedOn: string; lastUsedAt: string | null }

/** A change somebody asked the admin for: the admin's inbox is the product's real queue. */
export interface Request {
  id: string; kind: "change" | "upgrade"; outcome: string
  reason: "new information" | "an approved decision" | "a defect in the current result"; reasonText: string
  requester: { user: string; seat: string; at: string }
  origin: "locked control" | "no-access page" | "report" | "permission" | "field or stage" | "routing"; originLabel: string
  evidence: { kind: "record" | "view" | "report"; id: string; label: string }[]
  decisionOwner: string; state: "captured" | "investigating" | "approved" | "shipped" | "verified" | "declined"
  raisedOn: string; approvals: { investigate?: { by: string; on: string }; implement?: { by: string; on: string } }
  declined: { by: string; on: string; reason: string } | null
  estimate: string | null; baseline: string
  touches: { kind: "field" | "stage" | "workflow" | "profile" | "report" | "plan feature"; id: string; name: string }[]
  affected: { count: number; how: string }
  scope: { kind: "team" | "territory" | "everyone"; name?: string }; scopeHistory: { at: string; to: string }[]
  rollback: string; shippedOn: string | null; shippedBy: string | null
  announcement: { text: string; writtenOn: string; expiresOn: string } | null
  verify: { used: number; of: number; since: string } | null
  notes: { by: string; at: string; text: string }[]
  test: { what: string; on: string; by: string; result: string } | null
  history: { at: string; by: string; what: string }[]
  relatedTo: string | null
  upgrade: { feature: string; plan: string; monthlyTotal: number; newTotalForPeriod: number; alternative: string; alsoAskedBy: string[] } | null
}

/** Written context, human or generated. A comment is a note addressed to one teammate. */
export interface Note {
  id: string; kind: "note" | "comment" | "brief"; briefKind: "account" | "meeting" | "handoff" | "call" | null
  body: string; author: string; generatedBy: string | null; at: string
  to: string | null; mentions: string[]; answered: boolean
  about: { kind: "person" | "company" | "deal" | "meeting" | "call"; id: string; label: string }
  visibility: "everyone" | "private"
}

export interface Invoice { id: string; number: string; period: string; amount: number; currency: string; status: "paid" | "due"; issuedOn: string; paidOn: string | null }
export interface Workspace {
  name: string; logoInitials: string; timezone: string; currency: string; language: string
  profile: "Founder-led outbound" | "Separated sales team" | "Agency" | "Product-led growth"
  firstJob: string; people: string; seats: Role[]; declaredBy: string; declaredAt: string
  leftOut: { page: string; why: string; signals: number; signalKind: string }[]
  exposure: { page: string; started: string; ends: string; state: "showing" | "kept" | "dropped" } | null
  plan: { name: string; seats: number; pricePerSeat: number; monthlyTotal: number; billing: "monthly" | "annual"; renews: string }
  taxId: string | null; crm: string | null; setupRemaining: string[]
  modelTraining: "off"; answerTarget: { businessDays: number }; retention: { declinedDays: number }
  waterfall: { stopAtFirstVerified: boolean; ceilingPerRow: number; order: string[] }
}

export interface Notification { id: string; kind: "reply" | "meeting" | "approval" | "bounce-guard" | "sync-error" | "credits-low"; when: string; title: string; detail: string; target: string; unread: boolean; groupKey: string; interrupting: boolean }
export interface WorkspaceHealth { bounceRate: number; bounceVolume: number; bounceGuard: "ok" | "warning" | "paused"; syncErrors: number; mailboxesNearLimit: number; invitesPending: number; setupRemaining: string[] }
export interface UserActivity { user: string; sentThisWeek: number; callsThisWeek: number; meetingsBooked: number; tasksDone: number }
export interface ActivityEvent { id: string; kind: "email" | "call" | "meeting" | "task"; user: string; contactId: string; company: string; date: string }
/**
 * A named set of filters, columns and sort (spec 02 §3).
 *
 * On a person view, `filters[].field` is the filter's own id on the People page and `value` is one
 * chosen value; a filter with two values has two rows here. `columns` are the columns the view adds
 * to the seat's default set, in order.
 */
export interface SavedView {
  id: string; name: string; object: "person" | "company" | "deal"; filters: ListFilter[]; columns: string[]
  sort: string; owner: string; sharedWith: "everyone" | "me"; defaultFor: Role[]
  /** Email me when it gains people. */
  alert: "off" | "daily" | "weekly"
  /** True for the one view that ships with the product instead of being built in a workspace. */
  shipped: boolean
}
/** A reply somebody writes over and over, kept so they do not write it again. */
export interface SavedReply { id: string; name: string; body: string }
export interface Goal { id: string; period: string; user: string | null; team: string | null; amount: number }
export interface ForecastSubmission { id: string; period: string; user: string; amount: number; split: Record<string, number>; note: string; submittedAt: string; actual: number | null }
export interface ForecastPrediction { period: string; user: string; amount: number; drivers: string[] }
export interface StageHistory { dealId: string; stage: DealStage; enteredOn: string }
export interface SyncErrorRow { id: string; integration: string; at: string; count: number; message: string }

/* ------------------------------------------- the workspace settings the admin sets and pages read */

export interface DncLogRow { at: string; by: string; what: string; count: number }
/** A forecast category and the sentence printed under it, on Reports and in Settings alike. */
export interface ForecastDefinition { name: ForecastCategory; definition: string }

/**
 * The settings a workspace holds that no other collection carries (spec 14 §2.2). Users, mailboxes,
 * pipelines, fields, agents, keys and the plan are objects of their own and are not repeated here.
 */
export interface WorkspaceSettings {
  security: { mfaEnforced: boolean; sso: string | null; ipRanges: string[]; passwordPolicy: string; sessionTimeout: string }
  sending: { catchAll: boolean; unsubscribeText: string; usersMayDisable: boolean; opens: boolean; clicks: boolean }
  prospecting: {
    gdprRegions: string
    dncCountries: string[]
    primaryEmail: string
    duplicates: string
    duplicateRate: number
    inProgressLimit: number
    /** A 31-day obligation rather than a switch: the date, the next due date and the kept review log. */
    dnc: { synchronisedOn: string; nextDueOn: string; log: DncLogRow[] }
    removal: { people: number; addedThisMonth: number; sequences: number; jobs: number; keys: number; agents: number; lists: number; crmLinks: number }
  }
  pipeline: {
    forecastDefinitions: ForecastDefinition[]
    submissionWindow: { opensOn: string; day: string; time: string }
    renewalReminders: number[]
    multiCurrency: boolean
  }
  scoring: { expansionRouting: { toOwnerUnder: number; toAeAtOrOver: number }; firstValue: { noMilestoneDays: number } }
  agents: { context: string; ownKeySet: boolean }
  you: { delivery: "A daily digest" | "As they happen"; slack: boolean; push: boolean; muted: boolean; quietHours: string }
}

/**
 * The five sentences that say what each forecast category means. One list, so the words under the
 * label on Reports and the words in Settings › Pipeline and data are the same words.
 */
const FORECAST_DEFINITIONS: ForecastDefinition[] = [
  { name: "Omitted", definition: "Left out of the number. You are not counting on it this period." },
  { name: "Pipeline", definition: "Live, but not yet a number you would defend." },
  { name: "Best case", definition: "About a 50% number. It closes if the good version happens." },
  { name: "Commit", definition: "About a 90% number. You would be surprised to lose it." },
  { name: "Closed", definition: "Signed. Already counted for this period." },
]

const SETTINGS: Record<Business, WorkspaceSettings> = {
  meridian: {
    security: { mfaEnforced: true, sso: "Okta", ipRanges: ["81.14.0.0/16", "212.99.4.0/24"], passwordPolicy: "12 characters, one number", sessionTimeout: "30 minutes" },
    sending: { catchAll: true, unsubscribeText: "Reply STOP and I will not write again.", usersMayDisable: false, opens: true, clicks: true },
    prospecting: {
      gdprRegions: "EU and UK restricted", dncCountries: ["United States", "United Kingdom", "Germany", "France"],
      primaryEmail: "Business email", duplicates: "Ask before merging", duplicateRate: 3.1, inProgressLimit: 5,
      dnc: {
        synchronisedOn: "2026-09-02", nextDueOn: "2026-10-03",
        log: [
          { at: "2026-09-02", by: "Daniel Okafor", what: "Synchronised with the national registers", count: 18_400 },
          { at: "2026-08-04", by: "Daniel Okafor", what: "Synchronised with the national registers", count: 17_900 },
          { at: "2026-07-06", by: "Daniel Okafor", what: "Synchronised with the national registers", count: 17_240 },
        ],
      },
      removal: { people: 214, addedThisMonth: 31, sequences: 0, jobs: 1, keys: 2, agents: 3, lists: 3, crmLinks: 214 },
    },
    pipeline: { forecastDefinitions: FORECAST_DEFINITIONS, submissionWindow: { opensOn: "Wednesday", day: "Friday", time: "16:00" }, renewalReminders: [120, 90, 60, 30], multiCurrency: true },
    scoring: { expansionRouting: { toOwnerUnder: 15_000, toAeAtOrOver: 25_000 }, firstValue: { noMilestoneDays: 90 } },
    agents: { context: "Meridian Software sells revenue tooling to mid-market software companies. We win on permissions and reporting depth. We lose to incumbents on price.", ownKeySet: false },
    you: { delivery: "A daily digest", slack: true, push: false, muted: false, quietHours: "19:00 to 08:00" },
  },
  fathom: {
    security: { mfaEnforced: false, sso: null, ipRanges: [], passwordPolicy: "12 characters, one number", sessionTimeout: "No timeout" },
    sending: { catchAll: false, unsubscribeText: "Reply STOP and I will not write again.", usersMayDisable: true, opens: true, clicks: true },
    prospecting: {
      gdprRegions: "EU restricted", dncCountries: ["United States"],
      primaryEmail: "Any email", duplicates: "Merge automatically", duplicateRate: 4.6, inProgressLimit: 3,
      dnc: {
        synchronisedOn: "2026-09-05", nextDueOn: "2026-10-06",
        log: [
          { at: "2026-09-05", by: "Priya Natarajan", what: "Synchronised with the national registers", count: 2_200 },
          { at: "2026-08-07", by: "Priya Natarajan", what: "Synchronised with the national registers", count: 2_010 },
        ],
      },
      removal: { people: 12, addedThisMonth: 4, sequences: 0, jobs: 0, keys: 0, agents: 2, lists: 1, crmLinks: 0 },
    },
    pipeline: { forecastDefinitions: FORECAST_DEFINITIONS, submissionWindow: { opensOn: "Thursday", day: "Friday", time: "17:00" }, renewalReminders: [120, 90, 60, 30], multiCurrency: false },
    scoring: { expansionRouting: { toOwnerUnder: 15_000, toAeAtOrOver: 25_000 }, firstValue: { noMilestoneDays: 90 } },
    agents: { context: "Fathom Labs sells a seed-stage analytics tool to data teams of one to five people. Two founders do the outbound themselves.", ownKeySet: false },
    you: { delivery: "As they happen", slack: false, push: true, muted: false, quietHours: "22:00 to 07:00" },
  },
  halyard: {
    security: { mfaEnforced: true, sso: null, ipRanges: [], passwordPolicy: "12 characters, one number", sessionTimeout: "No timeout" },
    sending: { catchAll: true, unsubscribeText: "Reply STOP and we will not write again.", usersMayDisable: false, opens: true, clicks: true },
    prospecting: {
      gdprRegions: "EU and UK restricted", dncCountries: ["United States", "United Kingdom"],
      primaryEmail: "Business email", duplicates: "Ask before merging", duplicateRate: 2.4, inProgressLimit: 4,
      // Past 31 days: the row reads overdue, and Home's health strip carries it.
      dnc: {
        synchronisedOn: "2026-08-05", nextDueOn: "2026-09-05",
        log: [
          { at: "2026-08-05", by: "Ravi Sethi", what: "Synchronised for Kestrel Health", count: 9_800 },
          { at: "2026-07-03", by: "Ravi Sethi", what: "Synchronised for Kestrel Health", count: 9_100 },
        ],
      },
      removal: { people: 86, addedThisMonth: 12, sequences: 2, jobs: 1, keys: 1, agents: 2, lists: 4, crmLinks: 86 },
    },
    pipeline: { forecastDefinitions: FORECAST_DEFINITIONS, submissionWindow: { opensOn: "Wednesday", day: "Friday", time: "15:00" }, renewalReminders: [120, 90, 60, 30], multiCurrency: true },
    scoring: { expansionRouting: { toOwnerUnder: 15_000, toAeAtOrOver: 25_000 }, firstValue: { noMilestoneDays: 90 } },
    agents: { context: "Halyard runs outbound for ten client companies. Every workspace carries its own client's positioning; this one is Kestrel Health, clinic software.", ownKeySet: false },
    you: { delivery: "A daily digest", slack: true, push: true, muted: false, quietHours: "18:00 to 08:00" },
  },
  ridgeline: {
    security: { mfaEnforced: false, sso: null, ipRanges: [], passwordPolicy: "12 characters, one number", sessionTimeout: "30 minutes" },
    sending: { catchAll: false, unsubscribeText: "Reply STOP and we will not write again.", usersMayDisable: false, opens: false, clicks: false },
    prospecting: {
      gdprRegions: "EU restricted", dncCountries: ["United States"],
      primaryEmail: "Business email", duplicates: "Merge automatically", duplicateRate: 1.8, inProgressLimit: 2,
      dnc: {
        synchronisedOn: "2026-09-01", nextDueOn: "2026-10-02",
        log: [
          { at: "2026-09-01", by: "Grace Mwangi", what: "Synchronised with the national registers", count: 9_800 },
          { at: "2026-08-03", by: "Grace Mwangi", what: "Synchronised with the national registers", count: 9_400 },
        ],
      },
      removal: { people: 41, addedThisMonth: 6, sequences: 1, jobs: 0, keys: 1, agents: 1, lists: 2, crmLinks: 41 },
    },
    pipeline: { forecastDefinitions: FORECAST_DEFINITIONS, submissionWindow: { opensOn: "Wednesday", day: "Thursday", time: "16:00" }, renewalReminders: [120, 90, 60, 30], multiCurrency: false },
    scoring: { expansionRouting: { toOwnerUnder: 15_000, toAeAtOrOver: 25_000 }, firstValue: { noMilestoneDays: 90 } },
    agents: { context: "Ridgeline is product-led. Most conversations start inside the product; outbound is expansion and renewal only.", ownKeySet: false },
    you: { delivery: "A daily digest", slack: true, push: false, muted: false, quietHours: "18:00 to 09:00" },
  },
}

/** How many campaign emails a workspace may send in a day, and what today has used (spec 10 §2). */
const SEND_POLICY: Record<Business, { dailyCap: number; usedToday: number }> = {
  meridian: { dailyCap: 10_000, usedToday: 3_400 },
  ridgeline: { dailyCap: 4_000, usedToday: 900 },
  fathom: { dailyCap: 0, usedToday: 0 },
  halyard: { dailyCap: 0, usedToday: 0 },
}

/** Everything a page may read. Collections are plural; the seven original names are unchanged. */
export interface Seed {
  contacts: Contact[]; companies: Company[]; accounts: Account[]
  lists: List[]; savedViews: SavedView[]
  sequences: Sequence[]; sequenceSteps: SequenceStep[]; enrollments: Enrollment[]
  sequenceChanges: SequenceChange[]; schedules: Schedule[]; rulesets: Ruleset[]
  templates: Template[]; snippets: Snippet[]
  replies: Reply[]; savedReplies: SavedReply[]; tasks: Task[]; calls: Call[]; coachingNotes: CoachingNote[]; meetings: Meeting[]
  deals: Deal[]; dealContacts: DealContact[]; dealActivities: DealActivity[]; dealFiles: DealFile[]
  qualEvidence: QualEvidence[]; stageHistory: StageHistory[]; pipelines: Pipeline[]; fields: FieldDef[]
  campaigns: Campaign[]; audiences: Audience[]; forms: Form[]
  personas: Persona[]; signals: SignalDef[]; scoreModels: ScoreModel[]
  enrichmentJobs: EnrichmentJob[]; importDrafts: ImportDraft[]; importMappings: ImportMapping[]
  enrichmentRates: { field: string; hitRate: number; typicalCost: number }[]
  credits: CreditState
  agents: Agent[]; agentEvents: AgentEvent[]
  workflows: Workflow[]; workflowRuns: WorkflowRun[]; workflowEdits: WorkflowEdit[]
  mailboxes: Mailbox[]; domains: MailDomain[]
  users: User[]; teams: Team[]; territories: Territory[]; permissionProfiles: PermissionProfile[]
  integrations: Integration[]; crmFields: CrmField[]; integrationErrors: IntegrationError[]
  syncRuns: SyncRun[]; setupDrafts: SetupDraft[]; syncErrors: SyncErrorRow[]
  apiKeys: ApiKey[]; endpointCosts: EndpointCost[]; webhooks: Webhook[]; webhookDeliveries: WebhookDelivery[]
  mcpTokens: McpToken[]; cliDevices: CliDevice[]
  requests: Request[]; notes: Note[]; briefs: Note[]
  workspace: Workspace; settings: WorkspaceSettings; invoices: Invoice[]
  /** The workspace's campaign send cap and what today has used. */
  sendPolicy: { dailyCap: number; usedToday: number }
  notifications: Notification[]; workspaceHealth: WorkspaceHealth
  activity: UserActivity[]; activityEvents: ActivityEvent[]
  goals: Goal[]; forecastSubmissions: ForecastSubmission[]; forecastPredictions: ForecastPrediction[]
  dealWarningThresholds: typeof DEAL_WARNING_DEFAULTS
  bounceGuard: { warnPercent: number; pausePercent: number; observedPercent: number; volume7d: number; state: "ok" | "warning" | "paused" }
  secondApproval: { recipients: number; credits: number }
}

/** How much of each thing a business has. Every count a spec names is here and nowhere else. */
const SIZE: Record<Business, {
  contacts: number; companies: number; accounts: number; lists: number; segments: number
  replies: number; tasks: number; calls: number; meetings: number; agentEvents: number
  campaigns: number; audiences: number; forms: number; workflows: number; workflowRuns: number
  requests: number; mailboxes: number; domains: number; enrichmentJobs: number; invoices: number
  apiKeys: number; webhooks: number; mcpTokens: number; cliDevices: number; syncErrors: number
  teams: string[]; territories: string[]; profiles: string[]
  bounce: { rate: number; volume: number }; crm: string | null
  agentShareOfBurn: number; timezone: string; currency: string
  profile: Workspace["profile"]
}> = {
  fathom: {
    contacts: 220, companies: 90, accounts: 8, lists: 5, segments: 1, replies: 10, tasks: 40, calls: 120,
    meetings: 10, agentEvents: 60, campaigns: 0, audiences: 0, forms: 0, workflows: 0, workflowRuns: 0,
    requests: 2, mailboxes: 3, domains: 1, enrichmentJobs: 9, invoices: 4, apiKeys: 0, webhooks: 0,
    mcpTokens: 3, cliDevices: 1, syncErrors: 0, teams: [], territories: [], profiles: [],
    bounce: { rate: 3.6, volume: 620 }, crm: null, agentShareOfBurn: 0.6,
    timezone: "America/New_York", currency: "USD", profile: "Founder-led outbound",
  },
  meridian: {
    contacts: 800, companies: 260, accounts: 10, lists: 14, segments: 5, replies: 18, tasks: 40, calls: 400,
    meetings: 26, agentEvents: 60, campaigns: 12, audiences: 6, forms: 4, workflows: 6, workflowRuns: 120,
    requests: 9, mailboxes: 34, domains: 3, enrichmentJobs: 6, invoices: 12, apiKeys: 2, webhooks: 1,
    mcpTokens: 6, cliDevices: 1, syncErrors: 3,
    teams: ["Sales development", "AE East", "AE West", "Customer success", "Marketing"],
    territories: ["DACH", "UK and Ireland", "North America"],
    profiles: ["Admin", "Sales manager", "Account executive", "SDR", "Marketing"],
    bounce: { rate: 1.9, volume: 14_200 }, crm: "Salesforce", agentShareOfBurn: 0.35,
    timezone: "Europe/Berlin", currency: "EUR", profile: "Separated sales team",
  },
  halyard: {
    contacts: 600, companies: 180, accounts: 9, lists: 12, segments: 3, replies: 18, tasks: 40, calls: 300,
    meetings: 14, agentEvents: 60, campaigns: 0, audiences: 0, forms: 0, workflows: 1, workflowRuns: 20,
    requests: 14, mailboxes: 6, domains: 2, enrichmentJobs: 14, invoices: 12, apiKeys: 1, webhooks: 0,
    mcpTokens: 2, cliDevices: 2, syncErrors: 6,
    teams: ["Client pods A to E", "Client pods F to J"], territories: ["Kestrel Health accounts", "Orchard Payments accounts"],
    profiles: ["Agency admin", "Outbound specialist"],
    bounce: { rate: 4.4, volume: 9_800 }, crm: "HubSpot", agentShareOfBurn: 0.45,
    timezone: "Europe/London", currency: "GBP", profile: "Agency",
  },
  ridgeline: {
    contacts: 400, companies: 140, accounts: 20, lists: 9, segments: 7, replies: 6, tasks: 40, calls: 90,
    meetings: 18, agentEvents: 60, campaigns: 8, audiences: 5, forms: 6, workflows: 5, workflowRuns: 90,
    requests: 4, mailboxes: 9, domains: 1, enrichmentJobs: 4, invoices: 6, apiKeys: 1, webhooks: 2,
    mcpTokens: 1, cliDevices: 0, syncErrors: 1,
    teams: ["Inbound", "Expansion", "Customer success", "Lifecycle marketing"], territories: [],
    profiles: ["Admin", "Expansion AE", "Inbound", "Customer success", "Lifecycle"],
    bounce: { rate: 0.8, volume: 410 }, crm: "HubSpot", agentShareOfBurn: 0.3,
    timezone: "America/Los_Angeles", currency: "USD", profile: "Product-led growth",
  },
}

const SEQUENCE_NAMES: Record<Business, string[]> = {
  fathom: ["Series A founders", "Warm inbound follow-up", "Event follow-up: SaaStock", "Partner intro"],
  meridian: ["Q4 enterprise outbound", "Warm inbound follow-up", "Event follow-up: SaaStock", "Churned re-engagement", "RevOps leaders EMEA", "Security buyers, DACH", "Partner intro", "Trial activation nudge", "Renewal 60 days", "Expansion: new seats", "Webinar attendees", "Dormant accounts"],
  halyard: ["Kestrel Health: clinic managers", "Orchard Payments: fintech ops", "Tidewater Energy: plant leads", "Sable Robotics: manufacturing", "Lumen Security: CISOs", "Harbor Foods: procurement", "Granite Insurance: brokers", "Willow Finance: CFOs", "Pinecrest Media: ad ops", "Quartz Biotech: lab directors", "Redwood Learning: deans", "Summit Telecom: network leads"],
  ridgeline: ["Renewal 60 days", "Expansion: new seats"],
}

/** The six deal warnings, computed from the deal and the thresholds. Never stored (spec 09 §2). */
export function dealWarnings(d: Deal, today: string = TODAY, t = DEAL_WARNING_DEFAULTS): DealWarning[] {
  const days = (from: string) => Math.round((Date.parse(today) - Date.parse(from)) / 86_400_000)
  const out: DealWarning[] = []
  const open = d.stage !== "Closed won" && !d.archivedAt
  const late = d.stage === "Proposal" || d.stage === "Negotiation"
  if (open && days(d.lastActivity) >= t.noActivityDays) out.push({ kind: "No activity", observed: `${days(d.lastActivity)} days`, threshold: `${t.noActivityDays} days`, text: `Nothing has happened for ${days(d.lastActivity)} days. The workspace warns at ${t.noActivityDays}.` })
  if (open && d.lastProspectActivityAt && days(d.lastProspectActivityAt) >= t.ghostedDays && days(d.lastActivity) < t.noActivityDays) out.push({ kind: "Ghosted", observed: `${days(d.lastProspectActivityAt)} days`, threshold: `${t.ghostedDays} days`, text: `They have not replied for ${days(d.lastProspectActivityAt)} days, though we have kept touching the deal.` })
  if (open && d.closeDate < today) out.push({ kind: "Overdue", observed: d.closeDate, threshold: today, text: `The close date passed on ${d.closeDate}.` })
  if (open && late && d.contactCount < t.minContacts) out.push({ kind: "Too few contacts", observed: `${d.contactCount}`, threshold: `${t.minContacts}`, text: `${d.contactCount} contacts on a ${d.stage} deal. The workspace expects ${t.minContacts}.` })
  if (open && late && !d.seniorSponsor) out.push({ kind: "No senior sponsor", observed: "none", threshold: "director or above", text: "Nobody at director level or above is a champion or the economic buyer." })
  if (open && days(d.stageEnteredAt) >= t.stalledDays) out.push({ kind: "Stalled in stage", observed: `${days(d.stageEnteredAt)} days`, threshold: `${t.stalledDays} days`, text: `${days(d.stageEnteredAt)} days in ${d.stage}. The workspace warns at ${t.stalledDays}.` })
  return out
}

const WS_DOMAIN: Record<Business, string> = { fathom: "fathomlabs.com", meridian: "meridian.io", halyard: "halyardagency.com", ridgeline: "ridgeline.io" }
const ROLE_MIX: Record<Business, Role[]> = {
  fathom: ["admin"],
  meridian: ["sdr", "ae", "sdr", "cs", "ae", "marketer", "sdr", "ae", "cs", "sdr", "ae", "admin", "sdr"],
  halyard: ["sdr", "sdr", "sdr", "admin", "sdr", "sdr"],
  ridgeline: ["sdr", "ae", "cs", "marketer", "ae", "cs", "admin"],
}
const cache = new Map<Business, Seed>()

export function seedFor(business: Business): Seed {
  const hit = cache.get(business)
  if (hit) return hit
  const b = businessById(business)
  const sz = SIZE[business]
  const r = rng({ fathom: 11, meridian: 22, halyard: 33, ridgeline: 44 }[business])
  const seats = b.roles
  const owners = seats.map((s) => s.user)
  const outbound = business !== "ridgeline"
  const wsDomain = WS_DOMAIN[business]
  const seatUser = (role: Role, fallback = seats[0].user) => seats.find((s) => s.role === role)?.user ?? fallback
  const adminUser = seatUser("admin")
  const sdrUser = seatUser("sdr")
  const aeUser = seatUser("ae", adminUser)
  const csUser = seatUser("cs", aeUser)
  const mkUser = seatUser("marketer", adminUser)
  const managerUser = seats.find((s) => s.reports?.length)?.user ?? null
  const mailboxOf = (name: string) => `${name.split(" ")[0].toLowerCase()}@${wsDomain}`

  /* -------------------------------------------------- users, teams, territories, profiles */

  const teams: Team[] = sz.teams.map((name, i) => ({ id: `team-${i + 1}`, name, lead: owners[i % owners.length], members: 0 }))
  const territories: Territory[] = sz.territories.map((name, i) => ({
    id: `terr-${i + 1}`, name,
    rule: business === "halyard" ? "Accounts belonging to this client workspace" : `Account country in ${name}`,
    owner: owners[i % owners.length], accounts: int(r, 40, 420),
  }))
  const permissionProfiles: PermissionProfile[] = sz.profiles.map((name, i) => ({
    id: `prof-${i + 1}`, name, users: 0,
    canSee: name === "Admin" || name === "Agency admin" ? ["Everything"] : ["Their own records", "Their team's pipeline", "Shared lists and sequences"],
    cannotSee: name === "Admin" || name === "Agency admin" ? [] : ["Plan and billing", "Team and access", "Danger zone"],
    editsOwnOnly: !(name === "Admin" || name === "Agency admin" || name === "Sales manager"),
  }))
  const userCount = Math.min(b.counts.users, 42)
  const users: User[] = many(userCount, (i) => {
    const seat = seats[i]
    const role: Role = seat ? seat.role : ROLE_MIX[business][(i - seats.length) % ROLE_MIX[business].length]
    const name = seat ? seat.user : `${FIRST[(i * 7 + 13) % 50]} ${LAST[(i * 11 + 5) % 50]}`
    const title = seat ? seat.title : { sdr: "SDR", ae: "Account executive", marketer: "Campaign manager", cs: "Customer success manager", admin: "Operations analyst" }[role]
    const away = business === "meridian" && (i === 9 || i === 17)
    const limit = seat?.creditLimit ?? (business === "meridian" ? 5_000 : business === "ridgeline" ? 3_000 : null)
    return {
      id: `u-${i + 1}`, name, title, role,
      profile: sz.profiles.length ? (seat?.role === "admin" ? sz.profiles[0] : sz.profiles[(i % (sz.profiles.length - 1)) + 1]) : "Admin",
      team: teams.length ? teams[role === "sdr" ? 0 : role === "ae" ? 1 + (i % Math.min(2, teams.length - 1)) : role === "cs" ? Math.min(3, teams.length - 1) : Math.min(4, teams.length - 1)].name : "—",
      territory: territories.length ? territories[i % territories.length].name : null,
      status: i > 2 && chance(r, 0.06) ? "invited" : "active",
      availability: away ? { awayUntil: shift(int(r, 3, 12)) } : "available",
      creditLimit: limit, creditsUsed: 0, lastActive: dateBack(r, 6),
      mailbox: i < sz.mailboxes ? mailboxOf(name) : null,
      reports: seat?.reports ?? [], grants: seat?.role === "admin" ? ["Manage billing", "Manage users", "Edit fields and stages"] : [],
      seat: Boolean(seat),
    }
  })
  teams.forEach((t) => { t.members = users.filter((u) => u.team === t.name).length })
  permissionProfiles.forEach((p) => { p.users = users.filter((u) => u.profile === p.name).length })

  /* ------------------------------------------------------------------ mailboxes and domains */

  const domainNames = business === "halyard" ? ["kestrelhealth-outreach.com", "orchardpay-outreach.com"] : business === "meridian" ? ["meridian.io", "meridian-mail.io", "go.meridian.io"] : [wsDomain]
  const domains: MailDomain[] = many(sz.domains, (i) => ({
    id: `dom-${i + 1}`, domain: domainNames[i] ?? `${wsDomain}`,
    spf: true, dkim: true, dmarc: business !== "fathom",
    bounceRate7d: Number((sz.bounce.rate + (i - 1) * 0.3).toFixed(1)),
    mailboxes: Math.ceil(sz.mailboxes / sz.domains), trackingSubdomain: `link.${domainNames[i] ?? wsDomain}`,
  }))
  const mailboxes: Mailbox[] = many(sz.mailboxes, (i) => {
    const u = users[i % users.length]
    const warming = business === "fathom" || chance(r, 0.15)
    const paused = business === "halyard" && i === 4
    return {
      id: `mb-${i + 1}`, address: u.mailbox ?? mailboxOf(u.name), owner: u.name,
      provider: business === "ridgeline" ? "Microsoft 365" : "Google Workspace",
      signature: `${u.name} · ${u.title} · ${b.name}`,
      dailyLimit: warming ? int(r, 20, 60) : 120, hourlyLimit: warming ? 6 : 20, sentToday: int(r, 0, warming ? 22 : 118),
      warmup: { on: warming, day: warming ? int(r, 3, 24) : 30, of: 30 },
      deliverability: int(r, 82, 99), bounceRate7d: paused ? 6.2 : Number((sz.bounce.rate + (r() - 0.5)).toFixed(1)),
      paused, pausedReason: paused ? "Bounce guard paused this mailbox at 6.2%, over the 6% pause threshold" : null,
      sequences: [],
    }
  })

  /* ---------------------------------------------------- schedules, rulesets, copy, sequences */

  const scheduleNames = business === "halyard"
    ? ["Business hours, contact's time zone", "Kestrel Health hours", "Orchard Payments hours", "Tidewater hours"]
    : business === "meridian" ? ["Business hours, contact's time zone", "UK hours", "US Pacific hours"] : ["Business hours, contact's time zone"]
  const schedules: Schedule[] = scheduleNames.map((name, i) => ({
    id: `sch-${i + 1}`, name, timezone: i === 0 ? "Contact's time zone" : sz.timezone,
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"], hours: i === 0 ? "08:00–17:00" : "09:00–17:30", isDefault: i === 0,
  }))
  const rulesetDefs = business === "fathom" || business === "ridgeline"
    ? [business === "ridgeline" ? "Customer-safe" : "Default outbound"]
    : ["Default outbound", "Customer-safe"]
  const rulesets: Ruleset[] = rulesetDefs.map((name, i) => ({
    id: `rule-${i + 1}`, name, stopOnReply: true, stopOnAccountReply: name === "Customer-safe",
    excludeStages: name === "Customer-safe" ? ["Replied", "Interested", "Not interested", "Current client", "Active opportunity"] : ["Replied", "Interested", "Not interested"],
    maxEmailsPerPersonPerDay: 1, isDefault: i === 0,
  }))

  const snippets: Snippet[] = many(business === "meridian" ? 8 : 4, (i) => ({
    id: `sn-${i + 1}`,
    name: ["Value line: pipeline hygiene", "Proof point: 11% shorter cycles", "Meeting ask", "Break-up line", "Security one-liner", "Pricing line", "LinkedIn opener", "Referral ask"][i] ?? `Snippet ${i + 1}`,
    folder: i < 3 ? "Openers" : "Closers", owner: owners[i % owners.length],
    body: ["Most teams we work with lose a day a week to keeping the pipeline honest.", "Teams that follow up inside a day close 11% faster.", "Worth twenty minutes on Thursday?", "I will stop here unless you say otherwise.", "SOC 2 Type II, SSO and an audit export on the top plan.", "Seat-based, and it drops at twenty-five.", "Saw your post on routing — we solved that the hard way.", "Is there someone closer to this than you?"][i] ?? "Reusable copy.",
    variables: i % 2 ? ["{{first_name}}"] : [], usedBy: [],
  }))
  const templates: Template[] = many(business === "meridian" ? 10 : business === "fathom" ? 5 : 6, (i) => ({
    id: `tpl-${i + 1}`,
    name: ["First touch: problem first", "Second touch: proof", "Break-up", "Post-demo follow-up", "Renewal 60 days", "Expansion: seats", "Event follow-up", "Referral ask", "Re-engagement", "Pricing answer"][i] ?? `Template ${i + 1}`,
    folder: i < 4 ? "Outbound" : i < 7 ? "Customer" : "Shared", owner: owners[i % owners.length],
    subject: ["{{company}} · keeping the pipeline honest", "A number for {{company}}", "Closing the loop", "Thanks for your time, {{first_name}}", "{{company}} renews on {{renewal_date}}", "More seats at {{company}}?", "After the event", "Who owns this at {{company}}?", "Still worth a look?", "Pricing, plainly"][i] ?? "Hello",
    body: `Hi {{first_name}},\n\n{{snippet:value_line}}\n\nWorth twenty minutes this week?\n\n${owners[i % owners.length]}`,
    variables: ["{{first_name}}", "{{company}}"], snippets: i % 3 === 0 ? [snippets[0].id] : [],
    usedBy: [], linked: i % 3 !== 1, createdAt: dateBack(r, 300), updatedAt: dateBack(r, 40),
  }))

  const seqNames = SEQUENCE_NAMES[business]
  const sequences: Sequence[] = many(Math.min(b.counts.sequences, seqNames.length), (i) => {
    const active = int(r, outbound ? 40 : 10, outbound ? 420 : 120)
    const sent = active * int(r, 2, 5)
    const bounced = Math.round(sent * (sz.bounce.rate / 100) * (0.6 + r()))
    const rate7d = Number((sz.bounce.rate + (r() - 0.4) * 2).toFixed(1))
    const guard: Sequence["guardState"] = rate7d >= BOUNCE_GUARD.pausePercent ? "auto-paused" : rate7d >= BOUNCE_GUARD.warnPercent ? "warning" : "ok"
    const mine = mailboxes[i % Math.max(1, mailboxes.length)]
    const status: Sequence["status"] = guard === "auto-paused" ? "Paused" : i < Math.ceil(sequences_active(b.counts.sequences)) ? "Active" : chance(r, 0.5) ? "Paused" : "Draft"
    return {
      id: `seq-${i + 1}`, name: seqNames[i], steps: int(r, 3, 7), series: [],
      active, replied: Math.round(sent * (0.02 + r() * 0.08)), bounced,
      owner: business === "ridgeline" ? (i === 0 ? csUser : aeUser) : owners[i % owners.length], status,
      paused: int(r, 0, 30), finished: int(r, 20, 300), notSent: int(r, 0, 26), sent,
      delivered: sent - bounced, opened: Math.round(sent * (0.3 + r() * 0.3)),
      interested: int(r, 1, 24), meetings: int(r, 0, 12), bounceRate7d: Math.max(0, rate7d),
      guardState: guard, pausedBy: guard === "auto-paused" ? "Bounce guard" : status === "Paused" ? owners[i % owners.length] : null,
      mailbox: mine?.address ?? mailboxOf(owners[0]),
      mailboxRotation: business === "halyard" ? mailboxes.slice(0, 3).map((m) => m.address) : [],
      dailyCap: int(r, 40, 200), schedule: schedules[i % schedules.length].name,
      ruleset: business === "ridgeline" ? "Customer-safe" : rulesets[i % rulesets.length].name,
      priority: i === 0 ? "High" : "Normal", tracking: { opens: business !== "ridgeline", clicks: business !== "ridgeline" },
      sharedWith: chance(r, 0.6) ? "Everyone" : "Me", createdAt: dateBack(r, 240), updatedAt: dateBack(r, 20),
      archivedAt: null,
    }
  })
  function sequences_active(total: number) { return Math.max(1, Math.round(Math.min(total, seqNames.length) * 0.65)) }
  mailboxes.forEach((m) => { m.sequences = sequences.filter((s) => s.mailbox === m.address).map((s) => s.name) })
  // Twelve weeks of sending per sequence, oldest first, each column adding back up to the sequence's
  // own total — so a weekly chart and the totals beside it can never disagree.
  const twelveWeeks = lastWeeks(12)
  sequences.forEach((s, i) => {
    const sentW = overWeeks(s.sent, 12, i + 1)
    const deliveredW = overWeeks(s.delivered, 12, i + 2)
    const openedW = overWeeks(s.opened, 12, i + 3)
    const repliedW = overWeeks(s.replied, 12, i + 5)
    const bouncedW = overWeeks(s.bounced, 12, i + 8)
    s.series = twelveWeeks.map((week, k) => ({
      week, sent: sentW[k], delivered: deliveredW[k], opened: openedW[k], replied: repliedW[k], bounced: bouncedW[k],
    }))
  })

  const sequenceSteps: SequenceStep[] = []
  sequences.forEach((s) => {
    let on = 1
    for (let i = 0; i < s.steps; i++) {
      // Step 2 of the first sequence is always an email with two variants, so every workspace has an A/B to read.
      const kind: SequenceStep["kind"] = i === 0 || (s.id === "seq-1" && i === 1) ? "Email" : pick(r, ["Email", "Email", "Call task", "LinkedIn task", "Wait"] as const)
      const wait = kind === "Wait" ? int(r, 2, 5) : 0
      const tpl = kind === "Email" ? templates[int(r, 0, templates.length - 1)] : null
      const sent = kind === "Email" ? Math.round(s.sent / s.steps) : 0
      const created = kind === "Call task" || kind === "LinkedIn task" ? int(r, 20, 160) : 0
      const done = Math.round(created * (0.5 + r() * 0.4))
      const variants: SequenceStepVariant[] = [{ label: "A", subject: tpl?.subject ?? "", body: tpl?.body ?? "", sent, replied: Math.round(sent * 0.04) }]
      if (kind === "Email" && i === 1) variants.push({ label: "B", subject: "One number for {{company}}", body: `Hi {{first_name}},\n\nOne number: teams that follow up inside a day close 11% faster.\n\n${s.owner}`, sent: Math.round(sent * 0.9), replied: Math.round(sent * 0.055) })
      sequenceSteps.push({
        id: `${s.id}-st${i + 1}`, sequenceId: s.id, order: i + 1, kind, on,
        subject: tpl?.subject ?? "", body: kind === "LinkedIn task" ? "Hi {{first_name}} — saw {{company}} is hiring across revenue ops. Worth connecting." : tpl?.body ?? "",
        templateId: tpl?.id ?? null, variants,
        linkedinKind: kind === "LinkedIn task" ? pick(r, ["Connect", "Message", "View profile"] as const) : null,
        waitDays: wait, businessDaysOnly: true,
        stats: {
          sent, delivered: Math.round(sent * 0.97), opened: Math.round(sent * (0.3 + r() * 0.25)),
          replied: Math.round(sent * (0.02 + r() * 0.05)), bounced: Math.round(sent * sz.bounce.rate / 100),
          unsubscribed: Math.round(sent * 0.004), created, done, skipped: Math.round(created * 0.1),
          overdue: Math.round(created * 0.08), waitingNow: kind === "Wait" ? int(r, 5, 90) : 0,
        },
      })
      on += wait || int(r, 2, 4)
    }
  })
  templates.forEach((t) => { t.usedBy = sequenceSteps.filter((s) => s.templateId === t.id).map((s) => s.sequenceId) })
  snippets.forEach((s) => { s.usedBy = templates.filter((t) => t.snippets.includes(s.id)).map((t) => t.id) })
  const sequenceChanges: SequenceChange[] = sequences.flatMap((s) => many(int(r, 2, 6), (i) => ({
    id: `${s.id}-ch${i + 1}`, sequenceId: s.id, when: dateBack(r, 60), who: owners[i % owners.length],
    what: pick(r, ["Changed the schedule to business hours", "Added step 4: LinkedIn message", "Rewrote step 2 subject line", "Lowered the daily cap to 80", "Switched the ruleset to Customer-safe", "Promoted variant B on step 2"]),
  })))

  /* ------------------------------------------------- personas, signals and the score models */

  const personaSeeds = business === "ridgeline"
    ? [["Admin of a growing workspace", "Head of Operations", "Manager" as Seniority, "Operations"], ["Team lead who hit a limit", "Team Lead", "Manager" as Seniority, "Sales"], ["Economic buyer on renewal", "VP Revenue Operations", "VP" as Seniority, "Revenue operations"]]
    : [["RevOps leader", "Revenue Operations Manager", "Manager" as Seniority, "Revenue operations"], ["Sales leader", "VP Sales", "VP" as Seniority, "Sales"], ["Demand gen lead", "Head of Demand Generation", "Director" as Seniority, "Marketing"], ["Founder, seed stage", "Founder", "C-level" as Seniority, "Executive"]]
  const personas: Persona[] = personaSeeds.map((p, i) => ({
    id: `pers-${i + 1}`, name: p[0] as string, title: p[1] as string, seniority: p[2] as Seniority, department: p[3] as string,
    industry: pick(r, INDUSTRIES), size: pick(r, ["50–200", "200–1,000", "1,000–5,000"]), geography: pick(r, ["EMEA", "North America", "Global"]),
    sizeCount: int(r, 400, 9_000), retired: false,
  })).concat([{ id: "pers-old", name: "IT buyer (retired)", title: "IT Director", seniority: "Director", department: "Technology", industry: "Software", size: "200–1,000", geography: "EMEA", sizeCount: 0, retired: true }])

  const signalSeeds: [string, string, SignalDef["source"], number][] = business === "ridgeline"
    ? [["Seats over 90%", "Active seats above 90% of seats bought for 7 days", "Product", 7], ["Feature limit hit", "Hit a plan limit twice in 14 days", "Product", 14], ["New team joined", "A new team created 5 or more seats", "Product", 14], ["Pricing page visits", "Three or more pricing page visits in a week", "Website", 7], ["No first-value milestone in 90 days", "No first-value milestone confirmed 90 days after start", "Product", 90], ["Executive sponsor changed", "The named sponsor left or changed title", "CRM", 30]]
    : [["Hiring", "Two or more open revenue roles posted in 30 days", "Research agent", 30], ["Funded", "Funding announced in the last 90 days", "News", 90], ["Intent", "Research on the category from the company's network", "Research agent", 14], ["Visited site", "Two or more visits to a product page in 7 days", "Website", 7], ["Job change", "A known contact started at a new employer", "Research agent", 30], ["Executive sponsor changed", "The named sponsor left or changed title", "CRM", 30]]
  const signals: SignalDef[] = signalSeeds.map((s, i) => ({
    id: `sig-${i + 1}`, name: s[0], definition: s[1], source: s[2], freshnessDays: s[3],
    tips: pick(r, ["Name the job posting, not the company.", "Lead with what changed, not what you sell.", "Ask what they tried first.", "Say what you saw and stop."]),
    matches: int(r, 8, 340), retired: false,
  })).concat([{ id: "sig-old", name: "Website chat (retired)", definition: "Started a chat on the website", source: "Website", freshnessDays: 7, tips: "", matches: 0, retired: true }])
  const signalNames = signals.filter((s) => !s.retired).map((s) => s.name)

  const scoreModels: ScoreModel[] = [
    { id: "sm-fit", name: "Fit score", kind: "fit", primary: business !== "ridgeline", inputs: [{ name: "Industry", weight: 30 }, { name: "Employees", weight: 25 }, { name: "Technologies", weight: 25 }, { name: "Geography", weight: 20 }], decayDays: 0, published: dateBack(r, 120), publishedBy: adminUser, version: "v3", threshold: 70, shareAbove: 0, distribution: [], retired: false },
    { id: "sm-eng", name: "Engagement score", kind: "engagement", primary: false, inputs: [{ name: "Opens", weight: 20 }, { name: "Replies", weight: 45 }, { name: "Meetings", weight: 35 }], decayDays: 30, published: dateBack(r, 60), publishedBy: adminUser, version: "v2", threshold: 60, shareAbove: 0, distribution: [], retired: false },
    { id: "sm-risk", name: "Churn risk", kind: "risk", primary: business === "ridgeline", inputs: [{ name: "Usage change", weight: 40 }, { name: "Seat utilisation", weight: 25 }, { name: "Last touch", weight: 20 }, { name: "Open risks", weight: 15 }], decayDays: 14, published: dateBack(r, 30), publishedBy: adminUser, version: "v1", threshold: 40, shareAbove: 0, distribution: [], retired: false },
  ]

  /* ------------------------------------------------------------------- companies and people */

  const companyName = (i: number) => i < COMPANIES.length ? COMPANIES[i] : `${CO_A[(i - COMPANIES.length) % CO_A.length]} ${CO_B[Math.floor((i - COMPANIES.length) / CO_A.length) % CO_B.length]}`
  const stageFor = (i: number): AccountStage =>
    i < sz.accounts ? (i % 9 === 8 ? "Churned" : "Current client")
      : i % 17 === 5 ? "Do not prospect" : i % 3 === 0 ? "Active opportunity" : "Cold"
  const companies: Company[] = many(sz.companies, (i) => {
    const name = companyName(i)
    const place = PLACES[i % PLACES.length]
    const stage = stageFor(i)
    const customer = stage === "Current client" || stage === "Churned"
    const employees = [20, 50, 120, 300, 800, 2_000, 5_000][Math.floor(r() * 7)]
    const seatsBought = [5, 10, 25, 50, 100][i % 5]
    return {
      id: `co-${i + 1}`, name, industry: pick(r, INDUSTRIES), employees,
      domain: name.toLowerCase().replace(/[^a-z]+/g, "") + ".com", contacts: 0, stage,
      phone: `${place.dial} ${int(r, 100, 999)} ${int(r, 1000, 9999)}`,
      owner: owners[i % owners.length], lastActivity: dateBack(r, 40),
      location: { city: place.city, country: place.country }, founded: int(r, 1994, 2021),
      description: `${name} sells ${pick(r, KEYWORDS)} software to ${pick(r, INDUSTRIES).toLowerCase()} teams from ${place.city}.`,
      revenue: pick(r, ["Under $5M", "$5–20M", "$20–50M", "$50–100M", "$100–500M", "Over $500M"]),
      signals: pickN(r, signalNames, int(r, 0, business === "ridgeline" ? 3 : 2)),
      source: pick(r, ["Found", "Found", "Imported", "CRM"] as const), addedOn: dateBack(r, 420),
      enrichedOn: chance(r, 0.7) ? dateBack(r, 90) : null,
      parent: chance(r, 0.08) && i > 3 ? companyName(i % 4) : null, lists: [],
      notes: many(chance(r, 0.35) ? 1 : 0, () => ({ by: owners[i % owners.length], on: dateBack(r, 60), text: pick(r, ["Renewal conversation starts in October.", "Two buying centres: ops and security.", "They run a quarterly review; ask to be on it."]) })),
      crm: sz.crm ? { synced: !chance(r, 0.06), lastError: chance(r, 0.06) ? "Required field Industry is empty in the CRM" : null } : null,
      custom: (business === "meridian" ? { Tier: pick(r, ["Tier 1", "Tier 2", "Tier 3"]), Region: place.country } : business === "halyard" ? { Client: pick(r, ["Kestrel Health", "Orchard Payments", "Tidewater Energy"]) } : business === "ridgeline" ? { "Plan tier": pick(r, ["Starter", "Growth", "Scale"]) } : {}) as Record<string, string>,
      technologies: pickN(r, TECHS, int(r, 1, 4)), funding: chance(r, 0.3) ? `${pick(r, ["Seed", "Series A", "Series B", "Series C"])}, ${dateBack(r, 400).slice(0, 7)}` : null,
      headcountGrowth: int(r, -8, 44), keywords: pickN(r, KEYWORDS, 3),
      fitScore: chance(r, 0.8) ? int(r, 32, 97) : null,
      health: customer ? int(r, 28, 96) : null, healthDelta7d: customer ? int(r, -9, 9) : 0,
      renewalDate: customer ? shift(((i * 23 + 9) % 365)) : null,
      arr: customer ? seatsBought * (business === "ridgeline" ? 79 : 129) * 12 : null,
      expansionSignal: customer && chance(r, 0.4) ? pick(r, ["Seats over 90%", "New team joined", "Feature limit hit"]) : null,
    }
  })

  const contacts: Contact[] = many(sz.contacts, (i) => {
    const first = FIRST[i % FIRST.length], last = LAST[Math.floor(i / FIRST.length) % LAST.length]
    const co = companies[Math.floor(Math.pow(r(), 1.5) * companies.length)]
    const t = TITLES[Math.floor(r() * TITLES.length)]
    const place = PLACES[(i + 3) % PLACES.length]
    const status = pick(r, EMAIL_STATUS)
    const hasPhone = chance(r, 0.4)
    const revealed = hasPhone && chance(r, 0.55)
    const dnc = hasPhone && chance(r, 0.12)
    const score = int(r, 12, 98)
    const jobChanged = chance(r, business === "ridgeline" ? 0.035 : 0.01)
    const enrichedOn = chance(r, 0.65) ? dateBack(r, 120) : null
    // Time in role: about a fifth of people started inside the last six months, the rest longer ago.
    const newInRole = chance(r, 0.22)
    const roleStartedOn = shift(-(newInRole ? int(r, 20, 175) : int(r, 200, 2_600)))
    // What a signal says on a person, so the row can be read without opening the definition.
    const signalDetail: Record<string, string> = {
      Hiring: "Two open revenue roles posted this month.",
      Funded: "Announced a Series B in the last quarter.",
      Intent: "People on their network read about the category this week.",
      "Visited site": "Three visits to the pricing page in seven days.",
      "Job change": "Started at this employer in the last month.",
      "Executive sponsor changed": "The named sponsor changed title.",
      "Seats over 90%": "92% of seats active for seven days.",
      "Feature limit hit": "Hit a plan limit twice in fourteen days.",
      "New team joined": "A new team created eight seats.",
      "Pricing page visits": "Three pricing page visits this week.",
      "No first-value milestone in 90 days": "Ninety days in with no milestone confirmed.",
    }
    const signalsHere: ContactSignal[] = pickN(r, signalNames, int(r, 0, 2)).map((kind) => ({
      kind, on: dateBack(r, signals.find((s) => s.name === kind)?.freshnessDays ?? 30),
      detail: signalDetail[kind] ?? "Seen on the company in the last month.",
    }))
    return {
      id: `c-${i + 1}`, name: `${first} ${last}`, title: t.title, seniority: t.seniority, department: t.department,
      company: co.name, companyId: co.id, email: `${first}.${last}@${co.domain}`.toLowerCase(), emailStatus: status,
      phone: hasPhone, phoneNumber: revealed ? `+${int(r, 1, 49)} ${int(r, 100, 999)} ${int(r, 100000, 999999)}` : null,
      phoneRevealed: revealed, doNotCall: dnc, doNotCallSource: dnc ? pick(r, ["National DNC register", "Asked us not to call"]) : null,
      dncCheckedOn: hasPhone ? dateBack(r, 20) : null, doNotContact: chance(r, 0.03),
      stage: outbound ? pick(r, STAGES) : pick(r, ["Interested", "Meeting booked", "Replied", "Approaching"] as const),
      lastActivity: dateBack(r, 30), lastContacted: chance(r, 0.7) ? dateBack(r, 45) : null,
      owner: owners[i % owners.length], inSequence: chance(r, outbound ? 0.55 : 0.15) ? sequences[i % sequences.length]?.name ?? null : null,
      lists: [], source: pick(r, ["Found", "Found", "Imported", "CRM", "Form", "Agent"] as const),
      addedOn: dateBack(r, 400), enrichedOn,
      location: { city: place.city, country: place.country }, tz: place.tz,
      linkedin: `linkedin.com/in/${first}-${last}`.toLowerCase(),
      roleStartedOn,
      languages: place.languages,
      persona: personas[i % (personas.length - 1)].name, score, scorePrevious: Math.max(0, score - int(r, -12, 12)),
      scoredAt: dateBack(r, 9), scoreReasons: pickN(r, ["Industry matches the persona", "Seniority matches the persona", "Opened three emails in a week", "Company hiring in revenue", "No activity for 30 days"], 2),
      signals: signalsHere, opens: int(r, 0, 22), replies: int(r, 0, 4),
      lastEnrichedFields: enrichedOn ? pickN(r, ["Email", "Mobile", "Job title", "Company size", "LinkedIn", "Location"], int(r, 1, 4)) : [],
      crmId: sz.crm ? `00Q${int(r, 100000, 999999)}` : null, crmSyncedAt: sz.crm ? dateBack(r, 3) : null,
      custom: (business === "meridian" ? { "Buying role": pick(r, ["Champion", "User", "Blocker", "Unknown"]), Segment: pick(r, ["Enterprise", "Mid-market"]) } : {}) as Record<string, string>,
      restrictedBy: place.eu && chance(r, 0.5) ? "EU region rule" : null,
      jobChange: jobChanged ? { firedOn: dateBack(r, 30), source: "Research agent", previousCompany: companyName((i + 7) % companies.length), previousEmail: `${first}.${last}@${companyName((i + 7) % companies.length).toLowerCase().replace(/[^a-z]+/g, "")}.com`.toLowerCase(), newCompanyId: co.id } : null,
    }
  })
  companies.forEach((c) => { c.contacts = contacts.filter((p) => p.companyId === c.id).length })
  const contactById = new Map(contacts.map((c) => [c.id, c]))
  const byCompany = (id: string) => contacts.filter((c) => c.companyId === id)

  /* -------------------------------------------------------------- lists, segments and views */

  const listNames: Record<Business, string[]> = {
    fathom: ["Series A founders, EMEA", "Warm replies, no meeting", "Design partners", "Agent shortlist: 12 Sep", "Do not contact"],
    meridian: ["Q4 enterprise targets", "Replied, no meeting yet", "Fintech CROs, EMEA", "Series A, last 90 days", "Webinar attendees, August", "Churn risks", "DACH mid-market", "Security buyers", "Open deals, no next step", "Imported: SaaStock list", "Agent shortlist: hiring", "Named accounts, AE East", "Unsubscribed", "Dormant, 90 days"],
    halyard: ["Kestrel Health: clinic managers", "Orchard Payments: fintech ops", "Tidewater: plant leads", "CSV: Kestrel March", "CSV: Orchard June", "Sable Robotics targets", "Lumen Security CISOs", "Harbor Foods procurement", "Granite brokers", "Willow CFOs", "Pinecrest ad ops", "Quartz lab directors"],
    ridgeline: ["Trial day 14, no invite sent", "Renewal in 60 days", "Seats over 90%", "Feature limit hit twice", "Churn risk, usage down", "Expansion candidates", "Lifecycle: onboarding week 1", "Hand-raisers, last 30 days", "Do not contact"],
  }
  const lists: List[] = listNames[business].slice(0, sz.lists).map((name, i) => {
    const kind: List["kind"] = /targets|Series A|risks|accounts|Renewal/.test(name) && i % 3 === 0 ? "companies" : "people"
    const mode: List["mode"] = i < sz.segments ? "segment" : "static"
    const pool = kind === "people" ? contacts : companies
    const members = pickN(r, pool.map((p) => p.id), Math.min(pool.length, int(r, 18, kind === "people" ? 240 : 90)))
    const feedsSeq = mode === "segment" && sequences.length > 0 && chance(r, 0.6)
    return {
      id: `list-${i + 1}`, name, kind, mode, memberIds: members,
      newThisWeek: Math.min(Math.round(members.length * 0.15), int(r, 0, 38)),
      feeds: feedsSeq ? [{ target: sz.campaigns ? (chance(r, 0.5) ? "campaign" : "sequence") : "sequence", name: sequences[i % sequences.length].name, auto: i < 4 }] : [],
      filters: mode === "segment" ? [
        { field: kind === "people" ? "stage" : "industry", op: "is", value: kind === "people" ? "Replied" : pick(r, INDUSTRIES) },
        { field: "lastActivity", op: "in the last", value: "30 days" },
      ] : [],
      suppressions: mode === "segment" ? ["Unsubscribed", "Bounced", ...(chance(r, 0.5) ? ["In another sequence"] : [])] : [],
      owner: business === "halyard" && i >= 8 ? adminUser : owners[i % owners.length],
      visibility: business === "halyard" && i >= 8 ? "me" : chance(r, 0.75) ? "everyone" : "me",
      source: business === "fathom" && i >= 2 ? "agent" : name.startsWith("CSV") || name.startsWith("Imported") ? "csv" : mode === "segment" ? "search" : "manual",
      createdAt: dateBack(r, 300), updated: dateBack(r, 12),
      lastRefreshed: mode === "segment" ? dateBack(r, 2) : null,
      alert: mode === "segment" ? pick(r, ["off", "daily", "weekly"] as const) : "off",
      history: many(int(r, 3, 14), (h) => ({ when: dateBack(r, 120), who: owners[h % owners.length], what: pick(r, ["Created the list", "Added 38 records from a search", "Changed a filter: employees over 200", "Turned the weekly alert on", "Removed 12 bounced addresses", "Fed it into a sequence"]) })),
      archived: i === sz.lists - 1 && sz.lists > 6,
    }
  })
  lists.filter((l) => l.kind === "people").forEach((l) => l.memberIds.forEach((id) => { contactById.get(id)?.lists.push(l.name) }))
  lists.filter((l) => l.kind === "companies").forEach((l) => l.memberIds.forEach((id) => { const c = companies.find((x) => x.id === id); if (c) c.lists.push(l.name) }))

  /**
   * The seeded person views of spec 02 §3, per business and seat, plus the company and deal views the
   * other two tables read. On a person view `filters[].field` is the People page's own filter id and
   * each chosen value is its own row, and `columns` are the columns the view adds to the seat's set.
   */
  const primaryModel = scoreModels.find((m) => m.primary) ?? scoreModels[0]
  const mqlLabel = `Above the MQL threshold (${primaryModel.threshold})`
  const f = (field: string, values: string[]): ListFilter[] => values.map((value) => ({ field, op: "is", value }))
  const shippedView: SavedView = {
    id: "view-needs-enrichment", name: "Needs enrichment", object: "person", filters: [],
    columns: ["people.col.email", "people.col.phone", "people.col.company"],
    sort: "", owner: "Ollopa", sharedWith: "everyone", defaultFor: [], alert: "off", shipped: true,
  }
  const halyardClients = Array.from(new Set(companies.map((c) => c.custom.Client).filter(Boolean))).slice(0, 3)
  const personViews: SavedView[] = business === "fathom"
    ? [{
      id: "view-work-week", name: "To work this week", object: "person",
      filters: [...f("people.f.email", ["Verified"]), ...f("people.f.not-in-sequence", ["Not in a sequence"]), ...f("people.f.signals", ["In the last 30 days"])],
      columns: ["people.col.signals", "people.col.phone"], sort: "score desc",
      owner: adminUser, sharedWith: "everyone", defaultFor: ["sdr", "admin"], alert: "off", shipped: false,
    }]
    : business === "halyard"
      ? [
        ...halyardClients.map((client, i) => {
          // The ICP is read off the client's own accounts: their industries, their sizes, their countries.
          const theirs = companies.filter((c) => c.custom.Client === client)
          const industries = Array.from(new Set(theirs.map((c) => c.industry))).slice(0, 3)
          const countries = Array.from(new Set(theirs.map((c) => c.location.country))).slice(0, 3)
          return {
            id: `view-icp-${i + 1}`, name: `${client} ICP`, object: "person" as const,
            filters: [
              ...f("people.f.title", ["Manager", "Director", "Head", "VP", "Chief"]),
              ...f("people.f.company-size", ["51–200", "201–1,000", "1,000+"]),
              ...f("people.f.industry", industries.length ? industries : ["Software"]),
              ...f("people.f.location", countries.length ? countries : ["United Kingdom"]),
            ],
            columns: ["people.col.location"], sort: "",
            owner: sdrUser, sharedWith: "everyone" as const, defaultFor: (i === 0 ? ["sdr"] : []) as Role[], alert: "off" as const, shipped: false,
          }
        }),
        {
          id: "view-everyone-ws", name: "Everyone in this workspace", object: "person", filters: [],
          columns: ["people.col.owner", "people.col.source"], sort: "",
          owner: adminUser, sharedWith: "everyone", defaultFor: ["admin"], alert: "off", shipped: false,
        },
      ]
      : business === "ridgeline"
        ? [
          {
            id: "view-signals-week", name: "Signals this week", object: "person",
            filters: [...f("people.f.signals", ["In the last 7 days"]), ...f("people.f.stage", ["Cold", "Approaching", "Replied", "Interested", "Meeting booked", "Unresponsive"])],
            columns: ["people.col.signals", "people.col.last-activity"], sort: "lastActivity desc",
            owner: sdrUser, sharedWith: "everyone", defaultFor: ["sdr"], alert: "daily", shipped: false,
          },
          {
            id: "view-expansion", name: "My expansion accounts", object: "person",
            filters: [...f("people.f.owner", ["Me"]), ...f("people.f.signals", ["In the last 30 days"])],
            columns: ["people.col.signals", "people.col.last-activity"], sort: "",
            owner: aeUser, sharedWith: "me", defaultFor: ["ae"], alert: "weekly", shipped: false,
          },
          {
            id: "view-mql", name: "Above the MQL threshold", object: "person",
            filters: f("people.f.score", [mqlLabel]),
            columns: ["people.col.score", "people.col.lists", "people.col.last-activity"], sort: "score desc",
            owner: mkUser, sharedWith: "everyone", defaultFor: ["marketer"], alert: "off", shipped: false,
          },
        ]
        : [
          {
            id: "view-prospects", name: "My prospects to work", object: "person",
            filters: [...f("people.f.owner", ["Me"]), ...f("people.f.email", ["Verified"]), ...f("people.f.not-in-sequence", ["Not in a sequence"]), ...f("people.f.stage", ["Cold", "Approaching"])],
            columns: [], sort: "score desc",
            owner: sdrUser, sharedWith: "me", defaultFor: ["sdr"], alert: "off", shipped: false,
          },
          {
            id: "view-accounts-people", name: "My accounts' people", object: "person",
            filters: [...f("people.f.owner", ["Me"]), ...f("people.f.stage", ["Replied", "Interested", "Meeting booked"])],
            columns: ["people.col.phone", "people.col.last-activity"], sort: "",
            owner: aeUser, sharedWith: "me", defaultFor: ["ae"], alert: "off", shipped: false,
          },
          {
            id: "view-audience", name: "Audience: verified", object: "person",
            filters: f("people.f.email", ["Verified"]),
            columns: ["people.col.lists", "people.col.industry", "people.col.company-size"], sort: "",
            owner: mkUser, sharedWith: "everyone", defaultFor: ["marketer"], alert: "off", shipped: false,
          },
          {
            id: "view-mql", name: "Above the MQL threshold", object: "person",
            filters: f("people.f.score", [mqlLabel]),
            columns: ["people.col.score", "people.col.lists", "people.col.last-activity"], sort: "score desc",
            owner: mkUser, sharedWith: "everyone", defaultFor: [], alert: "weekly", shipped: false,
          },
          {
            id: "view-everyone", name: "Everyone", object: "person", filters: [],
            columns: ["people.col.owner", "people.col.source", "people.col.crm"], sort: "",
            owner: adminUser, sharedWith: "everyone", defaultFor: ["admin"], alert: "off", shipped: false,
          },
        ]
  const savedViews: SavedView[] = [
    ...personViews,
    shippedView,
    { id: "view-accounts-at-risk", name: "Accounts at risk", object: "company", filters: [{ field: "stage", op: "is", value: "Current client" }, { field: "health", op: "is under", value: "40" }], columns: ["name", "health", "renewalDate", "owner"], sort: "health asc", owner: csUser, sharedWith: "everyone", defaultFor: ["cs"], alert: "off", shipped: false },
    { id: "view-my-deals", name: "My deals closing this quarter", object: "deal", filters: [{ field: "owner", op: "is", value: "me" }, { field: "closeDate", op: "before", value: "2026-12-31" }], columns: ["name", "amount", "stage", "closeDate", "nextStep"], sort: "closeDate asc", owner: aeUser, sharedWith: "me", defaultFor: ["ae"], alert: "off", shipped: false },
  ]

  /* ------------------------------------------------------- accounts: the customer state of a company */

  const riskTypes = ["Usage drop", "Champion left", "Escalation", "Budget cut", "Competitor", "Onboarding stalled", "Churn notice"]
  const accounts: Account[] = companies.filter((c) => c.stage === "Current client" || c.stage === "Churned").map((c, i) => {
    const seatsBought = [5, 10, 25, 50, 100][i % 5]
    const seatsActive = Math.round(seatsBought * (0.35 + r() * 0.65))
    const usageDelta30 = int(r, -40, 40)
    const usage30 = int(r, 20, 100)
    const lastTouch = dateBack(r, 45)
    const touchDays = Math.round((Date.parse(TODAY) - Date.parse(lastTouch)) / 86_400_000)
    const openRisks: AccountRisk[] = many(i % 3 === 0 ? 1 : 0, (k) => ({
      id: `risk-${i + 1}-${k + 1}`, type: i === 3 && (business === "meridian" || business === "ridgeline") ? "Churn notice" : riskTypes[i % riskTypes.length],
      opened: dateBack(r, 60), owner: csUser,
      note: pick(r, ["Usage fell after the team reorganised.", "Our champion moved to another company.", "An escalation is open with support.", "Budget review in November.", "A competitor is running a pilot alongside us.", "No first-value milestone in 90 days.", "They gave notice for the March renewal."]),
      resolved: null,
    }))
    const accSignals: AccountSignal[] = many(int(r, 0, business === "ridgeline" ? 3 : 1), (k) => ({
      id: `asig-${i + 1}-${k + 1}`, kind: pick(r, ["Seats over 90%", "New team joined", "Pricing page visits", "Hiring in your buyer's team", "Feature limit hit", "Executive sponsor changed"]),
      fired: dateBack(r, 21), source: pick(r, ["Product", "Website", "Research agent", "CRM"]),
      detail: pick(r, ["92% of seats active for seven days.", "A new team created eight seats.", "Three pricing page visits this week.", "Two open roles on the buyer's team.", "Hit the workflow limit twice.", "The named sponsor changed title."]),
      dismissed: chance(r, 0.15), routedTo: chance(r, 0.85) ? csUser : "nobody",
      dueBy: shift(int(r, -3, 7)), outcome: pick(r, ["acted", "no conversation", "not real", null] as const),
    }))
    const usagePts = Math.max(-20, Math.min(20, Math.round(usageDelta30 / 2)))
    const seatPts = seatsActive / seatsBought >= 0.9 ? 10 : seatsActive / seatsBought >= 0.6 ? 0 : -10
    const touchPts = touchDays <= 14 ? 10 : touchDays <= 30 ? 0 : -15
    const riskPts = openRisks.reduce((s, x) => s + (x.type === "Churn notice" ? -37 : -12), 0)
    const signalPts = Math.min(10, accSignals.length * 5)
    const health = Math.max(0, Math.min(100, 55 + usagePts + seatPts + touchPts + riskPts + signalPts))
    const band: Account["band"] = health >= 70 ? "Healthy" : health >= 40 ? "Watch" : "At risk"
    const renewal = shift((i * 23 + 9) % 365)
    const price = business === "ridgeline" ? 79 : business === "meridian" ? 129 : 49
    const hasAe = seats.some((s) => s.role === "ae")
    const handoffOn = hasAe && i % 4 === 0
    // Thirteen weeks of use, oldest first. Seats walk towards today's active count, so the last week
    // in the series and the number on the record are the same number.
    const seatsThirteenWeeksAgo = Math.max(1, Math.round(seatsActive / (1 + usageDelta30 / 100)))
    const usageWeeks = lastWeeks(13)
    const usage90: AccountWeek[] = usageWeeks.map((week, k) => {
      const walk = Math.round(seatsThirteenWeeksAgo + ((seatsActive - seatsThirteenWeeksAgo) * k) / 12)
      const wobble = k === 12 ? 0 : ((seatsBought * (k + 3)) % 7) - 3
      const active = Math.max(0, Math.min(seatsBought, walk + wobble))
      return { week, activeSeats: active, events: active * (6 + ((k * 5) % 7)) }
    })
    // Who holds the seats. The people we already hold at the company fill them; the rest are names
    // only the customer's own admin would know, so they carry a sign-in date and nothing else.
    const holders = byCompany(c.id)
    const accountSeats: AccountSeat[] = many(seatsBought, (k) => ({
      name: holders[k]?.name ?? `${FIRST[(i * 5 + k * 7) % FIRST.length]} ${LAST[(i * 3 + k * 11) % LAST.length]}`,
      lastSignIn: k < seatsActive ? shift(-int(r, 0, 6)) : shift(-int(r, 24, 120)),
    }))
    return {
      id: `acc-${i + 1}`, companyId: c.id, name: c.name, domain: c.domain, stage: c.stage, owner: csUser, ae: hasAe ? aeUser : adminUser,
      plan: price === 129 ? "Scale" : price === 79 ? "Growth" : "Starter",
      seatsBought, seatsActive, usage30, usageDelta30, usage90, seats: accountSeats,
      health, band, healthDelta30: int(r, -14, 14),
      drivers: [{ label: "Base", points: 55 }, { label: `Usage ${usageDelta30 >= 0 ? "up" : "down"} ${Math.abs(usageDelta30)}%`, points: usagePts }, { label: `${Math.round(seatsActive / seatsBought * 100)}% of seats active`, points: seatPts }, { label: `Last touch ${touchDays} days ago`, points: touchPts }, { label: `${openRisks.length} open risk${openRisks.length === 1 ? "" : "s"}`, points: riskPts }, { label: `${accSignals.length} expansion signal${accSignals.length === 1 ? "" : "s"}`, points: signalPts }],
      renewal, value: seatsBought * price * 12, billing: "annual" as const, noticeDays: pick(r, [30, 60, 90]), autoRenew: chance(r, 0.6),
      forecast: (c.stage === "Churned" ? "Lost" : band === "At risk" ? "At risk" : band === "Healthy" && Date.parse(renewal) - Date.parse(TODAY) < 90 * 86_400_000 ? "Commit" : "Likely") as Account["forecast"],
      champion: byCompany(c.id)[0]?.name ?? "—", lastTouch,
      nextStep: { text: pick(r, ["Business review with the sponsor", "Confirm the renewal number", "Walk the new team through set-up", "Close the open escalation", "Introduce the expansion pricing"]), due: shift(int(r, -2, 21)) },
      risks: openRisks, signals: accSignals,
      handoff: handoffOn ? {
        from: aeUser, signer: byCompany(c.id)[0]?.name ?? "—", sent: dateBack(r, 21), accepted: chance(r, 0.7) ? dateBack(r, 14) : null,
        whyTheyBought: "They lose a day a week keeping the pipeline honest and their board asks for a forecast they cannot defend.",
        promised: ["A Salesforce field map reviewed by their admin", "Two onboarding sessions for the AE team", "A quarterly business review"],
        users: "Twelve AEs and four SDRs; the ops lead administers it.",
        risks: ["Their admin leaves in November", "Security review is not finished"], dissenters: ["The finance director wanted a cheaper tool"],
        deadline: shift(int(r, 7, 60)), deadlineWhy: "Their fiscal year starts and the old contract ends the same week.",
        checklist: [{ item: "Kickoff booked", done: true }, { item: "Data imported", done: chance(r, 0.6) }, { item: "First value confirmed", done: false }],
        writtenBy: [{ section: "Why they bought", by: aeUser }, { section: "What was promised", by: aeUser }, { section: "The risks", by: "Research agent (draft)" }],
      } : null,
      plays: many(int(r, 0, 2), (k) => ({
        id: `play-${i + 1}-${k + 1}`, name: pick(r, ["Expansion: second team", "Renewal 90 days out", "Win back the champion", "Onboarding rescue"]),
        why: pick(r, ["Seats are over 90% for a week.", "The renewal is inside the reminder window.", "The champion changed role.", "No first-value milestone in 90 days."]),
        dueBy: shift(int(r, 2, 30)), owner: csUser, state: pick(r, ["suggested", "running", "done", "dropped"] as const),
      })),
      firstValue: { definition: "Ten people enrolled in a live sequence", target: "Within 30 days of kickoff", confirmedOn: chance(r, 0.6) ? dateBack(r, 60) : null, confirmedBy: chance(r, 0.6) ? csUser : null },
      goals: [{ text: pick(r, ["Cut the time the team spends on CRM admin in half", "Give the board a forecast they can defend", "Book 40 meetings a month with no new headcount"]), agreedOn: dateBack(r, 120), source: "Hand-off from the AE" }],
      crmSync: (sz.crm ? (chance(r, 0.9) ? "synced" : "error") : "Not connected") as Account["crmSync"],
    }
  }).slice(0, sz.accounts)

  /* ------------------------------------------------------------------------------ the deals */

  const pipelineNames = business === "meridian" ? ["New business", "Renewals and expansion"] : business === "ridgeline" ? ["Expansion", "Renewals"] : [business === "halyard" ? "Client pipeline" : "New business"]
  const pipelines: Pipeline[] = pipelineNames.map((name, i) => ({
    id: `pipe-${i + 1}`, name, isDefault: i === 0,
    stages: DEAL_STAGES.map((s) => ({ name: s, probability: STAGE_PROBABILITY[s], forecast: STAGE_FORECAST[s], requiredFields: s === "Proposal" ? ["Economic buyer", "Close date"] : s === "Closed won" ? ["Hand-off complete"] : [] })),
  }))
  const openCount = b.counts.openDeals
  const archivedCount = Math.round(openCount / 6)
  const historyCount = Math.min(120, Math.round(openCount * 0.5))
  const dealContacts: DealContact[] = []
  const dealActivities: DealActivity[] = []
  const dealFiles: DealFile[] = []
  const qualEvidence: QualEvidence[] = []
  const stageHistory: StageHistory[] = []
  const lostReasons = ["Price", "No decision", "Competitor", "Timing"]
  // Who carries a book. New business sits with the people on an account-executive seat, so the by-rep
  // table has a row per rep rather than one row for the seat user; renewals sit with customer success
  // where the business has that seat, which is whose forecast the renewal book is.
  const aeNames = users.filter((u) => u.role === "ae").map((u) => u.name)
  const outboundNames = users.filter((u) => u.role === "sdr" || u.role === "admin").map((u) => u.name)
  const hasCsSeat = seats.some((s) => s.role === "cs")
  const bookOwner = (i: number, dealType: Deal["dealType"]): string => {
    if (dealType === "Renewal" && hasCsSeat) return csUser
    if (aeNames.length) return aeNames[i % aeNames.length]
    if (outboundNames.length) return outboundNames[i % Math.min(outboundNames.length, 10)]
    return owners[i % owners.length]
  }
  const deals: Deal[] = many(openCount + archivedCount + historyCount, (i) => {
    const co = companies[Math.floor(Math.pow(r(), 1.3) * companies.length)]
    const archived = i >= openCount && i < openCount + archivedCount
    const history = i >= openCount + archivedCount
    const stage: DealStage = archived ? pick(r, ["Discovery", "Proposal", "Negotiation"] as const) : history ? "Closed won" : pick(r, ["Qualified", "Discovery", "Proposal", "Negotiation"] as const)
    const customer = co.stage === "Current client" || co.stage === "Churned"
    const dealType: Deal["dealType"] = customer ? (chance(r, 0.5) ? "Renewal" : "Expansion") : business === "ridgeline" ? (chance(r, 0.6) ? "Expansion" : "Renewal") : "New"
    const amount = money(r, [4_800, 12_000, 24_000, 48_000, 96_000, 180_000])
    const createdAt = dateBack(r, history ? 300 : 180)
    // Stalled in stage is an exception, so most deals moved stage inside the last month and about one
    // in seven has been sitting where it is for longer than the workspace's warning.
    const stageEnteredAt = shift(-(i % 7 === 3 ? int(r, 31, 70) : int(r, 0, 25)))
    const owner = bookOwner(i, dealType)
    const people = byCompany(co.id).slice(0, int(r, 1, 5))
    const roles: DealContact["role"][] = ["Champion", "Economic buyer", "Technical", "User", "Blocker", "Other"]
    const id = `d-${i + 1}`
    people.forEach((p, k) => dealContacts.push({ dealId: id, contactId: p.id, name: p.name, title: p.title, role: roles[k % roles.length], engaged: chance(r, 0.6) }))
    const senior = people.some((p, k) => (roles[k % roles.length] === "Champion" || roles[k % roles.length] === "Economic buyer") && (p.seniority === "Director" || p.seniority === "VP" || p.seniority === "C-level"))
    const qualification = Object.fromEntries(QUAL_ELEMENTS.map((e) => {
      const state: WriteState = chance(r, 0.3) ? "validated" : chance(r, 0.5) ? "edited" : "suggested"
      const filled = stage !== "Qualified" || chance(r, 0.4)
      const value = !filled ? "" : {
        Metrics: "A day a week of admin per rep, and a forecast the board does not trust",
        "Economic buyer": people[1]?.name ?? "Not identified", "Decision criteria": "Two-way CRM sync, SSO, a forecast the manager can edit",
        "Decision process": "Security review, then procurement, then the CRO signs", "Paper process": "Their paper, 30-day payment terms, legal review two weeks",
        "Identified pain": "Reps spend 17% of the week on manual entry", Champion: people[0]?.name ?? "Not identified",
        Competition: pick(r, ["Incumbent spreadsheet", "Apollo", "Outreach", "None named"]),
      }[e]
      if (filled && state !== "suggested" && chance(r, 0.5)) qualEvidence.push({ id: `qe-${i + 1}-${e}`, dealId: id, element: e, quote: pick(r, ["\"We lose about a day a week to this.\"", "\"Rachel signs anything over fifty thousand.\"", "\"Security will take two weeks, they always do.\"", "\"If the sync breaks again we are done.\""]), sourceKind: pick(r, ["call", "email", "meeting", "note"] as const), sourceId: `src-${i + 1}`, at: dateBack(r, 40) })
      return [e, { value, state, source: state === "suggested" ? "Extracted from the discovery call, 4 Sep" : "Edited by the AE", updatedBy: state === "suggested" ? "Research agent" : owner, at: dateBack(r, 30) }]
    })) as Record<QualElementName, QualElement>
    many(int(r, 4, 12), (k) => {
      const kind = pick(r, ["email", "call", "meeting", "note", "stage", "field", "task", "agent", "file"] as const)
      dealActivities.push({
        id: `${id}-act${k + 1}`, dealId: id, kind, at: dateBack(r, 90), by: chance(r, 0.2) ? "Research agent" : owner,
        summary: { email: "Sent: pricing follow-up", call: "Call: 14 minutes, connected", meeting: "Discovery call held", note: "Note added", stage: `Stage moved to ${stage}`, field: "Close date changed", task: "Task completed: send the proposal", agent: "Research agent wrote three signals", file: "Proposal v2 uploaded" }[kind],
        detail: kind === "email" ? "Thanks for the time today — the pricing you asked for is below." : undefined,
        meta: kind === "email" ? { direction: "out" } : kind === "call" ? { durationSec: 840, outcome: "Connected" } : kind === "stage" ? { from: "Discovery", to: stage } : kind === "field" ? { field: "Close date", old: shift(-20), new: shift(12) } : undefined,
      })
    })
    many(int(r, 0, 3), (k) => dealFiles.push({ id: `${id}-f${k + 1}`, dealId: id, name: pick(r, ["Proposal v2.pdf", "Security questionnaire.xlsx", "Order form.pdf", "Pilot plan.docx"]), size: int(r, 40_000, 2_400_000), uploadedBy: owner, at: dateBack(r, 40) }))
    DEAL_STAGES.slice(0, DEAL_STAGES.indexOf(stage) + 1).forEach((s, k) => stageHistory.push({ dealId: id, stage: s, enteredOn: shift(-(60 - k * 12) - int(r, 0, 5)) }))
    const noNextStep = chance(r, 0.2)
    return {
      id, name: `${co.name} · ${dealType === "New" ? pick(r, ["Platform", "Growth plan", "Pilot"]) : dealType}`,
      company: co.name, companyId: co.id, amount,
      currency: business === "meridian" && chance(r, 0.12) ? pick(r, ["USD", "GBP"]) : sz.currency,
      stage, probability: STAGE_PROBABILITY[stage],
      // Won deals closed in the past. An open deal closes later this quarter or in the next one, and
      // about one in six has slipped past the date it was given, which is what Overdue is for.
      closeDate: history ? dateBack(r, 120)
        : archived ? dateBack(r, 60)
          : shift(i % 6 === 2 ? -int(r, 1, 12) : i % 6 === 4 || i % 6 === 5 ? int(r, 18, 108) : int(r, 2, 17)),
      owner,
      // Most open deals were touched this week; a tail has been quiet for over a month, and those are
      // the ones No activity is about.
      lastActivity: history || archived ? dateBack(r, 120) : shift(-(i % 9 === 4 ? int(r, 41, 70) : int(r, 0, 12))),
      nextStep: noNextStep ? null : pick(r, ["Send the proposal", "Security review call", "Intro to the CFO", "Pilot kickoff", "Pricing follow-up", "Contract redlines"]),
      nextStepDue: noNextStep ? null : shift(int(r, -3, 14)),
      dealType, pipeline: pipelineNames[dealType === "New" ? 0 : pipelineNames.length - 1],
      forecast: chance(r, 0.1) ? pick(r, FORECAST_CATEGORIES) : i < 2 ? "Omitted" : STAGE_FORECAST[stage],
      createdAt, stageEnteredAt, archivedAt: archived ? dateBack(r, 40) : null, lostReason: archived ? pick(r, lostReasons) : null,
      syncState: sz.crm ? (chance(r, 0.05) ? "error" : "synced") : null,
      crmId: sz.crm ? `006${int(r, 100000, 999999)}` : null, crmSyncedAt: sz.crm ? dateBack(r, 2) : null,
      crmError: sz.crm && chance(r, 0.05) ? "Stage value Negotiation is not in the CRM picklist" : null,
      agentProposal: chance(r, business === "fathom" ? 0.25 : 0.08) ? pick(r, ["Move to Proposal: they asked for pricing on the call", "Set the next step to a security review", "Re-date to 30 October: they said the budget lands then"]) : null,
      // Ghosted is an exception too: most prospects answered inside the fortnight.
      lastProspectActivityAt: chance(r, 0.85) ? shift(-(i % 8 === 6 ? int(r, 22, 60) : int(r, 0, 14))) : null,
      contactCount: people.length, seniorSponsor: senior,
      source: pick(r, ["Outbound", "Inbound", "Campaign", "Referral", "Product signal"]),
      campaign: sz.campaigns ? (chance(r, 0.3) ? "Q4 launch announcement" : null) : null,
      competitor: chance(r, 0.4) ? pick(r, ["Apollo", "Outreach", "Spreadsheet", "HubSpot Sales"]) : null,
      contractTerm: pick(r, ["12 months", "24 months", "36 months"]), paymentTerms: pick(r, ["Net 30", "Net 45", "Annual upfront"]),
      discount: pick(r, [0, 0, 5, 10, 15]), proposalLink: chance(r, 0.5) ? "proposals.ollopa.com/p/" + id : null,
      esign: pick(r, ["not sent", "sent", "signed"] as const), splitOwners: chance(r, 0.1) ? [owner, owners[(i + 1) % owners.length]] : [],
      tags: pickN(r, ["strategic", "multi-year", "security review", "displacement", "renewal risk"], int(r, 0, 2)),
      priority: chance(r, 0.2) ? "High" : "Normal",
      lineItems: [{ name: "Platform seats", qty: int(r, 5, 80), unit: business === "meridian" ? 129 : 79 }, ...(chance(r, 0.4) ? [{ name: "Credits pack", qty: 1, unit: 4_800 }] : [])],
      custom: (business === "meridian" ? { "Use case": pick(r, ["Outbound", "Pipeline hygiene", "Forecasting"]), "Legal review": pick(r, ["Not started", "In review", "Approved"]), "Security review": pick(r, ["Not started", "In review", "Approved"]), "Procurement portal": chance(r, 0.4), Region: co.location.country }
        : business === "halyard" ? { "Hand-off status": pick(r, ["Booked", "Handed off", "Client accepted", "Client rejected"]), "Meeting date": shift(int(r, -10, 20)), "Client feedback": "" }
          : business === "ridgeline" ? { "Plan tier": pick(r, ["Starter", "Growth", "Scale"]), Seats: int(r, 5, 120), "Renewal type": pick(r, ["Auto", "Negotiated"]), "Usage score": int(r, 20, 100) } : {}) as Record<string, string | number | boolean>,
      qualification,
      scoreAtFirstContact: { score: int(r, 30, 95), modelVersion: "Fit score v3", stampedOn: createdAt },
    }
  })
  const dealsByCompany = (id: string) => deals.filter((d) => d.companyId === id && !d.archivedAt)

  /* ------------------------------------------- enrolments, the reply threads, tasks and calls */

  const enrolled = contacts.filter((c) => c.inSequence).slice(0, 400)
  const enrollments: Enrollment[] = enrolled.map((c, i) => {
    const seq = sequences.find((s) => s.name === c.inSequence) ?? sequences[0]
    const status: Enrollment["status"] = pick(r, ["Active", "Active", "Active", "Paused", "Finished", "Replied", "Bounced", "Not sent"] as const)
    return {
      id: `enr-${i + 1}`, sequenceId: seq.id, contactId: c.id, status,
      stepOrder: int(r, 1, seq.steps), nextAt: status === "Active" ? shift(int(r, 0, 6)) : null,
      addedAt: dateBack(r, 60), addedBy: chance(r, 0.15) ? "Outreach agent" : c.owner,
      mailbox: seq.mailbox,
      notSentReason: status === "Not sent" ? pick(r, ["No email", "Unverified email", "Do not contact", "Already in another sequence", "Mailbox limit reached"] as const) : null,
    }
  })

  const replyBodies: Record<Reply["outcome"], string> = {
    Interested: "Happy to take a look. We are rebuilding how we route inbound this quarter, so the timing is not bad. Do you have time Thursday afternoon? I would want our ops lead on it too.",
    "Not now": "Not a priority this quarter — we are mid-migration and nobody has the bandwidth. Check back in January and I will take the call properly.",
    Question: "Does this work with HubSpot, and can we keep our own field names? We tried something similar last year and the sync overwrote our data, which cost us a week.",
    "Out of office": "I am out until the 21st with limited email access. For anything urgent please contact our operations team.",
    Unsubscribe: "Please remove me from this list. I am not the right person for this and I would rather not be contacted again.",
  }
  // The seats that read sequence replies: the SDR and the AE, and the admin where the workspace runs
  // outbound without a separate seat for it. A sales manager reads her reps' replies, not her own box.
  const replyReaders = seats
    .filter((s) => !s.reports?.length)
    .filter((s) => s.role === "sdr" || s.role === "ae" || (s.role === "admin" && (business === "fathom" || business === "halyard")))
    .map((s) => s.user)
  const replyBoxes = (replyReaders.length ? replyReaders : [sdrUser])
    .map((name) => mailboxes.find((m) => m.owner === name)?.address ?? mailboxOf(name))
  const replyCount = sz.replies + 6
  const replies: Reply[] = many(replyCount, (i) => {
    const c = contacts[Math.floor(r() * contacts.length)]
    const outcome = outbound
      ? pick(r, ["Interested", "Interested", "Not now", "Question", "Out of office", "Unsubscribe"] as const)
      : pick(r, ["Interested", "Interested", "Question", "Question", "Not now"] as const)
    const seq = sequences.find((s) => s.name === c.inSequence) ?? sequences[i % sequences.length] ?? sequences[0]
    const of = seq?.steps ?? 4
    const n = int(r, 1, of)
    const handled = i >= sz.replies
    const mb = replyBoxes[i % replyBoxes.length]
    const received = dateBack(r, 5)
    return {
      id: `r-${i + 1}`, contactId: c.id, contact: c.name, company: c.company,
      sequence: seq?.name ?? "Inbound", step: { n, of }, mailbox: mb, outcome, received,
      snippet: replyBodies[outcome].split(".")[0] + ".", body: replyBodies[outcome],
      messages: [
        ...many(n, (k) => ({ from: "us" as const, sent: shift(-(9 - k * 2)), subject: `${c.company} · keeping the pipeline honest`, body: `Hi ${c.name.split(" ")[0]},\n\nMost teams your size lose a day a week keeping the pipeline honest. Worth twenty minutes?\n\n${c.owner}` })),
        { from: "them" as const, sent: received, subject: `Re: ${c.company} · keeping the pipeline honest`, body: replyBodies[outcome] },
      ],
      status: handled ? "handled" : "open", handled, handedTo: handled && seats.some((s) => s.role === "ae") ? aeUser : null,
      // The agent puts the first outcome on a reply; a person who has worked it owns the outcome after.
      classifiedBy: handled ? (mailboxes.find((m) => m.address === mb)?.owner ?? sdrUser) : "reply agent",
      followUpOn: outcome === "Not now" ? "2027-01-05" : null,
      returnsOn: outcome === "Out of office" ? "2026-09-21" : null,
      dealId: outcome === "Interested" && chance(r, 0.4) ? deals[i % deals.length].id : null,
      draft: outcome === "Interested" || outcome === "Question" ? {
        subject: `Re: ${c.company} · keeping the pipeline honest`,
        body: `Thanks ${c.name.split(" ")[0]} — Thursday at 15:00 works. I will send an invitation with a short agenda, and bring the two-way sync question to it.\n\n${c.owner}`,
        by: "Outreach agent", state: chance(r, 0.3) ? "edited" : "suggested",
      } : null,
    }
  })

  /** The five replies this workspace writes over and over, ready to drop into a thread (spec 06 §2). */
  const savedReplies: SavedReply[] = [
    { id: "sr-1", name: "Offer three times", body: "Thanks {first name}. Three that work this side: Tuesday 14:00, Wednesday 10:30, Thursday 15:00. Say which and I will send the invitation." },
    { id: "sr-2", name: "Answer on the CRM sync", body: "Good question, {first name}. The sync is two-way and you keep your own field names — you map them once and nothing is overwritten without a review." },
    { id: "sr-3", name: "Send the security summary", body: "Here is the one-page security summary, {first name}. SSO, data residency and the sub-processor list are all in it. Happy to put your security lead on a call." },
    { id: "sr-4", name: "Follow up in the new year", body: "Understood, {first name} — I will come back in January. If anything changes before then, reply to this and it lands with me." },
    { id: "sr-5", name: "Hand over to a colleague", body: `Thanks {first name}. My colleague at ${b.name} runs this part and will pick it up from here, with everything you have told me already.` },
  ]

  const taskTitles = { Call: "Call after two opened emails", LinkedIn: "Send a connection request", Email: "Send the follow-up", "Follow-up": "Follow up on the proposal", Meeting: "Discovery call" }
  /**
   * Who works a task, by what the task is. The marketer never appears: that seat has no access to the
   * area at all. Where a business has not declared the seat that would normally take the work, it
   * falls to the next seat on the list that the business does declare.
   */
  const WORKS_TASK: Record<Task["kind"], Role[]> = {
    Call: ["sdr", "sdr", "ae", "admin"],
    LinkedIn: ["sdr", "sdr", "admin"],
    Email: ["sdr", "ae", "cs"],
    "Follow-up": ["ae", "cs", "sdr", "admin"],
    Meeting: ["ae", "sdr", "cs"],
  }
  const taskOwner = (kind: Task["kind"], i: number): string => {
    const wants = WORKS_TASK[kind]
    for (let k = 0; k < wants.length; k++) {
      const seat = seats.find((s) => s.role === wants[(i + k) % wants.length])
      if (seat) return seat.user
    }
    return seats[0].user
  }
  const tasks: Task[] = many(sz.tasks, (i) => {
    const c = contacts[Math.floor(r() * contacts.length)]
    const kind: Task["kind"] = i < 2 ? "Meeting"
      : business === "halyard" ? pick(r, ["Call", "Call", "LinkedIn", "LinkedIn", "Email", "Follow-up"] as const)
        : business === "ridgeline" ? pick(r, ["Follow-up", "Follow-up", "Email", "Call"] as const)
          : pick(r, ["Call", "LinkedIn", "Email", "Follow-up"] as const)
    const createdBy: Task["createdBy"] = business === "fathom" && i % 3 === 0 ? "agent" : c.inSequence ? "sequence" : "manual"
    const seq = sequences.find((s) => s.name === c.inSequence)
    const status: Task["status"] = i < 26 ? "Open" : pick(r, ["Done", "Done", "Snoozed", "Skipped"] as const)
    const owner = taskOwner(kind, i)
    return {
      id: `t-${i + 1}`, kind, contact: c.name, contactId: c.id, company: c.company,
      due: shift(int(r, -4, 6)), sequence: c.inSequence, title: taskTitles[kind],
      step: seq ? { n: int(r, 1, seq.steps), of: seq.steps, title: taskTitles[kind] } : null,
      // A task made by hand was made by the person who owns it, so the From column tells the truth.
      createdBy, creator: createdBy === "agent" ? "Outreach agent" : createdBy === "sequence" ? c.inSequence ?? "Sequence" : owner,
      owner, status,
      snoozedUntil: status === "Snoozed" ? shift(int(r, 1, 5)) : null, doneAt: status === "Done" ? dateBack(r, 4) : null,
      outcome: kind === "Call" && status === "Done" ? pick(r, ["Connected", "Voicemail", "No answer", "Wrong number"] as const) : null,
      priority: chance(r, 0.2) ? "High" : "Normal",
      dealId: chance(r, 0.3) ? deals[i % deals.length].id : null,
      message: kind === "LinkedIn" ? `Hi ${c.name.split(" ")[0]} — saw ${c.company} is hiring across revenue operations. We help teams there stop losing a day a week to CRM admin. Worth connecting.` : null,
      messageEdited: kind === "LinkedIn" && chance(r, 0.3),
      linkedinKind: kind === "LinkedIn" ? pick(r, ["Connect", "Message"] as const) : null,
      history: many(int(r, 0, 3), (k) => ({ step: k + 1, kind: pick(r, ["Email", "Call", "LinkedIn"]), when: dateBack(r, 20), result: pick(r, ["Delivered, opened twice", "No answer", "Connection accepted", "Bounced"]) })),
      notes: many(chance(r, 0.25) ? 1 : 0, () => ({ who: c.owner, when: dateBack(r, 10), text: pick(r, ["Gatekeeper says to call before nine.", "Asked for pricing by email first.", "Moving offices this week."]) })),
    }
  })
  // Two contacts per business carry a do-not-call flag and a call task, so the screening rule has rows.
  tasks.filter((t) => t.kind === "Call").slice(0, 2).forEach((t) => { const c = contactById.get(t.contactId); if (c) { c.doNotCall = true; c.doNotCallSource = "National DNC register"; c.dncCheckedOn = dateBack(r, 5) } })

  const coachingNotes: CoachingNote[] = []
  // Every rep logs calls, not just the person whose seat you sign in as: the activity report counts a
  // row per rep, and a coaching note is about somebody else's call.
  const frontLine = users.filter((u) => u.role === "sdr" || u.role === "ae")
  // At a workspace with no bench of reps the founders dial too, which is how Fathom actually works.
  const repNames = (frontLine.length > 1 ? frontLine : users.filter((u) => u.role !== "marketer")).map((u) => u.name)
  const calls: Call[] = many(sz.calls, (i) => {
    const c = contacts[Math.floor(r() * contacts.length)]
    const disposition = pick(r, DISPOSITIONS)
    const connected = disposition === "Connected" || disposition === "Connected, not interested" || disposition === "Callback booked"
    const id = `call-${i + 1}`
    const loggedBy = repNames.length ? repNames[i % repNames.length] : owners[i % owners.length]
    const day = dateBack(r, 91)
    if (i < Math.round(sz.calls * 0.12)) coachingNotes.push({
      id: `coach-${i + 1}`, callId: id, author: managerUser ?? adminUser, at: day,
      wentWell: pick(r, ["Opened with the signal, not the pitch.", "Let the silence do the work after the price.", "Confirmed the next step before hanging up."]),
      toChange: pick(r, ["Asked two questions in one breath.", "Took the first objection at face value.", "Did not name a date for the next step."]),
      oneBehaviour: "Ask one question, then stop talking.", state: pick(r, ["suggested", "edited", "accepted"] as const),
    })
    return {
      id, taskId: i < tasks.length ? tasks[i].id : null, contactId: c.id, contact: c.name, company: c.company,
      dealId: chance(r, 0.3) ? deals[i % deals.length].id : null,
      purpose: pick(r, CALL_PURPOSES), disposition, connected,
      startedAt: `${day} ${clockTime(r)}`, durationSec: connected ? int(r, 90, 1_500) : int(r, 8, 45),
      notes: connected ? pick(r, ["Runs a team of twelve. Their forecast is a spreadsheet the manager rebuilds on Thursdays.", "Uses Apollo, unhappy with the data. Renewal is in March.", "Asked for pricing and a security summary. Wants the ops lead on the next call."]) : "No answer; will try before nine tomorrow.",
      loggedBy, sentiment: connected ? pick(r, ["positive", "neutral", "negative"] as const) : "neutral",
      advancedSequence: !connected,
      transcript: null,
      coachingNote: null,
    }
  })
  coachingNotes.forEach((n) => { const call = calls.find((c) => c.id === n.callId); if (call) call.coachingNote = n })
  // A recorder is connected at Meridian and Ridgeline and nowhere else, and it returns something only
  // for a call that was answered and ran long enough to have anything in it.
  const recorderConnected = business === "meridian" || business === "ridgeline"
  calls.forEach((call) => {
    call.transcript = recorderConnected && call.connected && call.durationSec > 120
      ? `${call.contact}: “We looked at two other tools last quarter and stopped because the data was stale.”\n`
        + `${call.loggedBy}: “What would have to be true for this to be worth another look?”\n`
        + `${call.contact}: “Show me it keeps up with job changes, and I will bring in our ops lead.”`
      : null
  })

  const meetings: Meeting[] = many(sz.meetings, (i) => {
    const c = contacts[Math.floor(r() * contacts.length)]
    const state: Meeting["state"] = i % 5 === 0 ? "no-show" : i % 7 === 3 ? "cancelled" : i % 2 === 0 ? "held" : "booked"
    const held = state === "held"
    return {
      id: `mtg-${i + 1}`, taskId: i < 2 ? tasks[i].id : null, contactId: c.id, contact: c.name, company: c.company,
      dealId: chance(r, 0.6) ? deals[i % deals.length].id : null,
      host: seats.some((s) => s.role === "ae") ? aeUser : owners[i % owners.length],
      attendees: [c.name, ...byCompany(c.companyId).slice(1, 3).map((p) => p.name)],
      at: `${state === "booked" ? shift(int(r, 0, 14)) : dateBack(r, 30)} ${clockTime(r)}`, durationMin: pick(r, [30, 45, 60]),
      state, prepBriefId: chance(r, 0.6) ? `brief-${i + 1}` : null,
      followUpDraft: held ? `Thanks for the time today. You asked for the two-way sync detail and pricing at 40 seats — both are below. Next step: security review on ${shift(int(r, 3, 12))}.` : null,
      summary: held ? "They lose a day a week to manual entry. Two buying centres. The CRO signs above fifty thousand." : null,
      actionItems: held ? ["Send the security summary", "Introduce the ops lead", "Confirm the pilot dates"] : [],
      bookedFrom: pick(r, ["reply", "call", "form", "manual"] as const),
    }
  })

  /* ------------------------------------------------- campaigns, the audiences and the forms */

  const audiences: Audience[] = many(sz.audiences, (i) => {
    const live = business === "ridgeline" || i < 4
    const size = int(r, 400, 9_400)
    return {
      id: `aud-${i + 1}`,
      name: ["Customers, all plans", "Trial day 7–14", "Webinar attendees, August", "Enterprise prospects, EMEA", "Renewals in 90 days", "Hand-raisers, last 30 days"][i] ?? `Audience ${i + 1}`,
      type: i % 3 === 0 ? "Static" : "Segment", size,
      // A live audience moves every night; a frozen one is the same list it was frozen as.
      sizeDelta: live ? int(r, -40, 220) : 0,
      lastRebuilt: dateBack(r, 4),
      sources: [lists[i % lists.length]?.name ?? "Saved search", i % 2 ? "Trial day 7–14" : "Lifecycle stage is customer"],
      mode: live ? "live" : "frozen", refreshAt: live ? shift(1) : null, frozenAt: live ? null : dateBack(r, 12),
      feeds: [], rules: [{ field: "lifecycleStage", op: "is", value: i % 2 ? "Trial" : "Customer" }, { field: "industry", op: "is one of", value: "Software, Fintech" }],
      suppressed: { unsubscribed: int(r, 20, 180), bounced: int(r, 10, 120), customers: int(r, 0, 900), openDeals: deals.filter((d) => !d.archivedAt).length, closedLost: int(r, 5, 90), inSequence: contacts.filter((c) => c.inSequence).length },
      suppressionsOn: { customers: chance(r, 0.7), openDeals: true, closedLost: chance(r, 0.6), inSequence: true },
      usedBy: [],
    }
  })
  const campaignNames = ["Q4 launch announcement", "Webinar: pipeline hygiene", "Pricing update", "Customer newsletter, September", "Product update: routing", "Event invite: RevOps London", "Case study: Kestrel Health", "Re-engagement, dormant"]
  const lifecycleNames = ["Trial day 7 nudge", "Renewal 60 days out", "Seat limit reached", "Onboarding week 1", "Feature limit hit", "Win-back after churn"]
  const campaigns: Campaign[] = many(sz.campaigns, (i) => {
    const lifecycle = business === "ridgeline" ? i < 6 : i >= 8
    const status: Campaign["status"] = business === "ridgeline"
      ? (i < 6 ? "Running" : i === 6 ? "Paused" : "Draft")
      : (i < 2 ? "Draft" : i === 2 ? "Scheduled" : i < 9 ? "Sent" : i < 11 ? "Running" : "Paused")
    const aud = audiences[i % Math.max(1, audiences.length)]
    const sent = status === "Draft" || status === "Scheduled" ? 0 : int(r, 800, 12_000)
    const guardPaused = status === "Paused" && business === "meridian"
    const bounced = guardPaused ? Math.round(sent * 0.062) : Math.round(sent * (0.005 + r() * 0.03))
    const delivered = sent - bounced
    const opened = Math.round(delivered * (0.22 + r() * 0.33))
    const clicked = Math.round(delivered * (0.02 + r() * 0.07))
    const converted = Math.round(delivered * (0.005 + r() * 0.055))
    // The eight pre-send checks. Nothing has been checked until QA has been run; after that they
    // pass, except the one or two this campaign actually trips.
    const qaRun = status !== "Draft"
    const fails = new Set<number>(guardPaused ? [4] : status === "Paused" ? [1] : i % 4 === 1 ? [5] : [])
    const checks: CampaignCheck[] = CAMPAIGN_CHECKS.map((name, k) => ({
      name, state: !qaRun ? "not run" : fails.has(k) ? "fail" : "pass",
    }))
    const linkTargets = ["/changelog", "/pricing", "/book-a-demo", "/customers/kestrel-health", "/docs/routing", "/unsubscribe"]
    const linkCount = status === "Draft" || status === "Scheduled" ? 0 : int(r, 3, 6)
    const clickSplit = overWeeks(clicked, linkCount, i + 4)
    return {
      id: `camp-${i + 1}`, name: lifecycle ? lifecycleNames[i % lifecycleNames.length] : campaignNames[i % campaignNames.length],
      kind: lifecycle ? "Lifecycle" : "Email", status, pausedBy: guardPaused ? "Bounce guard" : status === "Paused" ? mkUser : null,
      subject: lifecycle ? "A quicker way to get your team started" : "What changed in Ollopa this quarter",
      previewText: "Two minutes, one number, no slides.", fromName: `${mkUser.split(" ")[0]} at ${b.name}`, fromMailbox: `marketing@${wsDomain}`,
      audienceId: aud?.id ?? "aud-1", audienceSize: aud?.size ?? 0,
      sendAt: lifecycle ? null : status === "Scheduled" ? shift(int(r, 1, 10)) : dateBack(r, 40),
      trigger: lifecycle ? pick(r, ["Trial reaches day 7", "Renewal is 60 days out", "Seats pass 90%"]) : null,
      delayDays: lifecycle ? int(r, 0, 3) : null, exitRule: lifecycle ? "Exits on reply or on upgrade" : null,
      sent, delivered, bounced, opened, clicked, replied: Math.round(delivered * (r() * 0.03)), converted,
      unsubscribed: Math.round(delivered * (0.001 + r() * 0.007)), complaints: Math.round(delivered * 0.0004),
      goal: pick(r, ["Booked demo", "Started trial", "Renewed", "Added seats"]), owner: mkUser,
      qa: { by: status === "Draft" ? null : owners[(i + 1) % owners.length], on: status === "Draft" ? null : dateBack(r, 30), checklist: [{ item: "Suppressions applied", done: true }, { item: "Links tested", done: status !== "Draft" }, { item: "Preview on phone", done: status !== "Draft" }, { item: "Someone who did not build it checked it", done: status !== "Draft" }], checks },
      links: many(linkCount, (k) => ({ url: `https://${wsDomain}${linkTargets[k % linkTargets.length]}`, clicks: clickSplit[k] ?? 0 })),
      attributionDays: lifecycle ? 14 : 30,
      sendsByDay: lifecycle ? many(30, (d) => ({ day: shift(-29 + d), sent: int(r, 4, 90) })) : [],
      variants: i < 2 && business === "meridian" ? [{ label: "A", subject: "What changed in Ollopa this quarter", sent: Math.round(sent / 2), opened: Math.round(opened / 2), replied: 4 }, { label: "B", subject: "Three things your team asked for", sent: Math.round(sent / 2), opened: Math.round(opened / 2) + 40, replied: 7 }] : [],
      activity: many(int(r, 2, 5), (k) => ({ at: dateBack(r, 30), by: mkUser, what: pick(r, ["Audience attached", "Copy rewritten", "QA passed", "Scheduled", "Paused by the bounce guard"]) + (k === 0 ? "" : "") })),
      dealsCreated: int(r, 0, 12), pipelineAmount: int(r, 0, 12) * 24_000, pipelineInfluenced: int(r, 0, 20) * 24_000,
    }
  })
  audiences.forEach((a) => { a.usedBy = campaigns.filter((c) => c.audienceId === a.id).map((c) => c.name); a.feeds = a.usedBy })
  const forms: Form[] = many(sz.forms, (i) => {
    const submissions = int(r, 4, 40)
    return {
      id: `form-${i + 1}`, name: ["Request a demo", "Webinar registration", "Contact sales", "Pricing enquiry", "Trial sign-up", "Newsletter"][i] ?? `Form ${i + 1}`,
      status: i === 0 ? "Live" : pick(r, ["Live", "Live", "Draft", "Off"] as const),
      fields: [{ label: "Work email", kind: "asked", credits: 0 }, { label: "First name", kind: "asked", credits: 0 }, { label: "Company", kind: "enriched", credits: 1 }, { label: "Job title", kind: "enriched", credits: 1 }, { label: "Company size", kind: "enriched", credits: 1 }],
      enrichOnSubmit: true, enrichCapDaily: 200, enrichUsedToday: int(r, 0, 180), matched: Math.round(submissions * 0.7),
      submissions7d: submissions, routesTo: sdrUser, reportsTo: mkUser, lastSubmission: dateBack(r, 3), unrouted: int(r, 0, 3),
      submissions: many(Math.min(submissions, 8), (k) => {
        const c = contacts[(i * 7 + k) % contacts.length]
        return { id: `sub-${i + 1}-${k + 1}`, at: `${dateBack(r, 7)} ${clockTime(r)}`, contactId: c.id, name: c.name, email: c.email, enriched: chance(r, 0.8), routedTo: chance(r, 0.85) ? sdrUser : null }
      }),
    }
  })

  /* --------------------------------------------- enrichment jobs, imports and the credit state */

  const enrichmentRates = [
    { field: "Email", hitRate: 0.72, typicalCost: 2 }, { field: "Mobile", hitRate: 0.41, typicalCost: 9 },
    { field: "Job title", hitRate: 0.88, typicalCost: 1 }, { field: "Company size", hitRate: 0.93, typicalCost: 1 },
  ]
  const providerOrder = business === "meridian" ? ["Northlight Data", "Beacon Verify", "Ollopa"] : business === "fathom" ? ["Northlight Data", "Ollopa"] : business === "ridgeline" ? ["Northlight Data", "Beacon Verify"] : ["Northlight Data", "Datakite"]
  const enrichmentJobs: EnrichmentJob[] = many(sz.enrichmentJobs, (i) => {
    const rows = int(r, 25, 4_000)
    const matched = Math.round(rows * (0.4 + r() * 0.5))
    const fields = pickN(r, ["Email", "Mobile", "Job title", "Company size", "LinkedIn"], int(r, 2, 4))
    const credits = fields.reduce((s, f) => s + (f === "Mobile" ? 9 : f === "Email" ? 2 : 1), 0) * matched
    const source = pick(r, ["import", "reveal", "api", "job-change", "form"] as const)
    return {
      id: `job-${i + 1}`, source,
      sourceLabel: { import: "CSV: client list, 4 September", reveal: "Selected 25 rows on People", api: "API key: Nightly enrichment", "job-change": "Job-change signal", form: "Form: Request a demo" }[source],
      startedBy: source === "api" ? "Nightly enrichment (key)" : owners[i % owners.length], startedAt: `${dateBack(r, 30)} ${clockTime(r)}`,
      keyId: source === "api" ? "key-1" : null, fields, providers: providerOrder, rows, matched, credits,
      byField: fields.map((f) => ({ field: f, hit: Math.round(matched * (0.4 + r() * 0.55)), cost: f === "Mobile" ? 9 : f === "Email" ? 2 : 1 })),
      unmatchedIds: contacts.slice(0, Math.min(6, rows - matched > 0 ? 6 : 0)).map((c) => c.id),
      charging: { chargedRows: matched, freeRows: rows - matched, note: "Only matched rows are charged. Mobiles are charged even where the number is on a do-not-call register, and are not refunded." },
      status: i === 0 && business === "halyard" ? "paused" : "done",
    }
  })
  const importDrafts: ImportDraft[] = business === "halyard" ? [{
    id: "imp-1", file: "kestrel-clinic-managers-sep.csv", rows: 1_842, uploadedBy: sdrUser, uploadedAt: `${dateBack(r, 2)} ${clockTime(r)}`, step: 4,
    answers: { duplicates: "Prompt", owner: sdrUser, stage: "Cold", list: lists[0]?.name ?? "CSV import" },
    mapping: { "First name": "firstName", "Last name": "lastName", "Email": "email", "Job Title": "title", "Org": "company", "Phone": "phone", "Notes": null },
    preview: [{ "First name": "Amara", "Last name": "Okonkwo", Email: "amara.okonkwo@kestrelhealth.com", "Job Title": "Clinic Manager", Org: "Kestrel Health" }],
    progress: { done: 640, total: 1_842, credits: 1_280, stoppedAt: `${dateBack(r, 2)} 14:10` },
  }] : []
  const importMappings: ImportMapping[] = many(business === "halyard" ? 4 : business === "meridian" ? 1 : 0, (i) => ({
    id: `impmap-${i + 1}`, name: ["Kestrel Health export", "Orchard Payments export", "Tidewater export", "Standard CSV"][i] ?? "Standard CSV",
    workspace: business === "halyard" ? ["Kestrel Health", "Orchard Payments", "Tidewater Energy", "All"][i] : "All",
    mapping: { "First name": "firstName", "Last name": "lastName", Email: "email", Title: "title", Company: "company" }, lastUsedOn: dateBack(r, 30),
  }))

  const burn = b.credits.burnPerWeek
  const agentShare = Math.round(burn * sz.agentShareOfBurn)
  const credits: CreditState = {
    balance: b.credits.balance, monthlyCap: b.credits.monthlyCap, burnPerWeek: burn,
    cycleEnds: shift(((Date.parse(b.plan.renews) - Date.parse(TODAY)) / 86_400_000) % 30 || 17),
    runsOutOn: shift(Math.round(b.credits.balance / (burn / 7))),
    perRunCap: business === "fathom" ? 3_000 : business === "meridian" ? 300_000 : 60_000,
    perUserLimit: business === "meridian" ? 5_000 : business === "ridgeline" ? 3_000 : null,
    bySurface: { app: Math.round(burn * 0.3), automation: Math.round(burn * 0.12), api: Math.round(burn * (business === "fathom" ? 0 : 0.1)), mcp: Math.round(burn * 0.04), cli: Math.round(burn * (business === "halyard" ? 0.09 : 0.02)), agent: agentShare },
    byFeature: [{ feature: "Research", credits: Math.round(agentShare * 0.5) }, { feature: "Email reveal", credits: Math.round(burn * 0.14) }, { feature: "Phone reveal", credits: Math.round(burn * 0.2) }, { feature: "Enrichment jobs", credits: Math.round(burn * 0.1) }, { feature: "Drafts", credits: Math.round(agentShare * 0.2) }],
    // What a person has spent this cycle. Where the workspace sets a ceiling per person, nobody can be
    // over it: most people are under half of theirs, and one or two are close enough to feel it.
    byUser: users.map((u, i) => {
      const share = Math.round((burn * 4 / users.length) * (u.role === "sdr" ? 1.8 : u.role === "ae" ? 1.1 : 0.5) * (0.6 + ((i * 37) % 80) / 100))
      if (u.creditLimit === null) return { user: u.name, used: share, limit: null }
      const closeToTheLimit = i % 23 === 3
      const fraction = closeToTheLimit ? 0.84 + ((i * 13) % 12) / 100 : 0.06 + ((i * 29) % 42) / 100
      return { user: u.name, used: Math.min(u.creditLimit, Math.round(u.creditLimit * fraction)), limit: u.creditLimit }
    }),
    teamBudgets: teams.map((t) => ({ team: t.name, credits: int(r, 20_000, 400_000), used: int(r, 5_000, 200_000) })),
    spikeAlert: { multiple: 3, todayMultiple: Number((0.6 + r() * 2.8).toFixed(1)) },
  }
  // The user row and the credit row are the same fact, so they are written from one place.
  users.forEach((u) => { u.creditsUsed = credits.byUser.find((x) => x.user === u.name)?.used ?? 0 })

  /* ------------------------------------------------------------------ agents and their runs */

  const agentCaps: Record<Business, Record<string, [number, number, number]>> = {
    fathom: { research: [25, 300, 3_000], outreach: [5, 200, 800], scoring: [2, 100, 500] },
    meridian: { research: [40, 20_000, 300_000], outreach: [10, 4_000, 60_000], scoring: [2, 3_000, 40_000] },
    halyard: { research: [30, 6_000, 80_000], outreach: [8, 1_500, 20_000], scoring: [2, 1_000, 10_000] },
    ridgeline: { research: [20, 4_000, 60_000], outreach: [8, 1_000, 15_000], scoring: [2, 2_000, 30_000] },
  }
  const agentIds: Agent["id"][] = b.counts.agents >= 3 ? ["research", "outreach", "scoring"] : ["research", "outreach"]
  const agents: Agent[] = agentIds.map((id) => {
    const caps = agentCaps[business][id]
    return {
      id, name: { research: "Research agent", outreach: "Outreach agent", scoring: "Scoring agent" }[id],
      on: !(business === "ridgeline" && id === "outreach"), owner: adminUser,
      model: "Ollopa default model" + (business === "meridian" ? " (own key available)" : ""),
      can: id === "research" ? ["Read public sources and write a brief with citations", "Write signals on a company", "Draft a shortlist"]
        : id === "outreach" ? ["Draft an email and save it", "Propose adding a person to a sequence", "Pre-classify a reply"]
          : ["Score a person or company", "Explain the score from its inputs"],
      needsApprovalFor: id === "outreach" ? ["Sending an email", "Enrolling anyone in a sequence", "Spending over the per-run cap"]
        : id === "research" ? ["Spending over the per-run cap"] : ["Changing the primary score model"],
      capPerRun: caps[0], capPerDay: caps[1], capPerMonth: caps[2],
      spentToday: int(r, 0, caps[1]), spentThisWeek: int(r, caps[1], caps[2] / 3),
      pausedReason: business === "ridgeline" && id === "outreach" ? "Turned off by the admin: Ridgeline does not cold-email" : null,
    }
  })

  const agentEvents: AgentEvent[] = many(sz.agentEvents, (i) => {
    const c = contacts[Math.floor(r() * contacts.length)]
    const co = companies.find((x) => x.id === c.companyId) ?? companies[0]
    const deal = deals[i % deals.length]
    // Every workspace has one run that stopped at its daily cap, so the exception is never theoretical.
    const kind: AgentEvent["kind"] = i === 7 ? "capped"
      : i === 9 ? "proposed"
        : i % 11 === 4 ? "skipped"
        : pick(r, ["researched", "researched", "drafted", "drafted", "scored", "proposed", "sent", "paused"] as const)
    const agent: AgentEvent["agent"] = kind === "scored" ? "Scoring agent" : kind === "researched" || kind === "capped" ? "Research agent" : "Outreach agent"
    const batch = i % 13 === 0 && kind === "researched"
    const seq = sequences[i % Math.max(1, sequences.length)]
    const needsApproval = kind === "proposed" || (kind === "drafted" && chance(r, 0.5))
    const recipients = kind === "proposed" ? (i === 9 ? int(r, 1_100, 2_400) : int(r, 1, 120)) : 1
    const spend = batch ? 300 : kind === "researched" ? CREDITS.research : kind === "drafted" ? CREDITS.draft : kind === "scored" ? CREDITS.score : 0
    const second = needsApproval && (recipients > (business === "fathom" ? 400 : SECOND_APPROVAL.recipients) || spend > (business === "fathom" ? 200 : SECOND_APPROVAL.credits))
    const status: AgentEvent["status"] = kind === "capped" ? "paused" : kind === "paused" ? "paused" : needsApproval ? (second ? "waiting-second" : chance(r, 0.35) ? (chance(r, 0.8) ? "approved" : "declined") : "waiting") : "done"
    const surface: Surface = business === "fathom" && i === 3 ? "mcp" : business === "halyard" && i === 5 ? "cli" : pick(r, ["app", "app", "automation", "agent", "api"] as const)
    const owner = c.owner
    const remoteMcp = business === "fathom" && i === 3
    const remoteCli = business === "halyard" && i === 5
    const summary = remoteMcp ? `Proposes enrolling 42 people in "${seq?.name ?? "outbound"}" (asked through Claude)`
      : remoteCli ? "Bulk update of 4,000 records, asked from the terminal"
        : batch ? `Researched 25 companies in one run` : {
          researched: `Researched ${co.name}: 3 signals found`, drafted: `Drafted a first email to ${c.name}`,
          scored: `Scored ${co.name} ${int(r, 40, 96)} (fit high, intent rising)`,
          proposed: recipients > 200 ? `Proposes enrolling ${recipients} people in "${seq?.name ?? "outbound"}"` : `Proposes moving ${deal.company} to Proposal`,
          sent: `Sent step 2 to ${c.name}`, paused: `Paused outreach to ${co.name}: bounce rate 5.1%`,
          capped: `Research agent stopped at its daily cap of ${(agents.find((a) => a.id === "research")?.capPerDay ?? 300).toLocaleString()} credits at 14:10`,
          skipped: `Passed over ${c.name}`,
        }[kind]
    return {
      id: `a-${i + 1}`, agent, when: dateBack(r, 6), at: clockTime(r), summary,
      detail: batch ? "Twenty-five companies, one run. Sources: company sites, news, profiles." : `Sources: company site, two news items, LinkedIn. Contact: ${c.name}, ${c.title} at ${c.company}.`,
      needsApproval, kind, credits: kind === "skipped" ? 0 : spend, surface,
      actorUser: remoteMcp ? `${adminUser} · Claude (MCP)` : remoteCli ? `${adminUser} · terminal (CLI)` : owner,
      ownerId: owner, trigger: batch ? "A list was saved" : pick(r, ["A list was saved", "A signal fired", "A reply landed", "Nightly run", "A person asked"]),
      contactId: c.id, contact: c.name, company: co.name, companyId: co.id,
      dealId: kind === "proposed" && recipients <= 200 ? deal.id : null, sequence: seq?.name ?? null,
      status, decidedBy: status === "approved" || status === "declined" ? owner : null,
      decidedAt: status === "approved" || status === "declined" ? dateBack(r, 2) : null,
      decidedAsAdmin: (status === "approved" || status === "declined") && chance(r, 0.2),
      needsSecondApproval: second, approvalTier: needsApproval ? (second ? "admin" : "owner") : "logged",
      batchKey: `${dateBack(r, 6)}-${["morning calls", "after the call block", "end of day"][i % 3]}`,
      to: kind === "drafted" || kind === "sent" ? c.name : null,
      draft: kind === "drafted" || kind === "proposed" ? `Subject: ${co.name} · a day a week\n\nHi ${c.name.split(" ")[0]},\n\nYou are hiring two revenue operations people, which usually means the reporting is the bottleneck rather than the headcount. Teams your size lose about a day a week keeping the pipeline honest, and the forecast still gets rebuilt by hand on Thursdays.\n\nWe fixed that for three companies in ${co.industry.toLowerCase()} this year. Worth twenty minutes on Thursday?\n\n${owner}` : null,
      sources: ["company site", "two news items", "LinkedIn profile"],
      inputs: [{ label: `${co.name} website`, href: `https://${co.domain}` }, { label: "Funding announcement, August", href: "#" }, { label: `${c.name} on LinkedIn`, href: `https://${c.linkedin}` }],
      decision: status === "approved" ? "approved" : status === "declined" ? "declined" : null,
      ifApproved: needsApproval ? {
        action: kind === "proposed" ? (recipients > 200 ? "enrol" : "stage") : "send",
        mailbox: mailboxes[i % Math.max(1, mailboxes.length)]?.address, sequence: seq?.name, stage: "Proposal",
        sendsAt: `${shift(1)} 08:00`, recipients, credits: spend || CREDITS.draft,
      } : null,
      // What the run did and what each step cost. A company with more to read costs more than one
      // with a single page, so no two runs come to the same total.
      steps: ((): AgentEvent["steps"] => {
        const pages = int(r, 1, 4), news = int(r, 0, 3), profiles = int(r, 1, 5), words = int(r, 90, 180)
        const log: AgentEvent["steps"] = [
          { at: clockTime(r), text: `Read ${pages} ${pages === 1 ? "page" : "pages"} on ${co.domain} (${pages * 2} credits)`, credits: pages * 2, source: `https://${co.domain}` },
        ]
        if (news > 0) log.push({ at: clockTime(r), text: `Read ${news} news ${news === 1 ? "item" : "items"} (${news * 2} credits)`, credits: news * 2 })
        log.push({ at: clockTime(r), text: `Read ${profiles} ${profiles === 1 ? "profile" : "profiles"} (${profiles} credits)`, credits: profiles })
        log.push({ at: clockTime(r), text: "Used company context", credits: 0 })
        if (kind === "drafted" || kind === "sent") log.push({ at: clockTime(r), text: `Drafted ${words} words (${CREDITS.draft} credits)`, credits: CREDITS.draft })
        if (kind === "scored") log.push({ at: clockTime(r), text: `Fit ${int(r, 40, 96)} from industry, size and stack (${CREDITS.score} credit)`, credits: CREDITS.score })
        return log
      })(),
      undoable: !needsApproval && kind !== "paused" && kind !== "capped",
      undoneAt: null, undoneBy: null,
      skipReason: kind === "skipped" ? pick(r, ["suppressed", "unsubscribed", "region restricted", "do not call"] as const) : null,
      expiresOn: needsApproval ? shift(int(r, 1, 5)) : null,
      sourceQuote: kind === "proposed" && recipients <= 200 ? "\"Send us the paper and we will start the security review this week.\" — discovery call, 9 Sep" : null,
    }
  })

  /* ------------------------------------------------ the queue each seat opens, and the runs behind it */

  const mailboxOfUser = (name: string) => mailboxes.find((m) => m.owner === name)?.address ?? mailboxOf(name)
  const pipeStages = pipelines[0].stages.map((s) => s.name)
  const nextStage = (d: Deal): DealStage => pipeStages[Math.min(pipeStages.length - 1, pipeStages.indexOf(d.stage) + 1)]
  const draftTo = (co: Company, person: Contact, sender: string) =>
    `Subject: ${co.name} · a day a week\n\nHi ${person.name.split(" ")[0]},\n\n`
    + `You are hiring two revenue operations people, which usually means the reporting is the bottleneck rather than the headcount. `
    + `Teams your size lose about a day a week keeping the pipeline honest, and the forecast still gets rebuilt by hand on Thursdays.\n\n`
    + `We fixed that for three companies in ${co.industry.toLowerCase()} this year. Worth twenty minutes on Thursday?\n\n${sender}`

  /**
   * Every declared seat has two to five items waiting on it, and each is work that seat owns: a send
   * or an enrolment belongs to the seat that runs outbound, a proposed stage change to the person who
   * owns the deal, and a request to spend over the agent's per-run cap to whoever owns the company
   * being researched. The items are taken from the end of the log so the shaped history at the front
   * — the capped run, the big enrolment — is left alone.
   */
  const outboundSeat = seats.find((s) => s.role === "sdr") ?? seats.find((s) => s.role === "admin") ?? seats[0]
  const openForStage = deals.filter((d) => d.stage !== "Closed won" && !d.archivedAt)
  const claimedIds = new Set<string>()
  let taken = 0
  seats.forEach((seat, si) => {
    const wants = 2 + ((si * 3 + 1) % 4)
    const theirDeals = openForStage.filter((d) => d.owner === seat.user)
    const theirContacts = contacts.filter((c) => c.owner === seat.user)
    for (let k = 0; k < wants && taken < agentEvents.length; k++) {
      const e = agentEvents[agentEvents.length - 1 - taken]
      taken++
      claimedIds.add(e.id)
      const person = theirContacts[k % Math.max(1, theirContacts.length)] ?? contacts[k % contacts.length]
      const co = companies.find((x) => x.id === person.companyId) ?? companies[0]
      const seq = sequences[(si + k) % Math.max(1, sequences.length)]
      const deal = theirDeals[k % Math.max(1, theirDeals.length)]
      const isOutbound = seat.user === outboundSeat.user
      const action: "send" | "enrol" | "stage" | "spend" =
        isOutbound ? (k === wants - 1 ? "enrol" : "send") : deal ? "stage" : "spend"
      e.ownerId = seat.user
      e.actorUser = seat.user
      e.needsApproval = true
      e.decision = null
      e.decidedBy = null
      e.decidedAt = null
      e.decidedAsAdmin = false
      e.undoable = false
      e.undoneAt = null
      e.undoneBy = null
      e.skipReason = null
      e.expiresOn = shift(3 + ((si * 2 + k) % 9))
      e.contactId = person.id
      e.contact = person.name
      e.company = co.name
      e.companyId = co.id
      e.inputs = [{ label: `${co.name} website`, href: `https://${co.domain}` }, { label: "Funding announcement, August", href: "#" }, { label: `${person.name} on LinkedIn`, href: `https://${person.linkedin}` }]
      e.status = "waiting"
      e.needsSecondApproval = false
      e.approvalTier = "owner"
      e.sourceQuote = null
      e.to = null
      e.draft = null
      e.dealId = null
      e.sequence = seq?.name ?? null
      if (action === "send") {
        e.agent = "Outreach agent"
        e.kind = "drafted"
        e.summary = `Drafted a first email to ${person.name}`
        e.trigger = "A signal fired"
        e.to = person.name
        e.draft = draftTo(co, person, seat.user)
        e.credits = CREDITS.draft
        e.ifApproved = { action: "send", mailbox: mailboxOfUser(seat.user), sequence: seq?.name, sendsAt: `${shift(1)} 08:00`, recipients: 1, credits: CREDITS.draft }
      } else if (action === "enrol") {
        // One enrolment per workspace is big enough to need the admin after the owner, so the second
        // approval is something a person can actually meet rather than a rule on a settings page.
        const recipients = secondApprovalOf(business).recipients + 240 + ((si * 37) % 600)
        e.agent = "Outreach agent"
        e.kind = "proposed"
        e.summary = `Proposes enrolling ${recipients.toLocaleString()} people in "${seq?.name ?? "outbound"}"`
        e.trigger = "A list was saved"
        e.draft = draftTo(co, person, seat.user)
        e.credits = 0
        e.status = "waiting-second"
        e.needsSecondApproval = true
        e.approvalTier = "admin"
        e.ifApproved = { action: "enrol", mailbox: mailboxOfUser(seat.user), sequence: seq?.name, sendsAt: `${shift(1)} 08:00`, recipients, credits: recipients * CREDITS.draft }
      } else if (action === "stage" && deal) {
        const to = nextStage(deal)
        e.agent = "Outreach agent"
        e.kind = "proposed"
        e.summary = `Proposes moving ${deal.company} to ${to}`
        e.trigger = "A reply landed"
        e.dealId = deal.id
        e.company = deal.company
        e.companyId = deal.companyId
        e.credits = 0
        e.sourceQuote = "\"Send us the paper and we will start the security review this week.\" — discovery call, 9 Sep"
        e.ifApproved = { action: "stage", mailbox: mailboxOfUser(seat.user), stage: to, recipients: 1, credits: 0 }
      } else {
        const over = (agents.find((a) => a.id === "research")?.capPerRun ?? 25) + 8 + ((si * 11 + k) % 40)
        e.agent = "Research agent"
        e.kind = "researched"
        e.summary = `Asks to spend ${over.toLocaleString()} credits researching ${co.name}, over its per-run cap`
        e.trigger = "A list was saved"
        e.credits = 0
        e.ifApproved = { action: "spend", mailbox: mailboxOfUser(seat.user), credits: over }
      }
    }
  })

  // Everything else in the log has already been decided: an item nobody ever decides is a decision
  // nobody made, dressed up as a decision pending.
  agentEvents.forEach((e, i) => {
    if (claimedIds.has(e.id)) return
    if (e.status === "waiting" || e.status === "waiting-second") {
      e.status = i % 5 === 0 ? "declined" : "approved"
      e.decision = e.status
      e.decidedBy = e.ownerId
      e.decidedAt = shift(-1 - (i % 3))
    }
  })

  /**
   * One run per agent per day. Agents work in runs, not one item at a time, so the log is cut into
   * runs of three to five items, each run gets its own day and clock, and every item in it carries
   * the run's key — which is what the approval batch on Home is grouped by.
   */
  const RUN_CLOCKS = ["08:10", "11:25", "14:05", "16:40"]
  const runKeyOf = (agent: string, on: string) => `${agent.toLowerCase().replace(/ /g, "-")}-${on}`
  AGENT_ORDER.forEach((agentName, ai) => {
    // Newest run first, so today's run holds the items still waiting and the older days hold history.
    const mine = agentEvents.filter((e) => e.agent === agentName).reverse()
    let day = 0
    for (let at = 0; at < mine.length; day++) {
      // Three to five, and never a tail of one or two: the last run takes whatever is left over.
      const want = 3 + ((day + ai) % 3)
      const size = mine.length - at - want < 3 ? mine.length - at : want
      const on = shift(-day)
      const key = runKeyOf(agentName, on)
      const start = Date.parse(`2026-01-01T${RUN_CLOCKS[day % RUN_CLOCKS.length]}:00Z`)
      for (let k = 0; k < size && at < mine.length; k++, at++) {
        mine[at].when = on
        mine[at].at = new Date(start + k * 7 * 60_000).toISOString().slice(11, 16)
        mine[at].batchKey = key
      }
    }
  })

  // The mailbox an item sends from is the owner's, the stage it proposes is the one after the deal's
  // own, and the draft is signed by whoever is sending it. A draft signed by one person and sent from
  // another's mailbox is a consequence line that is not true.
  agentEvents.forEach((e) => {
    if (e.ifApproved) {
      e.ifApproved.mailbox = mailboxOfUser(e.ownerId)
      if (e.ifApproved.action === "stage") {
        // A stage change can only be proposed on a deal that is still open, and it moves that deal to
        // the stage after the one it is in — never to the stage it is already sitting in.
        const deal = deals.find((d) => d.id === e.dealId && d.stage !== "Closed won" && !d.archivedAt)
          ?? openForStage.find((d) => d.owner === e.ownerId)
          ?? openForStage[0]
        if (deal) {
          e.dealId = deal.id
          e.company = deal.company
          e.companyId = deal.companyId
          e.ifApproved.stage = nextStage(deal)
          e.summary = `Proposes moving ${deal.company} to ${e.ifApproved.stage}`
        }
      } else {
        e.ifApproved.stage = undefined
      }
    }
    if (e.draft) {
      const lines = e.draft.trimEnd().split("\n")
      lines[lines.length - 1] = e.ownerId
      e.draft = lines.join("\n")
    }
  })

  /* -------------------------------------------------------------------------------- workflows */

  const workflowNames: Record<Business, string[]> = {
    fathom: [], halyard: ["New CSV rows: assign and enrich"],
    meridian: ["Inbound form to an SDR", "Score crossed 80: add to the hot list", "Job change: re-prospect", "Meeting booked: create the deal", "Closed won: hand off to CS", "Reply is a referral: route it"],
    ridgeline: ["Trial day 7: lifecycle campaign", "Seats over 90%: route to the AE", "Renewal 60 days: create the deal", "Feature limit hit: notify CS", "Form submitted: enrich and route"],
  }
  const workflows: Workflow[] = workflowNames[business].slice(0, sz.workflows).map((name, i) => ({
    id: `wf-${i + 1}`, name, owner: adminUser, status: i === sz.workflows - 1 && sz.workflows > 2 ? "off" : "on",
    statusChangedBy: adminUser, statusChangedOn: dateBack(r, 40), createdOn: dateBack(r, 200), editedBy: adminUser, editedOn: dateBack(r, 14),
    folder: business === "halyard" ? "Client set-up" : null,
    trigger: ["a form is submitted", "a score crosses a threshold", "a contact changes jobs", "a meeting is booked", "a deal is updated", "an email is replied to"][i % 6],
    enrolment: [{ field: "country", op: "is one of", value: "Germany, United Kingdom, United States" }, { field: "emailStatus", op: "is", value: "Verified" }],
    rules: [
      { id: `wf-${i + 1}-r1`, condition: "Company size is 200 or more", action: "assign an owner", config: "Round-robin across the AE pool, skipping anyone away" },
      { id: `wf-${i + 1}-r2`, condition: "Always", action: "create a task", config: "Call task, due in 2 hours" },
      { id: `wf-${i + 1}-r3`, condition: "Score is over 80", action: "add to a sequence", config: sequences[0]?.name ?? "Outbound" },
      { id: `wf-${i + 1}-r4`, condition: "No owner on the matched account", action: "notify", config: `Slack #revops, ${adminUser}` },
    ],
    routing: { kind: business === "meridian" ? "round-robin" : "territory", pool: users.filter((u) => u.role === "ae" || u.role === "sdr").slice(0, 5).map((u) => u.name), weights: null, skipAway: true },
    sla: i === 0 ? { windows: { hot: "2h", warm: "1 business day" }, reassignTo: "next in the pool", notifyFirst: true, running: business === "meridian" ? 41 : int(r, 4, 20), breachedToday: business === "meridian" ? 3 : int(r, 0, 2) } : null,
    ceiling: { perDay: business === "ridgeline" && i === 4 ? 200 : int(r, 200, 4_000), perRun: 25, spentToday: business === "ridgeline" && i === 4 ? 68 : int(r, 0, 300) },
    limits: { perDay: int(r, 50, 500), reEnrol: chance(r, 0.4), maxPerPerson: 1 },
    hours: { from: "08:00", to: "18:00", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], clockPauses: true },
    suppress: ["Do not contact", "Unsubscribed", lists[lists.length - 1]?.name ?? "Suppression list"],
  }))
  const notRoutedReasons = ["everyone in the pool is away", "no owner on the matched account", "the daily enrolment limit was reached", "the credit ceiling was reached", "the mailbox the action needs is paused", "no rule matched"]
  const workflowRuns: WorkflowRun[] = many(sz.workflowRuns, (i) => {
    const wf = workflows[i % Math.max(1, workflows.length)]
    const notRouted = business === "meridian" ? i % 17 === 3 : business === "ridgeline" ? i % 45 === 7 : i % 11 === 2
    const errored = business === "ridgeline" && i % 22 === 5
    const c = contacts[(i * 3) % contacts.length]
    return {
      id: `wfr-${i + 1}`, workflowId: wf?.id ?? "wf-1", at: `${dateBack(r, 14)} ${clockTime(r)}`, personId: c.id, person: c.name,
      outcome: errored ? "errored" : notRouted ? "not-routed" : "enrolled",
      ruleId: notRouted ? null : `${wf?.id ?? "wf-1"}-r1`, reason: notRouted ? pick(r, notRoutedReasons) : errored ? "the enrichment provider timed out" : null,
      createdTaskId: notRouted || errored ? null : tasks[i % tasks.length].id, assignedTo: notRouted || errored ? null : owners[i % owners.length],
      credits: notRouted ? 0 : int(r, 0, 9),
    }
  })
  const workflowEdits: WorkflowEdit[] = workflows.flatMap((w) => many(int(r, 2, 5), (i) => ({
    id: `${w.id}-e${i + 1}`, workflowId: w.id, at: dateBack(r, 90), by: adminUser,
    what: pick(r, ["Added the round-robin pool", "Raised the daily ceiling to 400 credits", "Turned the SLA clock on", "Added a suppression list", "Changed the trigger to a form submission"]),
  })))

  /* ------------------------------------------------------------------------- integrations */

  const crmKind = sz.crm
  const crmObjects = crmKind === "Salesforce" ? ["Contact", "Account", "Opportunity", "Task"] : ["Contact", "Company", "Deal", "Engagement"]
  const crmFieldNames = ["Id", "Name", "Email", "Phone", "Title", "Owner", "Stage", "Amount", "Close Date", "Industry", "Employees", "Website", "Created Date", "Last Modified", "Lead Source", "Description", "Type", "Probability", "Next Step", "Region"]
  const crmFields: CrmField[] = crmKind ? crmObjects.flatMap((object) => crmFieldNames.map((name, i) => ({
    object, name, kind: name.includes("Date") ? "date" : name === "Amount" || name === "Employees" || name === "Probability" ? "number" : name === "Stage" || name === "Type" || name === "Lead Source" || name === "Region" ? "picklist" : "text",
    required: name === "Name" || (object === "Opportunity" && (name === "Stage" || name === "Close Date")),
    values: name === "Stage" ? [...DEAL_STAGES] : name === "Lead Source" ? ["Web", "Outbound", "Event", "Partner"] : name === "Region" ? ["EMEA", "AMER", "APAC"] : [],
  })).filter((_, i) => i < 20)) : []

  const intDefs: { kind: string; name: string; env: string | null }[] =
    business === "meridian" ? [{ kind: "Salesforce", name: "Salesforce production", env: "production" }, { kind: "Google Calendar", name: "Google Calendar", env: null }, { kind: "Slack", name: "Slack", env: null }, { kind: "Northlight Data", name: "Northlight Data", env: null }, { kind: "Webhook", name: "Warehouse export", env: null }]
      : business === "fathom" ? [{ kind: "Google Calendar", name: "Google Calendar", env: null }, { kind: "Northlight Data", name: "Northlight Data", env: null }]
        : business === "halyard" ? [{ kind: "Google Workspace", name: "Google Workspace mail", env: null }, { kind: "HubSpot", name: "HubSpot · Kestrel Health", env: null }]
          : [{ kind: "HubSpot", name: "HubSpot", env: null }, { kind: "Google Calendar", name: "Google Calendar", env: null }, { kind: "Slack", name: "Slack", env: null }, { kind: "Northlight Data", name: "Northlight Data", env: null }]
  const integrations: Integration[] = intDefs.map((d, i) => {
    const isCrm = d.kind === "Salesforce" || d.kind === "HubSpot"
    const errorsToday = isCrm ? (business === "meridian" ? 3 : business === "halyard" ? 1 : 0) : 0
    return {
      id: `int-${i + 1}`, kind: d.kind, name: d.name, environment: d.env,
      status: errorsToday > 0 ? "needs attention" : "syncing",
      auth: { user: adminUser, validUntil: shift(int(r, 40, 300)) },
      objects: isCrm ? [{ object: "Contacts", direction: "both" }, { object: "Companies", direction: "both" }, { object: "Deals", direction: business === "fathom" ? "off" : "both" }, { object: "Activities", direction: "push" }] : [],
      mappings: isCrm ? [{ ollopa: "email", remote: "Email", direction: "both", writeRule: "Ollopa wins on conflict" }, { ollopa: "title", remote: "Title", direction: "both", writeRule: "Never overwrite a non-empty value" }, { ollopa: "stage", remote: "Stage", direction: "push", writeRule: "Ollopa wins on conflict" }, { ollopa: "amount", remote: "Amount", direction: "both", writeRule: "The CRM wins on conflict" }] : [],
      stageMap: isCrm ? DEAL_STAGES.map((s) => ({ ollopa: s, remote: s === "Closed won" ? "Closed Won" : s })) : [],
      rules: { pullWhen: "Owner is a user in this workspace", pushWhen: "Email status is Verified", pushUnverified: false, sourceValue: "Ollopa", onDelete: "Keep the record and mark it out of sync", onMerge: "Keep the oldest record", matchKey: "Email, then CRM id" },
      remoteCounts: { Contacts: b.counts.contacts + int(r, 200, 4_000), Companies: b.counts.companies + int(r, 50, 900), Deals: b.counts.openDeals + int(r, 20, 300) },
      lastSync: `${TODAY} ${clockTime(r)}`, nextSync: `${TODAY} ${clockTime(r)}`,
      recordsToday: isCrm ? int(r, 200, 1_400) : int(r, 0, 90), errorsToday, pausedBy: null,
      pollMinutes: isCrm ? 15 : 60, errorDigest: "daily",
      calendars: d.kind.includes("Calendar") ? users.slice(0, 3).map((u) => `${u.name} · primary`) : [],
      channels: d.kind === "Slack" ? [{ event: "A reply lands", channel: "#revenue" }, { event: "A deal reaches Closed won", channel: "#wins" }, { event: "A sync error", channel: "#revops" }] : [],
      enrichment: d.kind.includes("Northlight") ? { key: "nl_live_••••4821", fields: ["Email", "Mobile", "Job title", "Company size"], order: providerOrder } : null,
      webhook: d.kind === "Webhook" ? { url: "https://warehouse.meridian.io/hooks/ollopa", secretSetOn: dateBack(r, 120), events: ["deal.updated", "contact.created"], lastTest: dateBack(r, 12) } : null,
      creditsThisCycle: d.kind.includes("Northlight") ? Math.round(burn * 0.5) : 0,
    }
  })
  const errorMessages: [string, string][] = [
    ["Stage value Negotiation is not in the CRM picklist", "Add the value in the CRM, or map it to an existing one"],
    ["Required field Industry is empty", "Fill the field in Ollopa, or make it optional in the CRM"],
    ["Field Amount is read-only for the integration user", "Give the integration user edit rights on Amount"],
    ["Duplicate email: two CRM records match", "Merge the CRM records, or change the matching key"],
  ]
  const integrationErrors: IntegrationError[] = many(business === "meridian" ? 12 : business === "halyard" ? 6 : business === "ridgeline" ? 2 : 0, (i) => {
    const m = errorMessages[i % errorMessages.length]
    return {
      id: `interr-${i + 1}`, integrationId: integrations.find((x) => x.kind === crmKind)?.id ?? integrations[0].id,
      at: `${dateBack(r, 5)} ${clockTime(r)}`, object: pick(r, crmObjects.length ? crmObjects : ["Contact"]),
      record: contacts[i % contacts.length].name, direction: chance(r, 0.6) ? "push" : "pull",
      message: m[0], fix: m[1], attempts: int(r, 1, 6), groupKey: m[0],
    }
  })
  const syncRuns: SyncRun[] = many(crmKind ? 30 : 0, (i) => ({
    id: `sync-${i + 1}`, integrationId: integrations.find((x) => x.kind === crmKind)?.id ?? integrations[0].id,
    started: `${dateBack(r, 7)} ${clockTime(r)}`, object: pick(r, crmObjects), direction: chance(r, 0.5) ? "pull" : "push",
    pulled: int(r, 0, 400), pushed: int(r, 0, 400), failed: chance(r, 0.2) ? int(r, 1, 5) : 0,
  }))
  const setupDrafts: SetupDraft[] = business === "meridian"
    ? [{ id: "draft-1", kind: "Microsoft 365 Calendar", step: 2, of: 3, answers: { account: "daniel@meridian.io", calendars: "primary" }, savedOn: dateBack(r, 4), startedBy: adminUser }] : []
  const syncErrors: SyncErrorRow[] = many(sz.syncErrors, (i) => ({
    id: `serr-${i + 1}`, integration: crmKind ?? "Google Workspace", at: `${dateBack(r, 2)} ${clockTime(r)}`,
    count: int(r, 1, 18), message: errorMessages[i % errorMessages.length][0],
  }))

  /* --------------------------------------------- the developer surfaces: keys, hooks, MCP, CLI */

  const apiKeys: ApiKey[] = many(sz.apiKeys, (i) => ({
    id: `key-${i + 1}`, name: ["Warehouse sync", "Nightly enrichment"][i] ?? `Key ${i + 1}`,
    createdOn: dateBack(r, 200), createdBy: adminUser, lastUsedAt: `${dateBack(r, 2)} ${clockTime(r)}`,
    scopes: i === 0 ? ["people:read", "companies:read", "deals:read"] : ["people:read", "people:write", "enrich:run"],
    expiresOn: shift(int(r, 60, 400)), revokedOn: null,
    creditsThisCycle: Math.round(credits.bySurface.api * (i === 0 ? 0.3 : 0.7)), alertAt: 0.8, alertOwner: adminUser,
    jobs: enrichmentJobs.filter((j) => j.keyId === "key-1").map((j) => j.id),
  }))
  const webhooks: Webhook[] = many(sz.webhooks, (i) => ({
    id: `hook-${i + 1}`, url: `https://hooks.${wsDomain}/ollopa/${i + 1}`,
    events: i === 0 ? ["deal.updated", "contact.created"] : ["form.submitted"],
    secretSetOn: dateBack(r, 90), state: business === "ridgeline" && i === 1 ? "failing" : "delivering",
    failingSince: business === "ridgeline" && i === 1 ? dateBack(r, 2) : null, lastDeliveryAt: `${dateBack(r, 1)} ${clockTime(r)}`,
  }))
  const webhookDeliveries: WebhookDelivery[] = many(business === "ridgeline" ? 40 : webhooks.length ? 12 : 0, (i) => {
    const failing = business === "ridgeline" && i >= 22
    return {
      id: `del-${i + 1}`, webhookId: webhooks[failing ? 1 : 0]?.id ?? "hook-1", at: `${dateBack(r, 3)} ${clockTime(r)}`,
      event: failing ? "form.submitted" : pick(r, ["deal.updated", "contact.created"]), recordId: deals[i % deals.length].id,
      attemptNumber: failing ? int(r, 1, 5) : 1, status: failing ? "failed" : "delivered",
      cause: failing ? "handler returned 500" : null,
    }
  })
  const mcpTokens: McpToken[] = many(sz.mcpTokens, (i) => {
    const u = users[i % users.length]
    return {
      id: `mcp-${i + 1}`, userId: u.id, user: u.name,
      tier: business === "fathom" ? "read" : i === 0 ? "write_safe" : "read",
      actions: { "search people": "allow", "read a deal": "allow", "update a field": i === 0 ? "approve" : "block", "enrol in a sequence": "approve", "delete a record": "block" },
      client: pick(r, ["Claude", "Claude Code", "Cursor"]), authorisedOn: dateBack(r, 90),
      lastUsedAt: chance(r, 0.8) ? `${dateBack(r, 4)} ${clockTime(r)}` : null,
      requestedTier: business === "fathom" && i === 0 ? "write_safe" : null,
    }
  })
  const cliDevices: CliDevice[] = many(sz.cliDevices, (i) => {
    const u = users[i % users.length]
    return { id: `cli-${i + 1}`, userId: u.id, user: u.name, label: pick(r, ["MacBook Pro 16", "Ops laptop", "Build server"]), workspace: business === "halyard" ? pick(r, ["Kestrel Health", "Orchard Payments"]) : b.name, authorisedOn: dateBack(r, 120), lastUsedAt: `${dateBack(r, 3)} ${clockTime(r)}` }
  })

  /* --------------------------------------------------------- the admin's queue: intake requests */

  // What each change would touch, written from what the change is about: a request that says it
  // touches the same two things as every other request tells the admin nothing.
  const changeRequests: [string, Request["origin"], string, Request["touches"]][] = [
    ["See which deals lost a required field at Proposal", "report", "Asked from the Pipeline report",
      [{ kind: "report", id: "report-pipeline", name: "Pipeline report" }, { kind: "stage", id: "stage-proposal", name: "Proposal" }]],
    ["Add a Renewal type field on the deal", "field or stage", "Trying to record auto versus negotiated renewals",
      [{ kind: "field", id: "field-renewal-type", name: "Renewal type" }]],
    ["Let the AE team edit the close date after Proposal", "permission", "Blocked on the deal record",
      [{ kind: "profile", id: "prof-ae", name: "Account executive" }, { kind: "field", id: "field-close-date", name: "Close date" }]],
    ["Route inbound from Germany to the DACH pod", "routing", "A routing exception on the form workflow",
      [{ kind: "workflow", id: "wf-1", name: "Inbound form to an SDR" }]],
    ["Add a stage between Discovery and Proposal", "field or stage", "Asked on the deals board",
      [{ kind: "stage", id: "stage-discovery", name: "Discovery" }, { kind: "stage", id: "stage-proposal", name: "Proposal" }, { kind: "report", id: "report-forecast", name: "Forecast" }]],
    ["Give marketing read access to Accounts", "no-access page", "Landed on the no-access page for Accounts",
      [{ kind: "profile", id: "prof-marketing", name: "Marketing" }]],
    ["A weekly export of closed-won deals by rep", "report", "Asked from the Forecast tab",
      [{ kind: "report", id: "report-forecast", name: "Forecast" }, { kind: "plan feature", id: "plan.reports", name: "The scheduled weekly email" }]],
    ["Stop the bounce guard pausing the client sequence", "locked control", "Trying to change the threshold on Email sending",
      [{ kind: "plan feature", id: "plan.bounce-guard", name: "Bounce guard thresholds" }]],
    ["Make Economic buyer required at Negotiation", "field or stage", "Asked in the deal review",
      [{ kind: "field", id: "field-economic-buyer", name: "Economic buyer" }, { kind: "stage", id: "stage-negotiation", name: "Negotiation" }]],
    ["Add a second mailbox", "locked control", "Trying to add a second mailbox on the Email sending page",
      [{ kind: "plan feature", id: "plan.mailboxes", name: "A second mailbox per user" }]],
    ["Turn territories on", "locked control", "Trying to open Territories in Prospecting rules",
      [{ kind: "plan feature", id: "plan.territories", name: "Territories" }]],
  ]
  const upgradeFeatures: [string, string, number][] = [["A second mailbox per user", "Growth", 237], ["Territories", "Growth", 237], ["Two-way CRM sync", "Growth", 1_975], ["Custom objects in the CRM sync", "Scale", 3_225]]
  const requests: Request[] = many(sz.requests, (i) => {
    const isUpgrade = business === "fathom" ? true : business === "halyard" ? i >= 11 : business === "ridgeline" ? i === 3 : false
    const c = changeRequests[i % changeRequests.length]
    const up = upgradeFeatures[i % upgradeFeatures.length]
    const requester = users[(i + 1) % users.length]
    const state: Request["state"] = i % 7 === 0 ? "captured" : i % 7 === 1 ? "investigating" : i % 7 === 2 ? "approved" : i % 7 === 3 ? "shipped" : i % 7 === 4 ? "verified" : i % 7 === 5 ? "declined" : "investigating"
    const raisedOn = shift(-int(r, 1, 9))
    return {
      id: `req-${i + 1}`, kind: isUpgrade ? "upgrade" : "change",
      outcome: isUpgrade ? `Unlock ${up[0].toLowerCase()}` : c[0],
      reason: pick(r, ["new information", "an approved decision", "a defect in the current result"] as const),
      reasonText: isUpgrade ? "Two of us share one mailbox and the daily limit stops the second sequence." : "The current report cannot answer the question the board asked on Monday.",
      requester: { user: business === "fathom" ? sdrUser : requester.name, seat: business === "fathom" ? "SDR" : requester.title, at: `${raisedOn} ${clockTime(r)}` },
      origin: isUpgrade ? "locked control" : c[1], originLabel: isUpgrade ? (i === 0 ? "Trying to add a second mailbox on the Email sending page" : "Trying to open Territories in Prospecting rules") : c[2],
      evidence: [{ kind: "record", id: deals[i % deals.length].id, label: deals[i % deals.length].name }, { kind: "view", id: lists[i % lists.length]?.id ?? "list-1", label: lists[i % lists.length]?.name ?? "A saved view" }],
      decisionOwner: adminUser, state, raisedOn,
      approvals: state === "captured" ? {} : { investigate: { by: adminUser, on: shift(-int(r, 1, 5)) }, ...(state === "approved" || state === "shipped" || state === "verified" ? { implement: { by: adminUser, on: shift(-int(r, 1, 3)) } } : {}) },
      declined: state === "declined" ? { by: adminUser, on: shift(-1), reason: "The same answer is already on the Pipeline report; the column was hidden, not missing." } : null,
      estimate: state === "captured" ? null : "Half a day: one field, one report column, one line in the announcement.",
      baseline: "Today the stage gate checks nothing and the report counts every deal.",
      touches: isUpgrade ? [{ kind: "plan feature", id: "plan.mailboxes", name: up[0] }] : c[3],
      affected: { count: int(r, 4, 34), how: "everyone on a seat that edits deals" },
      scope: { kind: i % 3 === 0 ? "everyone" : "team", name: i % 3 === 0 ? undefined : teams[0]?.name ?? "Sales" },
      scopeHistory: [{ at: shift(-2), to: "Widened from AE East to everyone who edits deals" }],
      rollback: "Remove the field; values are kept 30 days.",
      shippedOn: state === "shipped" || state === "verified" ? shift(-int(r, 1, 3)) : null,
      shippedBy: state === "shipped" || state === "verified" ? adminUser : null,
      announcement: state === "shipped" || state === "verified" ? { text: "Deals now carry a Renewal type. It is required at Negotiation from Monday.", writtenOn: shift(-2), expiresOn: shift(12) } : null,
      verify: state === "verified" ? { used: 19, of: 34, since: shift(-9) } : null,
      notes: many(int(r, 1, 3), (k) => ({ by: k === 0 ? adminUser : requester.name, at: shift(-int(r, 1, 6)), text: pick(r, ["Can you show me the deal where this failed?", "Two other people asked for this in the same week.", "This changes what the forecast counts, so it needs the sales manager's word."]) })),
      test: state === "verified" ? { what: "Moved a test deal to Negotiation with the field empty", on: shift(-2), by: adminUser, result: "Blocked, with the field named" } : null,
      history: many(int(r, 2, 5), (k) => ({ at: shift(-int(r, 1, 8)), by: adminUser, what: ["Captured", "Estimated", "Approved to investigate", "Approved to implement", "Shipped"][k % 5] })),
      relatedTo: i > 0 && chance(r, 0.2) ? `req-${i}` : null,
      upgrade: isUpgrade ? { feature: up[0], plan: up[1], monthlyTotal: up[2], newTotalForPeriod: up[2] + b.plan.seats * b.plan.pricePerSeat, alternative: "Share the existing mailbox and lower the daily cap", alsoAskedBy: [] } : null,
    }
  })

  /* ---------------------------------------------------------- the shape of the records: fields */

  const fieldDefs: [FieldDef["object"], string, FieldDef["kind"], string[], string][] = business === "meridian"
    ? [["deal", "Use case", "picklist", ["Outbound", "Pipeline hygiene", "Forecasting"], "Commercial"], ["deal", "Legal review", "picklist", ["Not started", "In review", "Approved"], "Legal"], ["deal", "Security review", "picklist", ["Not started", "In review", "Approved"], "Legal"], ["deal", "Procurement portal", "checkbox", [], "Commercial"], ["deal", "Region", "picklist", ["EMEA", "AMER", "APAC"], "Commercial"], ["company", "Tier", "picklist", ["Tier 1", "Tier 2", "Tier 3"], "Account"], ["company", "Region", "picklist", ["EMEA", "AMER", "APAC"], "Account"], ["person", "Buying role", "picklist", ["Champion", "User", "Blocker", "Unknown"], "Person"], ["person", "Segment", "picklist", ["Enterprise", "Mid-market"], "Person"], ["deal", "Competitor", "text", [], "Commercial"], ["deal", "Contract term", "picklist", ["12 months", "24 months", "36 months"], "Commercial"], ["company", "Parent account", "text", [], "Account"], ["person", "Preferred channel", "picklist", ["Email", "Phone", "LinkedIn"], "Person"], ["deal", "Pilot end date", "date", [], "Commercial"]]
    : business === "halyard"
      ? [["deal", "Hand-off status", "picklist", ["Booked", "Handed off", "Client accepted", "Client rejected"], "Client hand-off"], ["deal", "Meeting date", "date", [], "Client hand-off"], ["deal", "Client feedback", "multi-line", [], "Client hand-off"], ["company", "Client", "picklist", ["Kestrel Health", "Orchard Payments", "Tidewater Energy"], "Account"], ["person", "Client list", "text", [], "Person"], ["person", "Source file", "text", [], "Person"]]
      : business === "ridgeline"
        ? [["deal", "Plan tier", "picklist", ["Starter", "Growth", "Scale"], "Plan"], ["deal", "Seats", "number", [], "Plan"], ["deal", "Renewal type", "picklist", ["Auto", "Negotiated"], "Plan"], ["deal", "Usage score", "number", [], "Plan"], ["company", "Plan tier", "picklist", ["Starter", "Growth", "Scale"], "Account"], ["company", "First value confirmed", "date", [], "Account"], ["person", "In-product role", "picklist", ["Admin", "Member", "Viewer"], "Person"], ["person", "Invited by", "text", [], "Person"], ["deal", "Expansion trigger", "text", [], "Plan"]]
        : [["deal", "Pilot", "checkbox", [], "Commercial"], ["person", "Warm intro from", "text", [], "Person"], ["company", "Investor", "text", [], "Account"]]
  const fields: FieldDef[] = fieldDefs.map((f, i) => ({
    id: `field-${i + 1}`, object: f[0], label: f[1], kind: f[2], values: f[3],
    requiredAtStage: f[1] === "Use case" ? "Proposal" : null,
    crmField: crmKind ? f[1].replace(/ /g, "_") + "__c" : null, group: f[4], retired: false,
  }))

  /* --------------------------------------------------------------------- notes, briefs, comments */

  const notes: Note[] = many(business === "meridian" ? 30 : 16, (i) => {
    const d = deals[i % deals.length]
    const isComment = i % 3 === 0
    return {
      id: `note-${i + 1}`, kind: isComment ? "comment" : "note", briefKind: null,
      body: isComment ? pick(r, ["Why is this still Commit with no next step?", "Bring this one to the review on Thursday.", "Who is the economic buyer here — is that confirmed or assumed?"]) : pick(r, ["They asked for the security summary before procurement opens.", "Two buying centres: operations signs, security can block.", "Budget lands in October; re-date if it slips again."]),
      author: isComment ? (managerUser ?? adminUser) : d.owner, generatedBy: null, at: `${dateBack(r, 30)} ${clockTime(r)}`,
      to: isComment ? d.owner : null, mentions: isComment ? [d.owner] : [], answered: isComment ? chance(r, 0.5) : true,
      about: { kind: "deal", id: d.id, label: d.name }, visibility: "everyone",
    }
  })
  const briefs: Note[] = many(business === "meridian" ? 12 : 6, (i) => {
    const m = meetings[i % Math.max(1, meetings.length)]
    const a = accounts[i % Math.max(1, accounts.length)]
    const kind: Note["briefKind"] = i % 3 === 0 ? "account" : i % 3 === 1 ? "meeting" : "handoff"
    return {
      id: `brief-${i + 1}`, kind: "brief", briefKind: kind,
      body: kind === "meeting"
        ? `Who is coming: ${m?.attendees.join(", ") ?? "—"}. Open objections: the two-way sync overwrote their data at a previous vendor. What we promised: a field map reviewed by their admin. Gaps: no economic buyer named.`
        : kind === "account"
          ? `${a?.name ?? "The account"} is at ${a?.health ?? 0} and ${a?.band ?? "Watch"}. Usage is ${a?.usageDelta30 ?? 0}% over 30 days, ${a?.seatsActive ?? 0} of ${a?.seatsBought ?? 0} seats active, renewal ${a?.renewal ?? "—"}.`
          : "Why they bought, what was promised, who signed, who will use it, the risks, who was against it, and the deadline and why it matters.",
      author: kind === "handoff" ? aeUser : "Research agent", generatedBy: kind === "handoff" ? "Research agent (draft, edited by the AE)" : "Research agent",
      at: `${dateBack(r, 14)} ${clockTime(r)}`, to: kind === "handoff" ? csUser : null, mentions: [], answered: true,
      about: kind === "meeting" && m ? { kind: "meeting", id: m.id, label: `${m.contact} · ${m.company}` } : { kind: "company", id: a?.companyId ?? companies[0].id, label: a?.name ?? companies[0].name },
      visibility: "everyone",
    }
  })

  /* ------------------------------------------------------- the workspace, the plan and the bills */

  const leftOut: Workspace["leftOut"] = sz.profile === "Founder-led outbound"
    ? [{ page: "inbox", why: "Founders read replies in their own mailbox until there are enough to work in one place", signals: 7, signalKind: "first reply" }, { page: "campaigns", why: "No marketer seat", signals: 0, signalKind: "first audience or campaign" }, { page: "accounts", why: "No customers yet", signals: 0, signalKind: "first deal reaching Closed won" }, { page: "reports", why: "Too little data to report on", signals: 2, signalKind: "first full week over ten sends" }, { page: "requests", why: "Everyone is an admin", signals: 0, signalKind: "second upgrade request in a week" }, { page: "workflows", why: "Nothing to automate yet", signals: 0, signalKind: "first routing exception" }]
    : sz.profile === "Agency"
      ? [{ page: "campaigns", why: "Clients run their own marketing", signals: 0, signalKind: "first audience or campaign" }, { page: "accounts", why: "The agency does not own the customer relationship", signals: 0, signalKind: "first deal reaching Closed won" }, { page: "workflows", why: "Client set-up is repeated by hand", signals: 1, signalKind: "first routing exception" }]
      : sz.profile === "Product-led growth"
        ? [{ page: "sequences", why: "Almost no cold outreach", signals: 0, signalKind: "first sequence built" }, { page: "lists", why: "Segments live with the campaigns", signals: 0, signalKind: "first saved list" }]
        : []
  const invoices: Invoice[] = many(sz.invoices, (i) => {
    const monthly = b.plan.seats * b.plan.pricePerSeat
    return {
      id: `inv-${i + 1}`, number: `OLL-2026-${String(1_000 + i)}`, period: shift(-30 * (i + 1)).slice(0, 7),
      amount: b.plan.billing === "annual" && i === 0 ? monthly * 12 : monthly, currency: sz.currency,
      status: i === 0 ? "due" : "paid", issuedOn: shift(-30 * (i + 1)), paidOn: i === 0 ? null : shift(-30 * (i + 1) + 4),
    }
  })
  const workspace: Workspace = {
    name: business === "halyard" ? "Kestrel Health (client)" : b.name, logoInitials: b.name.split(" ").map((w) => w[0]).join("").slice(0, 2),
    timezone: sz.timezone, currency: sz.currency, language: "English",
    profile: sz.profile,
    firstJob: sz.profile === "Founder-led outbound" ? "Find and email people myself" : sz.profile === "Agency" ? "Run outbound for other companies" : sz.profile === "Product-led growth" ? "Keep and grow the customers we have" : "Run a team with separate roles",
    people: b.size, seats: seats.map((s) => s.role), declaredBy: adminUser, declaredAt: dateBack(r, 260),
    leftOut, exposure: business === "fathom" ? { page: "inbox", started: shift(-4), ends: shift(10), state: "showing" } : null,
    plan: { name: b.plan.name, seats: b.plan.seats, pricePerSeat: b.plan.pricePerSeat, monthlyTotal: b.plan.seats * b.plan.pricePerSeat, billing: b.plan.billing, renews: b.plan.renews },
    taxId: business === "meridian" ? "DE 812 345 678" : business === "halyard" ? "GB 123 4567 89" : null,
    crm: sz.crm,
    // What set-up still owes this workspace. Fathom's second founder and its SDR were invited and
    // never accepted, so the set-up door reads "mailbox, invites (2)" rather than one line.
    setupRemaining: business === "fathom"
      ? ["Set up DMARC on fathomlabs.com", "2 invitations are not accepted"]
      : business === "halyard" ? ["Connect the CRM for two client workspaces"] : [],
    modelTraining: "off", answerTarget: { businessDays: 2 }, retention: { declinedDays: 365 },
    waterfall: { stopAtFirstVerified: true, ceilingPerRow: 12, order: providerOrder },
  }

  /* ------------------------------------------- what the shell, Home and Reports read at a glance */

  const guardState: WorkspaceHealth["bounceGuard"] = sz.bounce.rate >= BOUNCE_GUARD.pausePercent ? "paused" : sz.bounce.rate >= BOUNCE_GUARD.warnPercent ? "warning" : "ok"
  const workspaceHealth: WorkspaceHealth = {
    bounceRate: sz.bounce.rate, bounceVolume: sz.bounce.volume, bounceGuard: guardState,
    syncErrors: sz.syncErrors, mailboxesNearLimit: mailboxes.filter((m) => m.sentToday > m.dailyLimit * 0.9).length,
    invitesPending: users.filter((u) => u.status === "invited").length, setupRemaining: workspace.setupRemaining,
  }
  const notifications: Notification[] = [
    ...replies.filter((x) => x.outcome === "Interested" || x.outcome === "Question").slice(0, 16).map((x, i) => ({
      id: `n-r${i + 1}`, kind: "reply" as const, when: `${x.received} ${clockTime(r)}`, title: `${x.contact} replied: ${x.outcome}`,
      detail: x.snippet, target: `#/ollopa/inbox`, unread: i < 5, groupKey: x.sequence, interrupting: false,
    })),
    ...meetings.filter((m) => m.state === "booked").slice(0, 6).map((m, i) => ({
      id: `n-m${i + 1}`, kind: "meeting" as const, when: m.at, title: `Meeting booked with ${m.contact}`,
      detail: `${m.company} · ${m.durationMin} minutes`, target: "#/ollopa/tasks", unread: i < 2, groupKey: m.at.slice(0, 10), interrupting: false,
    })),
    ...agentEvents.filter((e) => e.needsApproval).slice(0, 14).map((e, i) => ({
      id: `n-a${i + 1}`, kind: "approval" as const, when: `${e.when} ${e.at}`, title: e.summary,
      detail: e.ifApproved ? `${e.ifApproved.action === "send" ? "Sends 1 email" : e.ifApproved.action === "enrol" ? `Enrols ${e.ifApproved.recipients} people` : "Changes the stage"} · ${e.ifApproved.credits} credits` : e.detail,
      target: "#/ollopa/agents", unread: true, groupKey: e.agent, interrupting: e.needsSecondApproval,
    })),
    ...(outbound ? [{
      id: "n-bg1", kind: "bounce-guard" as const, when: `${shift(-2)} 09:12`, title: `Bounce rate 4.3% on ${sequences[0]?.name ?? "a sequence"}`,
      detail: `Warns at ${BOUNCE_GUARD.warnPercent}%, pauses at ${BOUNCE_GUARD.pausePercent}%.`, target: "#/ollopa/sequences", unread: true, groupKey: sequences[0]?.name ?? "sequence", interrupting: true,
    }] : []),
    ...(mailboxes.some((m) => m.paused) ? [{
      id: "n-bg2", kind: "bounce-guard" as const, when: `${shift(-1)} 11:40`, title: "A mailbox was paused at 6.2%",
      detail: `The pause threshold is ${BOUNCE_GUARD.pausePercent}%. Sending from it has stopped.`, target: "#/ollopa/settings", unread: true, groupKey: "mailbox", interrupting: true,
    }] : []),
    ...syncErrors.map((e, i) => ({
      id: `n-s${i + 1}`, kind: "sync-error" as const, when: e.at, title: `${e.integration}: ${e.count} records did not sync`,
      detail: e.message, target: "#/ollopa/settings", unread: i === 0, groupKey: e.integration, interrupting: false,
    })),
    ...(b.credits.balance / (b.credits.burnPerWeek || 1) < 2 ? [{
      id: "n-c1", kind: "credits-low" as const, when: `${shift(-1)} 07:00`, title: "Credits run out in about 12 days",
      detail: `${b.credits.balance.toLocaleString()} left, ${b.credits.burnPerWeek.toLocaleString()} a week.`, target: "#/ollopa/settings", unread: true, groupKey: "credits", interrupting: true,
    }] : []),
  ]

  const activity: UserActivity[] = users.map((u) => ({
    user: u.name,
    sentThisWeek: u.role === "sdr" ? int(r, 120, 260) : u.role === "ae" ? int(r, 30, 90) : int(r, 0, 40),
    callsThisWeek: u.role === "sdr" ? int(r, 40, 120) : u.role === "ae" ? int(r, 5, 30) : 0,
    meetingsBooked: u.role === "sdr" ? int(r, 1, 9) : u.role === "ae" ? int(r, 2, 12) : int(r, 0, 3),
    tasksDone: int(r, 10, 90),
  }))
  const activityEvents: ActivityEvent[] = []
  users.forEach((u, ui) => {
    for (let w = 0; w < 13; w++) {
      const n = u.role === "sdr" ? int(r, 16, 28) : u.role === "ae" ? int(r, 10, 20) : int(r, 4, 12)
      for (let k = 0; k < n; k++) {
        const c = contacts[(ui * 17 + w * 7 + k) % contacts.length]
        activityEvents.push({
          id: `ae-${ui}-${w}-${k}`, kind: pick(r, ["email", "email", "email", "call", "task", "meeting"] as const),
          user: u.name, contactId: c.id, company: c.company, date: shift(-(w * 7 + int(r, 0, 6))),
        })
      }
    }
  })

  /**
   * A target per rep for the quarter being forecast and the two before it, so a report's period
   * selector has a denominator in every position. The number is the size of the book: what that rep
   * holds in Commit and Closed for the period, over the share of it they are actually at — which puts
   * attainment between 40% and 130%, the range a quota is set in.
   */
  const periods = [quarterOf(TODAY), quarterBack(quarterOf(TODAY), 1), quarterBack(quarterOf(TODAY), 2)]
  const countsTowardsGoal = (d: Deal) => d.forecast === "Commit" || d.forecast === "Closed"
  const aeUsers = users.filter((u) => deals.some((d) => d.owner === u.name && !d.archivedAt))
  const goals: Goal[] = []
  periods.forEach((period, p) => {
    const win = quarterWindow(period)
    aeUsers.forEach((u, i) => {
      const book = deals
        .filter((d) => d.owner === u.name && !d.archivedAt && d.closeDate >= win.from && d.closeDate <= win.to && countsTowardsGoal(d))
        .reduce((s, d) => s + d.amount, 0)
      // A rep with nothing in Commit or Closed for a quarter was not carrying a number for it, so no
      // target is written: a target with no book behind it reads as 0% and means nothing.
      if (book === 0) return
      const attainment = 0.4 + (((i * 7 + p * 3) % 10) / 10) * 0.9
      goals.push({
        id: `goal-u${p + 1}-${i + 1}`, period, user: u.name, team: null,
        amount: Math.max(5_000, Math.round(book / attainment / 5_000) * 5_000),
      })
    })
    teams.forEach((t, i) => {
      const members = users.filter((x) => x.team === t.name).map((x) => x.name)
      const total = goals.filter((g) => g.period === period && g.user && members.includes(g.user)).reduce((s, g) => s + g.amount, 0)
      goals.push({ id: `goal-t${p + 1}-${i + 1}`, period, user: null, team: t.name, amount: total || 1_200_000 })
    })
  })
  const submittedPeriods = [...periods].reverse()
  const forecastSubmissions: ForecastSubmission[] = aeUsers.flatMap((u, ui) =>
    submittedPeriods.map((p, i) => ({
      id: `fs-${ui}-${i}`, period: p, user: u.name, amount: int(r, 120_000, 420_000),
      split: { Commit: int(r, 80_000, 260_000), "Best case": int(r, 40_000, 180_000), Pipeline: int(r, 100_000, 600_000), Omitted: int(r, 0, 60_000) },
      note: pick(r, ["Two deals slipped a week; the rest is unchanged.", "Commit is down one deal: their security review moved.", "Holding the number; the biggest deal signs on Friday."]),
      submittedAt: `${shift(-90 + i * 30)} 15:40`, actual: i === submittedPeriods.length - 1 ? null : int(r, 100_000, 400_000),
    })))
  const forecastPredictions: ForecastPrediction[] = aeUsers.map((u) => ({
    period: periods[0], user: u.name, amount: int(r, 140_000, 380_000),
    drivers: deals.filter((d) => d.owner === u.name).slice(0, 3).map((d) => d.id),
  }))

  const seed: Seed = {
    contacts, companies, accounts, lists, savedViews,
    sequences, sequenceSteps, enrollments, sequenceChanges, schedules, rulesets, templates, snippets,
    replies, savedReplies, tasks, calls, coachingNotes, meetings,
    deals, dealContacts, dealActivities, dealFiles, qualEvidence, stageHistory, pipelines, fields,
    campaigns, audiences, forms, personas, signals, scoreModels,
    enrichmentJobs, importDrafts, importMappings, enrichmentRates, credits,
    agents, agentEvents, workflows, workflowRuns, workflowEdits,
    mailboxes, domains, users, teams, territories, permissionProfiles,
    integrations, crmFields, integrationErrors, syncRuns, setupDrafts, syncErrors,
    apiKeys, endpointCosts: ENDPOINT_COSTS, webhooks, webhookDeliveries, mcpTokens, cliDevices,
    requests, notes, briefs, workspace, settings: SETTINGS[business], invoices, sendPolicy: SEND_POLICY[business],
    notifications, workspaceHealth, activity, activityEvents,
    goals, forecastSubmissions, forecastPredictions,
    dealWarningThresholds: DEAL_WARNING_DEFAULTS,
    bounceGuard: { ...BOUNCE_GUARD, observedPercent: sz.bounce.rate, volume7d: sz.bounce.volume, state: guardState },
    secondApproval: secondApprovalOf(business),
  }
  cache.set(business, seed)
  return seed
}
