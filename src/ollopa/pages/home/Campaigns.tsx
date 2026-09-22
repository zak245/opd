// Campaigns: what is sending, and the two promises the marketer keeps every day.
//
// Routing and forms sit beside the campaigns because they are the same day's work: leads that missed
// the SLA window and submissions nobody could route are the things nobody else will notice. The
// enrichment spend is on the surface because at the cap enrichment stops while submissions keep arriving.
import { Chip } from "../../ui/Identity"
import { openBeside } from "../../beside"
import { follow } from "../../chain"
import { originHere } from "../work/register"
import { Door, type Disclosure } from "../../ui"
import type { HomeData } from "./data"
import { count } from "./format"
import { Nothing, Row, RowList, Section } from "./rows"

export function Campaigns({ data, d, order }: { data: HomeData; d: Disclosure; order: number }) {
  const c = data.campaigns
  const results = d.atLevelOne("home.campaigns.results")
  const routing = d.atLevelOne("home.campaigns.routing") ? c.routing : null
  const forms = d.atLevelOne("home.campaigns.forms") ? c.forms : null
  const audiencesOpen = d.atLevelOne("home.campaigns.audiences")
  const capReached = forms ? forms.used >= forms.cap : false

  return (
    <Section id="home-campaigns" title="Campaigns" count={c.running.length} order={order} link={{ label: "Campaigns", to: "/ollopa/campaigns" }}>
      {c.running.length > 0 ? (
        <RowList label="Campaigns running">
          {c.running.map((camp) => (
            // The row names a campaign, so it opens the campaign beside Home. The way to the record
            // is "Open the page" in the pane, which keeps Home and this row on the trail.
            <Row
              key={camp.id}
              itemId={camp.id}
              itemLabel={camp.name}
              onEnter={() => openBeside({
                kind: "campaign",
                id: camp.id,
                list: { ids: c.running.map((x) => x.id), index: c.running.indexOf(camp) },
                opener: document.querySelector<HTMLElement>(`[data-item="${camp.id}"]`),
              })}
            >
              <span className="min-w-0 flex-1">
                <span className="font-medium">{camp.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {camp.kind} · audience {count(camp.audienceSize)}
                  {results && <> · sent {count(camp.sent)} · opened {count(camp.opened)} · converted {count(camp.converted)}</>}
                </span>
              </span>
              <Chip status={camp.status} className="shrink-0">{camp.status}</Chip>
            </Row>
          ))}
        </RowList>
      ) : (
        <Nothing text="No campaign is sending right now." link={{ label: "Campaigns", to: "/ollopa/campaigns" }} />
      )}

      {routing && (
        <p className="mt-2 rounded-md border px-3 py-2 text-sm">
          <span className="font-medium">Routing</span>
          <span className="text-muted-foreground">: </span>
          <button type="button" className="underline underline-offset-2" onClick={(e) => openBeside({ kind: "workflow", id: routing.workflowId, opener: e.currentTarget })}>{count(routing.leads)} leads today</button>
          <span className="text-muted-foreground"> · </span>
          <button type="button" className="underline underline-offset-2" onClick={() => follow(`/ollopa/workflows/${routing.workflowId}?filter=sla`, originHere("home-campaigns"))}>{count(routing.breached)} past the SLA window</button>
          <span className="text-muted-foreground"> · </span>
          <button type="button" className="underline underline-offset-2" onClick={() => follow(`/ollopa/workflows/${routing.workflowId}?filter=not-routed`, originHere("home-campaigns"))}>{count(routing.unrouted)} could not be routed</button>
        </p>
      )}

      {forms && (
        <p className={"mt-2 rounded-md border px-3 py-2 text-sm" + (capReached ? " border-destructive" : "")}>
          <span className="font-medium">Forms</span>
          <span className="text-muted-foreground">: </span>
          <button type="button" className="underline underline-offset-2" onClick={(e) => openBeside({ kind: "form", id: forms.formId, opener: e.currentTarget })}>{count(forms.submissions)} submissions today</button>
          <span className="text-muted-foreground"> · </span>
          <button type="button" className="underline underline-offset-2" onClick={() => follow(`/ollopa/forms/${forms.formId}?filter=not-routed`, originHere("home-campaigns"))}>{count(forms.unrouted)} could not be routed</button>
          <span className="text-muted-foreground"> · enrichment {count(forms.used)} of {count(forms.cap)} credits{capReached ? " — enrichment has stopped for today" : ""}</span>
        </p>
      )}

      {c.audiences.length > 0 && (
        <div className="pt-1">
          <Door id="home.campaigns.audiences" label="Audiences that changed" count={c.audiences.length} defaultOpen={audiencesOpen}>
            <ul className="divide-y">
              {c.audiences.map((a) => (
                <li key={a.id} data-item={a.id} data-item-label={a.name} className="flex items-center gap-3 py-1.5 text-xs">
                  <button type="button" className="min-w-0 flex-1 text-left underline underline-offset-2" onClick={(e) => openBeside({ kind: "audience", id: a.id, list: { ids: c.audiences.map((x) => x.id), index: c.audiences.indexOf(a) }, opener: e.currentTarget })}>{a.name}</button>
                  <span className="shrink-0 text-muted-foreground">{a.type} · rebuilt {a.lastRebuilt}</span>
                  <span className="shrink-0 tabular-nums">{count(a.size)}</span>
                </li>
              ))}
            </ul>
          </Door>
        </div>
      )}
    </Section>
  )
}
