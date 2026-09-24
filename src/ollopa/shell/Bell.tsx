// The bell and what it opens. A panel, never a page.
//
// Eight short messages are reference, read at a glance and then left, so LAYOUTS.md §3 makes this a
// popover anchored to the bell: 400 wide, capped at 460 tall, its own scroll inside and the footer
// pinned. Below `sm` a popover that size is the whole screen, so there it stays the sheet.
//
// A row is two lines at most. The kind is the family's icon and hue (DESIGN.md §5 — a family is an
// icon and a hue, always together, never a shouted word), the title and its date are the first
// line, one line of detail is the second. Rows are links: opening one marks it read and closes the
// panel. A grouped row opens its page filtered — it never expands inside the panel, because that
// would be a third level. The two row acts live in one quiet "…" that is always there, because a
// touch screen has no hover and a hover-only act has no route on it.
import { useEffect, useRef, useState } from "react"
import { Bell as BellIcon, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { href, navigate } from "@/app/router"
import type { Session } from "../session"
import { Panel } from "../ui/Panel"
import { Divider } from "../ui/Divider"
import { FamilyIcon } from "../ui/Identity"
import { KIND_FAMILY, KIND_LABEL, older, readState, sectioned, shortDate, TODAY, writeState, type Note } from "./notifications"

export function unreadCount(rows: Note[]): number {
  return rows.filter((n) => n.unread).length
}

export function BellButton({ count, onOpen }: { count: number; onOpen: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      data-bell-trigger=""
      aria-label={`Notifications, ${count} unread`}
      onClick={onOpen}
      className="relative"
    >
      <BellIcon className="size-4" aria-hidden="true" />
      {count > 0 && (
        <Badge className="absolute -right-1 -top-1 h-4 min-w-4 justify-center px-1 tabular-nums">
          {count > 9 ? "9+" : count}
        </Badge>
      )}
    </Button>
  )
}

/**
 * The bell lives in the shell's header and the panel is rendered somewhere else in it, so the
 * popover finds its anchor by the mark the button wears rather than by wrapping it.
 */
const bellAnchor = {
  get current(): HTMLElement | null {
    return document.querySelector<HTMLElement>("[data-bell-trigger]")
  },
  set current(_el: HTMLElement | null) { /* Radix reads this; it never writes to it. */ },
}

function focusBell() {
  bellAnchor.current?.focus()
}

/** `sm` and up: the popover. Below it: the sheet, because at 400 a 400 px popover is the screen. */
function useWide(): boolean {
  const query = "(min-width: 40rem)"
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setWide(mq.matches)
    on()
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return wide
}

function Row({ note, unread, onOpen, onRead, onSnooze }: { note: Note; unread: boolean; onOpen: () => void; onRead: () => void; onSnooze: () => void }) {
  const date = note.on > TODAY ? `for ${shortDate(note.on)}` : shortDate(note.on)
  return (
    <li className="group relative first:[&>[data-slot=separator]]:hidden">
      <Divider className="absolute inset-x-0 top-0" />
      <a
        href={href(note.target)}
        onClick={onOpen}
        className="flex items-start gap-2.5 py-2 pl-3 pr-10 hover:bg-muted/50 focus-visible:bg-muted/50"
      >
        <FamilyIcon of={KIND_FAMILY[note.kind]} label={KIND_LABEL[note.kind]} className="mt-0.5" />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className={cn("t-body min-w-0 flex-1 truncate", unread && "font-medium")}>{note.title}</span>
            <span
              className={cn("size-1.5 shrink-0 self-center rounded-full", unread ? "bg-foreground" : "bg-transparent")}
              role={unread ? "img" : undefined}
              aria-label={unread ? "Unread" : undefined}
            />
            <span className="t-small shrink-0 tabular-nums text-muted-foreground">{date}</span>
          </span>
          {note.detail && <span className="t-small mt-0.5 line-clamp-1 text-muted-foreground">{note.detail}</span>}
        </span>
      </a>
      {/* One "…" per row, always there: hover is not a route on a touch screen (LAYOUTS.md §4). */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1.5 size-7 text-muted-foreground"
            aria-label={`Acts for: ${note.title}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onSnooze}>Snooze until tomorrow</DropdownMenuItem>
          <DropdownMenuItem onSelect={onRead}>Mark read</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}

/** A group's name, the way a menu labels a group: a quiet line after a rule, never a filled band. */
function GroupLabel({ children, first }: { children: string; first: boolean }) {
  return (
    <>
      {!first && <Divider className="my-1" />}
      <h3 className="t-small px-3 py-1 font-medium text-muted-foreground">{children}</h3>
    </>
  )
}

export function NotificationPanel({
  session,
  rows,
  open,
  onOpenChange,
  onChange,
}: {
  session: Session
  rows: Note[]
  open: boolean
  onOpenChange: (o: boolean) => void
  onChange: () => void
}) {
  const state = readState(session.business, session.role)
  const wide = useWide()
  // Closing gives the bell back. A sheet or a popover opened without a trigger of its own has
  // nothing to hand focus to, and a person on the keyboard would land on the body.
  const was = useRef(open)
  useEffect(() => {
    const closed = was.current && !open
    was.current = open
    if (!closed) return
    const t = window.setTimeout(() => {
      if (!document.activeElement || document.activeElement === document.body) focusBell()
    }, 30)
    return () => window.clearTimeout(t)
  }, [open])
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [showOlder, setShowOlder] = useState(false)

  // Read state is asked of the store on every render, not of the rows: what the shell handed down
  // was worked out before "Mark read" was pressed.
  const isUnread = (n: Note) => n.unread && !state.read.includes(n.id)
  const kept = rows.filter((n) => !state.snoozed.includes(n.id))
  const unread = kept.filter(isUnread).length
  const visible = kept.filter((n) => !unreadOnly || isUnread(n))
  const sections = sectioned(visible)
  const olderRows = older(visible)

  const markRead = (id: string) => {
    if (state.read.includes(id)) return
    writeState(session.business, session.role, { ...state, read: [...state.read, id] })
    onChange()
  }
  const snooze = (id: string) => {
    writeState(session.business, session.role, { ...state, snoozed: [...state.snoozed, id] })
    onChange()
  }
  const openRow = (n: Note) => { markRead(n.id); onOpenChange(false); navigate(n.target) }
  const rowFor = (n: Note) => (
    <Row key={n.id} note={n} unread={isUnread(n)} onOpen={() => openRow(n)} onRead={() => markRead(n.id)} onSnooze={() => snooze(n.id)} />
  )

  // A filter, not an act: two options and the count, so neither of the two acts here is filled.
  const filter = (
    <div className="flex items-center justify-between gap-2 px-3 py-2">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        aria-label="Which notifications"
        value={unreadOnly ? "unread" : "all"}
        onValueChange={(v) => { if (v) setUnreadOnly(v === "unread") }}
      >
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        <ToggleGroupItem value="unread" className="tabular-nums">Unread {unread}</ToggleGroupItem>
      </ToggleGroup>
      {/* Nothing unread, nothing to mark: the act shows no control rather than a dead one. */}
      {unread > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { writeState(session.business, session.role, { ...state, read: rows.map((n) => n.id) }); onChange() }}
        >
          Mark all read
        </Button>
      )}
    </div>
  )

  const list = (
    <>
      {sections.length === 0 && (
        <p className="t-body px-3 py-8 text-muted-foreground">
          {unreadOnly ? "Nothing unread." : (
            <>
              Nothing new. Replies land in <a className="underline underline-offset-4" href={href("/ollopa/inbox")}>Inbox</a>,
              approvals on <a className="underline underline-offset-4" href={href("/ollopa/agents")}>Agents</a>.
            </>
          )}
        </p>
      )}

      {sections.map((s, i) => (
        <section key={s.title}>
          <GroupLabel first={i === 0}>{s.title}</GroupLabel>
          <ul>{s.rows.map(rowFor)}</ul>
        </section>
      ))}

      {showOlder && olderRows.length > 0 && (
        <section>
          <GroupLabel first={sections.length === 0}>Older</GroupLabel>
          <ul>{olderRows.map(rowFor)}</ul>
        </section>
      )}
    </>
  )

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {olderRows.length > 0 ? (
        <button className="t-small underline underline-offset-4" onClick={() => setShowOlder((v) => !v)}>
          {showOlder ? "Hide older than seven days" : `Show older than seven days (${olderRows.length})`}
        </button>
      ) : <span />}
      <a className="t-small underline underline-offset-4" href={href("/ollopa/settings/you")}>Notification delivery</a>
    </div>
  )

  if (!wide) {
    return (
      <Panel id="bell" title="Notifications" open={open} onOpenChange={onOpenChange} footer={footer}>
        {/* The rows are a divided list, so they run to the sheet's own edges. */}
        <div className="-mx-5 -my-4">
          {filter}
          <Divider />
          {list}
        </div>
      </Panel>
    )
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor virtualRef={bellAnchor} />
      <PopoverContent
        id="bell"
        align="end"
        sideOffset={8}
        collisionPadding={8}
        aria-label="Notifications"
        className="flex max-h-[min(460px,calc(100dvh-5rem))] w-100 flex-col p-0"
        // There is no PopoverTrigger to return focus to, so the bell is given it by name.
        onCloseAutoFocus={(e) => { e.preventDefault(); focusBell() }}
        // Pressing the bell again while it is open is the bell's business, not a dismissal.
        onPointerDownOutside={(e) => {
          if ((e.target as HTMLElement | null)?.closest?.("[data-bell-trigger]")) e.preventDefault()
        }}
      >
        {filter}
        <Divider />
        <div className="min-h-0 flex-1 overflow-y-auto">{list}</div>
        <Divider />
        <div className="px-3 py-2">{footer}</div>
      </PopoverContent>
    </Popover>
  )
}
