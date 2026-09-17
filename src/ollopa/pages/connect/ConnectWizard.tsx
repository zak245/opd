// W-connect: the setup wizard, and the only wizard in this product's integration life.
//
// Six steps for a CRM, three for a calendar, Slack, an enrichment provider or a webhook. Progress is
// text, every button says where it goes, every answer saves as it is made, and one line under every
// heading says the thing the six-hour timer used to decide: nothing syncs until you press the button.
// Editing a mapping, changing a rule, retrying an error or re-authorising is never here — it is on the
// integration page, in place (spec 15 §3.1).
import { useMemo, useState } from "react"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { navigate, useRoute, href } from "@/app/router"
import { toast } from "../../templates/TablePage"
import { Door, useFlat } from "../../ui/Door"
import { Locked } from "../../ui/Locked"
import { gate, money } from "../../ui/gate"
import { useDisclosure } from "../../ui/useDisclosure"
import { businessById } from "../../data/businesses"
import { DEAL_STAGES, TODAY, seedFor } from "../../data/seed"
import type { Session } from "../../session"
import { day } from "../deal/format"
import { Check, Code, Confirm, Consequence, Picker, Radio, Wizard, about, n, type StepState } from "./bits"
import { discardDraft, peekDraft, useDraft, writeDraft } from "./drafts"
import {
  ACTIVITY_TYPES, CONDITION_FIELDS, CONTACT_STAGES, ENRICH_FIELDS, KINDS, OBJECTS, OPERATORS,
  SLACK_EVENTS, WEBHOOK_EVENTS, WRITE_RULES, crmFieldsFor, draftKey, kindBySlug, noCrmKey,
  ollopaFields, remoteObject, remotePlural, startingDraft,
  type ConnectDraft, type Direction, type FieldPair, type ObjectName,
} from "./connectData"

/* ------------------------------------------------------------------------------- the step lists */

const CRM_STEPS = ["Choose what to connect", "Authorise", "Choose what syncs", "Map fields", "Set sync rules", "Review and start"]
const THIRD_STEP: Record<string, string> = {
  "Google Calendar": "Choose calendars and detail",
  "Microsoft 365 Calendar": "Choose calendars and detail",
  Slack: "Choose events and channels",
  "Northlight Data": "Choose fields and the provider order",
  Webhook: "Choose events and finish",
}

function stepNames(kind: string | null): string[] {
  const def = KINDS.find((k) => k.kind === kind)
  if (!def) return CRM_STEPS
  if (def.crm) return CRM_STEPS
  return [CRM_STEPS[0], CRM_STEPS[1], THIRD_STEP[def.kind] ?? "Choose what it does"]
}

const DIRECTION_WORDS: Record<Direction, string> = {
  both: "Both ways",
  pull: "Pull only",
  push: "Push only",
  off: "Off",
}

function directionSentence(kind: string, object: ObjectName, direction: Direction): string {
  const remote = `${kind} ${remotePlural(kind, object).toLowerCase()}`
  switch (direction) {
    case "both": return `Ollopa will create and update ${remote} and take updates back.`
    case "pull": return `Ollopa will read ${remote} and change nothing there.`
    case "push": return `Ollopa will create and update ${remote} and ignore changes made there.`
    case "off": return `${object} do not sync at all.`
  }
}

/* ----------------------------------------------------------------------------------- step one */

function ChooseStep({ session, slug, go }: { session: Session; slug: string; go: (slug: string) => void }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const d = useDisclosure("connect")
  const [noCrm, saveNoCrm] = useDraft(noCrmKey(session.business), { declared: b.crm === null })
  const hooks = gate("webhooks", session.business)
  const crm = seed.integrations.find((i) => i.kind === "Salesforce" || i.kind === "HubSpot")

  // Spec 15 §3.6: the admin seat connects all seven kinds; every other seat connects its own
  // calendar and nothing else, and the page says who holds the rest rather than hiding that.
  const isAdmin = session.role === "admin"
  const admin = b.roles.find((r) => r.role === "admin")
  const groups: { name: string; kinds: typeof KINDS }[] = isAdmin ? [
    { name: "CRM", kinds: KINDS.filter((k) => k.group === "CRM") },
    { name: "Calendar", kinds: KINDS.filter((k) => k.group === "Calendar") },
    { name: "Team and data", kinds: KINDS.filter((k) => k.group === "Team and data") },
  ] : [
    { name: "Your calendar", kinds: KINDS.filter((k) => k.group === "Calendar") },
  ]

  const planLine = `Starter syncs one way · Growth both ways · Scale adds custom objects. You are on ${b.plan.name}.`

  return (
    <>
      {d.atLevelOne("wiz.template") && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-3">
          <Button size="sm" variant="outline" onClick={() => toast(`Loaded the saved template · steps 3 to 5 filled in`)}>Start from a saved template</Button>
          <span className="text-xs text-muted-foreground">A template holds what syncs, the field pairs and the sync rules. Authorising is still yours to do.</span>
        </div>
      )}

      {!isAdmin && (
        <p className="text-sm text-muted-foreground">
          Your seat connects your own calendar. The CRM, Slack, enrichment providers and webhooks are workspace integrations, set up by {admin ? `${admin.user} (${admin.title})` : "the admin"}.
        </p>
      )}

      {groups.map((group) => (
        <section key={group.name}>
          <h3 className="text-sm font-medium">{group.name}</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {group.kinds.map((k) => {
              const live = seed.integrations.find((i) => i.kind === k.kind || (k.kind === "Webhook" && i.webhook !== null))
              const saved = seed.setupDrafts.find((s) => s.kind === k.kind)
              const blocked = !!k.crm && !!crm && crm.kind !== k.kind
              const locked = k.kind === "Webhook" && hooks.locked
              const card = (
                <button
                  type="button"
                  disabled={blocked}
                  onClick={() => (blocked ? undefined : go(k.slug))}
                  className={cn(
                    "flex h-full w-full flex-col items-start gap-1 rounded-lg border bg-background p-3 text-left text-sm",
                    slug === k.slug && "border-foreground",
                    blocked ? "cursor-not-allowed opacity-70" : "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  )}
                >
                  <span className="flex w-full items-center gap-2 font-medium">
                    {k.kind === "Northlight Data" ? "Enrichment provider" : k.kind}
                    {locked && <Lock className="size-3.5 text-muted-foreground" aria-hidden="true" />}
                    {locked && <span className="text-xs font-normal text-muted-foreground">{hooks.plan} · {money(hooks.pricePerMonth)} a month for {b.plan.seats} seats</span>}
                  </span>
                  <span className="text-xs text-muted-foreground">{k.what}</span>
                  {live && <span className="text-xs">Connected{live.environment ? ` · ${live.environment}` : ""} · {live.status}</span>}
                  {saved && <span className="text-xs">Setting up · {saved.step} of {saved.of} steps done</span>}
                  {blocked && <span className="text-xs font-medium">Disconnect {crm?.kind} first</span>}
                  {k.crm && !blocked && <span className="text-xs text-muted-foreground">{planLine}</span>}
                </button>
              )
              return (
                <div key={k.slug} className="flex flex-col gap-1">
                  {locked
                    ? <Locked feature="Webhooks" plan={hooks.plan} pricePerMonth={hooks.pricePerMonth} what={hooks.what}>{card}</Locked>
                    : card}
                  {(live || saved) && (
                    <div className="flex flex-wrap gap-3 px-1 text-xs">
                      {live && <a className="underline" href={href(`/ollopa/integrations/${live.id}`)}>Open the {live.kind} page</a>}
                      {saved && <button type="button" className="underline" onClick={() => go(k.slug)}>Resume setup</button>}
                      {saved && (
                        <button
                          type="button"
                          className="underline"
                          onClick={() => { discardDraft(draftKey(session.business, k.slug)); toast(`Discarded the ${k.kind} setup · the account you signed in with is disconnected`) }}
                        >
                          Discard
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {group.name === "CRM" && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm sm:col-span-2">
                <Check
                  checked={noCrm.declared}
                  onChange={() => { saveNoCrm({ declared: !noCrm.declared }); toast(noCrm.declared ? "Ollopa is no longer marked as your CRM · the CRM row is back in the set-up list" : "Ollopa is your CRM · the CRM row has left the set-up list") }}
                  label="Ollopa is our CRM"
                  hint="A decision, not an absence. It takes the CRM row out of the set-up list on Home, and it is reversible here."
                />
                {noCrm.declared && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Ollopa is your CRM. It is holding your {n(b.counts.contacts)} contacts, {n(b.counts.companies)} companies and {n(b.counts.openDeals)} open deals. Connect Salesforce or HubSpot if that changes.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      ))}
    </>
  )
}

/* ----------------------------------------------------------------------------------- step two */

function AuthoriseStep({ session, draft, save }: { session: Session; draft: ConnectDraft; save: (p: Partial<ConnectDraft>) => void }) {
  const seed = seedFor(session.business)
  const domain = seed.domains[0]?.domain ?? "your-domain.com"
  const syncUser = draft.authUser || `ollopa-sync@${domain}`
  const isSalesforce = draft.kind === "Salesforce"

  const signIn = () => {
    save({ authorised: true, authUser: syncUser, stepsDone: [...new Set([...draft.stepsDone, 1, 2])] })
    toast(`Signed in to ${draft.kind} as ${syncUser}`)
  }

  if (draft.kind === "Northlight Data") {
    return (
      <section className="grid gap-3">
        <label className="block max-w-md text-sm">
          <span className="text-xs text-muted-foreground">Provider key</span>
          <Input className="mt-1" value={draft.enrichKey} placeholder="nl_live_…" onChange={(e) => save({ enrichKey: e.target.value })} />
        </label>
        <div>
          <Button onClick={() => { save({ enrichKeyChecked: true, authorised: true, stepsDone: [...new Set([...draft.stepsDone, 1, 2])] }); toast("Key accepted by Northlight Data") }}>Check the key</Button>
        </div>
        {draft.enrichKeyChecked && <p className="text-sm">Key accepted. Northlight Data will answer enrichment for this workspace.</p>}
      </section>
    )
  }

  if (draft.kind === "Webhook") {
    return (
      <section className="grid gap-3">
        <label className="block max-w-xl text-sm">
          <span className="text-xs text-muted-foreground">Endpoint URL</span>
          <Input className="mt-1" value={draft.webhookUrl} placeholder="https://example.com/hooks/ollopa" onChange={(e) => save({ webhookUrl: e.target.value })} />
        </label>
        <label className="block max-w-xl text-sm">
          <span className="text-xs text-muted-foreground">Signing secret</span>
          <Input className="mt-1" value={draft.webhookSecret} placeholder="whsec_…" onChange={(e) => save({ webhookSecret: e.target.value })} />
        </label>
        <div>
          <Button
            disabled={!draft.webhookUrl}
            onClick={() => { save({ webhookTest: TODAY, authorised: true, stepsDone: [...new Set([...draft.stepsDone, 1, 2])] }); toast("Test event sent") }}
          >
            Send a test event
          </Button>
        </div>
        {draft.webhookTest && (
          <div className="grid gap-2 rounded-md border p-3 text-sm">
            <div>Sent to {draft.webhookUrl || "your endpoint"} on {day(draft.webhookTest)}.</div>
            <Code block text={`POST ${draft.webhookUrl || "https://example.com/hooks/ollopa"}\nOllopa-Event: connection.test\nOllopa-Attempt: 1\nOllopa-Signature: t=1789012345,v1=<HMAC-SHA256 of the body with your secret>`} label="Copy the request" />
            <p className="text-xs text-muted-foreground">The answer your endpoint gives appears here and in the delivery log. Delivery is at-least-once and out of order.</p>
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="grid gap-4">
      {isSalesforce && (
        <fieldset>
          <legend className="text-sm font-medium">Which Salesforce</legend>
          <div className="mt-2 grid max-w-md gap-2 sm:grid-cols-2">
            <Radio name="env" checked={draft.environment === "production"} onChange={() => save({ environment: "production" })} label="Production" />
            <Radio name="env" checked={draft.environment === "sandbox"} onChange={() => save({ environment: "sandbox" })} label="Sandbox" />
          </div>
        </fieldset>
      )}

      {isSalesforce && (
        <div className="rounded-md border bg-muted/40 p-3 text-sm">
          <p className="font-medium">What the sync user must be able to do</p>
          <p className="mt-1">
            The sync user needs create, read and edit on Accounts, Contacts, Leads, Opportunities and User Roles, and API Enabled under System Permissions. Salesforce Essentials cannot connect.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Read this before you sign in: the person who can grant it is often not the person at the keyboard.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={signIn}>Sign in to {draft.kind}{isSalesforce ? " as the sync user" : ""}</Button>
        {isSalesforce && <span className="text-xs text-muted-foreground">Use a shared account that stays active when a person leaves.</span>}
      </div>

      {draft.authorised && (
        <p className="text-sm">
          Connected as {syncUser}.{" "}
          {draft.validUntil ? `Token valid until ${day(draft.validUntil)}.` : `The token stays valid until it is revoked in ${draft.kind}.`}
        </p>
      )}
    </section>
  )
}

/* --------------------------------------------------------------------------------- step three */

export function SyncStep({ session, draft, save }: { session: Session; draft: ConnectDraft; save: (p: Partial<ConnectDraft>) => void }) {
  const b = businessById(session.business)
  const flat = useFlat()
  const twoWay = gate("crm.two-way", session.business)
  const custom = gate("crm.custom-objects", session.business)
  const activityChecks = ACTIVITY_TYPES.map((t) => (
    <Check
      key={t}
      checked={draft.activityTypes.includes(t)}
      onChange={() => save({ activityTypes: draft.activityTypes.includes(t) ? draft.activityTypes.filter((x) => x !== t) : [...draft.activityTypes, t] })}
      label={t}
    />
  ))
  const setDirection = (object: ObjectName, direction: Direction) =>
    save({ objects: draft.objects.map((o) => (o.object === object ? { ...o, direction } : o)) })

  return (
    <>
      <section className="grid gap-3">
        {draft.objects.map((row) => (
          <div key={row.object} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-medium">{row.object}</h3>
              <span className="text-xs text-muted-foreground">{draft.kind} {remoteObject(draft.kind, row.object)}</span>
            </div>

            {/* Radios on a wide screen; one select per object on a phone. Same choices, same words. */}
            <div className="mt-2 hidden gap-2 sm:grid sm:grid-cols-4">
              {(["both", "pull", "push", "off"] as Direction[]).map((dir) => {
                const needsPlan = dir === "both" && twoWay.locked
                const control = (
                  <Radio
                    key={dir}
                    name={`dir-${row.object}`}
                    checked={row.direction === dir}
                    onChange={() => (needsPlan ? undefined : setDirection(row.object, dir))}
                    label={<span className="flex items-center gap-1">{DIRECTION_WORDS[dir]}{needsPlan && <Lock className="size-3 text-muted-foreground" aria-hidden="true" />}</span>}
                    hint={needsPlan ? `${twoWay.plan} · ${money(twoWay.pricePerMonth)} a month` : undefined}
                  />
                )
                return needsPlan
                  ? <Locked key={dir} feature="Two-way CRM sync" plan={twoWay.plan} pricePerMonth={twoWay.pricePerMonth} what={twoWay.what}>{control}</Locked>
                  : control
              })}
            </div>
            <div className="mt-2 sm:hidden">
              <Picker
                label={`Direction for ${row.object}`}
                value={DIRECTION_WORDS[row.direction]}
                options={(["both", "pull", "push", "off"] as Direction[]).filter((dir) => !(dir === "both" && twoWay.locked)).map((dir) => DIRECTION_WORDS[dir])}
                onChange={(v) => setDirection(row.object, (Object.keys(DIRECTION_WORDS) as Direction[]).find((k) => DIRECTION_WORDS[k] === v) ?? "off")}
              />
              {twoWay.locked && <p className="mt-1 text-xs text-muted-foreground">Both ways is on {twoWay.plan}: {money(twoWay.pricePerMonth)} a month for {b.plan.seats} seats.</p>}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">{directionSentence(draft.kind, row.object, row.direction)}</p>

            {row.object === "Activities" && row.direction !== "off" && (
              <div className="mt-2 border-t">
                {flat ? (
                  <div className="pt-2">
                    <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Which activities to push</h4>
                    <div className="mt-1 grid gap-1">{activityChecks}</div>
                  </div>
                ) : (
                  <Door id={`connect.activities.${draft.slug}`} label="Which activities to push (emails, calls, tasks, meetings)" count={draft.activityTypes.length}>
                    <div className="grid gap-1">{activityChecks}</div>
                  </Door>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Custom objects keep their place in the object list, with the lock where the choice is made. */}
        <div className="rounded-lg border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-1 text-sm font-medium">Custom {draft.kind} objects {custom.locked && <Lock className="size-3.5 text-muted-foreground" aria-hidden="true" />}</h3>
            {custom.locked
              ? <Locked feature="Custom CRM objects" plan={custom.plan} pricePerMonth={custom.pricePerMonth} what={custom.what}>
                  <Button size="sm" variant="outline">{custom.plan} · {money(custom.pricePerMonth)} a month</Button>
                </Locked>
              : <Button size="sm" variant="outline" onClick={() => toast("No custom objects were found in " + draft.kind)}>Read the custom objects</Button>}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Here, before anything is mapped — never after you have built a mapping for an object you cannot sync.</p>
        </div>
      </section>
    </>
  )
}

/* ---------------------------------------------------------------------------------- step four */

export function MapStep({ session, draft, save }: { session: Session; draft: ConnectDraft; save: (p: Partial<ConnectDraft>) => void }) {
  const seed = seedFor(session.business)
  const flat = useFlat()
  const [query, setQuery] = useState("")
  const [removing, setRemoving] = useState<string | null>(null)
  const objects = draft.objects.filter((o) => o.direction !== "off").map((o) => o.object)
  const [tab, setTab] = useState<string>(objects[0] ?? "Contacts")

  const counts = (object: ObjectName) => {
    const pairs = draft.pairs.filter((p) => p.object === object)
    const required = crmFieldsFor(seed, draft.kind, object).filter((f) => f.required)
    const unmapped = required.filter((f) => !pairs.some((p) => p.remote === f.name))
    return {
      mapped: pairs.filter((p) => p.state !== "suggested").length,
      suggested: pairs.filter((p) => p.state === "suggested").length,
      requiredUnmapped: unmapped,
    }
  }

  const setPair = (id: string, patch: Partial<FieldPair>) =>
    save({ pairs: draft.pairs.map((p) => (p.id === id ? { ...p, ...patch, state: "edited" } : p)) })

  return (
    <Tabs value={tab} onValueChange={setTab} className="min-w-0">
      <TabsList className="flex h-auto flex-wrap justify-start">
        {objects.map((o) => {
          const c = counts(o)
          return (
            <TabsTrigger key={o} value={o} className="text-xs">
              {o} · {c.mapped} mapped, {c.suggested} suggested{c.requiredUnmapped.length ? `, ${c.requiredUnmapped.length} required unmapped` : ""}
            </TabsTrigger>
          )
        })}
      </TabsList>

      {objects.map((object) => {
        const c = counts(object)
        const remoteFields = crmFieldsFor(seed, draft.kind, object)
        const pairs = draft.pairs.filter((p) => p.object === object)
        const shown = pairs.filter((p) => !query || p.ollopa.toLowerCase().includes(query.toLowerCase()) || p.remote.toLowerCase().includes(query.toLowerCase()))
        const unmappedRemote = remoteFields.filter((f) => !pairs.some((p) => p.remote === f.name))
        return (
          <TabsContent key={object} value={object} className="mt-4 grid min-w-0 gap-4 [&>*]:min-w-0">
            {c.requiredUnmapped.length > 0 && (
              <div className="rounded-md border border-amber-300 p-3 text-sm dark:border-amber-800">
                <p className="font-medium">Required in {draft.kind}, not mapped yet ({c.requiredUnmapped.length})</p>
                <ul className="mt-1 grid gap-1">
                  {c.requiredUnmapped.map((f) => (
                    <li key={f.name} className="flex flex-wrap items-center gap-2">
                      <span>Required · {f.name} ({f.kind})</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => save({ pairs: [...draft.pairs, { id: `${object}:${f.name}`, object, ollopa: ollopaFields(seed, object)[0], remote: f.name, direction: "push", writeRule: WRITE_RULES[0], state: "edited" }] })}
                      >
                        Map it
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <label className="block max-w-sm text-sm">
              <span className="text-xs text-muted-foreground">Find a field in either column</span>
              <Input className="mt-1" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="email, owner, amount…" />
            </label>

            <div className="min-w-0 overflow-x-auto">
              <table className="w-full min-w-[40rem] border-collapse text-sm">
                <caption className="sr-only">Field pairs for {object}: the Ollopa field, the direction, the {draft.kind} field, the write rule and the state of each pair.</caption>
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th scope="col" className="py-2 pr-3 font-medium">Ollopa field</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Direction</th>
                    <th scope="col" className="py-2 pr-3 font-medium">{draft.kind} field</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Write rule</th>
                    <th scope="col" className="py-2 font-medium">State</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((p) => (
                    <tr key={p.id} className="border-b align-top">
                      <td className="py-2 pr-3">{p.ollopa}</td>
                      <td className="py-2 pr-3">
                        <select aria-label={`Direction for ${p.ollopa}`} className="h-8 rounded-md border bg-background px-1 text-xs" value={p.direction} onChange={(e) => setPair(p.id, { direction: e.target.value as FieldPair["direction"] })}>
                          <option value="both">Both ways</option><option value="pull">Pull only</option><option value="push">Push only</option>
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <select aria-label={`${draft.kind} field for ${p.ollopa}`} className="h-8 rounded-md border bg-background px-1 text-xs" value={p.remote} onChange={(e) => setPair(p.id, { remote: e.target.value })}>
                          {remoteFields.map((f) => <option key={f.name} value={f.name}>{f.name}{f.required ? " (required)" : ""}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <select aria-label={`Write rule for ${p.ollopa}`} className="h-8 rounded-md border bg-background px-1 text-xs" value={p.writeRule} onChange={(e) => setPair(p.id, { writeRule: e.target.value })}>
                          {WRITE_RULES.map((w) => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </td>
                      <td className="py-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{p.state === "suggested" ? "Suggested" : p.state === "edited" ? "Edited" : "Mapped"}</span>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setRemoving(removing === p.id ? null : p.id)}>Remove</Button>
                        </div>
                        {removing === p.id && (
                          <div className="mt-1 grid gap-1">
                            <Consequence>Removing this pair can stop {object} syncing until the next full pull.</Consequence>
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" className="h-7 px-2 text-xs" onClick={() => { save({ pairs: draft.pairs.filter((x) => x.id !== p.id) }); setRemoving(null); toast(`Removed ${p.ollopa} → ${p.remote} · run a full pull to be sure`) }}>Remove the pair</Button>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setRemoving(null)}>Keep it</Button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => save({ pairs: [...draft.pairs, { id: `${object}:new-${draft.pairs.length}`, object, ollopa: ollopaFields(seed, object)[0], remote: remoteFields[0]?.name ?? "", direction: "both", writeRule: WRITE_RULES[0], state: "edited" }] })}
              >
                Add a field pair
              </Button>
            </div>

            {object === "Deals" && (
              <section>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">Stages, one to one</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const picks = remoteFields.find((f) => f.name === "Stage")?.values ?? []
                      save({ stageMap: DEAL_STAGES.map((s) => ({ ollopa: s, remote: picks.find((v) => v.toLowerCase() === s.toLowerCase()) ?? "" })) })
                      toast("Stages matched by name")
                    }}
                  >
                    Match stages by name
                  </Button>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {draft.stageMap.map((s) => (
                    <Picker
                      key={s.ollopa}
                      label={s.ollopa}
                      value={s.remote}
                      options={["", ...(remoteFields.find((f) => f.name === "Stage")?.values ?? [])]}
                      onChange={(v) => save({ stageMap: draft.stageMap.map((x) => (x.ollopa === s.ollopa ? { ...x, remote: v } : x)) })}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Push by stage is set on the previous step; the stages it names are these.</p>
              </section>
            )}

            {flat ? (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{unmappedRemote.length} unmapped {draft.kind} fields</h4>
                <ul className="mt-1 grid gap-1 sm:grid-cols-2">
                  {unmappedRemote.map((f) => (
                    <li key={f.name} className="text-xs text-muted-foreground">{f.name} · {f.kind}{f.required ? " · required" : ""}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <Door id={`connect.unmapped.${draft.slug}.${object}`} label={`Show ${unmappedRemote.length} unmapped ${draft.kind} fields`} count={unmappedRemote.length}>
                <ul className="grid gap-1 sm:grid-cols-2">
                  {unmappedRemote.map((f) => (
                    <li key={f.name} className="text-xs text-muted-foreground">{f.name} · {f.kind}{f.required ? " · required" : ""}</li>
                  ))}
                </ul>
              </Door>
            )}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

/* ---------------------------------------------------------------------------------- step five */

function ConditionBuilder({ rows, onChange, label }: {
  rows: { field: string; op: string; value: string }[]; onChange: (rows: { field: string; op: string; value: string }[]) => void; label: string
}) {
  return (
    <div className="mt-2 grid gap-2 rounded-md border p-3" role="group" aria-label={label}>
      {rows.length === 0 && <p className="text-xs text-muted-foreground">No condition yet. Add one and the rule applies only to records that match it.</p>}
      {rows.map((row, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <Picker label="Field" value={row.field} options={CONDITION_FIELDS} onChange={(v) => onChange(rows.map((r, j) => (j === i ? { ...r, field: v } : r)))} />
          <Picker label="Is" value={row.op} options={OPERATORS} onChange={(v) => onChange(rows.map((r, j) => (j === i ? { ...r, op: v } : r)))} />
          <label className="block text-sm">
            <span className="text-xs text-muted-foreground">Value</span>
            <Input className="mt-1 h-10" value={row.value} onChange={(e) => onChange(rows.map((r, j) => (j === i ? { ...r, value: e.target.value } : r)))} />
          </label>
          <Button variant="ghost" className="self-end" onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove</Button>
        </div>
      ))}
      <div aria-live="polite" className="text-xs text-muted-foreground">{rows.length} condition{rows.length === 1 ? "" : "s"}.</div>
      <div><Button size="sm" variant="outline" onClick={() => onChange([...rows, { field: CONDITION_FIELDS[0], op: OPERATORS[0], value: "" }])}>Add a condition</Button></div>
    </div>
  )
}

export function RulesStep({ draft, save }: { draft: ConnectDraft; save: (p: Partial<ConnectDraft>) => void }) {
  return (
    <div className="grid gap-6">
      <fieldset>
        <legend className="text-sm font-medium">Pull: what comes into Ollopa</legend>
        <div className="mt-2 grid gap-2">
          <Radio name="pull" checked={draft.pullAll} onChange={() => save({ pullAll: true })} label={`Pull every record from ${draft.kind}`} />
          <Radio name="pull" checked={!draft.pullAll} onChange={() => save({ pullAll: false })} label="Pull only records that match" />
          {!draft.pullAll && <ConditionBuilder label="Pull conditions" rows={draft.pullConditions} onChange={(rows) => save({ pullConditions: rows })} />}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Push: what goes out to {draft.kind}</legend>
        <div className="mt-2 grid gap-2">
          <Radio name="push" checked={draft.pushAll} onChange={() => save({ pushAll: true })} label={`Push every record to ${draft.kind}`} />
          <Radio name="push" checked={!draft.pushAll} onChange={() => save({ pushAll: false })} label="Push only records that match" />
          {!draft.pushAll && <ConditionBuilder label="Push conditions" rows={draft.pushConditions} onChange={(rows) => save({ pushConditions: rows })} />}
          <Check
            checked={draft.pushUnverified}
            onChange={() => save({ pushUnverified: !draft.pushUnverified })}
            label="Push contacts whose email is unverified"
            hint="Off by default. An unverified address in the CRM is one somebody will send to."
          />
          <label className="block max-w-sm text-sm">
            <span className="text-xs text-muted-foreground">Value written to {draft.kind}'s source field</span>
            <Input className="mt-1" value={draft.sourceValue} onChange={(e) => save({ sourceValue: e.target.value })} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Deletions and merges</legend>
        <p className="mt-1 text-xs text-muted-foreground">The four questions that decide what this connection can destroy. They are read together, so they sit together.</p>
        <div className="mt-2 grid gap-3">
          <div>
            <h4 className="text-sm">When a record is deleted in {draft.kind}</h4>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              <Radio name="crmdel" checked={draft.onCrmDelete === "unlink"} onChange={() => save({ onCrmDelete: "unlink" })} label="Unlink it in Ollopa" hint="The record stays and loses its link." />
              <div className="grid gap-1">
                <Radio name="crmdel" checked={draft.onCrmDelete === "delete"} onChange={() => save({ onCrmDelete: "delete" })} label="Delete it in Ollopa" />
                <Consequence>{"Deletes the person, their activity and their sequence history in Ollopa. Nothing restores it."}</Consequence>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm">When a record is deleted in Ollopa</h4>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              <Radio name="olldel" checked={draft.onOllopaDelete === "nothing"} onChange={() => save({ onOllopaDelete: "nothing" })} label={`Do nothing in ${draft.kind}`} />
              <div className="grid gap-1">
                <Radio name="olldel" checked={draft.onOllopaDelete === "delete"} onChange={() => save({ onOllopaDelete: "delete" })} label={`Delete it in ${draft.kind}`} />
                <Consequence>Deletes the record in your system of record. {draft.kind}&rsquo;s recycle bin is the only way back.</Consequence>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm">When two records are merged in {draft.kind}</h4>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              <Radio name="crmmerge" checked={draft.onCrmMerge === "mirror"} onChange={() => save({ onCrmMerge: "mirror" })} label="Mirror the merge in Ollopa" hint="The loser's activity moves onto the winner." />
              <Radio name="crmmerge" checked={draft.onCrmMerge === "nothing"} onChange={() => save({ onCrmMerge: "nothing" })} label="Do nothing in Ollopa" />
            </div>
          </div>
          <div>
            <h4 className="text-sm">When two records are merged in Ollopa</h4>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              <Radio name="ollmerge" checked={draft.onOllopaMerge === "nothing"} onChange={() => save({ onOllopaMerge: "nothing" })} label={`Do nothing in ${draft.kind}`} />
              <div className="grid gap-1">
                <Radio name="ollmerge" checked={draft.onOllopaMerge === "mirror"} onChange={() => save({ onOllopaMerge: "mirror" })} label={`Mirror the merge in ${draft.kind}`} />
                <Consequence>Merging here merges there. The losing {draft.kind} record is deleted by {draft.kind} and cannot be unmerged.</Consequence>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Matching: which key says two records are the same person</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Radio name="match" checked={draft.matchKey === "Email, then CRM id"} onChange={() => save({ matchKey: "Email, then CRM id" })} label="Email, then CRM id" hint="Catches the same person added twice." />
          <Radio name="match" checked={draft.matchKey === "CRM id only"} onChange={() => save({ matchKey: "CRM id only" })} label="CRM id only" hint="Two records with one address stay two records." />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Contact stages Ollopa can push: {CONTACT_STAGES.join(" · ")}.</p>
      </fieldset>
    </div>
  )
}

/* ------------------------------------------------------------------- the third step, non-CRM */

function ThirdStep({ session, draft, save }: { session: Session; draft: ConnectDraft; save: (p: Partial<ConnectDraft>) => void }) {
  const seed = seedFor(session.business)
  const order = seed.workspace.waterfall.order

  if (draft.kind.includes("Calendar")) {
    // A calendar the draft already named stays on the list, so resuming shows the answer that was given
    // rather than an empty form.
    const mine = [...new Set([...draft.calendars, ...seed.users.filter((u) => u.status === "active").slice(0, 4).map((u) => `${u.name} · primary`)])]
    return (
      <div className="grid gap-4">
        <fieldset>
          <legend className="text-sm font-medium">Which calendars</legend>
          <div className="mt-2 grid gap-1">
            {mine.map((c) => (
              <Check key={c} checked={draft.calendars.includes(c)} onChange={() => save({ calendars: draft.calendars.includes(c) ? draft.calendars.filter((x) => x !== c) : [...draft.calendars, c] })} label={c} />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-medium">What Ollopa reads</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Radio name="detail" checked={draft.busyOnly} onChange={() => save({ busyOnly: true })} label="Busy time only" hint="Enough to stop a double-booking. No titles, no attendees." />
            <Radio name="detail" checked={!draft.busyOnly} onChange={() => save({ busyOnly: false })} label="Event detail" hint="Titles and attendees, so a meeting matches itself to a deal." />
          </div>
        </fieldset>
      </div>
    )
  }

  if (draft.kind === "Slack") {
    const channels = ["#revenue", "#wins", "#revops", "#sales", "#alerts", ""]
    return (
      <fieldset>
        <legend className="text-sm font-medium">Which events, and where each one posts</legend>
        <div className="mt-2 grid gap-2">
          {SLACK_EVENTS.map((event) => {
            const row = draft.channels.find((c) => c.event === event)
            return (
              <div key={event} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_16rem]">
                <span className="text-sm">{event}</span>
                <Picker
                  label="Channel"
                  value={row?.channel ?? ""}
                  options={channels}
                  onChange={(v) => save({ channels: draft.channels.map((c) => (c.event === event ? { ...c, channel: v } : c)) })}
                />
              </div>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">An event with no channel does not post. Approvals do post here, and the message carries a link back.</p>
      </fieldset>
    )
  }

  if (draft.kind === "Northlight Data") {
    return (
      <div className="grid gap-4">
        <fieldset>
          <legend className="text-sm font-medium">Which fields it may fill</legend>
          <div className="mt-2 grid gap-1">
            {ENRICH_FIELDS.map((f) => (
              <Check key={f} checked={draft.enrichFields.includes(f)} onChange={() => save({ enrichFields: draft.enrichFields.includes(f) ? draft.enrichFields.filter((x) => x !== f) : [...draft.enrichFields, f] })} label={f} />
            ))}
          </div>
        </fieldset>
        <section>
          <h3 className="text-sm font-medium">Its place in the provider order</h3>
          <p className="mt-1 text-sm">{order.join(" → ")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This is the workspace default, set in Settings › Pipeline and data › Enrichment provider order. The waterfall stops at the first verified result{seed.workspace.waterfall.stopAtFirstVerified ? "" : " only when you say so"}, and one row may not cost more than {seed.workspace.waterfall.ceilingPerRow} credits.
          </p>
        </section>
      </div>
    )
  }

  // Webhook
  return (
    <div className="grid gap-4">
      <fieldset>
        <legend className="text-sm font-medium">Which events this endpoint receives</legend>
        <div className="mt-2 grid gap-1 sm:grid-cols-2">
          {WEBHOOK_EVENTS.map((e) => (
            <Check key={e} checked={draft.webhookEvents.includes(e)} onChange={() => save({ webhookEvents: draft.webhookEvents.includes(e) ? draft.webhookEvents.filter((x) => x !== e) : [...draft.webhookEvents, e] })} label={<code className="font-mono text-xs">{e}</code>} />
          ))}
        </div>
      </fieldset>
      <p className="text-sm">
        Approvals are not webhook events. A webhook fires on what happened, never on what needs deciding; approvals arrive in the app's queue, in the daily digest, and in Slack, which carries a link.
      </p>
      <p className="text-xs text-muted-foreground">
        Delivery is at-least-once and out of order, signed, attempt-numbered and retried for 24 hours. Reconcile nightly from <code className="font-mono">GET /v1/changes?since=&lt;cursor&gt;</code>.
      </p>
    </div>
  )
}

/* ----------------------------------------------------------------------------------- step six */

function ReviewStep({ session, draft, go }: { session: Session; draft: ConnectDraft; go: (n: number) => void }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const d = useDisclosure("connect")
  const live = seed.integrations.find((i) => i.kind === draft.kind)

  const pushContacts = seed.contacts.filter((c) => (draft.pushAll ? true : c.emailStatus === "Verified")).length
  const scale = b.counts.contacts / Math.max(1, seed.contacts.length)
  const pushing = draft.objects.filter((o) => o.direction === "both" || o.direction === "push").map((o) => o.object)
  const pulling = draft.objects.filter((o) => o.direction === "both" || o.direction === "pull").map((o) => o.object)

  const blocks: { title: string; step: number; lines: string[] }[] = [
    { title: "What you are connecting", step: 1, lines: [`${draft.kind}${draft.kind === "Salesforce" ? ` (${draft.environment})` : ""}`] },
    { title: "Authorisation", step: 2, lines: [draft.authorised ? `Connected as ${draft.authUser}${draft.validUntil ? ` · token valid until ${day(draft.validUntil)}` : ""}` : "Not signed in yet"] },
    { title: "What syncs", step: 3, lines: [draft.objects.map((o) => `${o.object} ${DIRECTION_WORDS[o.direction].toLowerCase()}`).join(" · "), `Activities pushed: ${draft.activityTypes.join(", ") || "none"}`] },
    { title: "Field mapping", step: 4, lines: [`${draft.pairs.length} pairs · ${draft.pairs.filter((p) => p.state === "suggested").length} still suggested · ${draft.stageMap.filter((s) => s.remote).length} of ${draft.stageMap.length} stages matched`] },
    {
      title: "Sync rules", step: 5, lines: [
        draft.pullAll ? "Pull every record" : `Pull where ${draft.pullConditions.map((c) => `${c.field} ${c.op} ${c.value}`).join(" and ") || "a condition you have not written yet"}`,
        draft.pushAll ? "Push every record" : `Push where ${draft.pushConditions.map((c) => `${c.field} ${c.op} ${c.value}`).join(" and ") || "a condition you have not written yet"}`,
        `Deletions in ${draft.kind}: ${draft.onCrmDelete === "unlink" ? "unlink in Ollopa" : "delete in Ollopa"} · Deletions in Ollopa: ${draft.onOllopaDelete === "nothing" ? `nothing in ${draft.kind}` : `delete in ${draft.kind}`}`,
        `Merges in ${draft.kind}: ${draft.onCrmMerge === "mirror" ? "mirrored" : "ignored"} · Merges in Ollopa: ${draft.onOllopaMerge === "mirror" ? "mirrored" : "ignored"} · Matching on ${draft.matchKey}`,
      ],
    },
    { title: "Source value and unverified emails", step: 5, lines: [`Source field written as "${draft.sourceValue}" · unverified emails ${draft.pushUnverified ? "are pushed" : "are not pushed"}`] },
  ]

  const pullSentence = live
    ? `Ollopa will pull ${pulling.map((o) => `${about(live.remoteCounts[o] ?? 0)} ${o.toLowerCase()}`).join(" and ")} from ${draft.kind}`
    : `Ollopa will pull every ${draft.kind} record that matches your pull rule — ${draft.kind} has not been counted yet, and the first run reports what it found`
  const pushSentence = `push ${pushing.map((o) => `${about((o === "Contacts" ? pushContacts * scale : o === "Companies" ? b.counts.companies : o === "Deals" ? b.counts.openDeals : Math.round(seed.tasks.length * scale)))} ${o.toLowerCase()}`).join(" and ")} to ${draft.kind}`

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border bg-muted/40 p-4">
        <h3 className="text-sm font-semibold">What the first sync will do</h3>
        <p className="mt-2 text-sm">
          {pullSentence} and {pushSentence}.{" "}
          Deletions in {draft.kind} will {draft.onCrmDelete === "unlink" ? "unlink records in Ollopa" : "delete records in Ollopa"}.{" "}
          Deletions in Ollopa will {draft.onOllopaDelete === "nothing" ? `change nothing in ${draft.kind}` : `delete the record in ${draft.kind}`}.{" "}
          Merges in {draft.kind} will be {draft.onCrmMerge === "mirror" ? "mirrored" : "ignored"}.{" "}
          Merges in Ollopa will be {draft.onOllopaMerge === "mirror" ? `mirrored in ${draft.kind}` : `kept in Ollopa only`}.
        </p>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        {blocks.map((block) => (
          <section key={block.title} className="rounded-lg border p-3">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-medium">{block.title}</h3>
              <button type="button" className="text-xs underline" onClick={() => go(block.step)}>Change</button>
            </div>
            <ul className="mt-1 grid gap-1 text-xs text-muted-foreground">
              {block.lines.map((l) => <li key={l}>{l}</li>)}
            </ul>
          </section>
        ))}
      </div>

      {d.atLevelOne("wiz.template") && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
          <Button size="sm" variant="outline" onClick={() => toast("Saved these choices as a setup template")}>Save these choices as a setup template</Button>
          <span className="text-xs text-muted-foreground">Holds steps 3 to 5. The next client workspace starts from it.</span>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------------------ the page */

export function ConnectWizard({ session, id }: { session: Session; id?: string }) {
  const route = useRoute()
  const seed = seedFor(session.business)
  const slug = id && id !== "new" && kindBySlug(id) ? id : ""
  const kindDef = slug ? kindBySlug(slug) : undefined
  // "new" starts empty: nothing is seeded from a connected integration until a card is chosen. A
  // non-admin seat connects only its own calendar, so its draft is its own, not the workspace's.
  const isAdmin = session.role === "admin"
  const start = useMemo(() => startingDraft(session.business, slug || "new", session.user), [session.business, session.user, slug])
  const [draft, save, drop] = useDraft(draftKey(session.business, slug || "new") + (isAdmin ? "" : `.${session.user}`), start)
  const [discarding, setDiscarding] = useState(false)

  // A kind this plan does not include never reaches step 2, however it was opened: the lock is at the
  // entry point, with the plan, the total and one button — never after work has been done.
  const hooksGate = gate("webhooks", session.business)
  if (kindDef?.kind === "Webhook" && hooksGate.locked) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 lg:px-6">
        <h2 className="text-xl font-semibold">Webhooks are on {hooksGate.plan}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{hooksGate.what}</p>
        <p className="mt-2 text-sm">{money(hooksGate.pricePerMonth)} a month for {businessById(session.business).plan.seats} seats, the whole bill at {hooksGate.plan}.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Locked feature="Webhooks" plan={hooksGate.plan} pricePerMonth={hooksGate.pricePerMonth} what={hooksGate.what}>
            <Button>See what changes on {hooksGate.plan}</Button>
          </Locked>
          <Button variant="outline" onClick={() => navigate("/ollopa/connect/new?step=1")}>Back to what you can connect</Button>
        </div>
      </div>
    )
  }

  const names = stepNames(kindDef?.kind ?? (isAdmin ? null : "Google Calendar"))
  const total = names.length
  const asked = Number(route.query.get("step"))
  const firstNotDone = Math.min(total, (names.findIndex((_, i) => !draft.stepsDone.includes(i + 1)) + 1) || total)
  const current = Math.min(Math.max(asked || (slug ? firstNotDone : 1), 1), total)

  const go = (step: number) => navigate(`/ollopa/connect/${slug || "new"}?step=${step}`)
  const markDone = (step: number) => save({ stepsDone: [...new Set([...draft.stepsDone, step])] })

  const summaries: Record<number, string> = {
    1: kindDef ? `${kindDef.kind}${kindDef.kind === "Salesforce" ? ` (${draft.environment})` : ""}` : "",
    2: draft.authorised ? draft.authUser || "signed in" : "",
    3: kindDef?.crm ? draft.objects.filter((o) => o.direction !== "off").map((o) => o.object).join(", ") : "",
    4: `${draft.pairs.length} pairs`,
    5: `${draft.onCrmDelete === "unlink" ? "deletions unlink" : "deletions delete"}, ${draft.onCrmMerge === "mirror" ? "merges mirrored" : "merges ignored"}`,
    6: draft.started ? "started" : "",
  }

  const steps: StepState[] = names.map((name, i) => ({
    n: i + 1,
    name,
    summary: summaries[i + 1] || undefined,
    done: draft.stepsDone.includes(i + 1),
    blocked: i + 1 >= 3 && !draft.authorised ? "Sign in first: these read the other system's fields" : undefined,
  }))

  const startSync = (state: "syncing" | "paused") => {
    save({ started: state, stepsDone: names.map((_, i) => i + 1) })
    const live = seed.integrations.find((i) => i.kind === draft.kind)
    if (draft.kind === "Webhook") { navigate("/ollopa/developer/webhooks"); return }
    navigate(`/ollopa/integrations/${live ? live.id : `draft-${slug}`}?started=${state}`)
  }

  const primary = () => {
    if (current === 1) {
      return slug
        ? <Button onClick={() => { markDone(1); go(2) }}>Continue to authorising {kindDef?.kind}</Button>
        : <Button disabled>Choose a card above to continue</Button>
    }
    if (current === 2) {
      return <Button disabled={!draft.authorised} onClick={() => { markDone(2); go(3) }}>Continue to {kindDef?.crm ? "what syncs" : (THIRD_STEP[draft.kind] ?? "the last step").toLowerCase()}</Button>
    }
    if (kindDef?.crm) {
      if (current === 3) return <Button onClick={() => { markDone(3); go(4) }}>Continue to field mapping</Button>
      if (current === 4) return (
        <Button onClick={() => {
          const confirmed = draft.pairs.filter((p) => p.state === "suggested").length
          save({ pairs: draft.pairs.map((p) => (p.state === "suggested" ? { ...p, state: "mapped" } : p)), stepsDone: [...new Set([...draft.stepsDone, 4])] })
          toast(`${confirmed} suggested pairs confirmed`)
          go(5)
        }}>Continue to sync rules</Button>
      )
      if (current === 5) return <Button onClick={() => { markDone(5); go(6) }}>Continue to review</Button>
      return (
        <>
          <Button onClick={() => startSync("syncing")}>Start syncing</Button>
          <Button variant="outline" onClick={() => startSync("paused")}>Save without syncing</Button>
        </>
      )
    }
    return (
      <>
        <Button onClick={() => startSync("syncing")}>{draft.kind === "Webhook" ? "Save the subscription and open webhooks" : `Start ${draft.kind === "Slack" ? "posting" : "syncing"}`}</Button>
        <Button variant="outline" onClick={() => startSync("paused")}>Save without {draft.kind === "Slack" ? "posting" : "syncing"}</Button>
      </>
    )
  }

  const backLink = current > 1
    ? <Button variant="ghost" onClick={() => go(current - 1)}>Back to {names[current - 2].toLowerCase()}</Button>
    : null

  const constant = draft.started
    ? `${draft.kind} is ${draft.started === "syncing" ? "syncing" : "connected and paused"}. Changes here take effect when you press the button on the last step.`
    : `Nothing syncs until you press ${kindDef?.crm ? "Start syncing on the last step" : "the button on the last step"}.`

  return (
    <>
      <Wizard
        steps={steps}
        current={current}
        go={go}
        constantLine={constant}
        onSaveAndExit={() => { toast(`Saved · ${draft.kind} setup, ${draft.stepsDone.length} of ${total} steps done`); navigate("/ollopa/settings/integrations") }}
        footer={<>{primary()}{backLink}{slug && <Button variant="ghost" onClick={() => setDiscarding(true)}>Discard this setup</Button>}</>}
      >
        {draft.seededFrom === "integration" && current === 1 && (
          <p className="rounded-md border bg-muted/40 p-3 text-sm">
            {draft.kind} is already connected. This re-runs its setup and changes nothing until you press the button on the last step. Editing one mapping, one rule or one token is on the {draft.kind} page, not here.
          </p>
        )}
        {current === 1 && <ChooseStep session={session} slug={slug} go={(s) => {
          const key = draftKey(session.business, s)
          writeDraft(key, { ...peekDraft(key, startingDraft(session.business, s, session.user)), stepsDone: [...new Set([...peekDraft(key, startingDraft(session.business, s, session.user)).stepsDone, 1])] })
          navigate(`/ollopa/connect/${s}?step=2`)
        }} />}
        {current === 2 && <AuthoriseStep session={session} draft={draft} save={save} />}
        {current === 3 && (kindDef?.crm ? <SyncStep session={session} draft={draft} save={save} /> : <ThirdStep session={session} draft={draft} save={save} />)}
        {current === 4 && <MapStep session={session} draft={draft} save={save} />}
        {current === 5 && <RulesStep draft={draft} save={save} />}
        {current === 6 && <ReviewStep session={session} draft={draft} go={go} />}
      </Wizard>

      <Confirm
        open={discarding}
        title={`Discard the ${draft.kind} setup?`}
        body={
          <>
            <p>{draft.stepsDone.length} of {total} steps go, with the field pairs, the rules and the answers on them.</p>
            <p className="mt-2">{draft.authorised ? `The token granted to ${draft.authUser} is revoked.` : "No token has been granted yet."} Nothing that is already in Ollopa changes.</p>
          </>
        }
        confirmLabel="Discard the setup"
        onConfirm={() => { drop(); setDiscarding(false); toast(`Discarded the ${draft.kind} setup`); navigate("/ollopa/settings/integrations") }}
        onCancel={() => setDiscarding(false)}
      />
    </>
  )
}
