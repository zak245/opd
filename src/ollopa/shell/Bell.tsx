// The bell and its panel. A panel, never a page.
//
// Rows are links: opening one marks it read and closes the panel. A grouped row opens its page
// filtered — it never expands inside the panel, because that would be a third level. Nothing is
// hover-only: "Snooze until tomorrow" and "Mark read" show on hover and on focus-within, and the
// same two sit in the row's "…" menu.
import { useState } from "react"
import { Bell as BellIcon, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { href, navigate } from "@/app/router"
import type { Session } from "../session"
import { Panel } from "../ui/Panel"
import { KIND_LABEL, older, readState, sectioned, shortDate, TODAY, writeState, type Note } from "./notifications"

export function unreadCount(rows: Note[]): number {
  return rows.filter((n) => n.unread).length
}

export function BellButton({ count, onOpen }: { count: number; onOpen: () => void }) {
  return (
    <Button variant="ghost" size="icon" aria-label={`Notifications, ${count} unread`} onClick={onOpen} className="relative">
      <BellIcon className="size-4" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-foreground px-1 t-small font-medium leading-4 text-background">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  )
}

function Row({ note, unread, onOpen, onRead, onSnooze }: { note: Note; unread: boolean; onOpen: () => void; onRead: () => void; onSnooze: () => void }) {
  return (
    <li className="group flex items-start gap-2 border-b px-4 py-2.5 last:border-b-0 focus-within:bg-muted/50 hover:bg-muted/50">
      <a
        href={href(note.target)}
        onClick={onOpen}
        className="min-w-0 flex-1 text-sm"
      >
        <div className="flex items-center gap-2">
          <span className="t-small uppercase tracking-wider text-muted-foreground">{KIND_LABEL[note.kind]}</span>
          <span className="t-small text-muted-foreground">{note.on > TODAY ? `for ${shortDate(note.on)}` : shortDate(note.on)}</span>
          {unread && <span className="size-1.5 rounded-full bg-foreground" aria-label="Unread" />}
        </div>
        <div className={cn("mt-0.5", unread && "font-medium")}>{note.title}</div>
        {note.detail && <div className="text-muted-foreground">{note.detail}</div>}
      </a>
      <div className="flex shrink-0 items-center gap-1">
        <div className="hidden gap-1 group-focus-within:flex group-hover:flex">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onSnooze}>Snooze until tomorrow</Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onRead}>Mark read</Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7" aria-label={`Actions for: ${note.title}`}><MoreHorizontal className="size-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onSnooze}>Snooze until tomorrow</DropdownMenuItem>
            <DropdownMenuItem onSelect={onRead}>Mark read</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
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
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [showOlder, setShowOlder] = useState(false)

  const visible = rows.filter((n) => !state.snoozed.includes(n.id) && (!unreadOnly || n.unread))
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

  return (
    <Panel
      id="bell"
      title="Notifications"
      open={open}
      onOpenChange={onOpenChange}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <button className="underline underline-offset-4" onClick={() => setShowOlder((v) => !v)}>
            {showOlder ? "Hide older than seven days" : `Show older than seven days (${olderRows.length})`}
          </button>
          <a className="underline underline-offset-4" href={href("/ollopa/settings/you")}>Notification delivery</a>
        </div>
      }
    >
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <Button
          variant={unreadOnly ? "default" : "outline"}
          size="sm"
          aria-pressed={unreadOnly}
          onClick={() => setUnreadOnly((v) => !v)}
        >
          Unread only
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { writeState(session.business, session.role, { ...state, read: rows.map((n) => n.id) }); onChange() }}
        >
          Mark all read
        </Button>
      </div>

      {sections.length === 0 && (
        <div className="px-4 py-8 text-sm text-muted-foreground">
          Nothing new. Replies land in <a className="underline underline-offset-4" href={href("/ollopa/inbox")}>Inbox</a>, approvals on{" "}
          <a className="underline underline-offset-4" href={href("/ollopa/agents")}>Agents</a>.
        </div>
      )}

      {sections.map((s) => (
        <section key={s.title}>
          <h3 className="sticky top-0 bg-background px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.title}</h3>
          <ul>
            {s.rows.map((n) => (
              <Row
                key={n.id}
                note={n}
                unread={n.unread}
                onOpen={() => { markRead(n.id); onOpenChange(false); navigate(n.target) }}
                onRead={() => markRead(n.id)}
                onSnooze={() => snooze(n.id)}
              />
            ))}
          </ul>
        </section>
      ))}

      {showOlder && (
        <section>
          <h3 className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Older</h3>
          <ul>
            {olderRows.map((n) => (
              <Row key={n.id} note={n} unread={n.unread} onOpen={() => { markRead(n.id); onOpenChange(false); navigate(n.target) }} onRead={() => markRead(n.id)} onSnooze={() => snooze(n.id)} />
            ))}
            {olderRows.length === 0 && <li className="px-4 py-3 text-sm text-muted-foreground">Nothing older than seven days. Rows are kept for 30 days.</li>}
          </ul>
        </section>
      )}
    </Panel>
  )
}
