// The common version of People: Apollo's People page, drawn from the same rows and the same seed.
//
// Nothing here is invented. Every piece is something `specs/02-people.md` §5 records from Apollo's
// knowledge base (fetched 13 Sep 2026) or from a review quoted in
// `knowledge-base/sources/07-apollo-settings-map.md`:
//
//   - a left sidebar of filters reached by "Show Filters", with a second button "More Filters"
//     ("Search for People", 5 Sep 2026), the glossary's split into "Most Popular Filters" and the
//     rest ("Search Filters Glossary", 11 Sep 2026), each filter a collapsible group with a value
//     picker inside it — the sidebar, the group and the picker are three levels
//   - tabs Total, Net New, Saved above the results ("How to Prospect in Apollo", 5 Sep 2026)
//   - "Save as new search" at the bottom of the sidebar, and the saved-search list opened by
//     clicking the current view name: All searches, Your searches, Favorites, Shared
//     ("Save and Share a Search or Set a Search Alert", 30 Aug 2026)
//   - Bulk Selection at the top of the search results: "Select number of people", "Max people per
//     company", "Select this page", "Select all" ("Search for People")
//   - eleven bulk actions, and two near-identical add-to-list controls ("Create and Use a List",
//     28 Aug 2026), the second of which adds the whole company
//   - "Add column" → "Add existing column", "Create field", an AI research column, and a gear icon
//     for "page view options, including the display order of page columns"
//     ("Manage Saved Records in Apollo", 12 Aug 2026)
//   - the price of a save shown at step 8 of a dialog: "Review the credit usage estimate"
//     ("Save Contacts and Accounts", 9 Sep 2026)
//   - the default view set in Settings › Users and teams › Sharing and defaults
//     ("Manage Search Sharing and Defaults")
//
// It is the same component tree as the disclosed version: the filters, the rows, the counts and the
// actions all come from the page's own model. Only where things live is different.
import { useState, type ReactNode } from "react"
import { ChevronDown, ChevronRight, Settings2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { href } from "@/app/router"
import { ValueList } from "./parts"
import { chipLabel, type Active, type FilterDef } from "./filters"
import type { ColumnDef } from "./columns"
import type { PeopleView } from "./views"

/* ------------------------------------------------------------------------------------- the tabs */

export interface ParodyTabsProps {
  total: number
  netNew: number
  saved: number
  tab: string
  onTab: (t: string) => void
}

/** Total, Net New, Saved. Two of the three hold nothing the person came for; all three are level one. */
export function ParodyTabs({ total, netNew, saved, tab, onTab }: ParodyTabsProps) {
  const tabs: { id: string; item: string; label: string; n: number }[] = [
    { id: "total", item: "people.tab.total", label: "Total", n: total },
    { id: "net-new", item: "people.tab.net-new", label: "Net New", n: netNew },
    { id: "saved", item: "people.tab.saved", label: "Saved", n: saved },
  ]
  return (
    <div
      className="flex items-center gap-4 border-b px-4 lg:px-6"
      data-container="people.parody.tabs"
      data-container-label="the tabs"
      data-print-hide
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          data-item={t.item}
          data-item-label={t.label}
          aria-pressed={tab === t.id}
          onClick={() => onTab(t.id)}
          className={cn(
            "-mb-px border-b-2 px-1 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            tab === t.id ? "border-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label} <span className="tabular-nums opacity-70">{t.n.toLocaleString()}</span>
        </button>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------------------------- the sidebar */

interface SidebarProps {
  /** The 20 the glossary calls "Most Popular Filters", and everything else. */
  popular: FilterDef[]
  rest: FilterDef[]
  active: Active
  values: (f: FilterDef) => string[]
  count: (f: FilterDef, value: string) => number
  onChange: (id: string, chosen: string[]) => void
  open: boolean
  moreOpen: boolean
  onMore: (v: boolean) => void
  onSaveSearch: () => void
}

/** One filter in the sidebar: a collapsible group, and the value picker is a third level inside it. */
function SidebarGroup({ filter, active, values, count, onChange }: {
  filter: FilterDef
  active: string[]
  values: string[]
  count: (value: string) => number
  onChange: (chosen: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const on = active.length > 0
  return (
    <div data-item={filter.id} data-item-label={filter.label} className="border-b border-border/60 last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1.5 px-1 py-1.5 text-left text-xs hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ChevronRight aria-hidden="true" className={cn("size-3 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} />
        <span className={cn("min-w-0 flex-1 truncate", on && "font-medium")}>{on ? chipLabel(filter, active) : filter.label}</span>
      </button>
      <div data-open={open ? "true" : "false"} className={cn("px-2 pb-2", !open && "hidden")}>
        <ValueList filter={filter} values={values} chosen={active} count={count} onChange={onChange} />
      </div>
    </div>
  )
}

export function ParodySidebar({ popular, rest, active, values, count, onChange, open, moreOpen, onMore, onSaveSearch }: SidebarProps) {
  const all = popular.length + rest.length
  return (
    <aside
      aria-label="Filters"
      data-container="people.parody.sidebar"
      data-container-label="the filter sidebar"
      data-open={open ? "true" : "false"}
      data-print-hide
      className={cn("w-60 shrink-0 overflow-y-auto border-r px-3 py-3", !open && "hidden")}
    >
      <section data-container="people.parody.popular" data-container-label="Most Popular Filters" data-open={open ? "true" : "false"}>
        <h4 className="pb-1 t-small font-medium uppercase tracking-wide text-muted-foreground">
          Most Popular Filters ({popular.length})
        </h4>
        {popular.map((f) => (
          <SidebarGroup
            key={f.id}
            filter={f}
            active={active[f.id] ?? []}
            values={values(f)}
            count={(v) => count(f, v)}
            onChange={(c) => onChange(f.id, c)}
          />
        ))}
      </section>

      <button
        type="button"
        data-item="people.filters.more"
        data-item-label="More Filters"
        aria-expanded={moreOpen}
        onClick={() => onMore(!moreOpen)}
        className="mt-3 flex w-full items-center gap-1.5 rounded border px-2 py-1.5 text-xs hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ChevronRight aria-hidden="true" className={cn("size-3 shrink-0 transition-transform", moreOpen && "rotate-90")} />
        More Filters ({rest.length}) · advanced
      </button>

      <section
        data-container="people.parody.more"
        data-container-label="More Filters"
        data-open={open && moreOpen ? "true" : "false"}
        className={cn("pt-2", !moreOpen && "hidden")}
      >
        {rest.map((f) => (
          <SidebarGroup
            key={f.id}
            filter={f}
            active={active[f.id] ?? []}
            values={values(f)}
            count={(v) => count(f, v)}
            onChange={(c) => onChange(f.id, c)}
          />
        ))}
      </section>

      <p className="pt-3 t-small text-muted-foreground">{all} filters in this sidebar.</p>
      <Button
        size="sm"
        variant="outline"
        data-item="people.views.save"
        data-item-label="Save as new search"
        className="mt-1 h-7 w-full px-2 text-xs"
        onClick={onSaveSearch}
      >
        Save as new search
      </Button>
    </aside>
  )
}

/* ------------------------------------------------------------------- the saved-search list door */

/** Clicking the current search name opens All searches, Your searches, Favorites, Shared. */
export function ParodyViewsDoor({ views, viewId, user, onOpen, onDefault, named = true }: {
  views: PeopleView[]
  viewId: string | null
  user: string
  onOpen: (v: PeopleView) => void
  /** Null before rule 5: the default is set in Settings, away from the page. */
  onDefault: ((v: PeopleView) => void) | null
  /** The door reads as the current search until the views themselves are in the row beside it. */
  named?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"all" | "yours" | "favorites" | "shared">("all")
  const current = views.find((v) => v.id === viewId)
  const list = tab === "yours" ? views.filter((v) => v.owner === user)
    : tab === "favorites" ? views.filter((v) => v.alert && v.alert !== "off")
    : tab === "shared" ? views.filter((v) => v.sharedWith === "everyone")
    : views
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-item="people.views.saved"
          data-item-label="the current search"
          aria-expanded={open}
          className="flex items-center gap-1 rounded border px-2.5 py-1 text-xs hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {named ? current?.name ?? "New search" : "All searches"}
          <ChevronDown aria-hidden="true" className="size-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="flex gap-2 border-b pb-2 text-xs">
          {([["all", "All searches"], ["yours", "Your searches"], ["favorites", "Favorites"], ["shared", "Shared"]] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
              className={cn("rounded px-1.5 py-0.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", tab === id ? "bg-muted font-medium" : "text-muted-foreground")}
            >
              {label}
            </button>
          ))}
        </div>
        <ul className="mt-2 max-h-64 space-y-0.5 overflow-y-auto p-0">
          {list.map((v) => (
            <li key={v.id} className="list-none">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                onClick={() => { onOpen(v); setOpen(false) }}
              >
                <span className="min-w-0 flex-1 truncate">{v.name}</span>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="list-none px-1.5 py-1 text-sm text-muted-foreground">Nothing here.</li>}
        </ul>
        <p className="mt-2 border-t pt-2 text-xs text-muted-foreground">
          {onDefault && current ? (
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => { onDefault(current); setOpen(false) }}>
              Set as my default
            </Button>
          ) : (
            <>Your default view is set in <a className="underline" href={href("/ollopa/settings")}>Settings › Users and teams › Sharing and defaults</a>.</>
          )}
        </p>
      </PopoverContent>
    </Popover>
  )
}

/* ------------------------------------------------------------- Bulk Selection, above the results */

/**
 * The strip that is simply always above the results, selection or no selection, holding the four
 * Bulk Selection controls and the actions they feed. "Select all" and "Max people per company" are
 * on opposite sides of the count they change; none of the action buttons says what it will act on.
 */
export function BulkSelection({ controls, children }: { controls: ReactNode; children: ReactNode }) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 border-y bg-card px-4 py-2 lg:px-6"
      data-container="people.parody.results-bar"
      data-container-label="the results toolbar"
      data-print-hide
    >
      {controls}
      <span className="flex flex-wrap items-center gap-1.5" data-container="people.parody.actions" data-container-label="the actions strip">
        {children}
      </span>
    </div>
  )
}

/** The four: "Select number of people", "Max people per company", "Select this page", "Select all". */
export function ParodySelection({ onSelectPage, onSelectAll, onNumber, onPerCompany, perCompany }: {
  onSelectPage: () => void
  onSelectAll: () => void
  onNumber: (n: number) => void
  onPerCompany: (n: number | null) => void
  perCompany: number | null
}) {
  return (
    <>
      <span className="text-xs font-medium text-muted-foreground">Bulk Selection</span>
      <Button
        size="sm" variant="outline" className="h-7 px-2 text-xs"
        data-item="people.bulk.number" data-item-label="Select number of people"
        onClick={() => onNumber(25)}
      >
        Select number of people
      </Button>
      <Button
        size="sm" variant="outline" className="h-7 px-2 text-xs"
        data-item="people.bulk.limit-per-company" data-item-label="Max people per company"
        onClick={() => onPerCompany(perCompany ? null : 3)}
      >
        Max people per company{perCompany ? `: ${perCompany}` : ""}
      </Button>
      <Button
        size="sm" variant="outline" className="h-7 px-2 text-xs"
        data-item="people.bulk.select-page" data-item-label="Select this page"
        onClick={onSelectPage}
      >
        Select this page
      </Button>
      <Button
        size="sm" variant="outline" className="h-7 px-2 text-xs"
        data-item="people.bulk.select" data-item-label="Select all"
        onClick={onSelectAll}
      >
        Select all
      </Button>
    </>
  )
}

/* --------------------------------------------------------------------------- columns and the gear */

/** "Add column" beside a gear for page view options: picking a column, creating a field and running
 *  an AI research column all sit behind the same two controls. */
export function ParodyColumns({ all, shownIds, onChange, density, onDensity, showDensity }: {
  all: ColumnDef[]
  shownIds: string[]
  onChange: (ids: string[]) => void
  density: "Comfortable" | "Compact"
  onDensity: (d: "Comfortable" | "Compact") => void
  /** Rule 3 puts the one legitimate user-controlled mode on the page. */
  showDensity: boolean
}) {
  const [gear, setGear] = useState(false)
  return (
    <span className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-item="people.columns.choose"
            data-item-label="Add column"
            className="flex items-center gap-1 rounded border px-2.5 py-1 text-xs hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Plus aria-hidden="true" className="size-3" />
            Add column
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56" data-container="people.columns.menu" data-container-label="Add column">
          <DropdownMenuItem onSelect={() => setGear(true)}>Add existing column</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setGear(true)}>Create field</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setGear(true)}>Research with AI</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover open={gear} onOpenChange={setGear}>
        <PopoverTrigger asChild>
          <Button
            size="icon" variant="ghost" className="size-7"
            aria-label="Page view options"
            data-item="people.columns.order" data-item-label="Page view options"
          >
            <Settings2 aria-hidden="true" className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72" data-container="people.columns.popover" data-container-label="Page view options">
          <h4 className="pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Page view options</h4>
          <ul className="max-h-64 space-y-0.5 overflow-y-auto p-0">
            {all.map((c) => {
              const on = shownIds.includes(c.id)
              return (
                <li key={c.id} className="list-none">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    className="flex w-full items-center gap-2 rounded px-1.5 py-1 text-left text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    onClick={() => onChange(on ? shownIds.filter((x) => x !== c.id) : [...shownIds, c.id])}
                  >
                    <span aria-hidden="true" className={cn("size-3.5 shrink-0 rounded-sm border", on && "border-foreground bg-foreground")} />
                    <span className="min-w-0 truncate">{c.header}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          {showDensity && (
            <div className="mt-2 flex items-center gap-1.5 border-t pt-2 text-xs" data-item="people.density" data-item-label="Density">
              <span className="text-muted-foreground">Density</span>
              {(["Comfortable", "Compact"] as const).map((v) => (
                <Button key={v} size="sm" variant={density === v ? "secondary" : "ghost"} aria-pressed={density === v} className="h-7 px-2 text-xs" onClick={() => onDensity(v)}>{v}</Button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </span>
  )
}

/* ----------------------------------------------------------------- the price, at step 8 of a flow */

/**
 * "Save Contacts and Accounts" (9 Sep 2026) is an eight-step flow whose eighth step is "Review the
 * credit usage estimate". Nothing before it says what the action costs.
 */
export function CreditsDialog({ open, onOpenChange, count, cost, balance, onConfirm }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  count: number
  cost: number
  balance: number
  onConfirm: () => void
}) {
  const [step, setStep] = useState(1)
  const steps = [
    "Check the prospects you want to save.",
    "Click Save.",
    "Choose whether to save as contacts or as accounts.",
    "Choose the lists to add them to.",
    "Choose the owner.",
    "Choose the stage.",
    "Choose how duplicates are handled.",
    "Review the credit usage estimate.",
  ]
  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setStep(1) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save {count.toLocaleString()} people</DialogTitle>
          <DialogDescription>Step {step} of {steps.length}</DialogDescription>
        </DialogHeader>
        <ol className="m-0 list-none space-y-1 p-0 text-sm">
          {steps.map((s, i) => (
            <li key={s} className={cn("flex gap-2", i + 1 === step ? "font-medium" : "text-muted-foreground")}>
              <span className="tabular-nums">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        {step === steps.length && (
          <p className="rounded-md border p-2.5 text-sm">
            Estimated credit usage: <span className="tabular-nums font-medium">{cost.toLocaleString()}</span> credits.
            Balance after: <span className="tabular-nums">{(balance - cost).toLocaleString()}</span>.
          </p>
        )}
        <DialogFooter>
          {step > 1 && <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < steps.length
            ? <Button size="sm" onClick={() => setStep(step + 1)}>Next</Button>
            : <Button size="sm" onClick={() => { onConfirm(); onOpenChange(false); setStep(1) }}>Save</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
