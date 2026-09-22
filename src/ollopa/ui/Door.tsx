// The door: the one collapsible in the product, and the only thing that costs a level.
//
// Rules it carries so no page has to remember them:
//   rule 2  a door never contains a door — nested doors render flat, with their label as a heading
//   rule 4  chevron plus text plus count, a button inside a heading, `aria-expanded`, keyboard and touch
//   rule 5  it sits where it is written and remembers whether it was left open
//   rule 7  closed content stays in the DOM (`hidden="until-found"`), so find-in-page and print reach it
//
// It also tags itself for the lesson view: `data-door` and `data-open` on the section, `data-container`
// and `data-container-label` on the body, so a page never tags a door by hand (BUILD-WAVE3.md).
import { createContext, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSession } from "../session"
import "./disclosure.css"

export interface DoorProps {
  id: string
  label: string
  count?: number
  children: ReactNode
  defaultOpen?: boolean
}

/** True inside a door or a panel: anything openable rendered here renders flat instead (rule 2). */
const Flat = createContext(false)
export const FlatProvider = Flat.Provider
export function useFlat() { return useContext(Flat) }

interface GroupValue {
  /** Incremented by Expand all / Collapse all; doors follow the signal and persist the new state. */
  signal: { n: number; open: boolean } | null
  /** Each door says what it is doing, so the control can read "Expand all" or "Collapse all" truthfully. */
  report: (id: string, open: boolean) => void
  forget: (id: string) => void
  expandAll: () => void
  collapseAll: () => void
  count: number
  openCount: number
}
const Group = createContext<GroupValue | null>(null)

/** Groups the doors of one page so "Expand all", "Collapse all" and printing can reach every one. */
export function DoorGroup({ children }: { children: ReactNode }) {
  const [signal, setSignal] = useState<{ n: number; open: boolean } | null>(null)
  const [doors, setDoors] = useState<Record<string, boolean>>({})

  const value = useMemo<GroupValue>(() => {
    const states = Object.values(doors)
    return {
      signal,
      report: (id, open) => setDoors((d) => (d[id] === open ? d : { ...d, [id]: open })),
      forget: (id) => setDoors((d) => { if (!(id in d)) return d; const next = { ...d }; delete next[id]; return next }),
      expandAll: () => setSignal((s) => ({ n: (s?.n ?? 0) + 1, open: true })),
      collapseAll: () => setSignal((s) => ({ n: (s?.n ?? 0) + 1, open: false })),
      count: states.length,
      openCount: states.filter(Boolean).length,
    }
  }, [signal, doors])

  // Printing expands every door, then leaves them as they were (rule 5, and the score's point 7).
  useEffect(() => {
    const before = () => setSignal((s) => ({ n: (s?.n ?? 0) + 1, open: true }))
    window.addEventListener("beforeprint", before)
    return () => window.removeEventListener("beforeprint", before)
  }, [])

  return <Group.Provider value={value}>{children}</Group.Provider>
}

/** "Expand all" / "Collapse all" for the group it sits in. Renders nothing when the group holds no doors. */
export function ExpandAll({ className }: { className?: string }) {
  const group = useContext(Group)
  if (!group || group.count === 0) return null
  const allOpen = group.openCount === group.count
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("h-7 px-2 text-xs", className)}
      data-print-hide
      onClick={() => (allOpen ? group.collapseAll() : group.expandAll())}
    >
      {allOpen ? "Collapse all" : "Expand all"}
    </Button>
  )
}

const doorKey = (user: string, id: string) => `ollopa.door.${user}.${id}`

/**
 * One store for every door on the page, so a control elsewhere ("Open the full evidence") opens the
 * real door rather than a second copy of its state. Backed by localStorage, keyed per user and door id.
 */
/** Only what the person actually chose is cached; the default is the caller's, so two callers on one
 *  door (the door itself, and a control elsewhere that opens it) never disagree about its default. */
const doorOpen = new Map<string, boolean | null>()
const doorListeners = new Map<string, Set<() => void>>()

function stored(key: string): boolean | null {
  if (doorOpen.has(key)) return doorOpen.get(key)!
  try {
    const raw = localStorage.getItem(key)
    const value = raw === null ? null : raw === "open"
    doorOpen.set(key, value)
    return value
  } catch { return null }
}

function readDoor(key: string, fallback: boolean): boolean {
  return stored(key) ?? fallback
}

function writeDoor(key: string, value: boolean) {
  doorOpen.set(key, value)
  try { localStorage.setItem(key, value ? "open" : "closed") } catch { /* private mode: this visit only */ }
  doorListeners.get(key)?.forEach((l) => l())
}

/** Reads and writes one door's remembered state. Exported so a page can open a door from elsewhere. */
export function useDoorState(id: string, defaultOpen = false): [boolean, (open: boolean) => void] {
  const session = useSession()
  const key = doorKey(session?.user ?? "anon", id)
  const value = useSyncExternalStore(
    (l) => {
      const set = doorListeners.get(key) ?? new Set()
      set.add(l)
      doorListeners.set(key, set)
      return () => set.delete(l)
    },
    () => readDoor(key, defaultOpen),
    () => defaultOpen,
  )
  return [value, (next: boolean) => writeDoor(key, next)]
}

export function Door({ id, label, count, children, defaultOpen = false }: DoorProps) {
  const flat = useFlat()
  const group = useContext(Group)
  const [open, setOpen] = useDoorState(id, defaultOpen)
  const contentId = useId()
  const content = useRef<HTMLDivElement>(null)
  const seen = useRef(group?.signal?.n ?? 0)

  useEffect(() => {
    if (!group || flat) return
    group.report(id, open)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, open, flat])

  useEffect(() => {
    if (!group || flat) return
    return () => group.forget(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, flat])

  useEffect(() => {
    if (!group?.signal || group.signal.n === seen.current) return
    seen.current = group.signal.n
    setOpen(group.signal.open)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.signal])

  // `hidden="until-found"` is set on the element rather than passed as a prop, because React renders
  // `hidden` as a boolean attribute and the value is the whole point: it keeps the closed content in
  // the DOM, reachable by find-in-page, and the browser tells us to open the door when it lands there.
  useLayoutEffect(() => {
    const el = content.current
    if (!el) return
    if (open) el.removeAttribute("hidden")
    else el.setAttribute("hidden", "until-found")
  }, [open])

  useEffect(() => {
    const el = content.current
    if (!el) return
    const onMatch = () => setOpen(true)
    el.addEventListener("beforematch", onMatch)
    return () => el.removeEventListener("beforematch", onMatch)
  })

  // One door, opened from anywhere by id: `ollopa:door` with { id, open }. The lesson view uses it to
  // open the door a step happens inside, and to show a viewer where a thing went; the product does
  // not dispatch it. There is still one state per door, so nothing can disagree about what is open.
  useEffect(() => {
    const onDoor = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string; open: boolean }>).detail
      if (!detail || detail.id !== id) return
      setOpen(detail.open)
    }
    document.addEventListener("ollopa:door", onDoor)
    return () => document.removeEventListener("ollopa:door", onDoor)
  })

  // A door inside a door is the third level the rules forbid: render the contents with the label as a heading.
  if (flat) {
    if (import.meta.env.DEV) console.warn(`[ui] Door "${id}" is inside a door or a panel; it renders flat (rule 2).`)
    return (
      <section data-door-flat className="py-2">
        <h4 className="pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}{count !== undefined && ` (${count})`}
        </h4>
        {children}
      </section>
    )
  }

  return (
    <section data-door={id} data-open={open ? "true" : "false"} className="border-t border-border first:border-t-0">
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen(!open)}
          className="t-label flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-muted focus-visible:outline-none"
        >
          <ChevronRight data-door-chevron aria-hidden="true" className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} />
          <span className="min-w-0">{label}</span>
          {count !== undefined && <span className="tabular-nums text-muted-foreground">({count})</span>}
        </button>
      </h3>
      <div
        id={contentId}
        ref={content}
        data-door-content
        data-container={id}
        data-container-label={label}
        className="t-body px-2 pb-3"
      >
        <FlatProvider value={true}>{children}</FlatProvider>
      </div>
    </section>
  )
}
