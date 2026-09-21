// Product routes a node id to a component. One table decides what exists (map.ts), one decides what
// the seat may open (map.ts seats), one decides what is in the sidebar (nav.ts), and this file only
// chooses the body.
import { memo, useEffect, useMemo, useState, type ReactNode } from "react"
import { useSession, applyTheme, type Session } from "./session"
import { useRoute } from "@/app/router"
import { bindChain, routeKey, usePendingReturn, useTrail } from "./chain"
import type { BesideComponent } from "./beside"
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

/**
 * Pane registry, collected by the same glob as `nodes`. A page folder that owns an object registers
 * how that object reads beside another page:
 *   export const besides: Record<string, BesideComponent> = { person: PersonBeside }
 * The frame that draws around them is `ui/Beside.tsx`; the type lives in `beside.ts`.
 */
export const besides: Record<string, BesideComponent> = {}
for (const mod of Object.values(import.meta.glob<{ nodes?: Record<string, PageComponent>; besides?: Record<string, BesideComponent> }>("./pages/*/register.tsx", { eager: true }))) {
  Object.assign(registered, mod.nodes ?? {})
  Object.assign(besides, mod.besides ?? {})
}

/** The page stack: the current page plus the trail's pages, never more than this many at once. */
const STACK_MAX = 5

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

/** What one route resolves to: the node, its record id, its h1 and whether the seat holds it. */
interface Resolved { node: MapNode; id?: string; page: Page; title: string; held: boolean }

function resolve(route: string, session: Session): Resolved {
  const path = route.replace(/^#/, "").split("?")[0].split("/").filter(Boolean)
  const match = matchRoute(path) ?? { node: nodeById("P-home")!, id: undefined }
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

  return { node, id, page, title, held }
}

/**
 * One page in the stack. Memoised on purpose: `Product` re-renders on every route change, and a
 * page the trail is holding must not re-render when the person walks away from it or comes back —
 * that is what keeps its rows, its scroll and its half-typed text exactly as they were. Every prop
 * here is a string, a boolean or the session, so the comparison is a real one.
 */
const StackPage = memo(function StackPage({ nodeId, id, session, held, page }: {
  nodeId: string
  id?: string
  session: Session
  held: boolean
  page: Page
}) {
  const node = nodeById(nodeId)
  if (!node) return <Placeholder session={session} page={page} title={nodeId} />
  return held ? bodyFor(node, session, id) : <NoAccess session={session} page={page} />
})

export function Product() {
  const session = useSession()
  const route = useRoute()
  // The trail belongs to this seat and to this browser tab. Signing out unbinds it, which is what
  // empties it: a path is never carried across a sign-out.
  bindChain(session?.business ?? null, session?.user ?? null)
  const trail = useTrail()
  const pending = usePendingReturn()

  useEffect(() => { applyTheme() }, [])

  /**
   * The page stack: the page you are on, plus every page the trail is still holding, all mounted.
   * A trail page is hidden with `visibility: hidden` and made `inert` — never `display: none`,
   * which would throw away its scroll position, its open doors and its half-typed text. Each one
   * owns its own scroller, so returning to it lands exactly where it was left.
   */
  const stack = useMemo(() => {
    if (!session) return []
    const here = routeKey(route.raw)
    // `pending` is the page `back` is on its way to: it stays mounted through the move, so the
    // element the person is returning to is the element they left.
    const wanted = [...trail.map((o) => o.route), ...(pending ? [pending] : []), route.raw]
    const seen = new Set<string>()
    const out: { key: string; route: string; active: boolean }[] = []
    // Last occurrence wins, so a route visited twice is mounted once, in its latest position.
    for (let i = wanted.length - 1; i >= 0; i--) {
      const key = routeKey(wanted[i])
      if (seen.has(key)) continue
      seen.add(key)
      out.unshift({ key, route: wanted[i], active: key === here })
    }
    return out.slice(-STACK_MAX)
  }, [trail, pending, route.raw, session])

  if (!session || route.path[1] === "signin") return <SignIn />

  // Workspace set-up runs before the sidebar exists, so a fresh workspace renders it without the
  // shell. Reached from Settings by `follow`, the trail is not empty and the person is in the middle
  // of something, so it resolves through the map like any other page: inside the shell, with the
  // crumb back to the row it was opened from.
  if (route.path[1] === "setup" && trail.length === 0) return <><WorkspaceSetup session={session} /><Toaster /></>

  const current = resolve(route.raw, session)

  return (
    <AppShell session={session} page={current.page} title={current.title}>
      {stack.map((entry) => {
        const r = entry.active ? current : resolve(entry.route, session)
        return (
          <div
            key={entry.key}
            data-page={entry.key}
            data-page-active={entry.active ? "true" : undefined}
            inert={!entry.active}
            style={entry.active ? undefined : { visibility: "hidden" }}
            className="absolute inset-0 overflow-y-auto pb-16 md:pb-0"
          >
            <StackPage nodeId={r.node.id} id={r.id} session={session} held={r.held} page={r.page} />
          </div>
        )
      })}
      <Toaster />
    </AppShell>
  )
}
