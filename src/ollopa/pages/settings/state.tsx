// One Save convention for the whole page (spec 14 §3.5).
//
// Nothing saves on its own. A change marks its row and raises one sticky bar that lists what will be
// saved, so a change inside a door you have since closed is not forgotten. There are no per-card Save
// buttons. Drawers are forms with one Save at the foot. Leaving with unsaved changes asks once.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Actions } from "../../ui/Actions"
import { surfaceClass } from "../../ui/Surface"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function toast(text: string) {
  document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: text }))
}

interface Change { id: string; label: string; value: unknown }

interface Store {
  /** The value a control shows: what the person changed, else what the workspace holds. */
  valueOf: <T>(id: string, fallback: T) => T
  set: (id: string, label: string, value: unknown) => void
  changes: Change[]
  save: () => void
  discard: () => void
  /** True while a row is the target of a search jump, for the two-second highlight. */
  lit: string | null
  light: (id: string | null) => void
}

const Ctx = createContext<Store | null>(null)

export function SettingsState({ children }: { children: ReactNode }) {
  const [changes, setChanges] = useState<Change[]>([])
  const [lit, setLit] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const light = useCallback((id: string | null) => {
    setLit(id)
    window.clearTimeout(timer.current)
    if (id) timer.current = window.setTimeout(() => setLit(null), 2_000)
  }, [])

  // Leaving the page with unsaved changes asks once, in the browser and on an in-app jump.
  useEffect(() => {
    if (changes.length === 0) return
    const beforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener("beforeunload", beforeUnload)
    return () => window.removeEventListener("beforeunload", beforeUnload)
  }, [changes.length])

  const value = useMemo<Store>(() => ({
    valueOf: <T,>(id: string, fallback: T) => {
      const c = changes.find((x) => x.id === id)
      return c ? (c.value as T) : fallback
    },
    set: (id, label, v) => setChanges((cs) => [...cs.filter((c) => c.id !== id), { id, label, value: v }]),
    changes,
    save: () => {
      const n = changes.length
      setChanges([])
      toast(n === 1 ? `Saved · ${changes[0].label}` : `Saved · ${n} changes`)
    },
    discard: () => { setChanges([]); toast("Changes discarded.") },
    lit,
    light,
  }), [changes, lit, light])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSettingsState(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error("A settings control was rendered outside SettingsState")
  return s
}

/** The one sticky bar. It names every change, so nothing behind a closed door is forgotten. */
export function SaveBar() {
  const s = useSettingsState()
  if (s.changes.length === 0) return null
  return (
    <div
      role="region"
      aria-label="Unsaved changes"
      data-print-hide
      /* The bar floats over the page: overlay, and the shadow that says so. Its role and its
         elevation come from the one map, never from a class picked here (DESIGN.md §5). */
      className={cn(
        surfaceClass("popover"),
        "sticky bottom-0 z-20 flex flex-wrap items-center gap-x-3 gap-y-2 border-x-0 border-b-0 px-4 py-3 sm:px-6",
      )}
    >
      {/* A Save bar is a form: Save at the leading edge, Discard after it (DESIGN.md §4). It is the
          page's one filled control — nothing else on Settings is a primary. */}
      <Actions surface="form" items={[
        { label: s.changes.length === 1 ? "Save the change" : `Save ${s.changes.length} changes`, kind: "primary", onClick: s.save },
        { label: "Discard", kind: "secondary", onClick: s.discard },
      ]} />
      <p className="t-body min-w-0 flex-1">
        <span className="font-medium">{s.changes.length === 1 ? "1 unsaved change" : `${s.changes.length} unsaved changes`}:</span>{" "}
        <span className="text-muted-foreground">{s.changes.map((c) => c.label).join(", ")}</span>
      </p>
    </div>
  )
}

/* ----------------------------------------------------------------------------- the row controls */

/** A switch that never saves on its own: it marks the row and raises the bar. */
export function Toggle({ id, change, label, on, onLabel = "On", offLabel = "Off" }: {
  id: string; change: string; label: string; on: boolean; onLabel?: string; offLabel?: string
}) {
  const s = useSettingsState()
  const value = s.valueOf(id, on)
  return (
    <span className="flex items-center gap-2">
      <Switch id={id} checked={value} aria-label={label} onCheckedChange={(v) => s.set(id, change, v)} />
      <span className="t-body text-muted-foreground">{value ? onLabel : offLabel}</span>
    </span>
  )
}

export function Text({ id, change, label, value, width = "w-56", type = "text" }: {
  id: string; change: string; label: string; value: string; width?: string; type?: string
}) {
  const s = useSettingsState()
  return (
    <Input
      id={id}
      type={type}
      aria-label={label}
      className={cn("h-8", width)}
      value={s.valueOf(id, value)}
      onChange={(e) => s.set(id, change, e.target.value)}
    />
  )
}

export function Num({ id, change, label, value, width = "w-24", suffix }: {
  id: string; change: string; label: string; value: number; width?: string; suffix?: string
}) {
  const s = useSettingsState()
  return (
    <span className="flex items-center gap-1.5">
      <Input
        id={id}
        type="number"
        aria-label={label}
        className={cn("h-8 tabular-nums", width)}
        value={String(s.valueOf(id, value))}
        onChange={(e) => s.set(id, change, Number(e.target.value))}
      />
      {suffix && <span className="t-body text-muted-foreground">{suffix}</span>}
    </span>
  )
}

export function Pick({ id, change, label, value, options, width = "w-56" }: {
  id: string; change: string; label: string; value: string; options: string[]; width?: string
}) {
  const s = useSettingsState()
  return (
    <Select value={s.valueOf(id, value)} onValueChange={(v) => s.set(id, change, v)}>
      <SelectTrigger id={id} aria-label={label} className={cn("h-8", width)}><SelectValue /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
    </Select>
  )
}
