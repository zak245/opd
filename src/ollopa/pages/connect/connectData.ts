// What the connect wizard is choosing between, and where its answers start from.
//
// Seven kinds in three groups (spec 15 §3.1). The card chosen decides the step list: six steps for a
// CRM, three for anything else. Nothing here is invented at render: the answers a draft starts with
// come from `seed.setupDrafts` when a draft was left behind, from `seed.integrations` when the kind is
// already connected, and from the spec's stated defaults otherwise.
import { DEAL_STAGES, STAGES, seedFor, type CrmField, type Integration, type Seed } from "../../data/seed"
import type { Business } from "../../usage/model"

export type Group = "CRM" | "Calendar" | "Team and data"

export interface KindDef {
  slug: string
  /** The name in the seed's `integrations[].kind`, so a card knows whether it is already connected. */
  kind: string
  group: Group
  /** One line saying what the connection does. */
  what: string
  crm?: boolean
}

export const KINDS: KindDef[] = [
  { slug: "salesforce", kind: "Salesforce", group: "CRM", crm: true, what: "Sync contacts, companies, deals and activities with Salesforce, and decide what Ollopa may write, delete and merge there." },
  { slug: "hubspot", kind: "HubSpot", group: "CRM", crm: true, what: "Sync contacts, companies, deals and engagements with HubSpot, and decide what Ollopa may write, delete and merge there." },
  { slug: "google-calendar", kind: "Google Calendar", group: "Calendar", what: "Meetings booked in Ollopa land in your calendar, and your busy time is read back so nothing double-books." },
  { slug: "microsoft-365", kind: "Microsoft 365 Calendar", group: "Calendar", what: "Meetings booked in Ollopa land in your calendar, and your busy time is read back so nothing double-books." },
  { slug: "slack", kind: "Slack", group: "Team and data", what: "Five events post to the channels you choose: a reply, a meeting, a deal moving, an agent needing approval, a sync error." },
  { slug: "enrichment", kind: "Northlight Data", group: "Team and data", what: "An enrichment provider fills email, mobile, job title and company size, in the order you set." },
  { slug: "webhook", kind: "Webhook", group: "Team and data", what: "Ollopa POSTs to your endpoint when something happens, signed and attempt-numbered." },
]

export function kindBySlug(slug: string): KindDef | undefined {
  return KINDS.find((k) => k.slug === slug)
}

export const OBJECTS = ["Contacts", "Companies", "Deals", "Activities"] as const
export type ObjectName = (typeof OBJECTS)[number]
export type Direction = "both" | "pull" | "push" | "off"

export const ACTIVITY_TYPES = ["Emails", "Calls", "Tasks", "Meetings"]

export const SLACK_EVENTS = [
  "A reply lands",
  "A meeting is booked",
  "A deal moves stage",
  "An agent needs approval",
  "A sync error",
]

export const WEBHOOK_EVENTS = [
  "contact.created", "contact.updated", "deal.updated", "deal.stage_changed",
  "meeting.booked", "reply.received", "form.submitted", "sequence.finished",
]

export const ENRICH_FIELDS = ["Email", "Mobile", "Job title", "Company size", "LinkedIn"]

export interface FieldPair {
  id: string
  object: ObjectName
  ollopa: string
  remote: string
  direction: "both" | "pull" | "push"
  /** "Fill empty" or "Overwrite" — the write rule sits in the row of the pair it governs. */
  writeRule: string
  state: "mapped" | "suggested" | "edited"
}

export interface ConnectDraft {
  slug: string
  kind: string
  environment: "production" | "sandbox"
  /** Step 2's result, in text. */
  authorised: boolean
  authUser: string
  validUntil: string
  objects: { object: ObjectName; direction: Direction }[]
  activityTypes: string[]
  pairs: FieldPair[]
  stageMap: { ollopa: string; remote: string }[]
  pullAll: boolean
  pullConditions: { field: string; op: string; value: string }[]
  pushAll: boolean
  pushConditions: { field: string; op: string; value: string }[]
  pushUnverified: boolean
  sourceValue: string
  onCrmDelete: "unlink" | "delete"
  onOllopaDelete: "nothing" | "delete"
  onCrmMerge: "mirror" | "nothing"
  onOllopaMerge: "mirror" | "nothing"
  matchKey: string
  calendars: string[]
  busyOnly: boolean
  channels: { event: string; channel: string }[]
  enrichKey: string
  enrichKeyChecked: boolean
  enrichFields: string[]
  webhookUrl: string
  webhookSecret: string
  webhookEvents: string[]
  webhookTest: string | null
  stepsDone: number[]
  started: "syncing" | "paused" | null
  /** Where the draft came from, so the wizard can say so rather than pretending it is new. */
  seededFrom: "nothing" | "draft" | "integration"
}

export const WRITE_RULES = ["Fill empty", "Overwrite"]
export const OPERATORS = ["is", "is not", "contains", "is set", "is not set", "is after"]

export const CONDITION_FIELDS = ["Owner", "Stage", "Email status", "Created date", "Country", "Lead source"]

/** The Ollopa fields a CRM object maps from: the entity's own fields plus this workspace's custom ones. */
export function ollopaFields(seed: Seed, object: ObjectName): string[] {
  const standard: Record<ObjectName, string[]> = {
    Contacts: ["Name", "Email", "Email status", "Phone", "Title", "Seniority", "Department", "Company", "Owner", "Stage", "Location", "LinkedIn", "Source", "Score"],
    Companies: ["Name", "Domain", "Industry", "Employees", "Owner", "Stage", "Location", "Revenue", "Technologies", "Founded"],
    Deals: ["Name", "Amount", "Stage", "Probability", "Close date", "Owner", "Next step", "Deal type", "Source", "Competitor"],
    Activities: ["Subject", "Kind", "When", "Owner", "Contact", "Outcome", "Notes"],
  }
  const custom = seed.fields
    .filter((f) => !f.retired && f.object === (object === "Contacts" ? "person" : object === "Companies" ? "company" : "deal"))
    .map((f) => f.label)
  return [...standard[object], ...custom]
}

/** The CRM's own object name for one of ours: Deals are Opportunities in Salesforce. */
/** The plural the sentences use: Opportunity → opportunities, not "opportunitys". */
export function remotePlural(kind: string, object: ObjectName): string {
  const one = remoteObject(kind, object)
  return one.endsWith("y") ? `${one.slice(0, -1)}ies` : `${one}s`
}

export function remoteObject(kind: string, object: ObjectName): string {
  if (kind === "Salesforce") return { Contacts: "Contact", Companies: "Account", Deals: "Opportunity", Activities: "Task" }[object]
  return { Contacts: "Contact", Companies: "Company", Deals: "Deal", Activities: "Engagement" }[object]
}

export function crmFieldsFor(seed: Seed, kind: string, object: ObjectName): CrmField[] {
  return seed.crmFields.filter((f) => f.object === remoteObject(kind, object))
}

/**
 * The pre-mapped rows. A standard field whose name matches is offered as **suggested**, never as
 * decided: a guess shown as a decision is what rule 6 objects to, and saving the step is what confirms
 * the guesses.
 */
function suggestPairs(seed: Seed, kind: string, objects: { object: ObjectName; direction: Direction }[]): FieldPair[] {
  const pairs: FieldPair[] = []
  for (const row of objects) {
    if (row.direction === "off") continue
    const remote = crmFieldsFor(seed, kind, row.object)
    for (const field of ollopaFields(seed, row.object)) {
      const hit = remote.find((f) => f.name.toLowerCase() === field.toLowerCase())
      if (!hit) continue
      pairs.push({
        id: `${row.object}:${field}`,
        object: row.object,
        ollopa: field,
        remote: hit.name,
        direction: row.direction,
        writeRule: WRITE_RULES[0],
        state: "suggested",
      })
    }
  }
  return pairs
}

export function draftKey(business: Business, slug: string): string {
  return `ollopa.connect.${business}.${slug}`
}

/** The workspace's answer to "Ollopa is our CRM", which is a decision and not an absence. */
export function noCrmKey(business: Business): string {
  return `ollopa.connect.${business}.ollopa-is-our-crm`
}

const DEFAULT_DIRECTIONS: Record<ObjectName, Direction> = { Contacts: "both", Companies: "both", Deals: "pull", Activities: "push" }

/** The answers a draft starts from: a left-behind draft, a connected integration, or the defaults. */
export function startingDraft(business: Business, slug: string, user: string): ConnectDraft {
  const seed = seedFor(business)
  const def = kindBySlug(slug)
  const kind = def?.kind ?? slug
  const live: Integration | undefined = seed.integrations.find((i) => i.kind === kind || (kind === "Webhook" && i.webhook !== null))
  const saved = seed.setupDrafts.find((d) => d.kind === kind)

  const objects = OBJECTS.map((object) => ({
    object,
    direction: (live?.objects.find((o) => o.object === object)?.direction ?? DEFAULT_DIRECTIONS[object]) as Direction,
  }))

  const pairs = live && live.mappings.length
    ? [
        ...live.mappings.map((m) => ({
          id: `Contacts:${m.ollopa}`,
          object: "Contacts" as ObjectName,
          ollopa: m.ollopa.charAt(0).toUpperCase() + m.ollopa.slice(1),
          remote: m.remote,
          direction: m.direction,
          writeRule: /never overwrite/i.test(m.writeRule) ? WRITE_RULES[0] : WRITE_RULES[1],
          state: "mapped" as const,
        })),
        ...suggestPairs(seed, kind, objects).filter((p) => !live.mappings.some((m) => m.remote === p.remote && p.object === "Contacts")),
      ]
    : def?.crm ? suggestPairs(seed, kind, objects) : []

  return {
    slug,
    kind,
    environment: (live?.environment === "sandbox" ? "sandbox" : "production"),
    authorised: !!live?.auth || (!!saved && saved.step >= 2),
    authUser: live?.auth?.user ?? saved?.answers.account ?? "",
    validUntil: live?.auth?.validUntil ?? "",
    objects,
    activityTypes: ACTIVITY_TYPES.slice(0, 3),
    pairs,
    stageMap: live?.stageMap.length ? live.stageMap : DEAL_STAGES.map((s) => ({ ollopa: s, remote: "" })),
    pullAll: !live,
    pullConditions: live ? [{ field: "Owner", op: "is", value: "a user in this workspace" }] : [],
    pushAll: !live,
    pushConditions: live ? [{ field: "Email status", op: "is", value: "Verified" }] : [],
    pushUnverified: live?.rules.pushUnverified ?? false,
    sourceValue: live?.rules.sourceValue ?? "Ollopa",
    onCrmDelete: live && /delete/i.test(live.rules.onDelete) ? "delete" : "unlink",
    onOllopaDelete: "nothing",
    onCrmMerge: "mirror",
    onOllopaMerge: "nothing",
    matchKey: live?.rules.matchKey ?? "Email, then CRM id",
    calendars: live?.calendars.length ? live.calendars.slice(0, 1) : saved?.answers.calendars ? [`${saved.answers.account} · ${saved.answers.calendars}`] : [],
    busyOnly: true,
    channels: live?.channels.length
      ? SLACK_EVENTS.map((event, i) => ({ event, channel: live.channels[i]?.channel ?? "" }))
      : SLACK_EVENTS.map((event) => ({ event, channel: "" })),
    enrichKey: live?.enrichment?.key ?? "",
    enrichKeyChecked: !!live?.enrichment,
    enrichFields: live?.enrichment?.fields ?? ENRICH_FIELDS.slice(0, 4),
    webhookUrl: live?.webhook?.url ?? "",
    webhookSecret: live?.webhook ? "set" : "",
    webhookEvents: live?.webhook?.events ?? [],
    webhookTest: live?.webhook?.lastTest ?? null,
    stepsDone: live ? [1, 2, 3, 4, 5] : saved ? Array.from({ length: saved.step }, (_, i) => i + 1) : [],
    started: live ? (live.status === "paused" ? "paused" : "syncing") : null,
    seededFrom: live ? "integration" : saved ? "draft" : "nothing",
  }
}

/** Contact stages, for the push condition's value list. */
export const CONTACT_STAGES = [...STAGES]
