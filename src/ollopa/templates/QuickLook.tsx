// The quick look: level one of a record, read without leaving the list.
//
// LAYOUTS.md §3: "the quick look is the beside pane, not a second mechanism". It used to be a
// modal Sheet over the page — a second overlay doing the pane's job, with the page behind it
// blocked while a person compared two rows. It is now the pane, non-modal, beside the page.
//
// The component keeps the props every call site passes, so no page had to change: it renders
// nothing itself and instead puts its content in the pane. Closing the pane closes it.
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Actions } from "../ui/Actions"
import { besideTarget, closeBeside, openBeside, registerBeside, setQuickLookStepper, useBeside, type BesideComponent } from "../beside"

export interface QuickLookField {
  label: string
  value: ReactNode
  /** A second line under the value: where it came from, when it was last touched. */
  note?: ReactNode
}

export interface QuickLookEditable {
  label: string
  value: string
  /** One of a fixed set. Without these the field is free text and the look draws a composer. */
  options?: string[]
  /** Free text over more than one line: a note, a next step. */
  multiline?: boolean
  onChange: (value: string) => void
}

export interface QuickLookProps {
  /** The family of the record this is level one of: its icon and its ink (DESIGN.md §5). */
  family?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fields: QuickLookField[]
  /** At most one. It replaces the field with the same label, or is added at the end. */
  editable?: QuickLookEditable
  /** "Open the page" goes to the record: the look carries no deep link, the page does. */
  onOpen: () => void
  openHref?: string
  /** Where this record sits in the list it was opened from, so `[` and `]` walk it. */
  list?: { index: number; total: number; onStep: (by: 1 | -1) => void }
}

// ------------------------------------------------------------------ what the pane is showing

type Look = Omit<QuickLookProps, "open" | "onOpenChange">

let look: Look | null = null
const listeners = new Set<() => void>()
const announce = () => listeners.forEach((l) => l())

function useLook() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l) } },
    () => look,
    () => look,
  )
}

/** The id the pane is opened under. One at a time, so one id is enough. */
const ID = "current"

/**
 * Put a quick look in the pane from anywhere, without rendering a component for it. The pane's own
 * frame draws the header, the previous and next, and the close.
 */
export function openQuickLook(next: Look, opener?: HTMLElement | null) {
  look = next
  announce()
  openBeside({
    kind: "quick-look",
    id: ID,
    opener: opener ?? (document.activeElement as HTMLElement | null),
    list: next.list ? { ids: Array.from({ length: next.list.total }, (_, i) => String(i)), index: next.list.index } : undefined,
  })
}

/**
 * The component form, kept so that every page that already renders `<QuickLook open … />` keeps
 * working. It draws nothing: it puts its props in the pane while `open` is true.
 */
export function QuickLook({ open, onOpenChange, ...rest }: QuickLookProps) {
  const was = useRef(false)
  // The pane is the truth about whether the look is open, so the opener follows it rather than the
  // other way round. Without this a page would have two ideas of "open" and they would drift.
  const pane = useBeside()
  // What the pane is showing, in one string. The look's content is refreshed on every render of the
  // opener — that is how an edit made in the pane reaches it — but the pane is only *told* when
  // something it draws has actually changed, or telling it would re-render the opener, which would
  // tell it again.
  const sig = `${rest.title}|${rest.fields.length}|${rest.editable?.value ?? ""}|${rest.list?.index ?? ""}`
  const lastSig = useRef("")
  useEffect(() => {
    if (open) {
      if (!was.current) {
        openQuickLook(rest)
        was.current = true
      } else {
        look = rest
        if (lastSig.current !== sig) announce()
      }
      lastSig.current = sig
    } else if (was.current) {
      was.current = false
      look = null
      announce()
      closeBeside()
    }
  })
  useEffect(() => () => { if (was.current) { look = null; announce(); closeBeside() } }, [])
  useEffect(() => {
    // Closed from inside the pane — Escape, the close, or a related object taking its place. The
    // store is read live rather than from `pane`: on the render that opens the look, `pane` is
    // still the null this component saw before its own effect ran, and acting on it would close
    // the look in the same commit that opened it.
    const now = besideTarget()
    if (open && was.current && (!now || now.kind !== "quick-look")) {
      look = null
      announce()
      onOpenChange(false)
    }
  }, [open, pane, onOpenChange])
  return null
}

// ------------------------------------------------------------------ the pane body

/**
 * What the pane draws for a quick look. Registered as the `quick-look` kind, so the pane frame —
 * its header, its `[` and `]`, its close and its focus return — is the same frame every other pane
 * content gets.
 */
export const QuickLookBeside: BesideComponent = () => {
  const shown = useLook()
  if (!shown) return null
  const editable = shown.editable
  const fields = shown.fields.filter((f) => f.label !== editable?.label)
  return (
    <div className="grid gap-3">
      <dl className="grid grid-cols-[minmax(6rem,auto)_minmax(0,1fr)] gap-x-4 gap-y-2">
        {fields.map((f) => (
          <div key={f.label} className="col-span-2 grid grid-cols-subgrid items-baseline">
            <dt className="t-label text-muted-foreground">{f.label}</dt>
            <dd className="t-body min-w-0">
              {f.value}
              {f.note && <div className="t-small text-muted-foreground">{f.note}</div>}
            </dd>
          </div>
        ))}
      </dl>
      {editable && (
        <>
          <Separator />
          <div className="grid gap-1.5">
            <span className="t-label text-muted-foreground" id="ql-edit">{editable.label}</span>
            {editable.options ? (
              <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="ql-edit">
                {editable.options.map((o) => (
                  <Button
                    key={o}
                    size="sm"
                    variant={o === editable.value ? "secondary" : "outline"}
                    aria-pressed={o === editable.value}
                    onClick={() => editable.onChange(o)}
                  >
                    {o}
                  </Button>
                ))}
              </div>
            ) : editable.multiline ? (
              <Textarea aria-labelledby="ql-edit" defaultValue={editable.value}
                        onBlur={(e) => editable.onChange(e.target.value)} />
            ) : (
              <Input aria-labelledby="ql-edit" defaultValue={editable.value}
                     onBlur={(e) => editable.onChange(e.target.value)} />
            )}
          </div>
        </>
      )}
    </div>
  )
}

QuickLookBeside.head = () => {
  if (!look) return null
  return { name: look.title, context: "", route: look.openHref ?? "" }
}

/** The family of the record the look is of, so the pane's icon and ink are the record's own. */
export function quickLookFamily(): string | undefined {
  return look?.family
}

/** The pane's "Open the page" runs the look's own `onOpen`, which is what keeps the trail. */
export function quickLookOpen() {
  look?.onOpen()
}

/** Used by the pane frame's `[` and `]` when a look was opened from a list. */
export function quickLookStep(by: 1 | -1) {
  look?.list?.onStep(by)
}
setQuickLookStepper(quickLookStep)
registerBeside("quick-look", QuickLookBeside)

/** Kept for the pages that import it to draw their own "Open the page" act. */
export function QuickLookOpenAct({ label = "Open the page", onOpen }: { label?: string; onOpen: () => void }) {
  return <Actions surface="pane" items={[{ kind: "secondary", label, onClick: onOpen }]} />
}
