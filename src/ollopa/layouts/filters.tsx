// One filtering pattern, for every index in the product (LAYOUTS.md §2, RULES.md 1, 4, 5, 7).
//
// Filtering is disclosure, so it obeys the disclosure rules; and it is a chain, because the person
// is watching the count change while they work. That makes four promises, and this file is where
// they are kept so that no page has to remember them:
//
//   one row       search, then at most three named filters that show their own value, then one
//                 door in the same place with the same label, then the count at the trailing edge.
//                 One row at 1440 and at 1024. On a phone: the search on the row, the door and
//                 the count on the one under it, and no filters on either — two things, not six.
//   visible cause every filter that is on reads without opening the door: in its own control when
//                 it is one of the three, on one line under the row when it is not. One "Clear
//                 all"; a filter is dropped from its own chip, never from a stray "×" beside it.
//   below, never  the door opens below the row and pushes the list down. It is not a dialog, not a
//   over          sheet and not a popover over the rows: the list behind it stays readable,
//                 because the count changing is the answer the person opened it for.
//   it moves      a filter change ticks the count, settles the rows and grows the applied line in.
//                 One duration and one easing for all of it, written once as MOTION below, and
//                 nothing moves under `prefers-reduced-motion: reduce`.
//
// The look is shadcn as shipped (DESIGN.md §4): Button, Input, Badge, Separator and the library's
// own ring. Nothing here declares a colour, a radius, a shadow or a spacing scale. The only values
// this file owns are the two durations and the one easing curve, because motion had none.
import {
  useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore,
  type CSSProperties, type ReactNode,
} from "react"
import { ChevronRight, SlidersHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
 * "9 of 800" is the feedback: it is the thing the person is watching while they filter, so it
 * counts from where it was to where it is rather than swapping. Tabular numerals mean it does not
 * change width while it runs. A screen reader is given the settled sentence once, not every frame.
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
 * The result count, at the trailing edge of the filter row: "9 of 800 people", or "800 people"
 * when nothing is filtering. It ticks when the filters change; it never moves or changes width.
 */
export function ResultCount({ shown, total, noun, className }: ResultCountProps) {
  const ticked = useTicker(shown)
  const filtered = shown !== total
  const say = filtered
    ? `${shown.toLocaleString()} of ${total.toLocaleString()} ${noun}`
    : `${total.toLocaleString()} ${noun}`
  return (
    <span className={cn("t-label shrink-0 tabular-nums text-muted-foreground", className)} aria-live="polite">
      <span aria-hidden="true">
        {filtered ? `${ticked.toLocaleString()} of ${total.toLocaleString()} ${noun}` : say}
      </span>
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
 * const settle = useSettle(`${query}|${JSON.stringify(active)}`)
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

/* --------------------------------------------------------------------------------- what a filter is */

export interface FilterControl {
  /** What the filter is for, in one or two words: "Owner", "Stage", "Health band". */
  name: string
  /** The control itself. A `Select`, a `ToggleGroup`, a chip — whatever the page already draws. */
  node: ReactNode
  /**
   * What the filter is set to right now, in the person's words: "me", "Cold, Approaching".
   * Undefined or empty means the filter is off. This is what makes the count explainable, so a
   * page that filters by something always says what.
   */
  value?: string
  /** Drops this one filter. Given, the applied line and the empty state can offer it. */
  onClear?: () => void
}

/** Where a control sits inside the door. The door shows the three groups in this order. */
export type FilterGroup = "filters" | "views" | "columns"

export interface DoorItem extends FilterControl {
  group?: FilterGroup
}

const GROUP_LABEL: Record<FilterGroup, string> = {
  filters: "Filters",
  views: "Saved views",
  columns: "Columns and density",
}

/** The one label the door carries, on every index, at every width. */
export const DOOR_LABEL = "Filters and views"

const applied = (c: FilterControl) => Boolean(c.value && c.value.length > 0)

/* -------------------------------------------------------------------------------- the applied line */

export interface AppliedLineProps {
  /** The filters that are on and are not readable in a control on the row. */
  chips: FilterControl[]
  /** Every filter that is on, including the ones the row already shows. Sets the "Clear all" count. */
  total: number
  onClearAll?: () => void
  className?: string
}

/**
 * One line under the row, naming the filters that are on and cannot be read in the row itself.
 * It grows in when the first one is set and collapses when the last is dropped.
 *
 * A filter is dropped from its own chip — the "×" is inside the chip, so it is one control with
 * one accessible name ("Clear Score: 40 and above"), never a second button floating beside it.
 * There is exactly one "Clear all", at the end of the line, and it says how many it clears.
 */
export function AppliedLine({ chips, total, onClearAll, className }: AppliedLineProps) {
  const open = total > 0
  return (
    <div
      className={cn("grid transition-[grid-template-rows,opacity] motion-reduce:transition-none", className)}
      style={{
        gridTemplateRows: open ? "1fr" : "0fr",
        opacity: open ? 1 : 0,
        transitionDuration: `${MOTION.settleMs}ms`,
        transitionTimingFunction: MOTION.ease,
      }}
    >
      <div className="overflow-hidden">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pt-2" inert={!open}>
          {chips.length > 0 && <span className="t-label shrink-0 text-muted-foreground">Filtered by</span>}
          {chips.map((c) => (
            <Button
              key={c.name}
              type="button"
              variant="secondary"
              size="sm"
              className="max-w-[18rem]"
              aria-label={`Clear ${c.name}: ${c.value}`}
              onClick={c.onClear}
              disabled={!c.onClear}
            >
              <span className="truncate">{c.name}: {c.value}</span>
              <X aria-hidden="true" />
            </Button>
          ))}
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
  /** "Search people by name, company or email". Used as the placeholder and the accessible name. */
  placeholder?: string
}

export interface FilterBarProps {
  /** Always first, always the same box. A page that cannot be searched leaves it out. */
  search?: FilterSearch
  /** A search box the page already owns (a ref, a shortcut hint). Takes the same first place. */
  searchNode?: ReactNode
  /**
   * The filters this page's seat sets most, in the seat's order. At most three are kept on the
   * row — the fourth and beyond go into the door with the rest, so the row never becomes two.
   */
  controls?: FilterControl[]
  /** Every other filter, the columns, the density and the saved views. One door holds all of it. */
  behind?: DoorItem[]
  /** The result count at the trailing edge. Give the three parts and it ticks. */
  count?: ResultCountProps | ReactNode
  /** Drops every filter at once. The one "Clear all" in the pattern. */
  onClearAll?: () => void
  /** The door's own id, so it remembers whether it was left open (RULES.md rule 5). */
  doorId?: string
  className?: string
}

const isCountProps = (c: FilterBarProps["count"]): c is ResultCountProps =>
  typeof c === "object" && c !== null && "shown" in c && "total" in c && "noun" in c

/**
 * The filtering pattern. One row, one door, one count, one applied line, one motion.
 *
 * ```tsx
 * <FilterBar
 *   search={{ value: q, onChange: setQ, placeholder: "Search people" }}
 *   controls={[
 *     { name: "Owner", value: owner === "all" ? undefined : owner, onClear: () => setOwner("all"),
 *       node: <Select …/> },
 *   ]}
 *   behind={[{ name: "Score", group: "filters", value: score, onClear: …, node: <Select …/> }]}
 *   count={{ shown: rows.length, total: all.length, noun: "people" }}
 *   onClearAll={clearAll} />
 * ```
 */
export function FilterBar({
  search, searchNode, controls = [], behind = [], count, onClearAll,
  doorId = "index.filters", className,
}: FilterBarProps) {
  const phone = useMedia("(max-width: 639px)")
  const roomy = useMedia("(min-width: 1280px)")
  const [open, setOpen] = useDoorState(`filters.${doorId}`, false)
  const panelId = useId()
  const panel = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  // Whether there is a door is a property of the page, not of the width: a person learns where
  // the filters live and must find them there at 1440 and at 400. A page whose filters all fit the
  // row — three at most, with nothing else behind them — shows them inline at every width and has
  // no door at all; every other page has the door at every width, same place, same label (§2).
  const doorless = behind.length === 0 && controls.length <= 3
  // Three named filters where there is room, two at 1024 where three plus the door plus the count
  // would wrap, none on a phone: there the row is the search and the door, and nothing else (§5).
  const room = doorless ? controls.length : phone ? 0 : roomy ? 3 : 2
  const front = controls.slice(0, room)
  const overflow = controls.slice(room)

  const items: DoorItem[] = useMemo(
    () => [...overflow.map((c) => ({ ...c, group: "filters" as const })), ...behind],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [controls, behind, room],
  )

  const groups = useMemo(() => {
    const order: FilterGroup[] = ["filters", "views", "columns"]
    return order
      .map((g) => ({ group: g, items: items.filter((i) => (i.group ?? "filters") === g) }))
      .filter((g) => g.items.length > 0)
  }, [items])

  const onBehind = items.filter(applied)
  const onFront = front.filter(applied)
  const onCount = onBehind.length + onFront.length

  // Focus goes into the door when it opens and back to the trigger when it closes, and Esc closes
  // it from anywhere inside (RULES.md rule 4: a door works from the keyboard or it does not work).
  const opened = useRef(open)
  useEffect(() => {
    if (open && !opened.current) panel.current?.focus()
    opened.current = open
  }, [open])

  const close = useCallback(() => { setOpen(false); trigger.current?.focus() }, [setOpen])

  const countNode = count === undefined ? null
    : isCountProps(count) ? <ResultCount {...count} className="ml-auto" />
    : <span className="t-label ml-auto shrink-0 tabular-nums text-muted-foreground">{count}</span>

  return (
    <div className={cn("flex w-full min-w-0 flex-col", className)} style={motionVars}>
      {/* The row. Search, the seat's filters, the door, the count — in that order, everywhere.
          It wraps rather than clips: a page that has not come onto the pattern yet and hands the
          row six controls gets a second line, never a control cut off at the card's edge (§5). */}
      <div className="flex w-full min-w-0 flex-wrap items-center gap-2">
        {searchNode ? (
          <div className={cn("min-w-0", phone ? "w-full [&_input]:w-full" : "shrink-0")}>{searchNode}</div>
        ) : search ? (
          <Input
            type="search"
            data-page-search
            aria-label={search.placeholder ?? "Search"}
            placeholder={search.placeholder ?? "Search"}
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            className={cn("h-8", phone ? "w-full" : "w-56 shrink-0")}
          />
        ) : null}
        {front.map((c) => <div key={c.name} className="min-w-0 shrink-0">{c.node}</div>)}
        {items.length > 0 && (
          <Button
            ref={trigger}
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            aria-expanded={open}
            aria-controls={panelId}
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
            <SlidersHorizontal aria-hidden="true" />
            {/* The same words at every width: an icon-only door is the unlabelled door rule 4
                bans, and a door called one thing here and another there is two doors. */}
            <span>{DOOR_LABEL}</span>
            {/* What the numbers are, in words: a bare "8 · 4" is the unlabelled thing rule 4
                bans, and the person cannot tell which number is which. */}
            <Badge variant="outline" className="tabular-nums">
              {onCount > 0 ? `${items.length} inside · ${onCount} on` : `${items.length} inside`}
            </Badge>
          </Button>
        )}
        {countNode}
      </div>

      {/* The applied line: what is on that the row does not already say, and the one "Clear all". */}
      <AppliedLine chips={onBehind} total={onCount} onClearAll={onCount > 0 ? onClearAll : undefined} />

      {/* The door. It opens below the row and pushes the list down; the list stays readable, which
          is the point — the person opened it to watch the count change. Never over the rows. */}
      {items.length > 0 && (
        <div
          className="grid transition-[grid-template-rows,opacity] motion-reduce:transition-none"
          style={{
            gridTemplateRows: open ? "1fr" : "0fr",
            opacity: open ? 1 : 0,
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
              {groups.map((g, i) => (
                <div key={g.group}>
                  {i > 0 && <Separator className="my-3" />}
                  <div className="t-label pb-2 text-muted-foreground">{GROUP_LABEL[g.group]}</div>
                  <div className="flex flex-col flex-wrap gap-2 sm:flex-row sm:items-center">
                    {g.items.map((it) => <div key={it.name} className="min-w-0">{it.node}</div>)}
                  </div>
                </div>
              ))}
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
  /**
   * The filters that are on, in the order they were switched on, so the last one is the one that
   * emptied the list. A page that keeps no order can pass them in any, and the line still names a
   * real filter and offers to clear it.
   */
  applied: FilterControl[]
  onClearAll?: () => void
  className?: string
}

/**
 * What a filtered index says when nothing is left. It names the filter that emptied it and offers
 * to clear that one, because "No results" leaves the person to guess which of four did it.
 */
export function FilterEmpty({ noun, applied: on, onClearAll, className }: FilterEmptyProps) {
  const last = on[on.length - 1]
  if (!last) {
    return <p className={cn("t-body py-8 text-center text-muted-foreground", className)}>No {noun} here yet.</p>
  }
  return (
    <div className={cn("flex flex-col items-center gap-2 py-8 text-center", className)}>
      <p className="t-body text-muted-foreground">
        No {noun} match <span className="font-medium text-foreground">{last.name}: {last.value}</span>.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {last.onClear && (
          <Button type="button" variant="outline" size="sm" onClick={last.onClear}>
            Clear {last.name}
          </Button>
        )}
        {on.length > 1 && onClearAll && (
          <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
            Clear all {on.length} filters
          </Button>
        )}
      </div>
    </div>
  )
}
