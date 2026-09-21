// Every control on a surface, drawn by its kind and not by whoever wrote the page.
//
// This encodes DESIGN.md sections 1 and 2, which is why a page never picks a Button variant by
// hand. What it decides, so a builder cannot:
//
//   · four kinds, and the kind decides the drawing — primary filled, secondary outline,
//     destructive text in the destructive colour, link a real `<a>`;
//   · one primary per surface; a second one is drawn as a secondary and said so in development;
//   · destructive is never filled, sits last, after a gap, at low emphasis;
//   · emphasis by fill, never by size: every control on a surface is the same size;
//   · full width only on a phone;
//   · a line beside a control only where the act spends something or cannot be undone;
//   · an act that cannot be undone goes through a confirmation whose affirmative carries the verb
//     and whose consequence sits above it — and the pane refuses such an act outright, because it
//     belongs on the record page.
//
// What it cannot decide, and the page still must: whether a seat may act at all. A seat that cannot
// act gets no control and one sentence naming who can (RULES.md rule 4) — so the page leaves the
// item out of the list rather than passing it here disabled.
import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export type ActionKind = "primary" | "secondary" | "destructive" | "link"

export interface Action {
  label: string
  kind: ActionKind
  onClick?: () => void
  /** A destination. `kind: "link"` renders a real `<a>`; with `onClick` too, the click is the page's. */
  href?: string
  /** What the act spends: "8 credits", "1 email". The only thing that earns a line beside a control. */
  cost?: string
  /** The rest of that one line: "Charged once". Allowed only beside a cost or an irreversible act. */
  consequence?: string
  /** An act that cannot be undone. Opens the confirmation; the affirmative carries the verb. */
  irreversible?: { title: string; consequence: string; confirmLabel: string }
  /** Object state the person can change — nothing chosen, a field empty. Never a seat or a permission. */
  disabledBecause?: string
  /** The shortcut this control answers to, printed on it. */
  keys?: string
}

export type Surface = "page" | "pane" | "dialog" | "card"
export type Layout = "row" | "stack" | "menu"

/** One size per surface, so emphasis can only come from fill. DESIGN.md §1. */
const SIZE: Record<Surface, "sm" | "default"> = { page: "default", pane: "sm", dialog: "default", card: "sm" }

/** A pane carries the three acts the chain runs most, and nothing that cannot be undone. */
const PANE_MAX = 3

const said = new Set<string>()
function warn(key: string, message: string) {
  if (!import.meta.env.DEV || said.has(key)) return
  said.add(key)
  console.warn(`[ollopa/Actions] ${message}`)
}

/** primary, then secondary, then destinations, then the destructive act on its own at the end. */
const RANK: Record<ActionKind, number> = { primary: 0, secondary: 1, link: 2, destructive: 3 }

/**
 * Read the list the way the rules say it must be drawn, and say in development where it broke one.
 * Pure, so the same answer can be tested without rendering anything.
 */
export function readActions(items: Action[], surface: Surface): Action[] {
  let primaries = 0
  const kept: Action[] = []

  for (const a of items) {
    let kind = a.kind

    if (kind === "primary") {
      primaries++
      if (primaries > 1) {
        warn(`primary:${surface}:${a.label}`,
          `"${a.label}" is a second primary on one ${surface}. One filled control per surface (DESIGN.md §1): ` +
          "two comparable acts are both secondary. Drawing it as a secondary.")
        kind = "secondary"
      }
    }

    if (a.irreversible && surface === "pane") {
      warn(`irreversible:${a.label}`,
        `"${a.label}" cannot be undone, so it does not belong in a pane (DESIGN.md §1). Leave it on the ` +
        'record page and let the pane offer "Open the page". Not drawing it.')
      continue
    }

    if (a.consequence && !a.cost && !a.irreversible) {
      warn(`line:${a.label}`,
        `"${a.label}" passes a line beside it but spends nothing and can be undone (DESIGN.md §2). ` +
        "A reversible, free act carries no sentence. Dropping the line.")
    }

    if (a.irreversible && a.kind === "primary") {
      warn(`destructive-primary:${a.label}`,
        `"${a.label}" cannot be undone and is marked primary. A destructive act is never the filled ` +
        "control on a surface (DESIGN.md §1); it is the affirmative inside its own confirmation.")
    }

    kept.push(kind === a.kind ? a : { ...a, kind })
  }

  if (surface === "pane" && kept.length > PANE_MAX) {
    warn(`count:${kept.map((a) => a.label).join(",")}`,
      `A pane carries at most ${PANE_MAX} acts (DESIGN.md §1) and this one has ${kept.length}: ` +
      `${kept.map((a) => a.label).join(", ")}. Gate them by the usage model the way the fields are.`)
  }

  return [...kept].sort((a, b) => RANK[a.kind] - RANK[b.kind])
}

/** The one line beside a control, when the rules allow one at all. */
function lineFor(a: Action): string | null {
  if (!a.cost && !a.irreversible) return null
  const parts = [a.cost, a.consequence].filter(Boolean)
  return parts.length ? parts.join(" · ") : null
}

/**
 * The shared confirmation for an act that cannot be undone. The consequence sits above the
 * affirmative, and the affirmative carries the verb — never "OK" (DESIGN.md §2, memo 26 part B).
 * Destructive styling lives in here and nowhere else.
 */
export function Confirm({ open, onOpenChange, title, consequence, confirmLabel, onConfirm }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  consequence: ReactNode
  confirmLabel: string
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-foreground">{consequence}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { onOpenChange(false); onConfirm() }}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Shortcut({ keys }: { keys?: string }) {
  if (!keys) return null
  return <kbd className="ml-1.5 rounded border px-1 font-mono text-[10px] text-muted-foreground">{keys}</kbd>
}

function One({ action, surface, layout, onIrreversible }: {
  action: Action
  surface: Surface
  layout: Layout
  onIrreversible: (a: Action) => void
}) {
  const size = SIZE[surface]
  const line = lineFor(action)
  const disabled = !!action.disabledBecause
  // Full width only on a phone: at every other width a control is as wide as its label.
  const width = layout === "stack" ? "max-sm:w-full justify-start" : ""

  const control = action.kind === "link" && action.href ? (
    // A destination is a real link: it opens in a new tab, it copies, it reads as a link. The page's
    // own click handler still runs, which is how a link inside the product keeps the trail.
    <a
      href={action.href}
      onClick={action.onClick ? (e) => { if (!e.metaKey && !e.ctrlKey && e.button === 0) { e.preventDefault(); action.onClick!() } } : undefined}
      // Always underlined, not only on hover: this product's primary colour is its text colour, so
      // colour alone would leave a link indistinguishable from the words around it.
      className={cn(
        "font-medium underline decoration-muted-foreground underline-offset-4 hover:decoration-current",
        size === "sm" ? "text-xs" : "text-sm",
      )}
    >
      {action.label}
      <Shortcut keys={action.keys} />
    </a>
  ) : (
    <Button
      size={size}
      variant={action.kind === "primary" ? "default" : action.kind === "destructive" ? "ghost" : "outline"}
      className={cn(width, action.kind === "destructive" && "text-destructive hover:text-destructive")}
      disabled={disabled}
      aria-describedby={undefined}
      onClick={() => {
        if (disabled) return
        if (action.irreversible) { onIrreversible(action); return }
        action.onClick?.()
      }}
    >
      {action.label}
      <Shortcut keys={action.keys} />
    </Button>
  )

  // The reason a control is off sits beside it; so does the one line an act earns by spending.
  const beside = action.disabledBecause ?? line
  if (!beside) return control
  return (
    <div className={cn(layout === "stack" ? "w-full" : undefined)}>
      {control}
      <p className="mt-1 text-xs text-muted-foreground">{beside}</p>
    </div>
  )
}

export function Actions({ items, layout = "row", surface = "page", className }: {
  items: Action[]
  layout?: Layout
  surface?: Surface
  className?: string
}) {
  const [confirming, setConfirming] = useState<Action | null>(null)
  const list = readActions(items, surface)
  if (list.length === 0) return null

  const irreversible = (a: Action) => setConfirming(a)

  const dialog = confirming?.irreversible && (
    <Confirm
      open
      onOpenChange={(o) => { if (!o) setConfirming(null) }}
      title={confirming.irreversible.title}
      consequence={confirming.irreversible.consequence}
      confirmLabel={confirming.irreversible.confirmLabel}
      onConfirm={() => { setConfirming(null); confirming.onClick?.() }}
    />
  )

  if (layout === "menu") {
    const doing = list.filter((a) => a.kind !== "destructive")
    const ending = list.filter((a) => a.kind === "destructive")
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size={SIZE[surface] === "sm" ? "icon-sm" : "icon"} aria-label="More actions">
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {doing.map((a) => (
              <DropdownMenuItem key={a.label} disabled={!!a.disabledBecause}
                onSelect={() => (a.irreversible ? irreversible(a) : a.onClick?.())}>
                {a.label}
                {a.cost && <span className="ml-auto pl-4 text-xs text-muted-foreground">{a.cost}</span>}
              </DropdownMenuItem>
            ))}
            {ending.length > 0 && doing.length > 0 && <DropdownMenuSeparator />}
            {ending.map((a) => (
              <DropdownMenuItem key={a.label} variant="destructive" disabled={!!a.disabledBecause}
                onSelect={() => (a.irreversible ? irreversible(a) : a.onClick?.())}>
                {a.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {dialog}
      </>
    )
  }

  const ending = list.filter((a) => a.kind === "destructive")
  const doing = list.filter((a) => a.kind !== "destructive")

  return (
    <>
      <div className={cn(
        layout === "stack" ? "flex flex-col items-start gap-3" : "flex flex-wrap items-start gap-2",
        className,
      )}>
        {doing.map((a) => <One key={a.label} action={a} surface={surface} layout={layout} onIrreversible={irreversible} />)}
        {/* The gap. A destructive act is never next to a benign one (memo 26, part B). */}
        {ending.length > 0 && (
          <div className={cn(layout === "stack" ? "mt-2 w-full border-t pt-3" : "ml-4 border-l pl-4")}>
            <div className={cn(layout === "stack" ? "flex flex-col items-start gap-3" : "flex flex-wrap items-start gap-2")}>
              {ending.map((a) => <One key={a.label} action={a} surface={surface} layout={layout} onIrreversible={irreversible} />)}
            </div>
          </div>
        )}
      </div>
      {dialog}
    </>
  )
}
