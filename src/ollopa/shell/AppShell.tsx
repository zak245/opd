// The app shell: sidebar, top bar, the three channels beside every page, and the phone layout.
//
// The sidebar is declared, never inferred: the seat decides what may be opened, the workspace profile
// may leave a page out, and the person may add one back. Order never changes by role, business or
// history. The one thing the shell must never lose is the credits pill, so it is here at every width.
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight, Grid3x3, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { href, navigate } from "@/app/router"
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
import { Panel } from "../ui/Panel"
import { notificationsFor, TODAY } from "./notifications"
import { exposureDue, plusTwoWeeks } from "./signals"

const COLLAPSE_KEY = "ollopa.sidebar"

function SidebarRow({ entry, page, collapsed, onAnswer }: { entry: SidebarEntry; page: Page; collapsed: boolean; onAnswer: (a: "keep" | "remove") => void }) {
  const i = entry.item
  const active = i.page === page
  const link = (
    <a
      href={href(`/ollopa/${i.page === "home" ? "" : i.page}`)}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
        collapsed && "justify-center px-0",
        active ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:bg-background hover:text-foreground",
      )}
    >
      <i.icon className="size-4 shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate">{i.label}</span>}
    </a>
  )
  return (
    <div>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{i.label}</TooltipContent>
        </Tooltip>
      ) : (
        link
      )}
      {entry.asking && !collapsed && (
        <div className="mx-2 mb-1 mt-1 rounded-md border bg-background p-2 text-xs">
          <p>Keep {i.label} in the sidebar?</p>
          <div className="mt-1.5 flex gap-1">
            <Button size="sm" className="h-6 px-2 text-xs" onClick={() => onAnswer("keep")}>Keep</Button>
            <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => onAnswer("remove")}>Remove</Button>
          </div>
        </div>
      )}
    </div>
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
  const [palette, setPalette] = useState(false)
  const [bell, setBell] = useState(false)
  const [creditsOpen, setCredits] = useState(false)
  const [shortcuts, setShortcuts] = useState(false)
  const [allPages, setAllPages] = useState(false)
  const [dismissed, setDismissed] = useState<string[]>([])
  const [expiring, setExpiring] = useState(false)
  const [, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)

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
        if (target) { e.preventDefault(); navigate(`/ollopa/${target.page === "home" ? "" : target.page}`) }
        return
      }
      if (e.key === "g") { last = "g"; at = Date.now() }
      else last = ""
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [session])

  const alerts = notes.filter((n) => n.interrupting && !dismissed.includes(n.id))
  // The bottom bar is the sidebar at phone width, so it carries only pages the sidebar carries:
  // the seat's four, in the fixed order, topped up from the sidebar when the profile left one out.
  const inSidebarPages = entries.map((e) => e.item.page)
  const bottom = [
    ...BOTTOM_BAR[session.role].filter((p) => inSidebarPages.includes(p)),
    ...inSidebarPages.filter((p) => !BOTTOM_BAR[session.role].includes(p)),
  ].slice(0, 4)
  const restOfPages = entries.filter((e) => !bottom.includes(e.item.page))

  return (
    <div className="flex h-screen bg-background text-foreground">
      <a href="#ollopa-main" className="sr-only rounded-md bg-foreground px-3 py-2 text-background focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50">
        Skip to content
      </a>

      <aside className={cn("hidden shrink-0 flex-col border-r bg-muted/30 md:flex", collapsed ? "w-14" : "w-56")}>
        <a href={href("/ollopa")} className={cn("flex h-14 items-center gap-2 border-b px-4 font-semibold tracking-tight", collapsed && "justify-center px-0")}>
          <span className="inline-block size-5 shrink-0 rounded-sm bg-foreground" aria-hidden="true" />
          {!collapsed && "ollopA"}
        </a>
        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Main">
          {groups.map((g) => (
            <div key={g} className={g === "bottom" ? "mt-2 border-t pt-3" : "mb-3"}>
              {g !== "top" && g !== "bottom" && !collapsed && (
                <div className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{g}</div>
              )}
              {entries.filter((e) => e.item.group === g).map((e) => (
                <SidebarRow
                  key={e.item.page}
                  entry={e}
                  page={page}
                  collapsed={collapsed}
                  onAnswer={(a) => { answerExposure(e.item.page, a); refresh() }}
                />
              ))}
            </div>
          ))}
        </nav>
        <button
          className="flex items-center gap-2 border-t px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="size-4" aria-hidden="true" /> : <ChevronLeft className="size-4" aria-hidden="true" />}
          {!collapsed && "Collapse"}
        </button>
        {!collapsed && <div className="border-t px-4 py-3 text-xs text-muted-foreground">{b.name}</div>}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* At 400 px, with a sidebar button beside the title, the title keeps the first line to itself
            and the chrome wraps under it; above 768 px the bar is one row of 56 px. */}
        <header className={cn("flex shrink-0 items-center gap-2 border-b px-3 sm:gap-3 sm:px-4", canAdd || added ? "h-auto min-h-14 flex-wrap py-1.5 md:h-14 md:flex-nowrap md:py-0" : "h-14")}>
          <h1 className={cn("truncate text-sm font-semibold", (canAdd || added) && "mr-auto md:mr-0")}>{title}</h1>
          {client && <span className="hidden shrink-0 rounded border px-2 py-0.5 text-xs text-muted-foreground sm:inline">{client} · client workspace</span>}
          {canAdd && (
            <Button variant="outline" size="sm" className="shrink-0" onClick={() => { addToSidebar(page); refresh() }}>Add to sidebar</Button>
          )}
          {added && inSidebar && (
            <Button variant="ghost" size="sm" className="shrink-0" onClick={() => { removeFromSidebar(page); refresh() }}>Remove from sidebar</Button>
          )}
          <div className={cn("flex-1", (canAdd || added) && "h-0 basis-full md:h-auto md:basis-auto")} />
          <Button variant="outline" size="sm" className="hidden w-64 justify-start text-muted-foreground lg:flex" onClick={() => setPalette(true)}>
            <Search className="size-4" aria-hidden="true" />
            Search or jump to…
            <kbd className="ml-auto rounded border px-1 font-mono text-[10px]">⌘K</kbd>
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Search or jump to" onClick={() => setPalette(true)}>
            <Search className="size-4" aria-hidden="true" />
          </Button>
          <span className="hidden sm:block"><CreditsPill session={session} onOpen={() => setCredits(true)} /></span>
          <span className="sm:hidden"><CreditsPill session={session} onOpen={() => setCredits(true)} compact /></span>
          <BellButton count={unread} onOpen={() => setBell(true)} />
          <AccountMenu session={session} onShortcuts={() => setShortcuts(true)} onChange={refresh} />
        </header>

        {expiring && (
          <div role="alert" className="flex items-center gap-3 border-b bg-muted px-4 py-2 text-sm">
            <span>Your session ends in 5 minutes.</span>
            <Button size="sm" variant="outline" onClick={() => setExpiring(false)}>Stay signed in</Button>
          </div>
        )}

        {alerts.length > 0 && (
          <div role="alert" className="border-b bg-amber-50 px-4 py-1.5 text-sm dark:bg-amber-950/40">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Needs you now</div>
            {alerts.map((n) => (
              <div key={n.id} className="flex flex-wrap items-baseline gap-x-3 py-0.5">
                <span className="min-w-0 flex-1">{n.title}</span>
                <a className="shrink-0 underline underline-offset-4" href={href(n.target)}>Open</a>
                <button className="shrink-0 text-muted-foreground underline underline-offset-4" onClick={() => setDismissed((d) => [...d, n.id])}>Dismiss</button>
              </div>
            ))}
          </div>
        )}

        <main id="ollopa-main" className="min-h-0 flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t bg-background md:hidden" aria-label="Pages">
          {bottom.map((p) => {
            const nav = navItem(p)!
            return (
              <a
                key={p}
                href={href(`/ollopa/${p === "home" ? "" : p}`)}
                aria-current={p === page ? "page" : undefined}
                className={cn("flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px]", p === page ? "font-medium" : "text-muted-foreground")}
              >
                <nav.icon className="size-4" aria-hidden="true" />
                {nav.label}
              </a>
            )
          })}
          <button className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] text-muted-foreground" onClick={() => setAllPages(true)}>
            <Grid3x3 className="size-4" aria-hidden="true" />
            All pages
          </button>
        </nav>
      </div>

      <Palette session={session} open={palette} onOpenChange={setPalette} />
      <NotificationPanel session={session} rows={notes} open={bell} onOpenChange={setBell} onChange={refresh} />
      <CreditsPanel session={session} open={creditsOpen} onOpenChange={setCredits} />
      <Shortcuts open={shortcuts} onOpenChange={setShortcuts} />
      <Panel id="allpages" title="All pages" open={allPages} onOpenChange={setAllPages} side="bottom">
        <ul className="p-2">
          {restOfPages.map((e) => (
            <li key={e.item.page}>
              <a
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm"
                href={href(`/ollopa/${e.item.page === "home" ? "" : e.item.page}`)}
                onClick={() => setAllPages(false)}
              >
                <e.item.icon className="size-4" aria-hidden="true" />
                {e.item.label}
              </a>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

export { NoAccess } from "./NoAccess"
