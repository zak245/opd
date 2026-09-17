// The four nodes this folder owns: `P-companies`, `P-accounts`, `Q-company` and `R-company`.
//
// `Q-company` is a drawer on a table and has no route of its own — the record is what a link
// carries — so a deep link that names the quick look lands on the record it is the top of.
//
// `/ollopa/accounts/:id` redirects to `/ollopa/companies/:id`: a company and an account are one
// object with a customer state, and there is one record, not two (PLAN.md, 15 September 2026).
import type { PageComponent } from "../../Product"
import { CompaniesPage } from "./CompaniesPage"
import { AccountsPage } from "./AccountsPage"
import { CompanyRecord } from "./CompanyRecord"
import { seedFor } from "../../data/seed"
import type { Business } from "../../usage/model"

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
