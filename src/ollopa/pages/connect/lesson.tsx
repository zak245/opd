// The connect page at the steps before the last one: the same page, laid out the way it was.
//
// This is not a second implementation of the wizard. It is the same component tree, the same seed and
// the same numbers, placed where each rule had not yet moved them. `ConnectWizard` renders this while
// any of the case's rules is still off, and renders the shipped wizard the moment they are all on, so
// the last step of the lesson and the product are the same DOM (BUILD-WAVE3.md, "The contract").
//
// Everything step 0 draws is documented: specs/15-connect-integration.md §5, which is built from
// Apollo's own articles (4414356051725, 4414496822797, 4414469523981, 7683909560845) and
// knowledge-base/sources/07-apollo-settings-map.md §§1.3 and 1.4. Nothing here is invented.
import { AlertTriangle, ChevronRight, Lock, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ruleOn, type Lesson, type Rule } from "../../../learn/context"
import { Door } from "../../ui/Door"
import { gate, money } from "../../ui/gate"
import { businessById } from "../../data/businesses"
import { seedFor } from "../../data/seed"
import type { Session } from "../../session"
import { Check, Consequence, Picker, Radio, n } from "./bits"
import { WRITE_RULES, remoteObject, startingDraft, type ConnectDraft } from "./connectData"

/** The rules this case applies, in the order spec 15 §7 applies them: 2, 4, 5, 7, 1, 6, 8. */
export const CONNECT_RULES: Rule[] = [2, 4, 5, 7, 1, 6, 8]

/* ------------------------------------------------------------------------------- small helpers */

/** A thing that can move. The id is the usage item id wherever one exists (`usage/connect.ts`). */
function Item({ id, label, className, children }: {
  id: string; label: string; className?: string; children: React.ReactNode
}) {
  return <div data-item={id} data-item-label={label} className={className}>{children}</div>
}

function Place({ id, label, open = true, className, children }: {
  id: string; label: string; open?: boolean; className?: string; children: React.ReactNode
}) {
  return (
    <div data-container={id} data-container-label={label} data-open={open ? "true" : "false"} hidden={!open} className={className}>
      {children}
    </div>
  )
}

function Heading({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{children}</h3>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

/** The documented Salesforce sync errors (16-apollo-workflow-inventory.md §20). */
const ERRORS = [
  { code: "DUPLICATES_DETECTED", what: "Salesforce refused the push: a matching record already exists.", fix: "Merge the Salesforce duplicates, then retry. ollopA mirrors Salesforce and will not merge for you." },
  { code: "INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST", what: "A stage value ollopA sent is not in the Salesforce picklist.", fix: "Add the value to the picklist, or map the stage to one that exists." },
  { code: "STORAGE_LIMIT_EXCEEDED", what: "The Salesforce org is out of data storage.", fix: "Free storage in Salesforce, then retry. Nothing pushes until there is room." },
  { code: "No participant as contact or lead", what: "An email had no matching contact or lead in Salesforce.", fix: "Push the contact first, or turn off pushing emails for unknown participants." },
]

/* --------------------------------------------------------------------------------- the page */

export function ConnectLesson({ session, lesson }: { session: Session; lesson: Lesson }) {
  const on = (r: Rule) => ruleOn(lesson, r)
  const seed = seedFor(session.business)
  const b = businessById(session.business)
  const draft: ConnectDraft = startingDraft(session.business, "salesforce", session.user)
  const live = seed.integrations.find((i) => i.kind === "Salesforce")
  const custom = gate("crm.custom-objects", session.business)

  const flat = on(2)

  return (
    <div className={cn("min-h-full bg-background", flat ? "" : "")}>
      <div className="mx-auto grid max-w-5xl gap-4 px-4 py-5 lg:px-6">
        {/* The page's own chrome at step 0: a marketplace under Settings, a page per integration,
            tabs on the page and sub-tabs inside the tabs (settings map §1.3: "D1 … D2 … D3 … D4"). */}
        {!flat && (
          <nav aria-label="Where you are" className="text-xs text-muted-foreground">
            Settings <ChevronRight className="inline size-3" aria-hidden="true" /> Integrations{" "}
            <ChevronRight className="inline size-3" aria-hidden="true" /> <span className="text-foreground">Salesforce</span>
          </nav>
        )}

        {!on(7) && (
          <Place id="connect.strip" label="the status strip" className="rounded-lg border border-amber-300 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/20">
            <Item id="connect.timer" label="the six-hour window">
              <p className="text-sm font-medium">Syncing starts automatically in 5 hours 42 minutes.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                You have a 6-hour window to configure push and pull settings and map fields. You cannot pull records
                manually during it. After 6 hours syncing is enabled for you, with whatever is set at that moment.
              </p>
            </Item>
          </Place>
        )}

        {flat ? <Flat session={session} draft={draft} on={on} /> : <Tabbed session={session} draft={draft} on={on} />}

        {/* The error log. Apollo puts it on the same page as the sync settings, behind a tab, with the
            fix on hover. It is level one on the integration page and not on the wizard (rule 1). */}
        {!on(1) && flat && (
          <ErrorArea on={on} />
        )}

        <Place id="connect.footer" label="the footer" className="flex flex-wrap items-center gap-3 border-t pt-4">
          <Item id="connect.primary" label={on(4) ? "Start syncing" : "Done"}>
            <Button>{on(7) ? "Start syncing" : on(4) ? "Start syncing" : "Done"}</Button>
          </Item>
          {!on(4) && (
            <Item id="connect.next" label="Next">
              <Button variant="outline">Next</Button>
            </Item>
          )}
          {on(5) && (
            <Item id="wiz.save-exit" label="Save and exit" className="ml-auto">
              <Button variant="ghost">
                Save and exit{on(8) && <span className="ml-2 text-xs text-muted-foreground">⌘S</span>}
              </Button>
            </Item>
          )}
        </Place>

        {on(5) && (
          <p className="text-xs text-muted-foreground">
            Every answer is saved as you make it. Leaving and coming back returns this page exactly as it is;
            the draft is offered again from Settings and from Home.
          </p>
        )}

        {!flat && (
          <p className="text-xs text-muted-foreground">
            Selective sync is available on certain plans purchased after 24 July 2024. {b.plan.name} includes it.
          </p>
        )}

        {custom.locked && flat && on(4) && (
          <p className="text-xs text-muted-foreground">
            Custom objects are on {custom.plan}: {money(custom.pricePerMonth)} a month for {b.plan.seats} seats.
          </p>
        )}

        {live && flat && on(7) && (
          <p className="text-xs text-muted-foreground">
            {n(live.remoteCounts.Contacts ?? 0)} Salesforce contacts and {n(live.remoteCounts.Companies ?? 0)} accounts
            are in range of the rules above. Nothing moves until you press the button.
          </p>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------- step 0: marketplace, tabs and sub-tabs */

function Tabbed({ session, draft, on }: { session: Session; draft: ConnectDraft; on: (r: Rule) => boolean }) {
  const seed = seedFor(session.business)
  const b = businessById(session.business)

  const TABS = [
    { id: "contacts", name: "Contacts" },
    { id: "leads", name: "Leads" },
    { id: "accounts", name: "Accounts" },
    { id: "deals", name: "Deals" },
    { id: "activities", name: "Activities" },
    { id: "authentication", name: "Authentication" },
    { id: "errors", name: "Error logs" },
  ]

  return (
    <>
      {/* The marketplace: category chips and cards, two buttons on the Salesforce card, a product
          variant to choose on HubSpot. The first decision is an environment, not what syncing does. */}
      <section data-container="connect.marketplace" data-container-label="the marketplace list" data-open="true" className="grid gap-2">
        <Heading sub="Browse the marketplace and connect what you use.">Integrations</Heading>
        <div className="flex flex-wrap gap-2">
          {["All", "CRM", "Calendar", "Enrichment", "Notifications", "Data"].map((c, i) => (
            <span key={c} className={cn("rounded-full border px-2.5 py-1 text-xs", i === 0 && "bg-muted font-medium")}>{c}</span>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Item id="wiz.choose" label="the Salesforce card" className="rounded-lg border bg-card p-3">
            <p className="text-sm font-medium">Salesforce</p>
            <p className="mt-0.5 text-xs text-muted-foreground">CRM</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm">Connect</Button>
              <span data-item="wiz.sandbox" data-item-label="Connect to Sandbox">
                <Button size="sm" variant="outline">Connect to Sandbox</Button>
              </span>
            </div>
          </Item>
          <Item id="connect.hubspot-variant" label="the HubSpot card" className="rounded-lg border bg-card p-3">
            <p className="text-sm font-medium">HubSpot</p>
            <p className="mt-0.5 text-xs text-muted-foreground">CRM</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" variant="outline">HubSpot CRM</Button>
              <Button size="sm" variant="outline">HubSpot Data Enrichment</Button>
            </div>
          </Item>
          <Item id="connect.slack-card" label="the Slack card" className="rounded-lg border bg-card p-3">
            <p className="text-sm font-medium">Slack</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Notifications</p>
            <div className="mt-2"><Button size="sm" variant="outline">Allow</Button></div>
          </Item>
          <Item id="connect.more-cards" label="the rest of the marketplace" className="rounded-lg border bg-card p-3 sm:col-span-3">
            <p className="text-xs text-muted-foreground">
              Pipedrive · Zoho · Microsoft Dynamics · Outreach · Salesloft · Marketo · SendGrid · Mailgun · Vidyard ·
              Zapier · Snowflake · API · OpenAI · Perplexity · Anthropic
            </p>
          </Item>
        </div>
      </section>

      {/* Authorising: four contexts, no step count, no progress, no resume. The buttons are
          "Save and next" and "Done", which say nothing about where they lead. */}
      <section data-container="connect.auth" data-container-label="Authorisation" data-open="true" className="grid gap-2">
        <Heading>Salesforce</Heading>
        <Item id="wiz.authorise" label="authorising Salesforce" className="rounded-lg border p-3">
          <p className="text-sm font-medium">Connect</p>
          <ol className="mt-2 grid list-decimal gap-1 pl-5 text-xs text-muted-foreground sm:grid-cols-2 sm:gap-x-6">
            <li>Here: Connect, then Install Managed Package.</li>
            <li>On the AppExchange: Get It Now, confirm, Confirm and install, choose who it installs for, Install, Done.</li>
            <li>In Salesforce: App Launcher, the Setup app, Get Started, create or pick an integration user, Save and next, review permissions, copy the credentials somewhere safe, Connect.</li>
            <li>Back here: Connect, Yes Continue, log in as the integration user.</li>
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm">Save and next</Button>
            <Button size="sm" variant="outline">Done</Button>
          </div>
        </Item>
      </section>

      {/* The page's tabs, and sub-tabs inside them: four levels to a sync setting. */}
      <section className="grid gap-2">
        <div className="flex flex-wrap gap-1 border-b pb-1" role="tablist" aria-label="Salesforce">
          {TABS.map((t, i) => (
            <span key={t.id} role="tab" aria-selected={i === 0} className={cn("rounded-t-md px-3 py-1.5 text-xs", i === 0 ? "border-b-2 border-foreground font-medium" : "text-muted-foreground")}>
              {t.name}
            </span>
          ))}
        </div>

        <Place id="connect.tab.contacts" label="the Contacts tab" open className="grid gap-3">
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Contacts">
            <span role="tab" aria-selected className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium">Sync</span>
            <span role="tab" aria-selected={false} className="rounded-md px-2.5 py-1 text-xs text-muted-foreground">Field mapping</span>
          </div>

          <Place id="connect.subtab.sync" label="the Sync sub-tab" open className="grid gap-3 rounded-lg border p-3">
            <Item id="wiz.pull-conditions" label="pull conditions">
              <Heading sub="Default: everything comes across.">Pull</Heading>
              <div className="mt-2 grid gap-1">
                <Check checked={false} onChange={() => {}} label="Pull contacts based on specific conditions" />
                <Check checked={false} onChange={() => {}} label="Hide my contacts and leads pulled from Salesforce" hint="Hides them from you, the person who pulled them." />
              </div>
            </Item>

            <Door id="connect.selective-sync" label="Selective sync">
              <div data-item="connect.plan-gate" data-item-label="the plan-gated door">
                <p className="text-sm">Selective sync is available on certain plans purchased after 24 July 2024.</p>
              </div>
            </Door>

            <Item id="wiz.push-conditions" label="push conditions">
              <Heading sub="Push account is on by default.">Push</Heading>
              <div className="mt-2 grid gap-1">
                <Check checked onChange={() => {}} label="Push contact" />
                <Check checked onChange={() => {}} label="Push account" />
                <Check checked={false} onChange={() => {}} label="Push unverified emails" />
                <Check checked={false} onChange={() => {}} label="Push by stage" hint="The stages it names are mapped on the Field mapping sub-tab." />
                <label className="mt-1 block max-w-xs text-sm">
                  <span className="text-xs text-muted-foreground">Source field</span>
                  <Input className="mt-1" defaultValue={draft.sourceValue} />
                </label>
              </div>
            </Item>

            {/* §1.4: deletion sync and merge sync live inside a block labelled "Advanced sync". */}
            <Door id="connect.advanced" label="Advanced sync">
              <div className="grid gap-3">
                <Item id="wiz.deletion" label="deletion sync">
                  <p className="text-sm font-medium">Deletion sync</p>
                  <Check checked={false} onChange={() => {}} label="Delete in ollopA when deleted in Salesforce" />
                </Item>
                <Item id="wiz.merge" label="merge sync">
                  <p className="text-sm font-medium">Merge sync</p>
                  <Check checked={false} onChange={() => {}} label="Mirror Salesforce merges in ollopA" />
                </Item>
              </div>
            </Door>
          </Place>

          <Place id="connect.subtab.mapping" label="the Field mapping sub-tab" open={false} className="grid gap-3 rounded-lg border p-3">
            <Item id="wiz.mapping" label="the field pairs" className="min-w-0">
              <Heading>Field mapping</Heading>
              <table data-container="connect.pairs" data-container-label="the field pair table" data-open="true" className="mt-2 w-full text-xs">
                <tbody>
                  {draft.pairs.slice(0, 5).map((p) => (
                    <tr key={p.id} className="border-b"><td className="py-1">{p.ollopa}</td><td className="py-1">{p.remote}</td></tr>
                  ))}
                </tbody>
              </table>
            </Item>
            <Item id="wiz.write-rule" label="data writing rules">
              <p className="text-sm font-medium">Data writing rules</p>
              <p className="text-xs text-muted-foreground">Auto-fill or Overwrite, set for the whole object here, away from the pair each one governs.</p>
            </Item>
            <Item id="wiz.stage-mapping" label="stage mapping">
              <p className="text-sm font-medium">Stages</p>
              <p className="text-xs text-muted-foreground">Stages must map one to one. Auto-map all stages.</p>
            </Item>
            <Item id="connect.auto-applied" label="the mappings applied for you">
              <p className="text-xs text-muted-foreground">{draft.pairs.length} fields were mapped for you when the connection was made.</p>
            </Item>
          </Place>
        </Place>

        <Place id="connect.tab.leads" label="the Leads tab" open={false} className="rounded-lg border p-3">
          <Item id="connect.leads-or-contacts" label="create as leads or contacts">
            <p className="text-sm">Create new records as leads or as contacts. New records only.</p>
          </Item>
        </Place>

        <Place id="connect.tab.accounts" label="the Accounts tab" open={false} className="grid gap-3 rounded-lg border p-3">
          <Item id="connect.infer" label="infer missing data">
            <Check checked={false} onChange={() => {}} label="Infer missing data from Salesforce accounts with no name or website" hint="1 enrichment credit per account." />
          </Item>
          <Item id="wiz.matching-key" label="duplicate handling">
            <p className="text-sm font-medium">Duplicate handling</p>
            <p className="text-xs text-muted-foreground">ollopA mirrors Salesforce. Clean and deduplicate Salesforce before connecting.</p>
          </Item>
        </Place>

        <Place id="connect.tab.deals" label="the Deals tab" open={false} className="rounded-lg border p-3">
          <Item id="connect.deal-pipeline" label="the deal pipeline">
            <p className="text-sm">A pipeline is created from the Salesforce opportunity stage names. Deal stages can no longer be created here.</p>
          </Item>
        </Place>

        <Place id="connect.tab.activities" label="the Activities tab" open={false} className="rounded-lg border p-3">
          <Item id="wiz.activity-types" label="which activities push">
            <p className="text-sm font-medium">Push emails, notes, tasks, calls, meetings</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Email advanced settings · Tasks advanced settings · View advanced settings — three blocks named for who
              they are for, holding the six email types and the exclusion filter.
            </p>
          </Item>
        </Place>

        <Place id="connect.tab.authentication" label="the Authentication tab" open={false} className="rounded-lg border p-3">
          <Item id="connect.sync-user" label="the team sync user">
            <p className="text-sm">The ollopA user whose Salesforce connection drives team sync: {seed.users[0]?.name ?? b.roles[0].user}.</p>
          </Item>
        </Place>

        <Place id="connect.tab.errors" label="the Error logs tab" open={false} className="rounded-lg border p-3">
          <ErrorTable on={on} />
        </Place>
      </section>
    </>
  )
}

/* -------------------------------------------------------- the error log, wherever it is living */

function ErrorTable({ on }: { on: (r: Rule) => boolean }) {
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Heading sub="A failed push is retried up to five times.">Error logs</Heading>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">Show filters</Button>
          <span data-item="int.retry" data-item-label="retry">
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" aria-label="Refresh">
              <RefreshCw className="size-3.5" aria-hidden="true" />
              {on(4) && <span className="ml-1.5">Retry these {ERRORS.length * 85} records</span>}
            </Button>
          </span>
        </div>
      </div>
      <div data-container="connect.errors" data-container-label="the error table" data-open="true" className="grid gap-1">
        {ERRORS.map((e, i) => (
          <Item key={e.code} id={`int.errors${i === 0 ? "" : `.${i}`}`} label={e.code} className="rounded-md border p-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <AlertTriangle className="size-3.5 text-amber-600" aria-hidden="true" />
              <span className="font-medium">{e.code}</span>
              <span className="text-muted-foreground">{85 + i * 12} records</span>
            </div>
            {i === 0 && (
              on(4)
                ? (
                  <div data-item="connect.error-fix" data-item-label="the suggested fix" className="mt-1">
                    <p className="text-muted-foreground">{e.what}</p>
                    <p className="mt-0.5">Fix: {e.fix}</p>
                  </div>
                )
                : (
                  <div data-container="connect.error-hover" data-container-label="the hover card" data-open="false" hidden className="mt-1">
                    <div data-item="connect.error-fix" data-item-label="the suggested fix">
                      <p className="text-muted-foreground">{e.what}</p>
                      <p className="mt-0.5">Fix: {e.fix}</p>
                    </div>
                  </div>
                )
            )}
            {i === 0 && !on(4) && <p className="mt-1 text-muted-foreground">Hover the row for the description, the full message and the suggested fix.</p>}
          </Item>
        ))}
      </div>
    </div>
  )
}

function ErrorArea({ on }: { on: (r: Rule) => boolean }) {
  return (
    <section className="rounded-lg border p-3">
      <ErrorTable on={on} />
    </section>
  )
}

/* ------------------------------------------ steps 1 to 6: the flat setup page, one step per row */

function Step({ n: num, name, sub, children }: { n: number; name: string; sub?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section data-container={`connect.step.${num}`} data-container-label={`Step ${num}: ${name}`} data-open="true" className="grid gap-3 rounded-lg border p-4">
      <Heading sub={sub}>Step {num} of 6: {name}</Heading>
      {children}
    </section>
  )
}

function Flat({ session, draft, on }: { session: Session; draft: ConnectDraft; on: (r: Rule) => boolean }) {
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  const custom = gate("crm.custom-objects", session.business)
  const live = seed.integrations.find((i) => i.kind === "Salesforce")

  // Deletion, merge and matching: inside a door until rule 7 takes them out onto the page. Rule 4
  // gives the door the name of what is behind it; rule 5 brings matching in beside them.
  const doorId = on(4) ? "connect.deletions" : "connect.advanced"
  const doorLabel = on(4) ? "Deletions and merges" : "Advanced sync"

  const deletion = (
    <Item id="wiz.deletion" label="deletion sync">
      <p className="text-sm font-medium">When a record is deleted in Salesforce</p>
      <div className="mt-1 grid gap-1">
        <Radio name="del" checked onChange={() => {}} label="Unlink it in ollopA" />
        <Radio name="del" checked={false} onChange={() => {}} label="Delete it in ollopA" />
      </div>
      {on(7) && <Consequence>Deletes the person, their activity and their sequence history in ollopA. Nothing restores it.</Consequence>}
    </Item>
  )
  const merge = (
    <Item id="wiz.merge" label="merge sync">
      <p className="text-sm font-medium">When two records are merged in ollopA</p>
      <div className="mt-1 grid gap-1">
        <Radio name="mrg" checked onChange={() => {}} label="Do nothing in Salesforce" />
        <Radio name="mrg" checked={false} onChange={() => {}} label="Mirror the merge in Salesforce" />
      </div>
      {on(7) && <Consequence>Merging here merges there. The losing Salesforce record is deleted by Salesforce and cannot be unmerged.</Consequence>}
    </Item>
  )
  const matching = (
    <Item id="wiz.matching-key" label="the matching key">
      <p className="text-sm font-medium">Which key says two records are the same person</p>
      <div className="mt-1 grid gap-1">
        <Radio name="match" checked onChange={() => {}} label="Email, then CRM id" />
        <Radio name="match" checked={false} onChange={() => {}} label="CRM id only" />
      </div>
    </Item>
  )

  const destructive = (
    <>
      {deletion}
      {merge}
      {on(5) && matching}
    </>
  )

  return (
    <div className="grid gap-4">
      <Heading sub={on(5) ? "Every answer is saved as you make it. Nothing syncs until you press the button on the last step." : undefined}>
        Connect Salesforce
      </Heading>

      <Step n={1} name="Choose what to connect">
        <Item id="wiz.choose" label="the Salesforce card" className="rounded-lg border bg-card p-3">
          <p className="text-sm font-medium">Salesforce</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Sync contacts, companies, deals and activities with Salesforce, and decide what ollopA may write, delete and merge there.
          </p>
          {on(4) && <p className="mt-1 text-xs text-muted-foreground">Starter syncs one way · Growth both ways · Scale adds custom objects. You are on {b.plan.name}.</p>}
        </Item>
        {on(4) && (
          <Item id="wiz.declare-no-crm" label="ollopA is our CRM" className="rounded-lg border bg-card p-3">
            <Check checked={false} onChange={() => {}} label="ollopA is our CRM" hint="A decision, not an absence. It takes the CRM row out of the set-up list, and it is reversible here." />
          </Item>
        )}
        {on(8) && (
          <Item id="wiz.template" label="start from a saved template" className="rounded-lg border bg-card p-3">
            <Button size="sm" variant="outline">Start from a saved template</Button>
            <span className="ml-2 text-xs text-muted-foreground">Holds what syncs, the field pairs and the sync rules.</span>
          </Item>
        )}
      </Step>

      <Step n={2} name="Authorise">
        {on(7) && (
          <Item id="wiz.sf-permissions" label="what the sync user must be able to do" className="rounded-md border bg-card p-3">
            <p className="text-sm font-medium">What the sync user must be able to do</p>
            <p className="mt-1 text-sm">
              Create, read and edit on Accounts, Contacts, Leads, Opportunities and User Roles, and API Enabled under
              System Permissions. Salesforce Essentials cannot connect.
            </p>
          </Item>
        )}
        <Item id="wiz.sandbox" label="production or sandbox">
          <p className="text-sm font-medium">Which Salesforce</p>
          <div className="mt-1 grid max-w-md gap-2 sm:grid-cols-2">
            <Radio name="env" checked onChange={() => {}} label="Production" />
            <Radio name="env" checked={false} onChange={() => {}} label="Sandbox" />
          </div>
        </Item>
        <Item id="wiz.authorise" label="authorising Salesforce">
          <Button>Sign in to Salesforce{on(4) ? " as the sync user" : ""}</Button>
          <p className="mt-1 text-xs text-muted-foreground">Connected as {draft.authUser || "the sync user"}.</p>
        </Item>
      </Step>

      <Step n={3} name="Choose what syncs">
        <Item id="wiz.objects" label="what syncs, and which way">
          <div className="grid gap-2">
            {draft.objects.map((o) => (
              <div key={o.object} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm">
                <span>{o.object} <span className="text-xs text-muted-foreground">· Salesforce {remoteObject("Salesforce", o.object)}</span></span>
                <span className="text-xs">{o.direction === "both" ? "Both ways" : o.direction === "pull" ? "Pull only" : o.direction === "push" ? "Push only" : "Off"}</span>
              </div>
            ))}
          </div>
        </Item>
        {on(1) ? (
          <Door id="connect.activities.salesforce" label="Which activities to push (emails, calls, tasks, meetings)" count={draft.activityTypes.length}>
            <Item id="wiz.activity-types" label="which activities push">
              <div className="grid gap-1">
                {["Emails", "Calls", "Tasks", "Meetings"].map((t) => (
                  <Check key={t} checked={draft.activityTypes.includes(t)} onChange={() => {}} label={t} />
                ))}
              </div>
            </Item>
          </Door>
        ) : (
          <Item id="wiz.activity-types" label="which activities push">
            <p className="text-sm font-medium">Which activities to push</p>
            <div className="mt-1 grid gap-1">
              {["Emails", "Calls", "Tasks", "Meetings"].map((t) => (
                <Check key={t} checked={draft.activityTypes.includes(t)} onChange={() => {}} label={t} />
              ))}
            </div>
          </Item>
        )}
        {on(4) && (
          <Item id="wiz.custom-objects" label="custom Salesforce objects" className="rounded-md border p-2">
            <p className="flex items-center gap-1 text-sm font-medium">
              Custom Salesforce objects {custom.locked && <Lock className="size-3.5 text-muted-foreground" aria-hidden="true" />}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {custom.locked
                ? `${custom.plan} · ${money(custom.pricePerMonth)} a month for ${b.plan.seats} seats. Here, before anything is mapped.`
                : `Included on ${b.plan.name}. Here, before anything is mapped — never after you have built a mapping for an object you cannot sync.`}
            </p>
          </Item>
        )}
      </Step>

      <Step n={4} name="Map fields">
        <Item id="wiz.mapping" label="the field pairs" className="min-w-0 overflow-x-auto">
          <table data-container="connect.pairs" data-container-label="the field pair table" data-open="true" className="w-full min-w-[30rem] text-xs">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-1 pr-3 font-medium">ollopA field</th>
                <th className="py-1 pr-3 font-medium">Salesforce field</th>
                {on(5) && <th className="py-1 font-medium">Write rule</th>}
              </tr>
            </thead>
            <tbody>
              {draft.pairs.slice(0, 5).map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-1 pr-3">{p.ollopa}</td>
                  <td className="py-1 pr-3">{p.remote}</td>
                  {on(5) && (
                    <td className="py-1">
                      <span data-item={p.id === draft.pairs[0]?.id ? "wiz.write-rule" : undefined} data-item-label="the write rule">
                        {WRITE_RULES[0]}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Item>
        {!on(5) && (
          <Item id="wiz.write-rule" label="data writing rules">
            <p className="text-sm font-medium">Data writing rules</p>
            <p className="text-xs text-muted-foreground">Auto-fill or Overwrite, set for the whole object, away from the pair each one governs.</p>
          </Item>
        )}
        <Item id="wiz.stage-mapping" label="stage mapping">
          <p className="text-sm font-medium">Stages, one to one</p>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            {draft.stageMap.slice(0, 4).map((s) => (
              <Picker key={s.ollopa} label={s.ollopa} value={s.remote} options={[s.remote]} onChange={() => {}} />
            ))}
          </div>
          {on(5) && <p className="mt-1 text-xs text-muted-foreground">Push by stage is set on step 5; the stages it names are these.</p>}
        </Item>
        {on(6) ? (
          <Item id="wiz.suggested-mappings" label="mapped, suggested, required unmapped">
            <p className="text-sm">Contacts · {draft.pairs.filter((p) => p.state !== "suggested").length} mapped, {draft.pairs.filter((p) => p.state === "suggested").length} suggested, 1 required unmapped.</p>
            <p className="mt-0.5 text-xs text-muted-foreground">A suggestion is not a decision. Saving this step confirms them and says how many.</p>
          </Item>
        ) : (
          <Item id="connect.auto-applied" label="the mappings applied for you">
            <p className="text-xs text-muted-foreground">{draft.pairs.length} fields were mapped for you when the connection was made.</p>
          </Item>
        )}
        {on(1) && (
          <Door id="connect.unmapped.salesforce.Contacts" label="Show 18 unmapped Salesforce fields" count={18}>
            <p className="text-xs text-muted-foreground">The tail nobody maps on a first connection, in one place, one click away.</p>
          </Door>
        )}
      </Step>

      <Step n={5} name="Set sync rules">
        <Item id="wiz.pull-conditions" label="pull conditions">
          <p className="text-sm font-medium">Pull: what comes into ollopA</p>
          <div className="mt-1 grid gap-1">
            <Radio name="pull" checked={!on(6)} onChange={() => {}} label="Pull every record from Salesforce" />
            <Radio name="pull" checked={on(6)} onChange={() => {}} label="Pull only records that match" />
            {on(6)
              ? <div className="rounded-md border p-2 text-xs text-muted-foreground">Owner is a user in this workspace. The builder is here because you chose the radio above.</div>
              : <div className="rounded-md border p-2 text-xs text-muted-foreground">Owner is a user in this workspace — a condition that was filled in for you.</div>}
          </div>
        </Item>
        <Item id="wiz.push-conditions" label="push conditions">
          <p className="text-sm font-medium">Push: what goes out to Salesforce</p>
          <div className="mt-1 grid gap-1">
            <Check checked onChange={() => {}} label="Push by stage" />
            <Check checked={false} onChange={() => {}} label="Push contacts whose email is unverified" />
          </div>
        </Item>

        {on(7) ? destructive : (
          <Door id={doorId} label={doorLabel}>
            <div className="grid gap-3">{destructive}</div>
          </Door>
        )}

        {!on(5) && matching}
      </Step>

      <Step n={6} name="Review and start">
        {on(7) && (
          <Item id="wiz.first-sync" label="what the first sync will do" className="rounded-lg border bg-card p-3">
            <p className="text-sm font-semibold">What the first sync will do</p>
            <p className="mt-1 text-sm">
              ollopA will pull about {n(Math.round((live?.remoteCounts.Contacts ?? 18_400) / 100) * 100)} contacts and{" "}
              about {n(Math.round((live?.remoteCounts.Companies ?? 3_100) / 100) * 100)} companies from Salesforce and push
              about {n(b.counts.contacts)} contacts to Salesforce. Deletions in Salesforce will unlink records in ollopA.
              Merges in ollopA will be kept in ollopA only.
            </p>
          </Item>
        )}
        <Item id="wiz.review" label="the review">
          <p className="text-sm font-medium">Review</p>
          <ul className="mt-1 grid gap-1 text-xs text-muted-foreground">
            <li>Salesforce (production) · connected as {draft.authUser || "the sync user"}</li>
            <li>{draft.objects.map((o) => `${o.object} ${o.direction}`).join(" · ")}</li>
            <li>{draft.pairs.length} field pairs · {draft.stageMap.filter((s) => s.remote).length} of {draft.stageMap.length} stages matched</li>
          </ul>
        </Item>
      </Step>
    </div>
  )
}
