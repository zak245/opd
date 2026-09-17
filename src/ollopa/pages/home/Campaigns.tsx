// Campaigns: what is sending, and the two promises the marketer keeps every day.
//
// Routing and forms sit beside the campaigns because they are the same day's work: leads that missed
// the SLA window and submissions nobody could route are the things nobody else will notice. The
// enrichment spend is on the surface because at the cap enrichment stops while submissions keep arriving.
import { Badge } from "@/components/ui/badge"
import { href, navigate } from "@/app/router"
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
            <Row key={camp.id} onEnter={() => navigate(`/ollopa/campaigns/${camp.id}`)}>
              <span className="min-w-0 flex-1">
                <span className="font-medium">{camp.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {camp.kind} · audience {count(camp.audienceSize)}
                  {results && <> · sent {count(camp.sent)} · opened {count(camp.opened)} · converted {count(camp.converted)}</>}
                </span>
              </span>
              <Badge variant="secondary" className="shrink-0 font-normal">{camp.status}</Badge>
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
          <a className="underline underline-offset-2" href={href(`/ollopa/workflows/${routing.workflowId}`)}>{count(routing.leads)} leads today</a>
          <span className="text-muted-foreground"> · </span>
          <a className="underline underline-offset-2" href={href(`/ollopa/workflows/${routing.workflowId}?filter=sla`)}>{count(routing.breached)} past the SLA window</a>
          <span className="text-muted-foreground"> · </span>
          <a className="underline underline-offset-2" href={href(`/ollopa/workflows/${routing.workflowId}?filter=not-routed`)}>{count(routing.unrouted)} could not be routed</a>
        </p>
      )}

      {forms && (
        <p className={"mt-2 rounded-md border px-3 py-2 text-sm" + (capReached ? " border-destructive" : "")}>
          <span className="font-medium">Forms</span>
          <span className="text-muted-foreground">: </span>
          <a className="underline underline-offset-2" href={href(`/ollopa/forms/${forms.formId}`)}>{count(forms.submissions)} submissions today</a>
          <span className="text-muted-foreground"> · </span>
          <a className="underline underline-offset-2" href={href(`/ollopa/forms/${forms.formId}?filter=not-routed`)}>{count(forms.unrouted)} could not be routed</a>
          <span className="text-muted-foreground"> · enrichment {count(forms.used)} of {count(forms.cap)} credits{capReached ? " — enrichment has stopped for today" : ""}</span>
        </p>
      )}

      {c.audiences.length > 0 && (
        <div className="pt-1">
          <Door id="home.campaigns.audiences" label="Audiences that changed" count={c.audiences.length} defaultOpen={audiencesOpen}>
            <ul className="divide-y">
              {c.audiences.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-1.5 text-xs">
                  <a className="min-w-0 flex-1 underline underline-offset-2" href={href(`/ollopa/audiences/${a.id}`)}>{a.name}</a>
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
