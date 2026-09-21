// Pipeline: the numbers an account executive acts on, and the deals behind the two that need work.
//
// Needs attention comes first and is a count only: the six warnings and their thresholds belong to the
// deal record and the board, so Home counts them and states nothing of its own. An AE who has direct
// reports gets the team roll-up above her own, because that is the number her week is measured in.
import { href } from "@/app/router"
import { Actions } from "../../ui/Actions"
import { openBeside } from "../../beside"
import { follow } from "../../chain"
import { originHere } from "../work/register"
import { Door, type Disclosure } from "../../ui"
import type { Deal } from "../../data/seed"
import type { HomeData } from "./data"
import { day } from "./format"
import { Nothing, Row, RowList, Section } from "./rows"

function Stat({ label, value, sub, to }: { label: string; value: string; sub?: string; to?: string }) {
  const body = (
    <>
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className="block text-base font-semibold tabular-nums">{value}</span>
      {sub && <span className="block text-xs text-muted-foreground">{sub}</span>}
    </>
  )
  // Leaving Home for the board is for acting on the whole set, and it carries the filter and the
  // trail: the crumb comes back to Pipeline with this number still under the cursor.
  return to
    ? (
      <button
        type="button"
        className="rounded-md border px-3 py-2 text-left hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        onClick={() => follow(to, originHere("home-pipeline"))}
      >
        {body}
      </button>
    )
    : <div className="rounded-md border px-3 py-2">{body}</div>
}

/**
 * The row names a deal, so it opens the deal — beside Home, with the rest of the pipeline still on
 * screen and the stage, the amount and the next step all readable without leaving. The way to the
 * record is "Open the page" in the pane, which keeps Home and this row on the trail.
 */
function DealRow({ deal, note, money, ids }: { deal: Deal; note: string; money: (n: number) => string; ids: string[] }) {
  const open = (opener?: HTMLElement | null) => openBeside({
    kind: "deal",
    id: deal.id,
    list: { ids, index: Math.max(0, ids.indexOf(deal.id)) },
    opener: opener ?? document.querySelector<HTMLElement>(`[data-item="${deal.id}"]`),
  })
  return (
    <Row itemId={deal.id} itemLabel={deal.name} onEnter={() => open()}>
      <span className="min-w-0 flex-1">
        <span className="font-medium">{deal.name}</span>
        <span className="block text-xs text-muted-foreground">{deal.stage} · {note}</span>
      </span>
      <span className="shrink-0 tabular-nums">{money(deal.amount)}</span>
      {/* A destination, not a state change: a real link, so it copies and opens in a new tab,
          and the click keeps it beside the page (DESIGN.md §1). */}
      <Actions surface="card" className="shrink-0" items={[{ kind: "link", label: "Open", href: href(`/ollopa/deals/${deal.id}`), onClick: () => open() }]} />
    </Row>
  )
}

export function Pipeline({ data, d, order, hasReports }: { data: HomeData; d: Disclosure; order: number; hasReports: boolean }) {
  const p = data.pipeline
  const m = data.money
  const mine = d.atLevelOne("home.pipeline.mine") && p.mine.length > 0
  const team = d.atLevelOne("home.pipeline.team")
  const warnings = d.atLevelOne("home.pipeline.warnings")
  const nextStep = d.atLevelOne("home.pipeline.next-step")
  const closing = d.atLevelOne("home.pipeline.closing")
  const stagesOpen = d.atLevelOne("home.pipeline.stages")

  const perRep = hasReports
    ? [data.user, ...data.reports].map((rep) => {
      const rows = p.open.filter((x) => x.owner === rep)
      return { rep, count: rows.length, total: rows.reduce((n, x) => n + x.amount, 0) }
    })
    : []

  return (
    <Section id="home-pipeline" title="Pipeline" order={order} link={{ label: "Deals", to: "/ollopa/deals" }}>
      {warnings && (
        <button
          type="button"
          className="mb-2 flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={() => follow("/ollopa/deals?filter=warnings", originHere("home-pipeline"))}
        >
          <span className="font-medium">Needs attention</span>
          <span className="tabular-nums">{p.needsAttention.length}</span>
          <span className="ml-auto text-xs text-muted-foreground">Open them on the board</span>
        </button>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {hasReports && (
          <Stat
            label={`Your team (${data.reports.length + 1} sellers)`}
            value={m(p.teamTotal)}
            sub={`${p.team.length} open deals`}
            to="/ollopa/deals?scope=team"
          />
        )}
        {mine && <Stat label="Your open deals" value={m(p.mineTotal)} sub={`${p.mine.length} deals`} to="/ollopa/deals?owner=me" />}
        {team && !hasReports && <Stat label="Team pipeline" value={m(p.openTotal)} sub={`${p.open.length} open deals`} to="/ollopa/deals" />}
        {nextStep && <Stat label="No next step" value={String(p.noNextStep.length)} sub="Deals with nothing planned" to="/ollopa/deals?filter=no-next-step" />}
        {closing && <Stat label="Closing in 30 days" value={String(p.closing.length)} sub={m(p.closing.reduce((n, x) => n + x.amount, 0))} to="/ollopa/deals?filter=closing" />}
      </div>

      {hasReports && perRep.length > 0 && (
        <ul className="mt-2 divide-y rounded-lg border text-sm">
          {perRep.map((r) => (
            <li key={r.rep} className="flex items-center gap-3 px-3 py-1.5">
              <span className="min-w-0 flex-1">{r.rep === data.user ? `${r.rep} (you)` : r.rep}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{r.count} deals</span>
              <span className="shrink-0 tabular-nums">{m(r.total)}</span>
            </li>
          ))}
        </ul>
      )}

      {closing && (
        <div className="pt-2">
          {p.closing.length > 0 ? (
            <RowList label="Deals closing in the next 30 days">
              {p.closing.slice(0, 5).map((deal) => (
                <DealRow key={deal.id} deal={deal} money={m} ids={p.closing.slice(0, 5).map((x) => x.id)} note={`closes ${day(deal.closeDate)}`} />
              ))}
            </RowList>
          ) : (
            <Nothing text="Nothing closes in the next 30 days." link={{ label: "Deals", to: "/ollopa/deals" }} />
          )}
        </div>
      )}

      <div className="pt-1">
        <Door id="home.pipeline.stages" label="By stage and forecast category" count={p.open.length} defaultOpen={stagesOpen}>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
            {p.byStage.map((s) => (
              <div key={s.label} className="flex items-baseline justify-between gap-2 border-b py-1">
                <dt className="text-muted-foreground">{s.label}</dt>
                <dd className="tabular-nums">{s.count} · {m(s.total)}</dd>
              </div>
            ))}
          </dl>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 pt-2 sm:grid-cols-3">
            {p.byForecast.filter((f) => f.count > 0).map((f) => (
              <div key={f.label} className="flex items-baseline justify-between gap-2 border-b py-1">
                <dt className="text-muted-foreground">{f.label}</dt>
                <dd className="tabular-nums">{f.count} · {m(f.total)}</dd>
              </div>
            ))}
          </dl>
          <p className="pt-2 text-xs text-muted-foreground">A lost deal is archived, so there is no Closed lost column.</p>
        </Door>
      </div>
    </Section>
  )
}
