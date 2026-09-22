// The quick look: level one of a record, opened from a table row with the table still in view.
//
// It is the top of the record page cut short — the same fields, in the same order, with the same
// labels — and it is flat: no doors, no sections, nothing that opens. Read-only except for the one
// field the glance exists for, which is why the drawer is opened at all (a deal's stage on the board,
// an account's next step on the accounts table). Whose field that is depends on who is looking: the
// owner moves the deal, anyone else gets the comment composer, because the board already refuses a
// move they do not own. One editable field either way; the rule is "one", not "the same one for all".
//
// The test: remove the drawer and you lose only speed. If removing it would lose a feature, it has
// become a second version of the record, which the pattern forbids.
import { useEffect, useRef, useState } from "react"
import { Kbd } from "@/components/ui/kbd"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { FlatProvider } from "../ui/Door"
import { FamilyIcon } from "../ui/Identity"
import { familyOf } from "../identity"
import { Actions } from "../ui/Actions"
import { type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

export interface QuickLookField {
  label: string
  value: ReactNode
}

export interface QuickLookEditable {
  label: string
  value: string
  onChange: (value: string) => void
  /** A picklist where the field is one (stage). Free text when absent. */
  options?: string[]
  /** A composer rather than a field: the non-owner's comment. */
  multiline?: boolean
}

export interface QuickLookProps {
  /** The family of the record this is level one of: its top bar and its icon (DESIGN.md §5). */
  family?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fields: QuickLookField[]
  /** At most one. It replaces the field with the same label, or is added at the end when it is a composer. */
  editable?: QuickLookEditable
  /** "Open" goes to the record page: the drawer carries no deep link, the page does. */
  onOpen: () => void
  /**
   * Where "Open" goes. A destination is a link and not a button (DESIGN.md §1), so given this the
   * footer draws a real `<a>` — it opens in a new tab and it copies — while a plain click still runs
   * `onOpen`, which is what keeps the trail. Without it the control stays a button.
   */
  openHref?: string
  /**
   * When the drawer was opened from a list — a board column, a table's rows — where this record sits
   * in it, so `[` and `]` walk that list without closing. The same convention as the pane's footer,
   * because the two are the same move at two depths and should not need learning twice.
   */
  list?: { index: number; total: number; onStep: (by: 1 | -1) => void }
}

export function QuickLook({ family, open, onOpenChange, title, fields, editable, onOpen, openHref, list }: QuickLookProps) {
  const [draft, setDraft] = useState(editable?.value ?? "")
  const first = useRef<HTMLButtonElement>(null)
  useEffect(() => { setDraft(editable?.value ?? "") }, [editable?.value, open])

  // `[` and `]` walk the list from anywhere in the drawer, and never while someone is typing in it.
  const step = list?.onStep
  const at = list?.index ?? 0
  const of_ = list?.total ?? 0
  useEffect(() => {
    if (!open || !step) return
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return
      if (e.key === "[" && at > 0) { e.preventDefault(); step(-1) }
      if (e.key === "]" && at < of_ - 1) { e.preventDefault(); step(1) }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, step, at, of_])

  const editableInline = editable && fields.some((f) => f.label === editable.label)

  const editor = editable && (
    <div className="grid gap-1.5">
      <Label htmlFor="quicklook-edit" className="t-label text-muted-foreground">{editable.label}</Label>
      {editable.options ? (
        <Select value={draft} onValueChange={(v) => { setDraft(v); editable.onChange(v) }}>
          <SelectTrigger id="quicklook-edit" className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>{editable.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
      ) : editable.multiline ? (
        <div className="grid gap-2">
          <Textarea id="quicklook-edit" rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Say it to the owner" />
          <Button size="sm" className="justify-self-start" disabled={!draft.trim()} onClick={() => { editable.onChange(draft); setDraft("") }}>Comment</Button>
        </div>
      ) : (
        <Input id="quicklook-edit" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => editable.onChange(draft)} />
      )}
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={cn("bg-popover", "w-full gap-0 p-0 sm:max-w-sm")}>
        {/* A thin bar in the record's family hue, so the drawer says what it is holding before it is
            read — the same mark the pane carries (DESIGN.md §5). */}
        <div aria-hidden="true" className="h-[3px] shrink-0" style={{ backgroundColor: familyOf(family).fill }} />
        <SheetHeader className="px-5 py-4">
          <SheetTitle className="t-section inline-flex items-center gap-2">
            <FamilyIcon of={family} size="header" />
            {title}
          </SheetTitle>
          <SheetDescription className="sr-only">A glance at this record. Open it for everything else.</SheetDescription>
        </SheetHeader>
        <Separator />
        {/* Flat by construction: anything openable rendered in here renders in place instead. */}
        <FlatProvider value={true}>
          <dl className="t-body min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {fields.map((f) => (
              editableInline && editable && f.label === editable.label ? (
                <div key={f.label}>{editor}</div>
              ) : (
                <div key={f.label} className="grid grid-cols-[9rem_1fr] items-baseline gap-3">
                  <dt className="t-label text-muted-foreground">{f.label}</dt>
                  <dd className="min-w-0">{f.value}</dd>
                </div>
              )
            ))}
            {editable && !editableInline && <><Separator className="my-3" />{editor}</>}
          </dl>
        </FlatProvider>
        <SheetFooter className="gap-2 px-5 py-3">
          {list && list.total > 1 && (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" disabled={at === 0} onClick={() => list.onStep(-1)}>
                Previous
                <Kbd className="ml-1">[</Kbd>
              </Button>
              <span className="t-small tabular-nums text-muted-foreground">{at + 1} of {list.total}</span>
              <Button size="sm" variant="ghost" className="ml-auto" disabled={at >= list.total - 1} onClick={() => list.onStep(1)}>
                Next
                <Kbd className="ml-1">]</Kbd>
              </Button>
            </div>
          )}
          {openHref
            ? <Actions surface="dialog" items={[{ label: "Open", kind: "link", href: openHref, onClick: onOpen }]} />
            : <Button ref={first} className="w-full" onClick={onOpen}>Open</Button>}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
