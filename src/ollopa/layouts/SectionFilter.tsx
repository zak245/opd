// The filter on a section inside a record — a contact's activity, a deal's timeline.
//
// Above `md` it is an inline `TabsList`, which is what the eye has learned. Below it the strip has
// nowhere to go: six words in a card that is 350 px wide clip at "Meetin…". LAYOUTS.md §5 says a
// thing is never clipped, only shaped differently, so on a phone the same choice is one shadcn
// `Select` naming the filter that is on.
//
// One part, so every section filter in every record behaves the same way.
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { usePhone } from "./parts"

export interface SectionFilterOption {
  key: string
  label: string
  /** Printed beside the label: how many things this filter would show. */
  count?: number
}

export interface SectionFilterProps {
  /** Names the control for a screen reader: "Activity filters". */
  label: string
  options: SectionFilterOption[]
  value: string
  onChange: (key: string) => void
  className?: string
}

/**
 * ```tsx
 * <SectionFilter label="Activity filters" options={FILTERS} value={filter} onChange={setFilter} />
 * ```
 */
export function SectionFilter({ label, options, value, onChange, className }: SectionFilterProps) {
  const phone = usePhone()
  const text = (o: SectionFilterOption) => (o.count === undefined ? o.label : `${o.label} (${o.count})`)

  if (phone) {
    return (
      <Select value={value} onValueChange={(v) => { if (v) onChange(v) }}>
        <SelectTrigger size="sm" aria-label={label} className={cn("w-auto min-w-40", className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {options.map((o) => <SelectItem key={o.key} value={o.key}>{text(o)}</SelectItem>)}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Tabs value={value} onValueChange={(v) => { if (v) onChange(v) }}>
      <TabsList aria-label={label} className={cn("w-fit", className)}>
        {options.map((o) => <TabsTrigger key={o.key} value={o.key}>{text(o)}</TabsTrigger>)}
      </TabsList>
    </Tabs>
  )
}
