// The shapes every Home section is built from: a section, a keyboard-navigable list, a row with its
// actions in view and in its menu, and the undo line an action leaves behind.
//
// Nothing here is hover-only: a row's actions are buttons in the row, visible on focus as well as
// hover, and repeated in the row's "…" menu with the key that runs them. J and K move, Enter opens,
// and the letters are the ones the menu prints.
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuShortcut, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { follow } from "../../chain"
import { originHere } from "../work/register"
import { FamilyIcon } from "../../ui/Identity"
import { SectionHeader } from "../../ui"

/* ------------------------------------------------------------------------------------- section */

export interface SectionProps {
  id: string
  title: string
  count?: number
  /** The page this section is one click from: All tasks, Inbox, Deals, Agents. Navigation, not a door. */
  link?: { label: string; to: string }
  /** Where the section sits when the page is one column (phone). */
  order?: number
  children: ReactNode
}

const ORDER = ["", "order-1", "order-2", "order-3", "order-4", "order-5", "order-6", "order-7", "order-8"]

/** The family a Home section is a window on, from the page it links to. */
function familyForSection(id: string, to?: string): string {
  if (to) return to.replace(/^#/, "").split("?")[0].split("/").filter(Boolean)[1] ?? id
  return id
}

export function Section({ id, title, count, link, order = 0, children }: SectionProps) {
  return (
    // The id is the anchor a chain that left from inside this section comes back to, when what it
    // left was the section itself rather than one row.
    <section id={id} aria-label={title} data-section={id} className={cn("min-w-0", ORDER[order] ?? "")}>
      <SectionHeader
        title={<span className="inline-flex items-center gap-1.5"><FamilyIcon of={familyForSection(id, link?.to)} />{title}</span>}
        count={count}
        className="surface-page sticky top-0 z-[1] pt-1"
        action={link && (
          // The whole page this section is a window on. It is a move, not a jump: the trail keeps
          // Home and the section, so the crumb comes back to it.
          <button
            type="button"
            className="t-small text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            onClick={() => follow(link.to, originHere(id))}
          >
            {link.label}
          </button>
        )}
      />
      {children}
    </section>
  )
}

/** One sentence where a list would be: an empty section keeps its shape rather than disappearing. */
export function Nothing({ text, link }: { text: string; link?: { label: string; to: string } }) {
  return (
    <p className="t-body rounded-lg border border-dashed px-3 py-2.5 text-muted-foreground">
      {text}{link && (
        <> <button type="button" className="text-foreground underline underline-offset-4"
                   onClick={() => follow(link.to, originHere())}>{link.label}</button></>
      )}
    </p>
  )
}

/* ---------------------------------------------------------------------------------- the list */

export function RowList({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  const list = useRef<HTMLUListElement>(null)

  function move(e: KeyboardEvent<HTMLUListElement>, step: 1 | -1) {
    const rows = Array.from(list.current?.querySelectorAll<HTMLElement>("li[data-row]") ?? [])
    const here = (document.activeElement as HTMLElement | null)?.closest("li[data-row]") as HTMLElement | null
    const next = rows[Math.min(rows.length - 1, Math.max(0, rows.indexOf(here!) + step))]
    if (next) { next.focus(); e.preventDefault() }
  }

  return (
    <ul
      ref={list}
      aria-label={label}
      className={cn("divide-y rounded-lg border", className)}
      onKeyDown={(e) => {
        if (typing(e.target)) return
        if (e.key === "ArrowDown" || e.key.toLowerCase() === "j") move(e, 1)
        if (e.key === "ArrowUp" || e.key.toLowerCase() === "k") move(e, -1)
      }}
    >
      {children}
    </ul>
  )
}

function typing(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  return Boolean(el?.closest?.("input, textarea, select, [contenteditable=true]"))
}

export interface RowProps {
  /** Keys that run this row's actions, the same letters the menu prints. */
  keys?: Record<string, () => void>
  onEnter?: () => void
  children: ReactNode
  className?: string
  /** Marks the row read once it has been on screen: the batch button waits for this. */
  seen?: (el: HTMLElement | null) => void
  /**
   * The id of the thing this row names — a task, a reply, an agent run, a deal, a company. The pane
   * marks the row it is reading from it, and a trail that left from this row comes back and lights
   * it. `data-item-id` stays for the approval queue's own read-once observer.
   */
  itemId?: string
  /** What the row is called, for the pane and the crumb. */
  itemLabel?: string
}

export function Row({ keys = {}, onEnter, children, className, seen, itemId, itemLabel }: RowProps) {
  return (
    <li
      data-row
      data-item-id={itemId}
      data-item={itemId}
      data-item-label={itemLabel}
      tabIndex={0}
      ref={seen}
      className={cn(
        "group flex flex-wrap items-start gap-x-3 gap-y-1 px-3 py-2.5 text-sm first:rounded-t-lg last:rounded-b-lg",
        "focus-within:bg-muted/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      onKeyDown={(e) => {
        // The row's letters belong to the row: a key pressed inside a button or a menu in it is that
        // control's, so Enter on "…" opens the menu rather than opening the record behind it.
        if (e.target !== e.currentTarget || e.metaKey || e.ctrlKey || e.altKey) return
        const run = e.key === "Enter" ? onEnter : keys[e.key.toLowerCase()]
        if (!run) return
        e.preventDefault()
        // An action that takes the row away hands focus to the next one, so the keyboard keeps working.
        const row = e.currentTarget
        const neighbour = (row.nextElementSibling ?? row.previousElementSibling) as HTMLElement | null
        run()
        requestAnimationFrame(() => { if (!row.isConnected) neighbour?.focus() })
      }}
    >
      {children}
    </li>
  )
}

/* ------------------------------------------------------------------------------- the row menu */

export interface MenuAction {
  label: string
  shortcut?: string
  onSelect: () => void
  /** Sits below the divider, with its consequence in the label. */
  destructive?: boolean
  /** A fact about the row rather than an action: shown, never clickable. */
  fact?: boolean
}

export function RowMenu({ name, actions }: { name: string; actions: MenuAction[] }) {
  const safe = actions.filter((a) => !a.destructive)
  const risky = actions.filter((a) => a.destructive)
  if (actions.length === 0) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label={`Actions for ${name}`}>
          <MoreHorizontal className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {safe.map((a) => (a.fact ? (
          <DropdownMenuLabel key={a.label} className="text-xs font-normal text-muted-foreground">{a.label}</DropdownMenuLabel>
        ) : (
          <DropdownMenuItem key={a.label} onSelect={a.onSelect}>
            {a.label}
            {a.shortcut && <DropdownMenuShortcut>{a.shortcut}</DropdownMenuShortcut>}
          </DropdownMenuItem>
        )))}
        {risky.length > 0 && <DropdownMenuSeparator />}
        {risky.map((a) => (
          <DropdownMenuItem key={a.label} variant="destructive" onSelect={a.onSelect}>
            {a.label}
            {a.shortcut && <DropdownMenuShortcut>{a.shortcut}</DropdownMenuShortcut>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ------------------------------------------------------------------------------------- undo */

export interface Undo { text: string; undo: () => void }

/** What an action left behind, with the way back. It stays until the next action rather than fading. */
export function UndoLine({ note, onDone }: { note: Undo | null; onDone: () => void }) {
  if (!note) return null
  return (
    <div role="status" className="mb-2 flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs">
      <span className="min-w-0 flex-1">{note.text}</span>
      <Button variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={() => { note.undo(); onDone() }}>Undo</Button>
    </div>
  )
}

export function useUndo(): [Undo | null, (note: Undo) => void, () => void] {
  const [note, setNote] = useState<Undo | null>(null)
  return [note, setNote, () => setNote(null)]
}

/** A short confirmation in place of the row's actions: the sentence, then the button that runs it. */
export function Confirm({ text, label, onConfirm, onCancel }: { text: string; label: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex w-full flex-wrap items-center gap-2 rounded-md bg-muted px-2 py-1.5 text-xs">
      <span className="min-w-0 flex-1">{text}</span>
      <Button size="sm" variant="destructive" className="h-7" onClick={onConfirm}>{label}</Button>
      <Button size="sm" variant="ghost" className="h-7" onClick={onCancel}>Cancel</Button>
    </div>
  )
}
