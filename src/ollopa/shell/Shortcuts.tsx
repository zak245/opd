// The keyboard shortcut sheet: `?`, or the account menu. Keys, not rules.
import { NAV } from "../nav"
import { Panel } from "../ui/Panel"

const GENERAL: { keys: string; what: string }[] = [
  { keys: "⌘K / Ctrl K", what: "Search or jump to" },
  { keys: "g n", what: "Notifications" },
  { keys: "?", what: "This list" },
  { keys: "Esc", what: "Close a panel and return focus" },
  { keys: "⌘Enter", what: "Open a record in a new tab, from the palette" },
]

export function Shortcuts({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Panel id="shortcuts" title="Keyboard shortcuts" open={open} onOpenChange={onOpenChange}>
      <section className="px-4 py-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Anywhere</h3>
        <ul className="mt-2 grid gap-1.5">
          {GENERAL.map((g) => (
            <li key={g.keys} className="flex items-baseline gap-3 text-sm">
              <kbd className="rounded border px-1.5 py-0.5 font-mono t-small">{g.keys}</kbd>
              <span className="text-muted-foreground">{g.what}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="border-t px-4 py-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Go to a page</h3>
        <ul className="mt-2 grid gap-1.5">
          {NAV.map((n) => (
            <li key={n.page} className="flex items-baseline gap-3 text-sm">
              <kbd className="rounded border px-1.5 py-0.5 font-mono t-small">g {n.key}</kbd>
              <span className="text-muted-foreground">{n.label}</span>
            </li>
          ))}
        </ul>
      </section>
      <p className="px-4 pb-4 text-sm text-muted-foreground">Sequences are ignored while you are typing in a field. None of these is the only way to do anything.</p>
    </Panel>
  )
}
