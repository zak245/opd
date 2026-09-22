// The four nodes this folder owns: `P-companies`, `P-accounts`, `Q-company` and `R-company`.
//
// `Q-company` is a drawer on a table and has no route of its own — the record is what a link
// carries — so a deep link that names the quick look lands on the record it is the top of.
//
// `/ollopa/accounts/:id` redirects to `/ollopa/companies/:id`: a company and an account are one
// object with a customer state, and there is one record, not two (PLAN.md, 15 September 2026).
import { declarePaneFields } from "../../ui/Beside"
import type { PageComponent } from "../../Product"
import type { BesideComponent } from "../../beside"
import { Actions } from "../../ui/Actions"
import { useDisclosure } from "../../ui/useDisclosure"
import { CompaniesPage } from "./CompaniesPage"
import { AccountsPage } from "./AccountsPage"
import { CompanyRecord } from "./CompanyRecord"
import { CREDITS, TODAY, seedFor } from "../../data/seed"
import type { Business } from "../../usage/model"
import { isCustomer, viewOf } from "./data"
import { quickLookFields } from "./quickLook"
import { renewalText } from "./format"
import { applyChange, changeFor, useChanges } from "./changes"

const ACCOUNT_RECORD = /^#?\/ollopa\/accounts\/([^/?#]+)/

/**
 * The redirect. It replaces the entry rather than pushing one, so Back goes where the person came
 * from and not into a loop. An account id resolves to its company; a company id passes straight
 * through, so both `/ollopa/accounts/acc-3` and `/ollopa/accounts/co-3` land on the same record.
 */
function redirectAccountRecord() {
  const match = ACCOUNT_RECORD.exec(location.hash)
  if (!match) return
  const id = match[1]
  let companyId = id
  try {
    const business = (JSON.parse(localStorage.getItem("ollopa.session") ?? "null")?.business ?? "meridian") as Business
    const seed = seedFor(business)
    companyId = seed.accounts.find((a) => a.id === id)?.companyId ?? id
  } catch { /* an unreadable session: the id passes through unchanged */ }
  location.replace(`${location.pathname}${location.search}#/ollopa/companies/${companyId}`)
}

if (typeof window !== "undefined") {
  redirectAccountRecord()
  window.addEventListener("hashchange", redirectAccountRecord)
}

export const nodes: Record<string, PageComponent> = {
  "P-companies": CompaniesPage,
  "P-accounts": AccountsPage,
  "Q-company": CompanyRecord,
  "R-company": CompanyRecord,
}

/* ----------------------------------------------------------------- a company, read beside a page */

function say(text: string) {
  document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: text }))
}

/** The company as this session has it: the seed plus whatever has been changed on top of it. */
function mergedCompany(business: Business, id: string) {
  const seed = seedFor(business)
  const found = seed.companies.find((c) => c.id === id)
    ?? seed.companies.find((c) => c.id === seed.accounts.find((a) => a.id === id)?.companyId)
  if (!found) return null
  const change = changeFor(found.id)
  return {
    seed,
    company: {
      ...found,
      ...(change.stage ? { stage: change.stage } : {}),
      ...(change.owner ? { owner: change.owner } : {}),
      ...(change.name ? { name: change.name } : {}),
    },
  }
}

/**
 * A company read beside another page — a deal, a person, a sequence.
 *
 * The body is the record's first level in the record's own order: the same fields, the same labels,
 * built from `quickLookFields`, so the pane, the drawer and the top of the page cannot drift apart.
 * Then the acts a chain that arrives here runs, drawn by their kind. There are two of them and
 * neither is filled, because they are comparable (DESIGN.md §1). Marking a company do not prospect
 * is not here: it stops the sequences of everybody at the company, which is not something a look
 * beside another page should be able to do in one click, so it lives on the record with its
 * confirmation and the pane's way to it is "Open the page". Nothing is written under a free,
 * reversible act; researching spends, so it carries its one line.
 */
const CompanyBeside: BesideComponent = ({ session, id }) => {
  // What has already been changed on this company in this session, so an action taken in here shows
  // its effect in here, at once, and the record behind says the same thing.
  void useChanges()
  // Which fields this pane shows is the same question the record page asks about its own header and
  // the table asks about its drawer: what does this seat, at this business, read in a typical week.
  const d = useDisclosure("companies")
  declarePaneFields("companies")
  const found = mergedCompany(session.business, id)
  if (!found) return <p className="text-muted-foreground">This company is not in this workspace.</p>

  const { seed, company } = found
  const v = viewOf(seed, company)
  const change = changeFor(company.id)
  const customer = isCustomer(company) && Boolean(v.account)
  const business = seed.workspace
  const runs = (change.researchRuns ?? []).length + v.research.length
  const canEdit = company.owner === session.user || session.role === "admin" || session.role === "cs"

  const research = () => {
    const before = change.researchRuns ?? []
    applyChange(company.id, { researchRuns: [{ id: `run-${before.length + 1}`, agent: "Research agent", at: TODAY, sources: 14, credits: CREDITS.research }, ...before] })
    say(`Research agent ran on ${company.name} · ${CREDITS.research} credits. The brief is in the company's research door.`)
  }

  const logTouch = () => {
    const before = change.touches ?? []
    applyChange(company.id, { touches: [{ kind: "Touch", at: TODAY, note: `Logged beside ${business.name}`, by: session.user }, ...before] })
    say(`Touch logged on ${company.name}. Last touch is today and the health score follows it.`)
  }

  return (
    <div className="space-y-4">
      <dl className="space-y-2.5">
        {quickLookFields(v, business.currency, d.level).map((f) => (
          <div key={f.label} className="grid grid-cols-[7rem_1fr] items-baseline gap-3">
            <dt className="t-label text-muted-foreground">{f.label}</dt>
            <dd className="t-body min-w-0">{f.value}</dd>
          </div>
        ))}
      </dl>

      {/* A seat that cannot change this company gets the sentence naming who can, not a control it
          may not use (RULES.md rule 4). Researching spends credits and anybody may do it. */}
      <div className="space-y-3 border-t pt-3">
        <Actions
          surface="pane"
          layout="stack"
          items={[
            {
              kind: "secondary",
              label: runs === 0 ? "Research" : "Research again",
              onClick: research,
              cost: `${CREDITS.research} credits`,
              consequence: "Charged once",
            },
            ...(customer && canEdit
              ? [{ kind: "secondary" as const, label: "Log a touch today", onClick: logTouch }]
              : []),
          ]}
        />
        {!canEdit && (
          <p className="t-small text-muted-foreground">
            {company.owner} owns {company.name}; only the owner, customer success or an admin can change it.
          </p>
        )}
      </div>
    </div>
  )
}

/** The frame's header: the name, one line of context, and where "Open the page" goes. */
CompanyBeside.head = ({ session, id }) => {
  const found = mergedCompany(session.business, id)
  if (!found) return { name: id, context: "", route: `/ollopa/companies/${id}` }
  const { seed, company } = found
  const account = seed.accounts.find((a) => a.companyId === company.id)
  const contacts = seed.contacts.filter((c) => c.companyId === company.id).length
  return {
    name: company.name,
    context: isCustomer(company) && account
      ? `${account.health} · ${account.band} · renews ${renewalText(account.renewal)}`
      : `${company.stage} · ${contacts} contact${contacts === 1 ? "" : "s"} · ${company.domain}`,
    route: `/ollopa/companies/${company.id}`,
  }
}

export const besides: Record<string, BesideComponent> = { company: CompanyBeside }
