// The pieces the People page is assembled from: the value picker behind a chip, the chip itself, the
// flat filters panel, the views list, the columns-and-density list and the selection bar.
//
// Each one is a door in the sense the rules mean it — a chevron, text, a count, keyboard and touch —
// and none of them contains another. A picker that follows a chosen action is the action's form, not
// a level: doors reveal options, forms complete a choice already made.
import { useMemo, useRef, useState, type ReactNode } from "react"
import { ChevronDown, Pin, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { chipLabel, type Active, type FilterDef, type FilterGroup } from "./filters"
import { FILTER_GROUPS } from "./filters"

/* ------------------------------------------------------------------------------- the value picker */

export interface PickerProps {
  filter: FilterDef
  values: string[]
  chosen: string[]
  count: (value: string) => number
  onChange: (chosen: string[]) => void
  onClose?: () => void
}

/** A listbox of values with live counts, and a box to search the rest when the list is long. */
export function ValueList({ filter, values, chosen, count, onChange }: PickerProps) {
  const [q, setQ] = useState("")
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const matching = needle ? values.filter((v) => v.toLowerCase().includes(needle)) : values
    return matching.slice(0, needle ? 40 : 12)
  }, [values, q])

  const toggle = (v: string) => {
    if (filter.single) { onChange(chosen.includes(v) ? [] : [v]); return }
    onChange(chosen.includes(v) ? chosen.filter((x) => x !== v) : [...chosen, v])
  }

  return (
    <div className="space-y-2">
      {(values.length > 12 || filter.typeAhead) && (
        <Input
          aria-label={`Search ${filter.label} values`}
          placeholder={filter.typeAhead ? `${filter.label} contains…` : "Search values"}
          className="h-8"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filter.typeAhead && q.trim()) { e.preventDefault(); toggle(q.trim()); setQ("") }
          }}
        />
      )}
      <ul role="listbox" aria-label={filter.label} aria-multiselectable={!filter.single} className="max-h-64 space-y-0.5 overflow-y-auto">
        {shown.map((v) => {
          const on = chosen.includes(v)
          return (
            <li key={v}>
              <button
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => toggle(v)}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  on && "bg-muted",
                )}
              >
                <span aria-hidden="true" className={cn("size-3.5 shrink-0 rounded-sm border", on && "border-foreground bg-foreground")} />
                <span className="min-w-0 flex-1 truncate">{v}</span>
                <span className="shrink-0 tabular-nums text-xs text-muted-foreground">{count(v).toLocaleString()}</span>
              </button>
            </li>
          )
        })}
        {shown.length === 0 && <li className="px-1.5 py-1 text-sm text-muted-foreground">Nothing matches “{q}”.</li>}
      </ul>
      {chosen.length > 0 && (
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => onChange([])}>
          Clear {filter.label}
        </Button>
      )}
    </div>
  )
}

/** The chip in the bar: it opens its picker in place, under itself, and reads what it holds. */
export function FilterChip(p: PickerProps & { note?: ReactNode }) {
  const [open, setOpen] = useState(false)
  const on = p.chosen.length > 0
  return (
    <span className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-expanded={open}
            className={cn(
              "flex max-w-[16rem] items-center gap-1 rounded-full border px-2.5 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              on ? "border-foreground bg-foreground text-background" : "hover:bg-muted",
            )}
          >
            <span className="truncate">{chipLabel(p.filter, p.chosen)}</span>
            <ChevronDown aria-hidden="true" className="size-3 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72">
          <ValueList {...p} />
        </PopoverContent>
      </Popover>
      {on && (
        <button
          type="button"
          aria-label={`Clear ${p.filter.label}`}
          className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={() => p.onChange([])}
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      )}
      {p.note}
    </span>
  )
}

/* ------------------------------------------------------------------------------- the flat panel */

export function FiltersPanelBody({ filters, active, values, count, onChange, onClear, dnc, includeDnc, onIncludeDnc }: {
  filters: FilterDef[]
  active: Active
  values: (f: FilterDef) => string[]
  count: (f: FilterDef, value: string) => number
  onChange: (id: string, chosen: string[]) => void
  onClear: () => void
  /** How many people in this workspace carry "do not contact". */
  dnc: number
  includeDnc: boolean
  onIncludeDnc: (v: boolean) => void
}) {
  const [q, setQ] = useState("")
  const needle = q.trim().toLowerCase()
  const shown = needle ? filters.filter((f) => f.label.toLowerCase().includes(needle)) : filters

  return (
    <div className="space-y-4">
      <Input aria-label="Search filters" placeholder="Search filters" className="h-8" value={q} onChange={(e) => setQ(e.target.value)} />

      {/* Safety state, stated rather than silently applied: excluded by default, with its count. */}
      <div className="rounded-md border p-2.5 text-xs">
        <p>
          {dnc.toLocaleString()} {dnc === 1 ? "person carries" : "people carry"} “do not contact”.{" "}
          {includeDnc ? "They are in these results." : "They are left out of these results."}
        </p>
        <Button size="sm" variant="outline" className="mt-1.5 h-7 px-2 text-xs" onClick={() => onIncludeDnc(!includeDnc)}>
          {includeDnc ? "Leave them out again" : "Show them anyway"}
        </Button>
      </div>

      {FILTER_GROUPS.map((group: FilterGroup) => {
        const inGroup = shown.filter((f) => f.group === group)
        if (inGroup.length === 0) return null
        return (
          <section key={group}>
            <h4 className="pb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{group}</h4>
            <div className="space-y-3">
              {inGroup.map((f) => (
                <div key={f.id}>
                  <div className="pb-1 text-sm font-medium">{f.label}</div>
                  <ValueList
                    filter={f}
                    values={values(f)}
                    chosen={active[f.id] ?? []}
                    count={(v) => count(f, v)}
                    onChange={(c) => onChange(f.id, c)}
                  />
                </div>
              ))}
            </div>
          </section>
        )
      })}

      <Button variant="outline" size="sm" onClick={onClear}>Clear all filters</Button>
    </div>
  )
}

/** The panel's own chrome: a labelled region that pushes the table, with the pin beside its close. */
export function FiltersPanelFrame({ title, pinned, onPin, onClose, children }: {
  title: string
  pinned: boolean
  onPin: (v: boolean) => void
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <section
      ref={ref}
      aria-label={title}
      className="hidden w-72 shrink-0 overflow-y-auto border-r px-4 py-3 md:block"
      data-print-hide
    >
      <div className="flex items-center gap-1 pb-2">
        <h3 className="flex-1 text-sm font-medium">{title}</h3>
        <Button
          size="icon"
          variant={pinned ? "secondary" : "ghost"}
          className="size-7"
          aria-pressed={pinned}
          aria-label={pinned ? "Unpin the filters panel" : "Pin the filters panel open"}
          onClick={() => onPin(!pinned)}
        >
          <Pin aria-hidden="true" className="size-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="size-7" aria-label="Close the filters panel" onClick={onClose}>
          <X aria-hidden="true" className="size-4" />
        </Button>
      </div>
      {children}
    </section>
  )
}
