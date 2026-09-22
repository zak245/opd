// The account menu. One level deep: nothing inside it opens a second menu.
// Items that do not apply are removed, never disabled.
import { ChevronDown, Check } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
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
        {/* Avatar in a ghost Button, which is the library's own account-menu trigger. */}
        <Button variant="ghost" size="sm" className="gap-1 px-1" aria-label="Account menu">
          <Avatar className="size-6"><AvatarFallback className="text-xs">{seat.initials}</AvatarFallback></Avatar>
          <ChevronDown className="text-muted-foreground" aria-hidden="true" />
        </Button>
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
        {/* One of three: shadcn's ToggleGroup, which is a radiogroup underneath. */}
        <ToggleGroup
          type="single"
          variant="outline"
          aria-label="Theme"
          value={current}
          onValueChange={(v) => { if (v) { setTheme(v as Theme); onChange() } }}
          className="px-2 pb-2"
        >
          {THEMES.map((t) => (
            <ToggleGroupItem key={t.id} value={t.id} className="flex-1">
              {current === t.id && <Check aria-hidden="true" />}
              {t.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

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
