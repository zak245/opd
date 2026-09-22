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
import { Loader2, MoreHorizontal } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

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
  /**
   * The act is running. The label stays where it is, a spinner joins it at the leading edge without
   * changing the width, and the control takes no second press (DESIGN.md §4).
   */
  loading?: boolean
  /** The usage-model id this control answers to, so a converted page keeps the ids it is pointed at by. */
  dataItem?: string
  dataItemLabel?: string
  /** The element's own id, where something else on the page has to point at it. */
  id?: string
  /** Where the label alone does not say what this control acts on. */
  "aria-label"?: string
  /**
   * Anything else the control must carry to be found later — `data-row-focus` for the row a pane
   * came from, a `data-testid`, a `data-print-hide`. `dataItem` and `dataItemLabel` are the two
   * every page needs, spelled out; this is for the rest. It is why a row's hover strip, its menu
   * and a bulk bar use `Actions` rather than drawing their own buttons.
   */
  attrs?: Record<string, string>
}

export type Surface = "page" | "pane" | "dialog" | "card" | "row" | "bulk" | "queue" | "form"
export type Layout = "row" | "stack" | "menu"

/**
 * One size per surface, and never the extra-small one for an act (DESIGN.md §4). Emphasis can only
 * come from fill, so the kind never touches this.
 */
const SIZE: Record<Surface, "sm" | "default"> = {
  page: "default", dialog: "default",
  pane: "sm", card: "sm", row: "sm", bulk: "sm", queue: "sm", form: "sm",
}

/**
 * Where a surface's acts sit, and which way they run. One place per surface type, the same on every
 * page and for every seat, because what the eye learns is position (DESIGN.md §4, memo 21).
 */
const PLACE: Record<Surface, { layout: Layout; align: "leading" | "trailing" }> = {
  page: { layout: "row", align: "trailing" },      // beside the title, primary leftmost in the row
  dialog: { layout: "row", align: "trailing" },    // the affirmative at the trailing edge
  pane: { layout: "stack", align: "leading" },     // a stack under the fields
  card: { layout: "row", align: "trailing" },
  row: { layout: "row", align: "trailing" },
  bulk: { layout: "row", align: "leading" },
  queue: { layout: "row", align: "leading" },
  form: { layout: "row", align: "leading" },       // the Save bar, Save at the leading edge
}

/** Any utility that paints. Colour has one meaning each, and a page may not borrow one. */
const COLOURED = /(^|[\s:])(bg|text|border|ring|decoration|fill|stroke|from|via|to|outline)-(?!\[)(?!(inherit|current|transparent)\b)[a-z]/

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

/**
 * The printed shortcut. On a filled primary the muted ink is invisible — 1.10:1 on the indigo fill —
 * so there it takes the label's own colour at 80%, measured at 4.16:1 on that fill (the pair is in
 * `scripts/contrast.mjs`). Everywhere else it stays quiet, as it should.
 */
function Shortcut({ keys, kind }: { keys?: string; kind?: ActionKind }) {
  if (!keys) return null
  return (
    <kbd className={cn(
      "ml-1.5 rounded border px-1 font-mono t-small",
      kind === "primary" ? "border-current/40 text-primary-foreground/80" : "text-muted-foreground",
    )}>{keys}</kbd>
  )
}

function One({ action, surface, layout, onIrreversible }: {
  action: Action
  surface: Surface
  layout: Layout
  onIrreversible: (a: Action) => void
}) {
  const size = SIZE[surface]
  const line = lineFor(action)
  const busy = !!action.loading
  const disabled = !!action.disabledBecause || busy
  // Full width only on a phone: at every other width a control is as wide as its label.
  const width = layout === "stack" ? "max-sm:w-full justify-start" : ""
  // The spinner sits in the padding, absolutely, so the label does not move and the control does
  // not change width when the act starts running.
  const spinner = busy ? (
    <Loader2 className="absolute left-2 size-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
  ) : null

  const control = action.kind === "link" && action.href ? (
    // A destination is a real link: it opens in a new tab, it copies, it reads as a link. The page's
    // own click handler still runs, which is how a link inside the product keeps the trail.
    <a
      href={action.href}
      id={action.id}
      aria-label={action["aria-label"]}
      data-item={action.dataItem}
      data-item-label={action.dataItemLabel}
      {...action.attrs}
      onClick={action.onClick ? (e) => { if (!e.metaKey && !e.ctrlKey && e.button === 0) { e.preventDefault(); action.onClick!() } } : undefined}
      // Always underlined, not only on hover: this product's primary colour is its text colour, so
      // colour alone would leave a link indistinguishable from the words around it.
      className={cn(
        "ollopa-act relative inline-block font-medium underline decoration-muted-foreground underline-offset-4",
        "transition-colors duration-100 hover:decoration-current motion-reduce:transition-none",
        size === "sm" ? "text-xs" : "text-sm",
      )}
    >
      {action.label}
      <Shortcut keys={action.keys} kind={action.kind} />
    </a>
  ) : (
    <Button
      id={action.id}
      aria-label={action["aria-label"]}
      data-item={action.dataItem}
      data-item-label={action.dataItemLabel}
      {...action.attrs}
      size={size}
      variant={action.kind === "primary" ? "default" : action.kind === "destructive" ? "ghost" : "outline"}
      className={cn(
        "ollopa-act relative",
        width,
        action.kind === "destructive" && "text-destructive hover:text-destructive",
      )}
      disabled={disabled}
      aria-busy={busy || undefined}
      onClick={() => {
        if (disabled) return
        if (action.irreversible) { onIrreversible(action); return }
        action.onClick?.()
      }}
    >
      {spinner}
      {action.label}
      <Shortcut keys={action.keys} kind={action.kind} />
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

export function Actions({ items, layout, surface = "page", menuLabel, className }: {
  items: Action[]
  layout?: Layout
  surface?: Surface
  /**
   * What the menu acts on: the row's own name. Required by `layout="menu"`, because a screen reader
   * meeting twenty "More actions" buttons on one table learns nothing (RULES.md rule 4). The
   * trigger reads "Actions for Mateo Okonkwo".
   */
  menuLabel?: string
  className?: string
}) {
  const [confirming, setConfirming] = useState<Action | null>(null)
  const place = PLACE[surface]

  // The surface decides where its acts sit. A page that asks for something else is asking for a
  // layout the eye has not learned on that surface, so it is said out loud and the map wins.
  if (layout && layout !== "menu" && layout !== place.layout) {
    warn(`layout:${surface}:${layout}`,
      `A ${surface} lays its acts out as a ${place.layout}, not a ${layout} (DESIGN.md §4). The map does ` +
      "not change by page or by seat; it is what the eye learns. Using the map.")
  }
  if (className && COLOURED.test(className)) {
    warn(`colour:${className}`,
      `Actions was passed "${className}". Colour has one meaning each (DESIGN.md §4): the primary fill ` +
      "belongs to the one primary act, the destructive hue to destructive acts, success to a Done line, " +
      "warning to ribbons. The kind paints the control; nothing else may.")
  }
  for (const a of items) {
    if (a.attrs && (a.attrs.class || a.attrs.className || a.attrs.style)) {
      warn(`attrclass:${a.label}`,
        `"${a.label}" passes class or style through \`attrs\`. \`attrs\` is for attributes a control must ` +
        "carry to be found again, never for how it looks.")
    }
    if (a.disabledBecause && a.attrs?.title) {
      warn(`disabledtitle:${a.label}`,
        `"${a.label}" is disabled and carries a tooltip. A disabled control never explains itself in a ` +
        "tooltip (DESIGN.md §4); the reason sits beside it, which is what `disabledBecause` draws.")
    }
  }

  const how: Layout = layout === "menu" ? "menu" : place.layout
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

  if (how === "menu") {
    if (!menuLabel) {
      warn(`menuLabel:${list.map((a) => a.label).join(",")}`,
        'A menu needs `menuLabel`: the name of the thing it acts on, so its trigger reads "Actions for ' +
        'Mateo Okonkwo" and not "More actions" twenty times down a table (RULES.md rule 4).')
    }
    const doing = list.filter((a) => a.kind !== "destructive")
    const ending = list.filter((a) => a.kind === "destructive")
    return (
      <>
        <DropdownMenu>
          {/* One of the three controls allowed to be icon-only, and like the other two it carries
              both an accessible name and a tooltip (DESIGN.md §4). */}
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size={SIZE[surface] === "sm" ? "icon-sm" : "icon"}
                        aria-label={menuLabel ? `Actions for ${menuLabel}` : "More actions"}>
                  <MoreHorizontal className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>{menuLabel ? `Actions for ${menuLabel}` : "More actions"}</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            {doing.map((a) => (
              <DropdownMenuItem key={a.label} disabled={!!a.disabledBecause}
                data-item={a.dataItem} data-item-label={a.dataItemLabel}
                onSelect={() => (a.irreversible ? irreversible(a) : a.onClick?.())}>
                {a.label}
                {a.cost && <span className="ml-auto pl-4 text-xs text-muted-foreground">{a.cost}</span>}
              </DropdownMenuItem>
            ))}
            {ending.length > 0 && doing.length > 0 && <DropdownMenuSeparator />}
            {ending.map((a) => (
              <DropdownMenuItem key={a.label} variant="destructive" id={a.id} aria-label={a["aria-label"]}
                data-item={a.dataItem} data-item-label={a.dataItemLabel} {...a.attrs}
                disabled={!!a.disabledBecause}
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
        how === "stack"
          ? "flex flex-col items-start gap-3"
          : cn("flex flex-wrap items-start gap-2", place.align === "trailing" ? "justify-end" : "justify-start"),
        className,
      )}>
        {doing.map((a) => <One key={a.label} action={a} surface={surface} layout={how} onIrreversible={irreversible} />)}
        {/* The gap. A destructive act is never next to a benign one (memo 26, part B). */}
        {ending.length > 0 && (
          <div className={cn(how === "stack" ? "mt-2 w-full border-t pt-3" : "ml-4 border-l pl-4")}>
            <div className={cn(how === "stack" ? "flex flex-col items-start gap-3" : "flex flex-wrap items-start gap-2")}>
              {ending.map((a) => <One key={a.label} action={a} surface={surface} layout={how} onIrreversible={irreversible} />)}
            </div>
          </div>
        )}
      </div>
      {dialog}
    </>
  )
}
