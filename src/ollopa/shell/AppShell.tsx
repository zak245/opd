// The app shell: sidebar, top bar, the three channels beside every page, and the phone layout.
//
// The sidebar is declared, never inferred: the seat decides what may be opened, the workspace profile
// may leave a page out, and the person may add one back. Order never changes by role, business or
// history. The one thing the shell must never lose is the credits pill, so it is here at every width.
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { ChevronLeft, Grid3x3, Minus, Plus, Search, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Kbd } from "@/components/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { href, navigate, useRoute } from "@/app/router"
import { businessById } from "../data/businesses"
import { seedFor } from "../data/seed"
import { BOTTOM_BAR, NAV, navItem, seatCarries, sidebarFor, type SidebarEntry } from "../nav"
import { clientWorkspace } from "../map"
import { addToSidebar, answerExposure, removeFromSidebar, signOut, startExposure, type Session } from "../session"
import type { Page } from "../usage/model"
import { CreditsPanel, CreditsPill } from "./Credits"
import { BellButton, NotificationPanel, unreadCount } from "./Bell"
import { AccountMenu } from "./AccountMenu"
import { Palette } from "./Palette"
import { Shortcuts } from "./Shortcuts"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider,
  SidebarRail, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar"
import { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Actions, type Action } from "../ui/Actions"
import { FamilyIcon } from "../ui/Identity"
import { familyOf } from "../identity"
import { Beside } from "../ui/Beside"
import { back, clearTrail, crumbName, lightUp, showReturn, takeArrival, takeArrivalHandled, takeReturnCue, useTrail, type Origin } from "../chain"
import { notificationsFor, TODAY, type Kind } from "./notifications"
import { usePageAlerts, type AlertItem } from "./banner"
import { usePhone } from "../layouts/parts"
import { exposureDue, plusTwoWeeks } from "./signals"

const COLLAPSE_KEY = "ollopa.sidebar"

/** The interrupting kinds that read as danger rather than as a warning, which sets the Alert's variant. */
const DANGER_KINDS = new Set<Kind>(["bounce-guard", "sync-error", "credits-low"])

/**
 * The page a band's door leads to, named by the sidebar's own word for it. A door is labelled by
 * where the rest are decided, never by a count (RULES.md rule 4 and rule 7).
 */
function placeOf(target: string | undefined): string | null {
  if (!target) return null
  const path = target.replace(/^#/, "").replace(/^\/ollopa\/?/, "").split(/[/?#]/)[0]
  if (!path) return "Home"
  return NAV.find((n) => n.page === path)?.label ?? null
}

function SidebarRow({ entry, page, onAnswer }: { entry: SidebarEntry; page: Page; onAnswer: (a: "keep" | "remove") => void }) {
  const i = entry.item
  const active = i.page === page
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={active} tooltip={i.label}>
        <a href={href(`/ollopa/${i.page === "home" ? "" : i.page}`)} onClick={clearTrail} aria-current={active ? "page" : undefined}>
          <FamilyIcon of={i.page} tone={active ? "current" : "ink"} />
          <span>{i.label}</span>
        </a>
      </SidebarMenuButton>
      {entry.asking && (
        <div className="t-small mx-2 mb-1 mt-1 border bg-background p-2 group-data-[collapsible=icon]:hidden">
          <p>Keep {i.label} in the sidebar?</p>
          <div className="mt-1.5 flex gap-1">
            <Button size="sm" className="t-small h-6 px-2" onClick={() => onAnswer("keep")}>Keep</Button>
            <Button size="sm" variant="outline" className="t-small h-6 px-2" onClick={() => onAnswer("remove")}>Remove</Button>
          </div>
        </div>
      )}
    </SidebarMenuItem>
  )
}


/**
 * The trail in the header: the person's own path, `Q4 enterprise outbound › Amara Nakamura`.
 * Every crumb but the last is a button back to that page, exactly as it was left. At phone width
 * there is only room for one, so only the step back shows.
 */
/** The family a trail origin belongs to, read from its route: "/ollopa/sequences/seq-1" → engagement. */
function familyOfRoute(route: string): string {
  return route.replace(/^#/, "").split("?")[0].split("/").filter(Boolean)[1] ?? "home"
}

function Crumbs({ trail }: { trail: Origin[] }) {
  if (trail.length === 0) return null
  const previous = trail[trail.length - 1]
  return (
    <>
      {/* At phone width there is room for one step back; above it, shadcn's Breadcrumb. */}
      {/* One nav, so "Your path" names the trail at every width; shadcn's breadcrumb parts draw it. */}
      <nav aria-label="Your path" className="flex min-w-0 items-center">
      <button
        type="button"
        onClick={() => back(trail.length - 1)}
        className="t-body flex min-w-0 items-center gap-1 rounded text-muted-foreground hover:text-foreground sm:hidden"
      >
        <ChevronLeft className="size-4 shrink-0" aria-hidden="true" />
        <FamilyIcon of={familyOfRoute(previous.route)} />
        <span className="truncate">{crumbName(previous.title)}</span>
      </button>
      <BreadcrumbList className="hidden sm:flex">
          {trail.map((o, i) => (
            <Fragment key={`${o.route}-${i}`}>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button type="button" onClick={() => back(i)} className="inline-flex items-center gap-1">
                    <FamilyIcon of={familyOfRoute(o.route)} />
                    <span className="max-w-[14rem] truncate">{crumbName(o.title)}</span>
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ))}
      </BreadcrumbList>
      </nav>
    </>
  )
}

/**
 * The phone's navigation: a fixed bar of ghost Buttons, and "All pages" opens the Sidebar's own
 * mobile Sheet rather than a second list of our own. The bar sets no colour — the active page is a
 * secondary Button, which is how the library marks a chosen one.
 */
function BottomBar({ pages, page }: { pages: Page[]; page: Page }) {
  const { setOpenMobile } = useSidebar()
  return (
    <nav className="bg-background fixed inset-x-0 bottom-0 z-30 flex border-t md:hidden" aria-label="Pages">
      {pages.map((p) => {
        const nav = navItem(p)!
        const here = p === page
        return (
          <Button
            key={p}
            asChild
            variant={here ? "secondary" : "ghost"}
            className="h-auto flex-1 flex-col gap-0.5 py-2 text-xs"
          >
            <a href={href(`/ollopa/${p === "home" ? "" : p}`)} onClick={clearTrail} aria-current={here ? "page" : undefined}>
              <FamilyIcon of={p} tone={here ? "current" : "ink"} />
              {nav.label}
            </a>
          </Button>
        )
      })}
      <Button variant="ghost" className="h-auto flex-1 flex-col gap-0.5 py-2 text-xs" onClick={() => setOpenMobile(true)}>
        <Grid3x3 aria-hidden="true" />
        All pages
      </Button>
    </nav>
  )
}

export function AppShell({ session, page, title, children, defaultCollapsed }: { session: Session; page: Page; title: string; children: ReactNode; defaultCollapsed?: boolean }) {
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  // The person's own choice is remembered; a caller (the lesson stage, which is narrower than a
  // desktop) may only set the starting state.
  const [collapsed, setCollapsed] = useState(() => {
    if (defaultCollapsed !== undefined) return defaultCollapsed
    try { return localStorage.getItem(COLLAPSE_KEY) === "collapsed" } catch { return false }
  })
  // Not enough room for a full sidebar. Kept apart from the person's own choice above, so a narrow
  // window never rewrites what they picked, and widening the window gives it back.
  const [tight, setTight] = useState(() =>
    defaultCollapsed === undefined && typeof window !== "undefined"
      ? window.matchMedia("(max-width: 1180px)").matches
      : false)
  const [palette, setPalette] = useState(false)
  const [bell, setBell] = useState(false)
  const [creditsOpen, setCredits] = useState(false)
  const [shortcuts, setShortcuts] = useState(false)
  const [expiring, setExpiring] = useState(false)
  const [, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  const pageAlerts = usePageAlerts()
  const trail = useTrail()
  const route = useRoute()
  const heading = useRef<HTMLHeadingElement>(null)

  const entries = sidebarFor(session, TODAY)
  const notes = useMemo(() => notificationsFor(session), [session])
  const unread = unreadCount(notes)
  const client = clientWorkspace(session.business, seed.workspace.name)
  const item = navItem(page)
  const inSidebar = entries.some((e) => e.item.page === page)
  const added = session.sidebarAdded.includes(page)
  const canAdd = !!item && seatCarries(page, session.business, session.role) && !inSidebar
  const groups = ["top", "Prospect", "Engage", "Win", "bottom"].filter((g) => entries.some((e) => e.item.group === g))

  // The page title, everywhere the browser shows one.
  useEffect(() => { document.title = `${title} · ${b.name} · ollopA` }, [title, b.name])

  // Arriving back somewhere: light the thing that was left, once. The page is already mounted, so
  // this waits only for the browser to lay the now-visible copy out.
  useEffect(() => {
    const anchor = takeReturnCue(route.raw)
    if (anchor) {
      const t = window.setTimeout(() => showReturn(anchor), 60)
      return () => window.clearTimeout(t)
    }
    // Arriving by following a link. Focus lands on the page's own title, so the first Shift+Tab is
    // the crumb back and not a walk through the sidebar, and the title is lit for the same three
    // seconds a return is, so the eye knows where it landed.
    //
    // This is the fallback, never the winner. A page that lights something of its own on arrival —
    // a settings row named by `?row=`, or any page that calls `arrivalHandledHere()` — keeps focus
    // where it put it: the row is a better place to land than the heading above it.
    const arrived = takeArrival(route.raw)
    const handled = takeArrivalHandled()
    if (!arrived || handled) return
    const t = window.setTimeout(() => {
      const h1 = heading.current
      if (!h1) return
      // A page that put focus into itself while we waited — a settings row named by `?row=` — has
      // already answered, and the row is a better place to land than the heading above it.
      const main = document.querySelector('[data-page-active="true"]')
      if (main?.contains(document.activeElement) || h1.contains(document.activeElement)) return
      h1.focus({ preventScroll: true })
      // One mark at a time: a page that lit something of its own keeps the only light on screen,
      // and the title takes the focus without a second flash competing with it.
      if (main?.querySelector(".ollopa-returned")) return
      lightUp(h1)
    }, 60)
    return () => window.clearTimeout(t)
  }, [route.raw])

  // The two-week exposure appears on the next load of Home, never mid-task.
  useEffect(() => {
    if (page !== "home") return
    const due = exposureDue(session)
    if (due) startExposure(due.page, due.because, plusTwoWeeks(due.on))
  }, [page, session])

  // Meridian and Ridgeline enforce a session timeout; Fathom and Halyard never show this.
  useEffect(() => {
    if (session.business !== "meridian" && session.business !== "ridgeline") return
    const t = window.setTimeout(() => setExpiring(true), 25 * 60 * 1000)
    return () => window.clearTimeout(t)
  }, [session.business, expiring])

  useEffect(() => {
    if (defaultCollapsed !== undefined) return   // a stage's starting state is not the person's choice
    try { localStorage.setItem(COLLAPSE_KEY, collapsed ? "collapsed" : "open") } catch { /* ignore */ }
  }, [collapsed, defaultCollapsed])

  // A full sidebar costs the page 224 px, which a 1,100 px window cannot spare. Above 1180 px the
  // person's own choice stands; below it the rail is the starting state. The trigger still opens the
  // sidebar at any width — it clears `tight` — because a control that does nothing is worse than a
  // narrow page.
  useEffect(() => {
    if (defaultCollapsed !== undefined) return
    const q = window.matchMedia("(max-width: 1180px)")
    const cross = (e: MediaQueryListEvent) => setTight(e.matches)
    q.addEventListener("change", cross)
    return () => q.removeEventListener("change", cross)
  }, [defaultCollapsed])

  // The channels answer to events too, so the palette can open the bell without knowing about it.
  useEffect(() => {
    const openPalette = () => setPalette(true)
    const openBell = () => setBell(true)
    const switchAccount = () => { signOut({ rememberWorkspace: true }); navigate("/ollopa") }
    const out = () => { signOut(); navigate("/ollopa") }
    document.addEventListener("ollopa:palette", openPalette)
    document.addEventListener("ollopa:bell", openBell)
    document.addEventListener("ollopa:switch", switchAccount)
    document.addEventListener("ollopa:signout", out)
    return () => {
      document.removeEventListener("ollopa:palette", openPalette)
      document.removeEventListener("ollopa:bell", openBell)
      document.removeEventListener("ollopa:switch", switchAccount)
      document.removeEventListener("ollopa:signout", out)
    }
  }, [])

  // ⌘K anywhere; `g` then a letter; `?`. Sequences are ignored while focus is in a field.
  useEffect(() => {
    let last = ""
    let at = 0
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(true); return }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === "?") { e.preventDefault(); setShortcuts(true); return }
      if (last === "g" && Date.now() - at < 1200) {
        last = ""
        if (e.key === "n") { e.preventDefault(); setBell(true); return }
        const target = NAV.find((n) => n.key === e.key && seatCarries(n.page, session.business, session.role))
        if (target) { e.preventDefault(); clearTrail(); navigate(`/ollopa/${target.page === "home" ? "" : target.page}`) }
        return
      }
      if (e.key === "g") { last = "g"; at = Date.now() }
      else last = ""
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [session])

  /**
   * Everything that needs a decision, workspace first. A workspace notification earns the band only
   * by being marked interrupting in the seed — something is stopped until it is answered — and the
   * page adds at most one of its own. There is no dismiss: nothing hides an unresolved problem, and
   * the band goes when the thing is resolved (REVIEW-ALERTS.md §5).
   */
  const said: AlertItem[] = [
    ...(expiring ? [{ id: "__session", text: "Your session ends in 5 minutes.", acts: [{ label: "Stay signed in", onClick: () => setExpiring(false) }] }] : []),
    ...notes.filter((n) => n.interrupting).map((n) => ({
      id: n.id,
      text: n.title,
      danger: DANGER_KINDS.has(n.kind),
      href: href(n.target),
    })),
    ...pageAlerts,
  ]
  // One band, one item. The rest are named by the place they are decided, never by a count.
  const band = said[0]
  const rest = said.slice(1)
  // Where the rest are decided. An item the open page declared is decided on the open page, whatever
  // its link points at; a workspace item is decided where its link goes.
  const restPlace = rest.length === 0 ? null
    : pageAlerts.includes(rest[0]) ? (NAV.find((n) => n.page === page)?.label ?? title)
      : placeOf(rest[0].href)
  /**
   * At most two acts (DESIGN.md §1). The item's own choices come first; a destination is a link. When
   * something else is waiting, the second act is the door to where it is decided — labelled by that
   * place, so nothing decision-critical sits behind a count at any width (RULES.md rule 7).
   */
  const bandActs: Action[] = band ? [
    ...(band.acts ?? []).slice(0, rest.length > 0 ? 1 : 2)
      .map((a) => ({ kind: "secondary" as const, label: a.label, onClick: a.onClick })),
    ...(!band.acts?.length && band.href
      ? [{ kind: "link" as const, label: placeOf(band.href) ?? "Open", href: band.href }]
      : []),
    ...(rest.length > 0 && restPlace
      ? [{ kind: "link" as const, label: `${rest.length} more waiting · ${restPlace}`, href: rest[0].href ?? href(`/ollopa/${page === "home" ? "" : page}`) }]
      : []),
  ].slice(0, 2) : []
  // The bottom bar is the sidebar at phone width, so it carries only pages the sidebar carries:
  // the seat's four, in the fixed order, topped up from the sidebar when the profile left one out.
  const inSidebarPages = entries.map((e) => e.item.page)
  const bottom = [
    ...BOTTOM_BAR[session.role].filter((p) => inSidebarPages.includes(p)),
    ...inSidebarPages.filter((p) => !BOTTOM_BAR[session.role].includes(p)),
  ].slice(0, 4)

  // Controlled, not just `defaultOpen`: shadcn's provider keeps its own state only while no
  // `onOpenChange` is given, so passing the handler alone leaves the trigger dead and the sidebar
  // never collapses. Our state is the one state, and it is what the trigger and the rail both move.
  return (
    <SidebarProvider
      open={!(collapsed || tight)}
      onOpenChange={(o) => { setCollapsed(!o); setTight(false) }}
      style={{ "--sidebar-width": "14rem" } as CSSProperties}
    >
      <a href="#ollopa-main" className="sr-only bg-foreground px-3 py-2 text-background focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50">
        Skip to content
      </a>

      {/* shadcn's Sidebar, as it ships: the collapsible icon rail replaces our own Collapse button,
          and the groups carry the declared sidebar's own labels. */}
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <a href={href("/ollopa")} onClick={clearTrail}>
                  <span className="inline-block size-5 shrink-0 bg-foreground" aria-hidden="true" />
                  {/* The mark alone carries the rail; the word would only be cut in half there. */}
                  <span className="font-semibold tracking-tight group-data-[collapsible=icon]:hidden">ollopA</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {groups.map((g) => (
            <SidebarGroup key={g}>
              {g !== "top" && g !== "bottom" && <SidebarGroupLabel>{g}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {entries.filter((e) => e.item.group === g).map((e) => (
                    <SidebarRow
                      key={e.item.page}
                      entry={e}
                      page={page}
                      onAnswer={(a) => { answerExposure(e.item.page, a); refresh() }}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <div className="t-small px-2 py-1 text-muted-foreground group-data-[collapsible=icon]:hidden">{b.name}</div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-w-0">
        {/* At 400 px, with a sidebar button beside the title, the title keeps the first line to itself
            and the chrome wraps under it; above 768 px the bar is one row of 56 px. */}
        {/* shadcn's header pattern inside SidebarInset: the trigger, a vertical Separator, then the
            page's own path and the workspace channels. Nothing here sets a colour or a size of its
            own — the Button, Badge, Kbd and Avatar carry it. */}
        <header data-slot="app-bar" className={cn("bg-background relative z-20 flex shrink-0 items-center gap-2 border-b px-4", canAdd || added ? "h-auto min-h-14 flex-wrap py-1.5 md:h-14 md:flex-nowrap md:py-0" : "h-14")}>
          {/* The page title carries its family icon and hue — one of the three ways you know
              where you are (DESIGN.md §5). */}
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 hidden data-[orientation=vertical]:h-4 sm:block" />
          <FamilyIcon of={page} size="header" className="hidden shrink-0 sm:block" />
          <Crumbs trail={trail} />
          {/* The last crumb is the page you are on, and it never truncates: the earlier ones do. */}
          <h1 ref={heading} tabIndex={-1} className={cn(
            "rounded text-sm font-semibold outline-none",
            (canAdd || added) && "mr-auto md:mr-0",
            trail.length > 0 ? "shrink-0 whitespace-nowrap max-sm:sr-only" : "truncate",
          )} style={{ color: familyOf(page).ink }}>{trail.length > 0 ? crumbName(title) : title}</h1>
          {client && <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">{client} · client workspace</Badge>}
          {/* Below 1280 the words do not fit beside the search and the workspace channels, and a
              page that overflows its own viewport is worse than an icon. Same control, same name,
              with a tooltip that says it. */}
          {canAdd && (
            <>
              <Button variant="outline" size="sm" className="hidden shrink-0 xl:inline-flex" onClick={() => { addToSidebar(page); refresh() }}>Add to sidebar</Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon-sm" className="shrink-0 xl:hidden" aria-label="Add to sidebar" onClick={() => { addToSidebar(page); refresh() }}>
                    <Plus aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add to sidebar</TooltipContent>
              </Tooltip>
            </>
          )}
          {added && inSidebar && (
            <>
              <Button variant="ghost" size="sm" className="hidden shrink-0 xl:inline-flex" onClick={() => { removeFromSidebar(page); refresh() }}>Remove from sidebar</Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="shrink-0 xl:hidden" aria-label="Remove from sidebar" onClick={() => { removeFromSidebar(page); refresh() }}>
                    <Minus aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove from sidebar</TooltipContent>
              </Tooltip>
            </>
          )}
          <div className={cn("min-w-0 flex-1", (canAdd || added) && "h-0 basis-full md:h-auto md:basis-auto")} />
          {/* It gives width back before anything else does: a floor, not a fixed size. */}
          <Button variant="outline" size="sm" className="hidden w-64 min-w-40 shrink justify-start overflow-hidden text-muted-foreground lg:flex" onClick={() => setPalette(true)}>
            <Search className="size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate">Search or jump to…</span>
            <Kbd className="ml-auto shrink-0">⌘K</Kbd>
          </Button>
          <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Search or jump to" onClick={() => setPalette(true)}>
            <Search className="size-4" aria-hidden="true" />
          </Button>
          <span className="hidden sm:block"><CreditsPill session={session} onOpen={() => setCredits(true)} /></span>
          <span className="sm:hidden"><CreditsPill session={session} onOpen={() => setCredits(true)} compact /></span>
          <BellButton count={unread} onOpen={() => setBell(true)} />
          <AccountMenu session={session} onShortcuts={() => setShortcuts(true)} onChange={refresh} />
        </header>

        {/* One band, one item, one decision (LAYOUTS.md §2). The title is the thing itself, in its own
            words — there is no fixed heading — and it wraps rather than being cut mid-word. The
            variant is this item's own, so a warning is never painted in a sibling's red. It scrolls
            with the page and goes when the thing is resolved. */}
        {band && (
          <div className="px-3 py-1">
            <Alert variant={band.danger ? "destructive" : "default"} className="items-center py-2">
              <TriangleAlert />
              {/* The words and the acts share one line where there is room, and stack where there is
                  not. `line-clamp-none` undoes the component's one-line clamp: a band is never cut
                  mid-word, it wraps (REVIEW-ALERTS.md §5). */}
              <AlertTitle className="line-clamp-none flex flex-wrap items-center gap-x-3 gap-y-1.5 text-pretty">
                <span className="min-w-0">{band.text}</span>
                {bandActs.length > 0 && <Actions surface="card" items={bandActs} />}
              </AlertTitle>
            </Alert>
          </div>
        )}

        {/* The page and the pane are siblings, so opening a pane shrinks the page instead of covering
            it. Below `sm` there is no room for both and the pane takes the whole width. */}
        <div className="relative flex min-h-0 flex-1">
          <main id="ollopa-main" className={cn("bg-background", "relative min-h-0 flex-1 overflow-y-auto pb-16 md:pb-0")}>{children}</main>
          <Beside session={session} pageTitle={title} />
        </div>

        <BottomBar pages={bottom} page={page} />
      </SidebarInset>

      <Palette session={session} open={palette} onOpenChange={setPalette} />
      <NotificationPanel session={session} rows={notes} open={bell} onOpenChange={setBell} onChange={refresh} />
      <CreditsPanel session={session} open={creditsOpen} onOpenChange={setCredits} />
      <Shortcuts open={shortcuts} onOpenChange={setShortcuts} />
    </SidebarProvider>
  )
}

export { NoAccess } from "./NoAccess"
