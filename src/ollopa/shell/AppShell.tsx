import { type ReactNode } from "react"
import { Bell, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { href, navigate } from "@/app/router"
import { GROUP_ORDER, navFor, navItem } from "../nav"
import { businessById } from "../data/businesses"
import { ROLE_LABEL, type Page } from "../usage/model"
import { signOut, type Session } from "../session"

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M"
  if (n >= 1_000) return Math.round(n / 1_000) + "k"
  return String(n)
}

export function AppShell({ session, page, children }: { session: Session; page: Page; children: ReactNode }) {
  const b = businessById(session.business)
  const seat = b.roles.find((r) => r.role === session.role) ?? b.roles[0]
  const items = navFor(session.role)
  const groups = GROUP_ORDER.filter((g) => items.some((i) => i.group === g))
  const current = navItem(page)

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/30">
        <a href={href("/ollopa")} className="flex h-14 items-center gap-2 border-b px-4 font-semibold tracking-tight">
          <span className="inline-block size-5 rounded-sm bg-foreground" aria-hidden="true" />
          Ollopa
        </a>
        <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Main">
          {groups.map((g) => (
            <div key={g} className={g === "bottom" ? "mt-2 border-t pt-3" : "mb-3"}>
              {g !== "top" && g !== "bottom" && <div className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{g}</div>}
              {items.filter((i) => i.group === g).map((i) => {
                const active = i.page === page || (page === "deal" && i.page === "deals") || (page === "connect" && i.page === "settings")
                return (
                  <a
                    key={i.page}
                    href={href(`/ollopa/${i.page === "home" ? "" : i.page}`)}
                    aria-current={active ? "page" : undefined}
                    className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-sm", active ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:bg-background hover:text-foreground")}
                  >
                    <i.icon className="size-4" aria-hidden="true" />
                    {i.label}
                  </a>
                )
              })}
            </div>
          ))}
        </nav>
        <div className="border-t px-4 py-3 text-xs text-muted-foreground">{b.name}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <h1 className="text-sm font-semibold">{current?.label ?? "Ollopa"}</h1>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="w-64 justify-start text-muted-foreground" onClick={() => document.dispatchEvent(new CustomEvent("ollopa:palette"))}>
            <Search className="size-4" aria-hidden="true" />
            Search or jump to…
            <kbd className="ml-auto rounded border px-1 font-mono text-[10px]">⌘K</kbd>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <a href={href("/ollopa/settings")} className="rounded-full border px-3 py-1 font-mono text-xs tabular-nums hover:bg-muted">
                {fmt(b.credits.balance)} credits · {fmt(b.credits.burnPerWeek)}/wk
              </a>
            </TooltipTrigger>
            <TooltipContent>Balance and this week's burn. Cap {fmt(b.credits.monthlyCap)} per month.</TooltipContent>
          </Tooltip>
          <Button variant="ghost" size="icon" aria-label="Notifications"><Bell className="size-4" /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full pl-1 pr-2 hover:bg-muted" aria-label="Account menu">
                <Avatar className="size-7"><AvatarFallback className="text-xs">{seat.initials}</AvatarFallback></Avatar>
                <ChevronDown className="size-3 text-muted-foreground" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="font-medium">{seat.user}</div>
                <div className="text-xs font-normal text-muted-foreground">{seat.title} ({ROLE_LABEL[session.role]}) · {b.name}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate("/ollopa/settings")}>Your profile</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate("/ollopa/settings")}>Credit usage</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => { signOut(); navigate("/ollopa") }}>Switch account</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

/** Shown when a role opens a page that is not part of its job. Never a silent gap, never a greyed-out control. */
export function NoAccess({ session, page }: { session: Session; page: Page }) {
  const b = businessById(session.business)
  const item = navItem(page)
  const admin = b.roles.find((r) => r.role === "admin")
  const who = item ? item.roles.map((r) => ROLE_LABEL[r]).join(", ") : "other roles"
  return (
    <div className="mx-auto max-w-md p-10 text-center">
      <h2 className="text-lg font-semibold">{item?.label ?? "This area"} is not part of your role</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        It is used by: {who}. If you need it, ask {admin ? `${admin.user} (${admin.title})` : "your admin"} to change your permissions.
      </p>
      <Button className="mt-6" variant="outline" onClick={() => navigate("/ollopa")}>Back to Home</Button>
    </div>
  )
}
