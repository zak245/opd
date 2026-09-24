// One filtering pattern, for every index in the product (LAYOUTS.md §2, RULES.md 1, 4, 5, 7).
//
// Filtering is disclosure, so it obeys the disclosure rules; and it is a chain, because the person
// is watching the count change while they work. The promises are kept here, once, so that no page
// has to remember them — and, more than that, **the pattern draws every control**. A page declares
// data: a name, a kind, the options, the value and what changes it. It cannot pass a node, so it
// cannot decide the look of the most visible thing on the page. That one escape hatch is what made
// four indexes look like four products.
//
//   one reading   every filter reads `Name: value`, everywhere, in every place it appears, and
//                 when nothing is chosen the value is the word `any`. Never a bare name.
//   one control   one trigger for all five kinds: a button that reads `Name: value` with the
//                 chevron straight after the text, opening its values under itself. A single
//                 choice, a multiple choice, a range, a toggle and a piece of text are five
//                 insides of one outside.
//   on is seen    an idle filter is the library's outline button; a filter that is on carries the
//                 accent — the one hue that means "you are here" (DESIGN.md §5). Colour never
//                 works alone: the value is written on the control as well.
//   one row       search, the filters this seat sets most, one door, the count at the trailing
//                 edge. Three filters at 1280 and up, two at 1024, none on a phone — and never
//                 exactly one filter left over, because a door holding one filter is worse than
//                 no door.
//   one home      every filter that is on is listed on one line under the row, whether its control
//                 is on the row or in the door, each dropped from its own chip, with one
//                 "Clear all" that says how many it clears.
//   one count     "9 of 640 companies", always, in the same words and the same place, filtered or
//                 not. It ticks rather than swapping.
//   below, never  the door opens below the row and pushes the list down. Not a dialog, not a
//   over          sheet, not a popover over the rows: the count changing is the answer.
//   it moves      one duration and one easing, written once as MOTION, and nothing moves under
//                 `prefers-reduced-motion: reduce`.
//
// The look is shadcn as shipped (DESIGN.md §4): Button, Input, Badge, Separator, Popover and the
// library's own ring. Nothing here declares a colour, a radius, a shadow or a spacing scale — the
// accent is read from the theme's own tokens. The only values this file owns are the two durations
// and the one easing curve, because motion had none.
import {
  useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore,
  type CSSProperties, type ReactNode, type Ref,
} from "react"
import { ChevronDown, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useDoorState } from "../ui/Door"

/* ------------------------------------------------------------------------------- the motion tokens
 *
 * Two durations and one curve, and everything that moves in the product uses them. They are here
 * rather than in a page because a door that opens in 180 ms on People and 300 ms on Accounts is
 * two patterns, not one. Read them from TypeScript as `MOTION`, or from CSS as the three custom
 * properties `motionVars` writes — spread it on any root and `var(--ollopa-door-ms)` works inside.
 */
export const MOTION = {
  /** `--ollopa-door-ms` — a door, a panel or a pane opening or closing. */
  doorMs: 180,
  /** `--ollopa-settle-ms` — rows settling, the count ticking, a line growing in. */
  settleMs: 160,
  /** `--ollopa-ease` — the one curve. Fast out of the gate, soft into the stop. */
  ease: "cubic-bezier(0.32, 0.72, 0, 1)",
} as const

/** The same three as CSS custom properties, for anything that would rather write them in CSS. */
export const motionVars: CSSProperties = {
  "--ollopa-door-ms": `${MOTION.doorMs}ms`,
  "--ollopa-settle-ms": `${MOTION.settleMs}ms`,
  "--ollopa-ease": MOTION.ease,
} as CSSProperties

/**
 * What a filter that is on looks like. The accent is the one hue that means "act here" and "you
 * are here" (DESIGN.md §5), and the three values come from the theme, so this file declares no
 * colour of its own and a theme change is still a single-file edit.
 */
const ON_LOOK: CSSProperties = {
  backgroundColor: "var(--brand-tint)",
  color: "var(--brand-ink)",
  borderColor: "var(--brand)",
}

/* ------------------------------------------------------------------------------------ what a width
 * and a preference say. One subscription each, read and never rendered twice. */

function useMedia(query: string) {
  return useSyncExternalStore(
    (f) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {}
      const m = window.matchMedia(query)
      m.addEventListener("change", f)
      return () => m.removeEventListener("change", f)
    },
    () => typeof window !== "undefined" && window.matchMedia?.(query).matches === true,
    () => false,
  )
}

/** True when the person has asked for less movement. Everything in this file stops when it is. */
export function useReducedMotion() {
  return useMedia("(prefers-reduced-motion: reduce)")
}

/* --------------------------------------------------------------------------------- the count ticks
 *
 * "9 of 640 companies" is the feedback: it is the thing the person is watching while they filter,
 * so it counts from where it was to where it is rather than swapping. Tabular numerals mean it
 * does not change width while it runs. A screen reader is given the settled sentence once.
 */

function useTicker(value: number) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  const raf = useRef(0)

  useEffect(() => {
    cancelAnimationFrame(raf.current)
    if (reduced || from.current === value) { from.current = value; setShown(value); return }
    const start = performance.now()
    const begin = from.current
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / MOTION.settleMs)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = Math.round(begin + (value - begin) * eased)
      from.current = next
      setShown(next)
      if (t < 1) raf.current = requestAnimationFrame(step)
      else from.current = value
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [value, reduced])

  return shown
}

export interface ResultCountProps {
  /** How many the filters leave. */
  shown: number
  /** How many there are without them. */
  total: number
  /** What is being counted, so the number says what it is: "people", "accounts", "deals". */
  noun: string
  className?: string
}

/**
 * The result count, at the trailing edge of the filter row. **One wording, always**: "9 of 640
 * companies", filtered or not, so the person never has to work out which of two sentences they are
 * reading. It ticks when the filters change; it never moves and never changes width.
 */
export function ResultCount({ shown, total, noun, className }: ResultCountProps) {
  const ticked = useTicker(shown)
  const say = `${shown.toLocaleString()} of ${total.toLocaleString()} ${noun}`
  return (
    <span className={cn("t-label shrink-0 tabular-nums text-muted-foreground", className)} aria-live="polite" aria-atomic="true">
      <span aria-hidden="true">{ticked.toLocaleString()} of {total.toLocaleString()} {noun}</span>
      <span className="sr-only">{say}</span>
    </span>
  )
}

/* ------------------------------------------------------------------------------------ rows settle
 *
 * A list that swaps its rows on a filter change gives the eye nothing to follow, and the person
 * cannot tell whether their click did anything. The rows are not this file's to draw, so this is
 * the hook the list container spreads: the new set arrives faded and two pixels high and settles
 * over `MOTION.settleMs`. Going out is instant — a dip in both directions is a flicker, not a
 * settle — and under reduced motion nothing happens at all.
 *
 * ```tsx
 * const settle = useSettle(signatureOf(filters))
 * <div {...settle}>{rows}</div>
 * ```
 */
export function useSettle(signature: string | number) {
  const reduced = useReducedMotion()
  const [settling, setSettling] = useState(false)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (reduced) return
    setSettling(true)
    let second = 0
    const frame = requestAnimationFrame(() => { second = requestAnimationFrame(() => setSettling(false)) })
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(second) }
  }, [signature, reduced])

  return {
    "data-settling": settling ? "true" : undefined,
    className: "transition-[opacity,transform] motion-reduce:transition-none",
    style: {
      // Out is instant, in takes the settle. Anything else reads as a flash.
      transitionDuration: settling ? "0ms" : `${MOTION.settleMs}ms`,
      transitionTimingFunction: MOTION.ease,
      opacity: settling ? 0.45 : 1,
      transform: settling ? "translateY(-2px)" : "translateY(0)",
    } as CSSProperties,
  }
}

/* --------------------------------------------------------------------------------- what a filter is
 *
 * Data, and only data. There is no `node`: a page that could hand the row a control could decide
 * the product's most visible surface page by page, and four pages did. If a page needs something
 * none of these five kinds can say, the answer is a sixth kind here, agreed once, never a hatch.
 */

/** One value a filter can take, and how many rows carry it where the page can say. */
export interface FilterOption {
  value: string
  label: string
  /** How many rows this value would leave. Printed beside it, so a dead end is visible first. */
  count?: number
}

interface FilterBase {
  /** What the filter is for, in one or two words: "Owner", "Stage", "Health band". */
  name: string
  /** Which of the door's three groups this sits in when it is not on the row. Filters by default. */
  group?: FilterGroup
  /** A long list gets a box to search it. Set automatically above twelve values. */
  search?: boolean
}

/** One value at a time. The "any" row is drawn by the pattern and is always first. */
export interface OneFilter extends FilterBase {
  kind: "one"
  options: FilterOption[]
  value: string
  /** The value that means "not filtering". `"all"` unless the page says otherwise. */
  off?: string
  onChange: (value: string) => void
}

/** Any number of values at once. Reads "Stage: Cold +2" once more than one is chosen. */
export interface ManyFilter extends FilterBase {
  kind: "many"
  options: FilterOption[]
  value: string[]
  onChange: (value: string[]) => void
}

/** On or off. Reads "Archived: yes" and "Archived: no", and is on only when it is `true`. */
export interface ToggleFilter extends FilterBase {
  kind: "toggle"
  value: boolean
  /** What the two states are called, if "yes" and "no" are not the words for this one. */
  onLabel?: string
  offLabel?: string
  onChange: (value: boolean) => void
}

/** A band with two ends, chosen from one ordered list of stops. Reads "Amount: 10k to 50k". */
export interface RangeFilter extends FilterBase {
  kind: "range"
  /** The stops, in order, low to high. */
  options: FilterOption[]
  from: string
  to: string
  onChange: (from: string, to: string) => void
}

/** A piece of text the row has to contain. Reads "Company: Cedar". */
export interface TextFilter extends FilterBase {
  kind: "text"
  value: string
  onChange: (value: string) => void
}

export type Filter = OneFilter | ManyFilter | ToggleFilter | RangeFilter | TextFilter

/** Where a control sits inside the door. The door shows the three groups in this order. */
export type FilterGroup = "filters" | "views" | "columns"

const GROUP_LABEL: Record<FilterGroup, string> = {
  filters: "Filters",
  views: "Saved views",
  columns: "Columns and density",
}

/** The one label the door carries, on every index, at every width. */
export const DOOR_LABEL = "Filters and views"

/** The one word for "this filter is not filtering", everywhere in the product. */
export const ANY = "any"

/* ---------------------------------------------------------------------------- how a filter reads */

export interface Reading {
  name: string
  /** What it is set to, in the person's words. `"any"` when it is not filtering. */
  value: string
  on: boolean
}

const labelOf = (options: FilterOption[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value

/**
 * A yes/no filter whose one value is its own name would read "Not in a sequence: Not in a
 * sequence". Its value is `on`, which is the same reading rule with the stutter taken out.
 */
const say = (name: string, value: string) =>
  value.toLowerCase() === name.toLowerCase() ? "on" : value

/**
 * The one reading rule, and the only place it is written: `Name: value`, always, including when
 * nothing is chosen. `Title` and `Kind: all` cannot both be right, and neither of them is.
 */
export function readFilter(f: Filter): Reading {
  switch (f.kind) {
    case "one": {
      const off = f.off ?? "all"
      const on = f.value !== off && f.value !== ""
      return { name: f.name, value: on ? say(f.name, labelOf(f.options, f.value)) : ANY, on }
    }
    case "many": {
      const on = f.value.length > 0
      const first = on ? say(f.name, labelOf(f.options, f.value[0])) : ANY
      return { name: f.name, value: f.value.length > 1 ? `${first} +${f.value.length - 1}` : first, on }
    }
    case "toggle":
      return { name: f.name, value: f.value ? (f.onLabel ?? "yes") : (f.offLabel ?? "no"), on: f.value }
    case "range": {
      const on = Boolean(f.from || f.to)
      const from = f.from ? labelOf(f.options, f.from) : ""
      const to = f.to ? labelOf(f.options, f.to) : ""
      return {
        name: f.name,
        value: !on ? ANY : from && to ? `${from} to ${to}` : from ? `${from} and above` : `${to} and below`,
        on,
      }
    }
    case "text": {
      const on = f.value.trim().length > 0
      return { name: f.name, value: on ? f.value.trim() : ANY, on }
    }
  }
}

/** Puts one filter back to not filtering. The pattern's "Clear all" is this, over every filter. */
export function clearFilter(f: Filter) {
  switch (f.kind) {
    case "one": return f.onChange(f.off ?? "all")
    case "many": return f.onChange([])
    case "toggle": return f.onChange(false)
    case "range": return f.onChange("", "")
    case "text": return f.onChange("")
  }
}

const isOn = (f: Filter) => readFilter(f).on

/* --------------------------------------------------------------------------- the one control */

/** Arrow keys walk the values, Home and End jump. Radix's popover does Esc and the focus return. */
function useRoving() {
  return useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"]
    if (!keys.includes(e.key)) return
    const list = e.currentTarget
    const items = Array.from(list.querySelectorAll<HTMLElement>('[data-value-row]:not([disabled])'))
    if (items.length === 0) return
    const at = items.findIndex((el) => el === document.activeElement)
    const to = e.key === "Home" ? 0
      : e.key === "End" ? items.length - 1
      : e.key === "ArrowDown" ? Math.min(items.length - 1, at + 1)
      : Math.max(0, at - 1)
    e.preventDefault()
    items[to]?.focus()
  }, [])
}

/** One row in a value list: the word, a tick when it is chosen, and its count where there is one. */
function ValueRow({ label, count, chosen, multiple, onPick }: {
  label: string
  count?: number
  chosen: boolean
  multiple: boolean
  onPick: () => void
}) {
  return (
    <button
      type="button"
      data-value-row=""
      role="option"
      aria-selected={chosen}
      onClick={onPick}
      className={cn(
        "flex w-full items-center gap-2 px-1.5 py-1 text-left text-sm hover:bg-muted",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        chosen && !multiple && "font-medium",
      )}
    >
      <Checkbox checked={chosen} aria-hidden="true" tabIndex={-1} className="pointer-events-none shrink-0" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className="shrink-0 tabular-nums text-xs text-muted-foreground">{count.toLocaleString()}</span>
      )}
    </button>
  )
}

/** The values behind a single or a multiple choice, with the "any" row the pattern always draws. */
function ChoiceList({ f, close }: { f: OneFilter | ManyFilter | ToggleFilter; close: () => void }) {
  const [q, setQ] = useState("")
  const roving = useRoving()

  const options: FilterOption[] = f.kind === "toggle"
    ? [{ value: "yes", label: f.onLabel ?? "yes" }]
    : f.options
  const multiple = f.kind === "many"
  const needle = q.trim().toLowerCase()
  const shown = needle ? options.filter((o) => o.label.toLowerCase().includes(needle)) : options
  const searchable = f.search ?? options.length > 12

  const chosen = (v: string) =>
    f.kind === "many" ? f.value.includes(v)
    : f.kind === "toggle" ? f.value
    : f.value === v
  const anyChosen = !isOn(f)

  const pick = (v: string) => {
    if (f.kind === "many") {
      f.onChange(f.value.includes(v) ? f.value.filter((x) => x !== v) : [...f.value, v])
      return
    }
    if (f.kind === "toggle") { f.onChange(!f.value); close(); return }
    f.onChange(v)
    close()
  }

  return (
    <div className="space-y-2">
      {searchable && (
        <Input
          aria-label={`Search the ${f.name.toLowerCase()} values`}
          placeholder="Search values"
          className="h-8"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      )}
      <ul
        role="listbox"
        aria-label={f.name}
        aria-multiselectable={multiple}
        className="max-h-64 space-y-0.5 overflow-y-auto"
        onKeyDown={roving}
      >
        {/* The "any" row is the pattern's, on every filter, so "not filtering" is a value a person
            can choose rather than a state they have to reason their way back to. */}
        {!needle && (
          <li>
            <ValueRow
              label={f.kind === "toggle" ? (f.offLabel ?? "no") : ANY}
              chosen={anyChosen}
              multiple={false}
              onPick={() => { clearFilter(f); close() }}
            />
          </li>
        )}
        {shown.map((o) => (
          <li key={o.value}>
            <ValueRow label={o.label} count={o.count} chosen={chosen(o.value)} multiple={multiple} onPick={() => pick(o.value)} />
          </li>
        ))}
        {shown.length === 0 && (
          <li className="px-1.5 py-1 text-sm text-muted-foreground">Nothing matches “{q}”.</li>
        )}
      </ul>
    </div>
  )
}

/** The two ends of a band, from one ordered list of stops. */
function RangeBody({ f }: { f: RangeFilter }) {
  const roving = useRoving()
  const end = (which: "from" | "to") => (
    <div className="min-w-0 flex-1">
      <div className="t-label pb-1 text-muted-foreground">{which === "from" ? "From" : "To"}</div>
      <ul role="listbox" aria-label={`${f.name}, ${which}`} className="max-h-48 space-y-0.5 overflow-y-auto" onKeyDown={roving}>
        <li>
          <ValueRow label={ANY} chosen={(which === "from" ? f.from : f.to) === ""} multiple={false}
                    onPick={() => (which === "from" ? f.onChange("", f.to) : f.onChange(f.from, ""))} />
        </li>
        {f.options.map((o) => (
          <li key={o.value}>
            <ValueRow
              label={o.label}
              count={o.count}
              chosen={(which === "from" ? f.from : f.to) === o.value}
              multiple={false}
              onPick={() => (which === "from" ? f.onChange(o.value, f.to) : f.onChange(f.from, o.value))}
            />
          </li>
        ))}
      </ul>
    </div>
  )
  // Two ends of one band are read together, so they sit together and never across a door (rule 5).
  return <div className="flex gap-3">{end("from")}{end("to")}</div>
}

/** A piece of text the row has to contain. */
function TextBody({ f }: { f: TextFilter }) {
  return (
    <Input
      autoFocus
      aria-label={f.name}
      placeholder={`${f.name} contains…`}
      className="h-8"
      value={f.value}
      onChange={(e) => f.onChange(e.target.value)}
    />
  )
}

/**
 * **The control.** One outside for all five kinds: a button that reads `Name: value` with the
 * chevron straight after the text, opening its values under itself. Idle is the library's outline
 * button; on carries the accent, and the value is written on it as well, so colour never works
 * alone (DESIGN.md §5).
 */
export function FilterControl({ f, wide }: { f: Filter; wide?: boolean }) {
  const [open, setOpen] = useState(false)
  const { name, value, on } = readFilter(f)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-filter={name}
          data-on={on ? "true" : undefined}
          aria-expanded={open}
          aria-label={`${name}: ${value}`}
          className={cn("min-w-0 max-w-56", wide && "w-full justify-between")}
          style={on ? ON_LOOK : undefined}
        >
          <span className="truncate">{name}: {value}</span>
          <ChevronDown aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn(f.kind === "range" ? "w-80" : "w-64")}>
        {f.kind === "range" ? <RangeBody f={f} />
          : f.kind === "text" ? <TextBody f={f} />
          : <ChoiceList f={f} close={() => setOpen(false)} />}
        {on && (
          <Button type="button" variant="ghost" size="sm" className="mt-2"
                  onClick={() => { clearFilter(f); setOpen(false) }}>
            Clear {name}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}

/* ------------------------------------------------------------- what the door holds besides filters
 *
 * Neither of these narrows the list, so neither is a filter and neither is ever on the row. They
 * are data too: the pattern draws the checkbox list and the view list, and a page hands over the
 * ids and the callbacks.
 */

export interface DisplaySpec {
  /** Every column the table can show, and which are on. The pattern draws the list. */
  columns?: { id: string; label: string; on: boolean; locked?: boolean }[]
  onColumns?: (ids: string[]) => void
  /** How the rows or cards are ordered, where the page has no sortable headers to click. */
  order?: { value: string; options: FilterOption[]; onChange: (value: string) => void }
  /** The two-step density (RULES.md 3: density is the one legitimate user-controlled mode). */
  density?: { value: string; options: FilterOption[]; onChange: (value: string) => void }
}

export interface ViewsSpec {
  views: { id: string; name: string; note?: string }[]
  current?: string | null
  onOpen: (id: string) => void
  /** Given, the door offers to keep the filters that are on as a new view. */
  onSave?: () => void
  /** True while the open view has been changed but not saved. */
  edited?: boolean
  onRevert?: () => void
}

function DisplayBody({ d }: { d: DisplaySpec }) {
  const ids = (d.columns ?? []).filter((c) => c.on).map((c) => c.id)
  return (
    <div className="flex flex-col gap-3">
      {d.order && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="t-label text-muted-foreground">Order</span>
          <FilterControl f={{ kind: "one", name: "Order", options: d.order.options, value: d.order.value, off: "", onChange: d.order.onChange }} />
        </div>
      )}
      {d.density && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="t-label text-muted-foreground">Density</span>
          <FilterControl f={{ kind: "one", name: "Density", options: d.density.options, value: d.density.value, off: "", onChange: d.density.onChange }} />
        </div>
      )}
      {d.columns && d.columns.length > 0 && (
        <div>
          <div className="t-label pb-1 text-muted-foreground">
            Columns · {ids.length} of {d.columns.length}
          </div>
          {/* A grid of labels rather than a list: `ul > li` means "the rows of this index"
              everywhere else in the product, and a columns control is not a row. */}
          <div className="grid max-h-48 gap-1 overflow-y-auto sm:grid-cols-2">
            {d.columns.map((c) => (
              <label key={c.id} className={cn("flex items-center gap-2 text-sm", c.locked && "text-muted-foreground")}>
                <Checkbox
                  checked={c.on}
                  disabled={c.locked}
                  onCheckedChange={(v) =>
                    d.onColumns?.(v === true ? [...ids, c.id] : ids.filter((x) => x !== c.id))}
                />
                {c.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ViewsBody({ v }: { v: ViewsSpec }) {
  return (
    <div className="flex flex-col gap-2">
      {v.views.length === 0 && <p className="t-body text-muted-foreground">Nothing saved yet.</p>}
      <div className="flex flex-wrap gap-2">
        {v.views.map((x) => {
          const here = v.current === x.id
          return (
            <Button
              key={x.id}
              type="button" variant="outline" size="sm"
              aria-current={here ? "true" : undefined}
              style={here ? ON_LOOK : undefined}
              onClick={() => v.onOpen(x.id)}
            >
              {x.name}{x.note ? ` · ${x.note}` : ""}
            </Button>
          )
        })}
      </div>
      {(v.onSave || (v.edited && v.onRevert)) && (
        <div className="flex flex-wrap items-center gap-2">
          {v.onSave && (
            <Button type="button" variant="outline" size="sm" onClick={v.onSave}>
              {v.edited && v.current ? "Save the changes to this view" : "Save what is on as a view"}
            </Button>
          )}
          {v.edited && v.onRevert && (
            <Button type="button" variant="ghost" size="sm" onClick={v.onRevert}>Put it back</Button>
          )}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------------- the applied line
 *
 * **One home for what is on, and it holds everything.** The research disagrees with itself here:
 * Linear and Google Drive keep the applied filter only in its own chip; Carbon and Helios keep it
 * only in a tag list under the bar. Maersk's own reading of the research — "it is best to show the
 * applied filter by highlighting them both in their original placement … as well as in a separate
 * 'applied filters' section" — is the side taken here, and it is what memo 31 argues: the control
 * is where you change a filter, the line is where you read the whole cause of the count at once,
 * and a line that lists only the hidden half is a line nobody can trust.
 */

export interface AppliedLineProps {
  /** Every filter that is on, wherever its control sits. */
  on: Filter[]
  /** What is in the search box, if anything. A search narrows the list, so it is on this line too. */
  search?: string
  onClearSearch?: () => void
  onClearAll?: () => void
  className?: string
}

/**
 * One line under the row, naming every filter that is on and offering to drop each one.
 *
 * A filter is dropped from its own chip — the "×" is inside the chip, so it is one control with
 * one accessible name ("Clear Score: 40 and above"), never a second button floating beside it.
 * There is exactly one "Clear all", at the end of the line, and it says how many it clears.
 */
export function AppliedLine({ on, search, onClearSearch, onClearAll, className }: AppliedLineProps) {
  const total = on.length + (search ? 1 : 0)
  const open = total > 0
  return (
    <div
      className={cn("grid transition-[grid-template-rows,opacity,visibility] motion-reduce:transition-none", className)}
      style={{
        gridTemplateRows: open ? "1fr" : "0fr",
        opacity: open ? 1 : 0,
        visibility: open ? "visible" : "hidden",
        transitionDuration: `${MOTION.settleMs}ms`,
        transitionTimingFunction: MOTION.ease,
      }}
    >
      <div className="overflow-hidden">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pt-2" inert={!open}>
          <span className="t-label shrink-0 text-muted-foreground">Filtered by</span>
          {/* The search narrows the list exactly as a filter does, so it reads on this line in the
              same words and is dropped the same way. A "Clear all" that counted it but did not
              show it is a number the person cannot account for. */}
          {search && (
            <Button
              type="button" variant="outline" size="sm" className="max-w-[18rem]" style={ON_LOOK}
              aria-label={`Clear Search: ${search}`}
              onClick={onClearSearch}
            >
              <span className="truncate">Search: {search}</span>
              <X aria-hidden="true" />
            </Button>
          )}
          {on.map((f) => {
            const r = readFilter(f)
            return (
              <Button
                key={r.name}
                type="button"
                variant="outline"
                size="sm"
                className="max-w-[18rem]"
                style={ON_LOOK}
                aria-label={`Clear ${r.name}: ${r.value}`}
                onClick={() => clearFilter(f)}
              >
                <span className="truncate">{r.name}: {r.value}</span>
                <X aria-hidden="true" />
              </Button>
            )
          })}
          {onClearAll && (
            <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
              Clear all {total} {total === 1 ? "filter" : "filters"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------------------- the bar */

export interface FilterSearch {
  value: string
  onChange: (value: string) => void
  /** For the page's own "/" shortcut. The box, its placeholder and its label are the pattern's. */
  inputRef?: Ref<HTMLInputElement>
}

export interface FilterBarProps {
  /** Always first, always the same box. A page that cannot be searched leaves it out. */
  search?: FilterSearch
  /** Every filter this page has, in the order this seat sets them. The bar decides what fits. */
  filters?: Filter[]
  /** The saved views, in the door's second group. */
  views?: ViewsSpec
  /** The columns, the order and the density, in the door's third group. */
  display?: DisplaySpec
  /** The count at the trailing edge, in three parts, so it ticks and says what it counts. */
  count?: ResultCountProps
  /** The door's own id, so it remembers whether it was left open (RULES.md rule 5). */
  doorId?: string
  className?: string
}

/** How many named filters keep the row at this width, before the "never one left over" rule. */
function roomFor(total: number, phone: boolean, roomy: boolean) {
  if (phone) return 0
  const room = roomy ? 3 : 2
  // A door holding exactly one filter is worse than no door: the row takes the odd one instead.
  return total - room === 1 ? room + 1 : Math.min(room, total)
}

/** Every filter that is on, in the page's own order, for the applied line and the empty state. */
export function filtersOn(filters: Filter[] = []) {
  return filters.filter(isOn)
}

/** What the rows settle on: change any of it and the list has been re-filtered. */
export function filterSignature(p: FilterBarProps) {
  return [p.search?.value ?? "", ...(p.filters ?? []).map((f) => { const r = readFilter(f); return `${r.name}:${r.value}` })].join("|")
}

/**
 * The filtering pattern. One row, one door, one count, one applied line, one motion — and every
 * control drawn here.
 *
 * ```tsx
 * <FilterBar
 *   search={{ value: q, onChange: setQ }}
 *   filters={[
 *     { kind: "one", name: "Owner", value: owner, onChange: setOwner,
 *       options: owners.map((o) => ({ value: o, label: o })) },
 *     { kind: "many", name: "Stage", value: stages, onChange: setStages, options: STAGES },
 *   ]}
 *   display={{ columns, onColumns: setColumns }}
 *   count={{ shown: rows.length, total: all.length, noun: "people" }} />
 * ```
 */
export function FilterBar({
  search, filters = [], views, display, count, doorId = "index.filters", className,
}: FilterBarProps) {
  const phone = useMedia("(max-width: 639px)")
  const roomy = useMedia("(min-width: 1280px)")
  const [open, setOpen] = useDoorState(`filters.${doorId}`, false)
  const panelId = useId()
  const panel = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  const room = roomFor(filters.length, phone, roomy)
  const front = filters.slice(0, room)
  const behind = filters.slice(room)

  const groups = useMemo(() => {
    const byGroup: Record<FilterGroup, Filter[]> = { filters: [], views: [], columns: [] }
    for (const f of behind) byGroup[f.group ?? "filters"].push(f)
    return byGroup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [behind.map((f) => f.name).join("|")])

  // Whether there is a door at all: it holds the filters the row had no room for, the saved views
  // and the columns and density. A page with none of those has nothing to put behind one.
  const inside = behind.length + (views ? 1 : 0) + (display ? 1 : 0)
  const on = filters.filter(isOn)
  const noun = count?.noun ?? "rows"

  const clearAll = useCallback(() => {
    search?.onChange("")
    for (const f of filters) clearFilter(f)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, search])

  // Focus goes into the door when it opens and back to the trigger when it closes, and Esc closes
  // it from anywhere inside (RULES.md rule 4: a door works from the keyboard or it does not work).
  const opened = useRef(open)
  useEffect(() => {
    if (open && !opened.current) panel.current?.focus()
    opened.current = open
  }, [open])

  const close = useCallback(() => { setOpen(false); trigger.current?.focus() }, [setOpen])

  return (
    <div className={cn("flex w-full min-w-0 flex-col", className)} style={motionVars}>
      {/* The row. Search, the seat's filters, the door, the count — in that order, everywhere. */}
      <div className="flex w-full min-w-0 flex-wrap items-center gap-2">
        {search && (
          <Input
            ref={search.inputRef}
            type="search"
            data-page-search
            // One placeholder rule, so no page writes one and none of them truncates mid-word:
            // the word "Search" and the same noun the count uses (DESIGN.md §3 — a placeholder
            // never explains; the "/" shortcut is taught by the shortcuts list, not in the box).
            aria-label={`Search ${noun}`}
            placeholder={`Search ${noun}`}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            // Full width on a phone, where it is the whole row; narrower at 1024 than at 1440, so
            // the two named filters, the door and the count still fit on one line there.
            className={cn("h-8", phone ? "w-full" : "w-44 shrink-0 xl:w-56")}
          />
        )}
        {front.map((f) => <FilterControl key={f.name} f={f} />)}
        {inside > 0 && (
          <Button
            ref={trigger}
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            data-filter-door
            aria-expanded={open}
            aria-controls={panelId}
            style={on.length > 0 ? ON_LOOK : undefined}
            onClick={() => setOpen(!open)}
          >
            <ChevronRight
              aria-hidden="true"
              className="transition-transform motion-reduce:transition-none"
              style={{
                transform: open ? "rotate(90deg)" : "none",
                transitionDuration: `${MOTION.doorMs}ms`,
                transitionTimingFunction: MOTION.ease,
              }}
            />
            {/* The same words at every width: an icon-only door is the unlabelled door rule 4
                bans, and a door called one thing here and another there is two doors. */}
            <span>{DOOR_LABEL}</span>
            {/* **How much of this page's filtering is on**, in the same "N of M" grammar the
                result count uses and in the same format on every page: "2 of 26 on". It counts
                every filter the page has, not only the ones behind this door, so it can never
                disagree with the applied line — and it never counts the columns and the views,
                which are inside the door but are not things that can be on. A bare "8 · 4" is the
                unlabelled thing rule 4 bans; "2 of 26 on" says which number is which. */}
            <Badge variant="outline" className="tabular-nums">{on.length} of {filters.length} on</Badge>
          </Button>
        )}
        {count && <ResultCount {...count} className="ml-auto" />}
      </div>

      {/* The applied line: every filter that is on, and the one "Clear all". */}
      <AppliedLine
        on={on}
        search={search?.value}
        onClearSearch={() => search?.onChange("")}
        onClearAll={on.length + (search?.value ? 1 : 0) > 0 ? clearAll : undefined}
      />

      {/* The door. It opens below the row and pushes the list down; the list stays readable, which
          is the point — the person opened it to watch the count change. Never over the rows. */}
      {inside > 0 && (
        <div
          className="grid transition-[grid-template-rows,opacity,visibility] motion-reduce:transition-none"
          style={{
            gridTemplateRows: open ? "1fr" : "0fr",
            opacity: open ? 1 : 0,
            // A closed door is out of the page, not merely clipped by it: `inert` takes it out of
            // the keyboard and the accessibility tree, and `visibility` takes it out of layout, so
            // nothing counting the page's rows or controls finds a filter that is not on screen.
            visibility: open ? "visible" : "hidden",
            transitionDuration: `${MOTION.doorMs}ms`,
            transitionTimingFunction: MOTION.ease,
          }}
        >
          <div className="overflow-hidden">
            <div
              id={panelId}
              ref={panel}
              tabIndex={-1}
              inert={!open}
              role="group"
              aria-label={DOOR_LABEL}
              className="mt-2 max-h-[60vh] overflow-y-auto rounded-md border border-border p-3 outline-none"
              onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); close() } }}
            >
              {(["filters", "views", "columns"] as FilterGroup[]).map((g, i) => {
                const own = groups[g]
                const body = g === "views" ? (views ? <ViewsBody v={views} /> : null)
                  : g === "columns" ? (display ? <DisplayBody d={display} /> : null)
                  : null
                if (own.length === 0 && !body) return null
                return (
                  <div key={g}>
                    {i > 0 && <Separator className="my-3" />}
                    <div className="t-label pb-2 text-muted-foreground">{GROUP_LABEL[g]}</div>
                    {own.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pb-2">
                        {own.map((f) => <FilterControl key={f.name} f={f} />)}
                      </div>
                    )}
                    {body}
                  </div>
                )
              })}
              <div className="flex items-center justify-end pt-3">
                <Button type="button" variant="ghost" size="sm" onClick={close}>Done</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------------- the empty state */

export interface FilterEmptyProps {
  /** What the page is a list of: "people", "accounts". */
  noun: string
  /** Every filter the page has. The empty state names the ones that are on. */
  filters?: Filter[]
  /** What is in the search box, because the search empties a list as often as a filter does. */
  search?: string
  onClearSearch?: () => void
  onClearAll?: () => void
  className?: string
}

/**
 * What a filtered index says when nothing is left. It names the filter that emptied it and offers
 * to clear that one, because "No results" leaves the person to guess which of four did it.
 */
export function FilterEmpty({ noun, filters = [], search, onClearSearch, onClearAll, className }: FilterEmptyProps) {
  const on = filtersOn(filters)
  const last = on[on.length - 1]
  if (!last) {
    if (search) {
      return (
        <div className={cn("flex flex-col items-center gap-2 py-8 text-center", className)}>
          <p className="t-body text-muted-foreground">
            No {noun} match “<span className="font-medium text-foreground">{search}</span>”.
          </p>
          {onClearSearch && (
            <Button type="button" variant="outline" size="sm" onClick={onClearSearch}>Clear the search</Button>
          )}
        </div>
      )
    }
    return <p className={cn("t-body py-8 text-center text-muted-foreground", className)}>No {noun} here yet.</p>
  }
  const r = readFilter(last)
  return (
    <div className={cn("flex flex-col items-center gap-2 py-8 text-center", className)}>
      <p className="t-body text-muted-foreground">
        No {noun} match <span className="font-medium text-foreground">{r.name}: {r.value}</span>.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => clearFilter(last)}>
          Clear {r.name}
        </Button>
        {/* The search narrows the list as hard as a filter does, so when there is one it is
            offered here too: the person cannot tell from a blank table which of the two did it. */}
        {search && onClearSearch && (
          <Button type="button" variant="outline" size="sm" onClick={onClearSearch}>
            Clear the search
          </Button>
        )}
        {(on.length > 1 || search) && onClearAll && (
          <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
            Clear all {on.length + (search ? 1 : 0)} filters
          </Button>
        )}
      </div>
    </div>
  )
}
