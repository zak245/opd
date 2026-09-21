// Accounts: the renewal book, the accounts that moved the wrong way this week, and where more is possible.
//
// Three short lists rather than one long one, because they are three different decisions. Each row
// carries the one number that decision turns on: the renewal date, the health drop, the signal.
import { href } from "@/app/router"
import { Actions } from "../../ui/Actions"
import { openBeside } from "../../beside"
import type { Company } from "../../data/seed"
import { type Disclosure } from "../../ui"
import type { HomeData } from "./data"
import { day } from "./format"
import { Nothing, Row, RowList, Section } from "./rows"

/** The row names an account, so it opens the account beside Home rather than replacing it. */
function AccountRow({ c, figure, money, ids }: { c: Company; figure: string; money: (n: number) => string; ids: string[] }) {
  const open = (opener?: HTMLElement | null) => openBeside({
    kind: "company",
    id: c.id,
    list: { ids, index: Math.max(0, ids.indexOf(c.id)) },
    opener: opener ?? document.querySelector<HTMLElement>(`[data-item="${c.id}"]`),
  })
  return (
    <Row itemId={c.id} itemLabel={c.name} onEnter={() => open()}>
      <span className="min-w-0 flex-1">
        <span className="font-medium">{c.name}</span>
        <span className="block text-xs text-muted-foreground">{c.owner} · {c.arr ? `${money(c.arr)} a year` : "no contract value"}</span>
      </span>
      <span className="shrink-0 tabular-nums">{figure}</span>
      <Actions surface="card" className="shrink-0" items={[{ kind: "link", label: "Open", href: href(`/ollopa/companies/${c.id}`), onClick: () => open() }]} />
    </Row>
  )
}

function List({ title, rows, figure, money, empty }: {
  title: string
  rows: Company[]
  figure: (c: Company) => string
  money: (n: number) => string
  empty: string
}) {
  return (
    <div className="pb-3">
      <h4 className="pb-1 text-xs font-medium text-muted-foreground">{title} ({rows.length})</h4>
      {rows.length > 0
        ? <RowList label={title}>{rows.slice(0, 4).map((c) => <AccountRow key={c.id} c={c} figure={figure(c)} money={money} ids={rows.slice(0, 4).map((x) => x.id)} />)}</RowList>
        : <Nothing text={empty} />}
    </div>
  )
}

export function Accounts({ data, d, order }: { data: HomeData; d: Disclosure; order: number }) {
  const a = data.accounts
  const m = data.money
  return (
    <Section id="home-accounts" title="Accounts" order={order} link={{ label: "Accounts", to: "/ollopa/accounts" }}>
      {d.atLevelOne("home.accounts.renewals") && (
        <List title="Renewals in the next 60 days" rows={a.renewals} money={m} figure={(c) => day(c.renewalDate)} empty="No renewal in the next 60 days." />
      )}
      {d.atLevelOne("home.accounts.health") && (
        <List title="Health dropped this week" rows={a.healthDropped} money={m} figure={(c) => `${c.health} (${c.healthDelta7d})`} empty="No account dropped this week." />
      )}
      {d.atLevelOne("home.accounts.expansion") && (
        <List title="Expansion signals" rows={a.expansion} money={m} figure={(c) => c.expansionSignal ?? "—"} empty="No expansion signal this week." />
      )}
    </Section>
  )
}
