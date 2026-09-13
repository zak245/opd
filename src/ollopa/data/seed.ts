// Deterministic seed data. Same business, same rows, every time.
import type { Business } from "../usage/model"
import { businessById } from "./businesses"

function rng(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST = ["Amara","Ben","Chloe","Dev","Elif","Farid","Greta","Hugo","Ines","Jamal","Kai","Lena","Mateo","Nadia","Omar","Petra","Quinn","Rosa","Sami","Tara","Umar","Vera","Wen","Ximena","Yusuf","Zara","Anders","Bianca","Cyrus","Dalia","Emil","Freya","Gael","Hiro","Ivy","Joel","Kira","Luca","Maya","Nils","Orla","Paulo","Rhea","Soren","Tomas","Una","Viktor","Willa","Yara","Zev"]
const LAST = ["Okonkwo","Fischer","Moreau","Patel","Yilmaz","Haddad","Lindgren","Silva","Costa","Nakamura","Ivanova","Schmidt","Rossi","Kowalski","Andersen","Novak","Murphy","Bakker","Larsen","Castillo","Nguyen","Kim","Sato","Abebe","Mensah","Dubois","Meyer","Romano","Jensen","Berg","Fontaine","Ortiz","Popescu","Varga","Horvat","Dimitrov","Petrov","Ahmed","Khan","Osei","Reyes","Torres","Vogel","Weiss","Zimmer","Brennan","Doyle","Walsh","Byrne","Quinn"]
const COMPANIES = ["Northwind Analytics","Bluefin Logistics","Kestrel Health","Orchard Payments","Tidewater Energy","Sable Robotics","Lumen Security","Copperline Retail","Granite Insurance","Vantage Legal","Harbor Foods","Ironwood Manufacturing","Pinecrest Media","Quartz Biotech","Redwood Learning","Summit Telecom","Trellis HR","Umber Studios","Verdant Agritech","Willow Finance","Atlas Freight","Beacon Software","Cobalt Mining","Delta Textiles","Ember Hospitality","Falcon Aerospace","Glacier Water","Horizon Travel","Indigo Fashion","Juniper Pharma","Keystone Construction","Lantern Publishing","Meridian Dental","Nimbus Cloud","Obsidian Gaming","Prism Optics","Quill Legal","Ridge Outdoor","Sierra Solar","Terra Realty"]
const TITLES = ["VP Sales","Head of Growth","Revenue Operations Manager","Sales Director","CMO","VP Marketing","Founder","CEO","Head of Demand Generation","Sales Enablement Lead","Account Executive","SDR Manager","Chief Revenue Officer","Director of Partnerships","Head of Customer Success"]
const INDUSTRIES = ["Software","Logistics","Healthcare","Fintech","Energy","Manufacturing","Media","Retail","Insurance","Legal"]
const STAGES = ["Cold","Approaching","Replied","Interested","Meeting booked","Not interested","Unresponsive"] as const
const EMAIL_STATUS = ["Verified","Verified","Verified","Guessed","Unverified","Bounced"] as const
const DEAL_STAGES = ["Qualified","Discovery","Proposal","Negotiation","Closed won"] as const

export type ContactStage = (typeof STAGES)[number]
export interface Contact { id: string; name: string; title: string; company: string; email: string; emailStatus: (typeof EMAIL_STATUS)[number]; stage: ContactStage; lastActivity: string; owner: string; inSequence: string | null; phone: boolean }
export interface Company { id: string; name: string; industry: string; employees: number; domain: string; contacts: number; stage: "Cold" | "Active opportunity" | "Current client" | "Churned"; owner: string; lastActivity: string }
export interface Deal { id: string; name: string; company: string; amount: number; stage: (typeof DEAL_STAGES)[number]; probability: number; closeDate: string; owner: string; lastActivity: string; nextStep: string }
export interface Sequence { id: string; name: string; steps: number; active: number; replied: number; bounced: number; owner: string; status: "Active" | "Paused" | "Draft" }
export interface Task { id: string; kind: "Call" | "LinkedIn" | "Email" | "Follow-up"; contact: string; company: string; due: string; sequence: string | null }
export interface Reply { id: string; contact: string; company: string; sequence: string; outcome: "Interested" | "Not now" | "Question" | "Out of office" | "Unsubscribe"; received: string; snippet: string }
export interface AgentEvent { id: string; agent: "Research agent" | "Outreach agent" | "Scoring agent"; when: string; summary: string; detail: string; needsApproval: boolean; kind: "researched" | "drafted" | "scored" | "proposed" | "sent" | "paused"; credits: number }

export interface Seed { contacts: Contact[]; companies: Company[]; deals: Deal[]; sequences: Sequence[]; tasks: Task[]; replies: Reply[]; agentEvents: AgentEvent[] }

const cache = new Map<Business, Seed>()

function dateBack(r: () => number, maxDays: number): string {
  const d = new Date(2026, 8, 13)
  d.setDate(d.getDate() - Math.floor(r() * maxDays))
  return d.toISOString().slice(0, 10)
}
function dateAhead(r: () => number, maxDays: number): string {
  const d = new Date(2026, 8, 13)
  d.setDate(d.getDate() + Math.floor(r() * maxDays))
  return d.toISOString().slice(0, 10)
}
function pick<T>(r: () => number, arr: readonly T[]): T { return arr[Math.floor(r() * arr.length)] }

export function seedFor(business: Business): Seed {
  const hit = cache.get(business)
  if (hit) return hit
  const b = businessById(business)
  const r = rng({ fathom: 11, meridian: 22, halyard: 33, ridgeline: 44 }[business])
  const owners = b.roles.map((s) => s.user)
  const outbound = business !== "ridgeline"

  const sequences: Sequence[] = Array.from({ length: Math.min(b.counts.sequences, 12) }, (_, i) => ({
    id: `seq-${i + 1}`,
    name: ["Q4 enterprise outbound", "Warm inbound follow-up", "Event follow-up: SaaStock", "Churned re-engagement", "Series A founders", "RevOps leaders EMEA", "Partner intro", "Trial activation nudge", "Renewal 60 days", "Expansion: new seats", "Webinar attendees", "Dormant accounts"][i] ?? `Sequence ${i + 1}`,
    steps: 3 + Math.floor(r() * 5),
    active: Math.floor(r() * 400),
    replied: Math.floor(r() * 60),
    bounced: Math.floor(r() * 12),
    owner: pick(r, owners),
    status: r() < 0.7 ? "Active" : r() < 0.5 ? "Paused" : "Draft",
  }))

  const companies: Company[] = COMPANIES.map((name, i) => ({
    id: `co-${i + 1}`,
    name,
    industry: pick(r, INDUSTRIES),
    employees: [20, 50, 120, 300, 800, 2000, 5000][Math.floor(r() * 7)],
    domain: name.toLowerCase().replace(/[^a-z]+/g, "") + ".com",
    contacts: 1 + Math.floor(r() * 14),
    stage: business === "ridgeline" ? pick(r, ["Current client", "Current client", "Active opportunity", "Churned"] as const) : pick(r, ["Cold", "Cold", "Active opportunity", "Current client"] as const),
    owner: pick(r, owners),
    lastActivity: dateBack(r, 40),
  }))

  const contacts: Contact[] = Array.from({ length: 160 }, (_, i) => {
    const first = pick(r, FIRST), last = pick(r, LAST), co = pick(r, companies)
    return {
      id: `c-${i + 1}`,
      name: `${first} ${last}`,
      title: pick(r, TITLES),
      company: co.name,
      email: `${first}.${last}@${co.domain}`.toLowerCase(),
      emailStatus: pick(r, EMAIL_STATUS),
      stage: outbound ? pick(r, STAGES) : pick(r, ["Interested", "Meeting booked", "Replied", "Approaching"] as const),
      lastActivity: dateBack(r, 30),
      owner: pick(r, owners),
      inSequence: r() < (outbound ? 0.55 : 0.15) ? pick(r, sequences).name : null,
      phone: r() < 0.4,
    }
  })

  const deals: Deal[] = Array.from({ length: Math.min(b.counts.openDeals, 40) }, (_, i) => {
    const co = pick(r, companies)
    const stage = pick(r, DEAL_STAGES)
    return {
      id: `d-${i + 1}`,
      name: `${co.name} · ${pick(r, ["Platform", "Growth plan", "Expansion", "Renewal", "Pilot"])}`,
      company: co.name,
      amount: [4_800, 12_000, 24_000, 48_000, 96_000, 180_000][Math.floor(r() * 6)],
      stage,
      probability: { Qualified: 10, Discovery: 25, Proposal: 50, Negotiation: 75, "Closed won": 100 }[stage],
      closeDate: dateAhead(r, 90),
      owner: pick(r, owners),
      lastActivity: dateBack(r, 14),
      nextStep: pick(r, ["Send proposal", "Security review call", "Intro to CFO", "Pilot kickoff", "Pricing follow-up", "Contract redlines"]),
    }
  })

  const tasks: Task[] = Array.from({ length: 24 }, (_, i) => {
    const c = pick(r, contacts)
    return { id: `t-${i + 1}`, kind: pick(r, ["Call", "LinkedIn", "Email", "Follow-up"] as const), contact: c.name, company: c.company, due: dateAhead(r, 5), sequence: c.inSequence }
  })

  const replies: Reply[] = Array.from({ length: 18 }, (_, i) => {
    const c = pick(r, contacts)
    const outcome = pick(r, ["Interested", "Interested", "Not now", "Question", "Out of office", "Unsubscribe"] as const)
    return {
      id: `r-${i + 1}`, contact: c.name, company: c.company, sequence: c.inSequence ?? sequences[0]?.name ?? "Inbound",
      outcome, received: dateBack(r, 4),
      snippet: { Interested: "Happy to take a look. Do you have time Thursday?", "Not now": "Not a priority this quarter, check back in January.", Question: "Does this work with HubSpot?", "Out of office": "I am out until the 21st with limited email access.", Unsubscribe: "Please remove me from this list." }[outcome],
    }
  })

  const agentEvents: AgentEvent[] = Array.from({ length: 30 }, (_, i) => {
    const c = pick(r, contacts)
    const kind = pick(r, ["researched", "researched", "drafted", "scored", "proposed", "sent", "paused"] as const)
    const agent = kind === "scored" ? "Scoring agent" : kind === "researched" ? "Research agent" : "Outreach agent"
    const needsApproval = kind === "proposed" || (kind === "drafted" && r() < 0.5)
    return {
      id: `a-${i + 1}`, agent, when: dateBack(r, 3), needsApproval, kind,
      credits: kind === "researched" ? 12 : kind === "drafted" ? 4 : kind === "scored" ? 1 : 0,
      summary: {
        researched: `Researched ${c.company}: 3 signals found`,
        drafted: `Drafted a first email to ${c.name}`,
        scored: `Scored ${c.company} 82 (fit high, intent rising)`,
        proposed: `Proposes adding ${c.name} to "${sequences[0]?.name ?? "outbound"}"`,
        sent: `Sent step 2 to ${c.name}`,
        paused: `Paused outreach to ${c.company}: bounce rate 5.1%`,
      }[kind],
      detail: `Sources: company site, two news items, LinkedIn. Confidence: medium. Contact: ${c.name}, ${c.title} at ${c.company}.`,
    }
  })

  const seed = { contacts, companies, deals, sequences, tasks, replies, agentEvents }
  cache.set(business, seed)
  return seed
}
