// The account menu. One level deep: nothing inside it opens a second menu.
// Items that do not apply are removed, never disabled.
import { ChevronDown, Check } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { navigate } from "@/app/router"
import { businessById } from "../data/businesses"
import { ROLE_LABEL } from "../usage/model"
import { setTheme, signOut, theme, type Session, type Theme } from "../session"
import { digestOn, setDigest } from "./notifications"

const THEMES: { id: Theme; label: string }[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
]

export function AccountMenu({ session, onShortcuts, onChange }: { session: Session; onShortcuts: () => void; onChange: () => void }) {
  const b = businessById(session.business)
  const seat = b.roles.find((r) => r.role === session.role && r.user === session.user) ?? b.roles[0]
  const current = theme()
  const digest = digestOn(session.business, session.role)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 rounded-full pl-1 pr-1.5 hover:bg-muted" aria-label="Account menu">
          <Avatar className="size-7"><AvatarFallback className="text-xs">{seat.initials}</AvatarFallback></Avatar>
          <ChevronDown className="size-3 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>
          <div className="font-medium">{seat.user}</div>
          <div className="text-xs font-normal text-muted-foreground">
            {seat.title === ROLE_LABEL[session.role] ? seat.title : `${seat.title} (${ROLE_LABEL[session.role]})`} · {b.name}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/ollopa/settings/you")}>Your profile</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/ollopa/settings/plan")}>Credit usage</DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Daily email digest</DropdownMenuLabel>
        <div className="flex items-center justify-between gap-3 px-2 pb-2 text-sm">
          <label htmlFor="digest-switch" className="text-muted-foreground">
            {digest ? "On: what waits, at 08:00" : "Off: nothing by email"}
          </label>
          <Switch
            id="digest-switch"
            checked={digest}
            onCheckedChange={(v) => { setDigest(session.business, session.role, v); onChange() }}
          />
        </div>

        <DropdownMenuLabel className="pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Theme</DropdownMenuLabel>
        <div role="radiogroup" aria-label="Theme" className="flex gap-1 px-2 pb-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              role="radio"
              aria-checked={current === t.id}
              onClick={() => { setTheme(t.id); onChange() }}
              className={"flex-1 rounded-md border px-2 py-1 text-xs " + (current === t.id ? "border-foreground font-medium" : "text-muted-foreground")}
            >
              {current === t.id && <Check className="mr-1 inline size-3" aria-hidden="true" />}
              {t.label}
            </button>
          ))}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onShortcuts}>Keyboard shortcuts</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/ollopa/settings")}>Help and docs</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/ollopa/settings")}>Contact support</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/ollopa/settings/plan")}>What changed this month</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { signOut({ rememberWorkspace: true }); navigate("/ollopa") }}>Switch account</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => { signOut(); navigate("/ollopa") }}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
