// Product routes a node id to a component. One table decides what exists (map.ts), one decides what
// the seat may open (map.ts seats), one decides what is in the sidebar (nav.ts), and this file only
// chooses the body.
import { useEffect, useState, type ReactNode } from "react"
import { useSession, applyTheme, type Session } from "./session"
import { useRoute } from "@/app/router"
import { SignIn } from "./pages/SignIn"
import { WorkspaceSetup } from "./pages/setup/WorkspaceSetup"
import { AppShell } from "./shell/AppShell"
import { NoAccess } from "./shell/NoAccess"
import { Placeholder } from "./shell/Placeholder"
import { DealRecord } from "./pages/deal/DealRecord"
import { matchRoute, nodeById, type MapNode } from "./map"
import { navItem, seatCarries } from "./nav"
import { seedFor } from "./data/seed"
import type { Business, Page } from "./usage/model"

/** The record a deep link names, for the page title: "{record} · {page}". */
function recordName(node: MapNode, id: string, business: Business): string | null {
  const seed = seedFor(business)
  switch (node.id) {
    case "R-person": return seed.contacts.find((c) => c.id === id)?.name ?? null
    case "R-company": return seed.companies.find((c) => c.id === id)?.name ?? null
    case "R-deal": return seed.deals.find((d) => d.id === id)?.name ?? null
    case "R-sequence": return seed.sequences.find((s) => s.id === id)?.name ?? null
    case "X-thread": return seed.replies.find((r) => r.id === id)?.contact ?? null
    case "R-list": return seed.lists.find((l) => l.id === id)?.name ?? null
    case "R-template": return seed.templates.find((t) => t.id === id)?.name ?? seed.snippets.find((t) => t.id === id)?.name ?? null
    case "R-campaign": return seed.campaigns.find((c) => c.id === id)?.name ?? null
    case "R-audience": return seed.audiences.find((a) => a.id === id)?.name ?? null
    case "R-form": return seed.forms.find((f) => f.id === id)?.name ?? null
    case "R-workflow": return seed.workflows.find((w) => w.id === id)?.name ?? null
    case "R-integration": return seed.integrations.find((i) => i.id === id)?.name ?? null
    case "R-job": case "R-enrichment-job": return seed.enrichmentJobs.find((j) => j.id === id)?.sourceLabel ?? null
    case "R-request": return seed.requests.find((r) => r.id === id)?.outcome ?? null
    case "R-agent-run": return seed.agentEvents.find((e) => e.id === id)?.summary ?? null
    // The wizard's id is the integration kind ("salesforce") or an existing integration.
    case "W-connect": return seed.integrations.find((i) => i.id === id)?.name ?? (id === "new" ? null : id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, " "))
    default: return null
  }
}

function Toaster() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    let t: number | undefined
    const on = (e: Event) => { setMsg((e as CustomEvent<string>).detail); window.clearTimeout(t); t = window.setTimeout(() => setMsg(null), 2200) }
    document.addEventListener("ollopa:toast", on)
    return () => document.removeEventListener("ollopa:toast", on)
  }, [])
  return (
    <div role="status" aria-live="polite" className={"pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-foreground px-3 py-2 text-sm text-background shadow-lg transition-opacity " + (msg ? "opacity-100" : "opacity-0")}>{msg}</div>
  )
}

/**
 * Page registry. A page folder registers itself by exporting `nodes` from `pages/<folder>/register.tsx`:
 *   export const nodes = { "P-agents": AgentsPage, "R-agent-run": AgentRunPage }
 * Each component receives { session, id }. Nothing else in the app needs editing to add a page.
 */
export type PageComponent = (props: { session: Session; id?: string }) => ReactNode
const registered: Record<string, PageComponent> = {}
for (const mod of Object.values(import.meta.glob<{ nodes?: Record<string, PageComponent> }>("./pages/*/register.tsx", { eager: true }))) {
  Object.assign(registered, mod.nodes ?? {})
}

/** Every node id that has its own built component today. Everything else renders its real counts. */
function bodyFor(node: MapNode, session: Session, id: string | undefined) {
  const Registered = registered[node.id]
  if (Registered) return <Registered session={session} id={id} />
  if (node.id === "R-deal") return <DealRecord session={session} dealId={id} />
  const title = id ? `${recordName(node, id, session.business) ?? id} · ${node.name}` : node.name
  return <Placeholder session={session} page={node.page} title={title} />
}

/** A page body by node id, for the lesson stage: the same component the product routes to. */
export function PageBody({ nodeId, session, id }: { nodeId: string; session: Session; id?: string }) {
  const node = nodeById(nodeId)
  if (!node) return <Placeholder session={session} page="home" title={nodeId} />
  return bodyFor(node, session, id)
}

export function Product() {
  const session = useSession()
  const route = useRoute()

  useEffect(() => { applyTheme() }, [])

  if (!session || route.path[1] === "signin") return <SignIn />

  // Workspace set-up runs before the sidebar exists, so it renders without the shell.
  if (route.path[1] === "setup") return <><WorkspaceSetup session={session} /><Toaster /></>

  const match = matchRoute(route.path) ?? { node: nodeById("P-home")!, id: undefined }
  const { node, id } = match
  const page: Page = node.page

  // The h1 equals the sidebar label for a page; a record reads "{record} · {page}"; a settings area,
  // a wizard or a surface carries its own name, because that is what the person asked for.
  const pageLabel = navItem(page)?.label ?? node.name
  const title = id && !(node.type === "wizard" && id === "new")
    ? `${recordName(node, id, session.business) ?? id} · ${pageLabel}`
    : node.type === "page"
      ? pageLabel
      : node.name

  // The map's seat column decides, with two additions. A seat overlay (nav.ts) may carry a page the
  // map's row does not name for that role: Fathom's founder holds Inbox and Tasks. And a settings
  // area is never refused outright: the Settings page renders what the seat holds and closes with
  // the sentence naming the admin (spec 14 §3.8), so it decides for itself.
  const held = node.seats.includes(session.role)
    || seatCarries(page, session.business, session.role)
    || (node.type === "settings area" && seatCarries("settings", session.business, session.role))

  return (
    <AppShell session={session} page={page} title={title}>
      {held ? bodyFor(node, session, id) : <NoAccess session={session} page={page} />}
      <Toaster />
    </AppShell>
  )
}
