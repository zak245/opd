// P-inbox — replies from sequences, grouped by what the person meant.
//
// The page is master-detail: it fills the `MasterDetail` template (src/ollopa/layouts) with the
// table on the left and the thread as the open half of the page on the right, and the template owns
// the measure, the real `Split` handle between them and the collapse to one pane at 400. Nothing
// else. It opens on Interested, longest-waiting first, because an interested person who is waiting
// is the one thing this seat may never lose sight of.
//
// Which groups get a tab, which filters sit beside search and which row actions are visible is asked
// of the usage model, never hard-coded: `useDisclosure("inbox")` answers for this seat at this
// business, so one page serves four workspaces and three seats with no mode switch.
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRoute } from "@/app/router"
import { openBeside, openBesideNested } from "../../beside"
import { Actions, type Action, type ActionKind } from "../../ui/Actions"
import { Chip, FamilyIcon, inkOf } from "../../ui/Identity"
import { MasterDetail } from "../../layouts"
import { follow } from "../../chain"
import { useEdits } from "../../edits"
import { Container, Group } from "../../ui/Section"
import { Door, DoorGroup } from "../../ui/Door"
import { EmptyState } from "../../ui/EmptyState"
import { useDisclosure } from "../../ui/useDisclosure"
import { seedFor, type Reply } from "../../data/seed"
import type { Session } from "../../session"
import { day, daysBetween, overdueWait, stamp, waitedLabel } from "./format"
import { adminSeat, aeSeats, calendarOf, contactIndex, MEANINGS, repliesFor, sdrSeats, visibleReplies, type InboxReply } from "./data"
import { originHere, undoSend, useRenderCount } from "./acts"
import { Thread } from "./Thread"
import { MeetingPanel } from "./MeetingPanel"
import { useUndo } from "./undo"

type Outcome = Reply["outcome"]
type GroupKey = Outcome | "Handled"

const GROUPS: { key: GroupKey; item: string }[] = [
  { key: "Interested", item: "inbox.group.interested" },
  { key: "Question", item: "inbox.group.question" },
  { key: "Not now", item: "inbox.group.not-now" },
  { key: "Out of office", item: "inbox.group.out-of-office" },
  { key: "Unsubscribe", item: "inbox.group.unsubscribe" },
  { key: "Handled", item: "inbox.group.handled" },
]

/** Who put this outcome on the reply: the agent that read it, or the person who corrected it. */
const classifier = (r: InboxReply) => r.classifiedBy ?? "nobody yet"

/** What a person has changed in this session, over the seed. */
interface Change { outcome?: Outcome; handled?: boolean; handedTo?: string | null; meantBy?: "you"; followUpOn?: string | null; hidden?: boolean }

const store = (session: Session, key: string) => `ollopa.inbox.${session.business}.${session.role}.${key}`
function remember(session: Session, key: string, value: string) {
  try { localStorage.setItem(store(session, key), value) } catch { /* private mode: this visit only */ }
}
function recall(session: Session, key: string, fallback: string): string {
  try { return localStorage.getItem(store(session, key)) ?? fallback } catch { return fallback }
}

export function Inbox({ session, thread, book }: { session: Session; thread?: string; book?: boolean }) {
  const renders = useRenderCount()
  const d = useDisclosure("inbox")
  const seed = seedFor(session.business)
  const contactOf = contactIndex(session.business)
  const calendar = calendarOf(session.business)
  const aes = aeSeats(session.business)
  const admin = adminSeat(session.business)
  const { say, bar } = useUndo()

  // What this seat sees, plus the one reply a link named. At Meridian the Inbox is filtered to your
  // own mailbox, but Home lists replies from the people you own — so a reply can be shown there and
  // filtered out here, and "Open the page" would land on the wrong thread. A thread the person was
  // sent to by their own move is shown; the thread header says which mailbox it landed in, so
  // nothing is hidden and nothing is misreported.
  const base = useMemo(() => {
    const seen = visibleReplies(session)
    if (!thread || seen.some((r) => r.id === thread)) return seen
    const named = repliesFor(session).find((r) => r.id === thread)
    return named ? [named, ...seen] : seen
  }, [session, thread])
  const [changes, setChanges] = useState<Record<string, Change>>({})
  // What a pane or a composer did to these replies, from the one store every surface reads: a reply
  // handled in the pane beside Home, and a reply that is on its way out of the composer here. One
  // source, so a row and a pane can never say different things about the same reply.
  const acted = useEdits("reply")
  const rows: InboxReply[] = useMemo(
    () => base.map((r) => {
      const c = changes[r.id]
      const a = acted[r.id] as { handled?: boolean; handedTo?: string } | undefined
      if (!c && !a) return r
      const handled = a?.handled ?? c?.handled ?? r.handled
      return { ...r, outcome: c?.outcome ?? r.outcome, handled, status: handled ? "handled" : r.status, handedTo: a?.handedTo ?? (c?.handedTo !== undefined ? c.handedTo : r.handedTo), followUpOn: c?.followUpOn !== undefined ? c.followUpOn : r.followUpOn }
    }).filter((r) => !changes[r.id]?.hidden),
    [base, changes, acted],
  )

  // A deep link names the thread, and the group follows the reply it names — object state, not history.
  const linked = thread ? base.find((r) => r.id === thread) ?? null : null
  const [group, setGroup] = useState<GroupKey>(() =>
    linked ? (linked.handled ? "Handled" : linked.outcome) : (recall(session, "group", "Interested") as GroupKey))
  const [q, setQ] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [selection, setSelection] = useState<string[]>([])
  const [selecting, setSelecting] = useState(false)
  const [openId, setOpenId] = useState<string | null>(thread ?? null)
  const [focusComposer, setFocusComposer] = useState(0)
  const [booking, setBooking] = useState<InboxReply | null>(null)
  // On a phone the thread is a page reached by tapping a row — except when the link named a thread,
  // which is a person asking for that thread and not for the list.
  const [onPhoneThread, setOnPhoneThread] = useState(!!thread)

  useEffect(() => { remember(session, "group", group) }, [session, group])

  // Arriving from somewhere that said "book a meeting" — the reply pane on Home — opens the panel
  // once, on the thread that was named. Pressing Escape closes it and it does not come back.
  const booked = useRef(false)
  useEffect(() => {
    if (!book || booked.current || !linked) return
    booked.current = true
    setBooking(linked)
  }, [book, linked])

  const inGroup = useCallback((r: InboxReply, g: GroupKey) => (g === "Handled" ? r.handled : !r.handled && r.outcome === g), [])
  const counts = useMemo(() => Object.fromEntries(GROUPS.map((g) => [g.key, rows.filter((r) => inGroup(r, g.key)).length])) as Record<GroupKey, number>, [rows, inGroup])

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return rows
      .filter((r) => inGroup(r, group))
      .filter((r) => !needle || `${r.contact} ${r.company} ${r.body}`.toLowerCase().includes(needle))
      .filter((r) => !filters.sequence || filters.sequence === "all" || r.sequence === filters.sequence)
      .filter((r) => !filters.owner || filters.owner === "all" || r.boxOwner === filters.owner)
      .filter((r) => !filters.mailbox || filters.mailbox === "all" || r.box === filters.mailbox)
      .filter((r) => {
        if (!filters.date || filters.date === "all") return true
        const n = daysBetween(r.received)
        return filters.date === "Today" ? n === 0 : filters.date === "This week" ? n <= 7 : n > 7
      })
      .sort((a, b) => a.received.localeCompare(b.received))
  }, [rows, group, q, filters, inGroup])

  // The page opens on the longest-waiting reply in the group and keeps a thread open (spec 06 §6).
  const open = filtered.find((r) => r.id === openId) ?? filtered[0] ?? null
  useEffect(() => { if (open && open.id !== openId) setOpenId(open.id) }, [open, openId])

  const waitingCount = rows.filter((r) => !r.handled).length
  const longest = rows.filter((r) => !r.handled).reduce((n, r) => Math.max(n, daysBetween(r.received)), 0)

  /* ------------------------------------------------------------------------------- the actions */

  const change = useCallback((id: string, next: Change, message: string) => {
    setChanges((c) => {
      const before = c[id]
      window.setTimeout(() => say(message, () => setChanges((cc) => ({ ...cc, [id]: before ?? {} }))), 0)
      return { ...c, [id]: { ...(c[id] ?? {}), ...next } }
    })
  }, [say])

  /** The element focus returns to when a pane closes: the row, which is focusable and stays put. */
  const rowEl = (r: InboxReply) => document.getElementById(`reply-${r.id}`)
  /** The deal behind a reply, so the menu names it rather than saying "the deal". */
  const dealOf = (r: InboxReply) => (r.dealId ? seed.deals.find((x) => x.id === r.dealId) : undefined)

  const doAction = useCallback((key: string, r: InboxReply, arg?: string, opener?: HTMLElement | null) => {
    const first = r.contact.split(" ")[0]
    switch (key) {
      case "reply": setOpenId(r.id); setFocusComposer((n) => n + 1); break
      case "book": setBooking(r); break
      case "hand": change(r.id, { handled: true, handedTo: arg ?? aes[0]?.user ?? null }, `${r.contact} handed to ${arg ?? aes[0]?.user}. A task “Reply to ${first}” is on their list.`); break
      case "done": change(r.id, { handled: true }, `${r.contact} marked done.`); break
      case "not-interested": change(r.id, { handled: true }, `${r.contact} marked not interested. The sequence is finished and the stage is Not interested.`); break
      case "follow-up": change(r.id, { handled: true, followUpOn: arg ?? r.followUpOn }, `Follow-up task created for ${day(arg ?? r.followUpOn)}. ${r.contact} moves to Handled.`); break
      case "resume": change(r.id, { handled: true }, arg === "now" ? `“${r.sequence}” resumed for ${r.contact} now.` : `“${r.sequence}” resumes for ${r.contact} on ${day(r.returnsOn)}.`); break
      case "confirm-unsub": change(r.id, { handled: true }, `ollopA will not email ${contactOf(r.contactId)?.email ?? r.contact} again from any sequence.`); break
      // The deal behind the reply and the person who sent it open beside the thread, never instead
      // of it: the half-written reply, the scroll and the open doors are all still there when the
      // pane closes. The list is the group as it is on screen, so [ and ] walk the same replies.
      case "create-deal": {
        const ids = filtered.filter((x) => x.dealId).map((x) => x.dealId!)
        if (r.dealId) {
          // Read while the contact is already beside the thread, the deal is the next step of the
          // same look and the header keeps one "‹ them"; with nothing open it is simply the deal.
          openBesideNested({ kind: "deal", id: r.dealId, list: { ids, index: Math.max(0, ids.indexOf(r.dealId)) }, opener: opener ?? rowEl(r) })
        } else {
          // Nothing to look at yet: making one is a page, and the trail keeps this reply.
          follow(`/ollopa/deals/${seed.deals[0].id}`, originHere(r.contactId))
        }
        break
      }
      case "open-contact": {
        const ids = filtered.map((x) => x.contactId)
        // One call for both routes — the row's menu and the thread's own "Contact details" — so the
        // same pane always carries the same list and [ and ] walk the same replies.
        openBeside({ kind: "person", id: r.contactId, list: { ids, index: Math.max(0, ids.indexOf(r.contactId)) }, opener: opener ?? rowEl(r) })
        break
      }
      case "change-meaning": change(r.id, { outcome: arg as Outcome, meantBy: "you" }, `Read as ${arg}, by you. The correction is logged for the classifier.`); break
      case "remove-from-sequence": change(r.id, { handled: true }, `${r.contact} removed from “${r.sequence}”. The history is kept.`); break
      case "note": say(`Note added to ${r.contact}.`); break
      case "forward": say(`Thread with ${r.contact} forwarded.`); break
      case "open-in-mailbox": say(`Opening the thread in ${seed.mailboxes[0]?.provider ?? "your mailbox"}.`); break
      case "assign": change(r.id, { handedTo: arg ?? null }, `${r.contact} assigned to ${arg}.`); break
      case "add-to-list": say(`${r.contact} added to a list.`); break
      case "unread": say(`${r.contact} marked unread.`); break
      case "spam": change(r.id, { hidden: true }, `${r.contact} marked as spam or a bot reply.`); break
      case "misread": say(`Misread reported for ${r.contact}. It goes to the classifier with the reply.`); break
      default: break
    }
  }, [aes, change, contactOf, filtered, say, seed])

  /* -------------------------------------------------------- which two actions the row shows */

  const available = useCallback((key: string) => {
    if (key === "book") return !!calendar
    if (key === "hand") return aes.length > 0 && session.role === "sdr"
    return true
  }, [calendar, aes, session.role])

  const ITEM: Record<string, string> = {
    reply: "inbox.act.reply", book: "inbox.act.book-meeting", hand: "inbox.act.hand-to-ae", done: "inbox.act.done",
    "not-interested": "inbox.act.not-interested", "follow-up": "inbox.act.follow-up", resume: "inbox.act.resume",
    "confirm-unsub": "inbox.act.confirm-unsubscribe", "create-deal": "inbox.act.create-deal", "open-contact": "inbox.act.open-contact",
  }
  const LABEL: Record<string, string> = {
    reply: "Reply", book: "Book meeting", hand: "Hand to an AE", done: "Mark done", "not-interested": "Not interested",
    "follow-up": "Follow up on…", resume: "Resume", "confirm-unsub": "Confirm unsubscribe", "create-deal": "Create deal", "open-contact": "Open contact",
  }
  /** What each row act is, so the row never picks a button variant by hand (DESIGN.md §1). */
  const KIND: Record<string, ActionKind> = {
    reply: "primary", book: "secondary", hand: "secondary", done: "secondary",
    "not-interested": "secondary", "follow-up": "secondary", resume: "secondary",
    "confirm-unsub": "secondary", "create-deal": "secondary", "open-contact": "secondary",
    spam: "destructive", misread: "destructive",
  }
  const KEYS: Record<string, string> = { reply: "r", book: "b", done: "d", "not-interested": "n", hand: "h", "confirm-unsub": "u" }

  /** "Open the deal" only where there is one; otherwise the action makes it. */
  const labelFor = (k: string, r: InboxReply) =>
    k === "create-deal" ? (r.dealId ? "Open the deal" : "Create a deal from this reply") : LABEL[k]

  const CANDIDATES: Record<GroupKey, string[]> = {
    Interested: ["reply", "book", "hand", "create-deal", "done"],
    Question: ["reply", "book", "hand", "create-deal", "done"],
    "Not now": ["follow-up", "done"],
    "Out of office": ["resume", "done"],
    Unsubscribe: ["confirm-unsub", "not-interested"],
    Handled: ["open-contact", "reply"],
  }
  const visibleActions = useCallback((g: GroupKey) =>
    CANDIDATES[g].filter((k) => available(k) && d.level(ITEM[k] ?? "inbox.act.done") === 1).slice(0, 2),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [available, d],
  )

  /* -------------------------------------------------------------------------------- keyboard */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (!el || el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const i = filtered.findIndex((r) => r.id === openId)
      const go = (n: number) => { const next = filtered[Math.max(0, Math.min(filtered.length - 1, n))]; if (next) { setOpenId(next.id); document.getElementById(`reply-${next.id}`)?.focus() } }
      switch (e.key) {
        case "j": e.preventDefault(); go(i + 1); break
        case "k": e.preventDefault(); go(i - 1); break
        case "r": if (open) { e.preventDefault(); doAction("reply", open) } break
        case "b": if (open && calendar) { e.preventDefault(); doAction("book", open) } break
        case "d": if (open) { e.preventDefault(); doAction("done", open) } break
        case "n": if (open) { e.preventDefault(); doAction("not-interested", open) } break
        case "h": if (open && available("hand")) { e.preventDefault(); doAction("hand", open) } break
        case "u": if (open && open.outcome === "Unsubscribe") { e.preventDefault(); doAction("confirm-unsub", open) } break
        case "o": if (open) { e.preventDefault(); setOpenId(open.id); setOnPhoneThread(true) } break
        case "x": if (open) { e.preventDefault(); setSelecting(true); setSelection((s) => (s.includes(open.id) ? s.filter((x) => x !== open.id) : [...s, open.id])) } break
        case "Escape":
          // A pane is open: Escape belongs to it, and the pane closes itself.
          if (document.querySelector("aside[aria-label*='beside']")) break
          if (selection.length || selecting) { setSelection([]); setSelecting(false); break }
          // At 400 the thread is a page, and Escape is the way back to the list.
          setOnPhoneThread(false)
          break
        default: break
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [filtered, openId, open, doAction, available, calendar, selection.length, selecting])

  /* ------------------------------------------------------------------------- tabs and filters */

  // The meanings this seat opens on come first in the list, then the rest. All of them are options
  // of one control, so the choice can never run off the edge of the pane.
  const groupOptions = [...GROUPS.filter((g) => d.level(g.item) === 1), ...GROUPS.filter((g) => d.level(g.item) !== 1)]
  const filterDefs = [
    { key: "sequence", label: "Sequence", item: "inbox.filter.sequence", options: [...new Set(rows.map((r) => r.sequence))] },
    { key: "owner", label: "Owner", item: "inbox.filter.owner", options: [...new Set(rows.map((r) => r.boxOwner))] },
    { key: "mailbox", label: "Mailbox", item: "inbox.filter.mailbox", options: [...new Set(rows.map((r) => r.box))] },
    { key: "date", label: "Date received", item: "inbox.filter.date", options: ["Today", "This week", "Older"] },
  ]
  const shownFilters = filterDefs.filter((f) => d.level(f.item) === 1)
  const doorFilters = filterDefs.filter((f) => d.level(f.item) !== 1)
  const searchAtLevelOne = d.level("inbox.filter.search") === 1
  const activeFilters = Object.entries(filters).filter(([, v]) => v && v !== "all")

  const showSequenceColumn = d.level("inbox.list.sequence-step") === 1
  const showOwnerColumn = d.level("inbox.list.owner") === 1
  const showMeantLine = d.level("inbox.agent-class") === 1

  /* ------------------------------------------------------------------------------------ views */

  const emptyBody =
    base.length === 0
      ? <EmptyState title="No replies yet" body={`Replies to your ${seed.sequences.filter((s) => s.status === "Active").length} active sequences land here within about 30 minutes of reaching your mailbox.`} action={<Actions surface="card" items={[{ kind: "secondary", label: "Open Sequences", onClick: () => follow("/ollopa/sequences", originHere()) }]} />} />
      : group === "Out of office"
        ? <EmptyState title="Nobody is out of office." body="Sequences pause and resume on the return date by themselves." />
        : group === "Interested"
          ? <EmptyState title="Nothing waiting" body="Every interested reply is handled." />
          : <EmptyState title={`Nothing in ${group}.`} body="Replies land here as they arrive." />

  /**
   * One reply, one line — the way a mail list reads.
   *
   * Across the row: select it, what kind of thing it is, who wrote, what they meant, the first line
   * of what they said, and when it landed. Nothing else, because a row five lines tall showed four
   * replies in a 430 px pane where this shows fifteen, and a person working replies is scanning.
   *
   * What the row used to carry and no longer does is not gone: "Read as … by the reply agent ·
   * change", the job title, the company, the mailbox and the sequence are all in the thread beside
   * it, which is the open half of this page rather than a door — one click, or Enter (RULES.md
   * rule 4: nothing here is hidden behind a door that was not already one).
   */
  function Row({ r }: { r: InboxReply }) {
    const actions = visibleActions(group)
    const late = overdueWait(r.received, r.outcome)
    const selected = selection.includes(r.id)
    const when = waitedLabel(r.received, late)
    // Where the seat reads its replies by sequence or by whose mailbox they landed in, that follows
    // the first words on the same line and truncates with them — behind them, because what the
    // person wrote is read more often than which sequence reached them (95 against 60).
    const meta = [
      showSequenceColumn ? `${r.sequence} · step ${r.step.n} of ${r.step.of}` : "",
      showOwnerColumn ? r.boxOwner : "",
    ].filter(Boolean).join(" · ")
    return (
      <div
        id={`reply-${r.id}`}
        data-item={r.contactId}
        data-item-label={r.contact}
        role="row"
        tabIndex={0}
        aria-selected={r.id === openId}
        onClick={() => { setOpenId(r.id); setOnPhoneThread(true) }}
        onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) { e.preventDefault(); setOpenId(r.id); setOnPhoneThread(true) } }}
        className={cn(
          // Rows in one container are divided, never carded, and the row you are on is the one
          // container-low region the container holds (DESIGN.md §5, containment).
          "group relative flex w-full cursor-pointer flex-wrap items-center gap-x-2 px-3 py-1.5 text-left",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:flex-nowrap",
          r.id === openId ? "bg-muted" : "hover:bg-muted focus-within:bg-muted",
        )}
      >
        {/* Select it, and what kind of thing it is: a reply is a Work object and wears that
            family's icon, never a glyph drawn for this page (DESIGN.md §5). */}
        <span role="gridcell" className="flex shrink-0 items-center gap-2">
          <span onClick={(e) => e.stopPropagation()} className="flex items-center">
            <Checkbox
              aria-label={`Select the reply from ${r.contact}`}
              checked={selected}
              onCheckedChange={(v) => setSelection((sel) => (v === true ? [...sel, r.id] : sel.filter((x) => x !== r.id)))}
            />
          </span>
          <FamilyIcon of="reply" label={`Reply from ${r.contact}`} />
        </span>

        {/* Who wrote, what they meant, and their first line. Bold until somebody has handled it.
            At 400 the first line drops under the name rather than fighting it for forty pixels;
            wider, `sm:contents` dissolves that wrapper and the whole row is one line. */}
        <span role="rowheader" className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-x-2">
          <span className="flex min-w-0 items-center gap-x-2 sm:contents">
          {/* The name takes the width it needs and gives it up last: the first line of the reply
              is the one thing on the row that reads at any length, so it takes what is left and
              stops there (`flex-1`, which grows into the gap and never pushes the name out). */}
          <span className={cn("t-body min-w-0 truncate", r.handled ? "font-normal" : "font-semibold")}>
            {r.contact}
          </span>
          {/* What the reply means is the whole reason this page exists, so it stays on the row. It
              is a category and not a state, so it is a neutral chip with the word (DESIGN.md §5).
              Overdue, Sending and Sent are the states. */}
          <Chip icon={false} className="shrink-0">{r.outcome}</Chip>
          </span>
          <span className="t-body line-clamp-1 min-w-0 text-muted-foreground sm:flex-1">
            {r.snippet}{meta && <> · {meta}</>}
          </span>
        </span>

        {/* When it landed, and the row's own acts in its place while the pointer or the keyboard is
            on the row. Overdue is the date in the danger ink; the word itself is on the title and
            in the accessible name, because a one-line row has no room for a column of chips. */}
        <span role="gridcell" className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0">
          {/* The same record the composer is reading: for ten seconds the reply can be pulled back
              from the row it was written on, and after that the row says it has gone. While it is
              going, Undo is the only act the row has — Reply and Book do not apply to a reply in
              flight, so they are removed rather than left to cover the one control that does
              (RULES.md rule 4), and they come back the moment the window closes. */}
          {acted[r.id]?.sending === true ? (
            <span role="status" aria-live="polite" className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <Chip status="Sending">Sending</Chip>
              <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={(e) => { e.stopPropagation(); undoSend(r.id) }}>Undo</Button>
            </span>
          ) : (
          <>
          {acted[r.id]?.sent === true && <Chip status="Sent" className="shrink-0">Sent</Chip>}
          <span
            title={when}
            className={cn(
              "t-small shrink-0 tabular-nums",
              late ? undefined : "text-muted-foreground",
              "sm:transition-opacity sm:group-hover:opacity-0 sm:group-focus-within:opacity-0 sm:group-has-[[data-state=open]]:opacity-0",
            )}
            style={late ? { color: inkOf("overdue") } : undefined}
          >
            <span aria-hidden="true">{stamp(r.received)}</span>
            <span className="sr-only">{when}</span>
          </span>
          <span
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex items-center gap-1",
              // A phone has no hover, so the row's menu is simply there beside the date (RULES.md
              // rule 4: never hover-only). Wider, the acts take the date's place while the pointer
              // or the keyboard is on the row, and the menu comes with them.
              "static opacity-100",
              // Anchored to the row, not to the date cell, so the acts have the row's width to lay
              // out in and take the date's place rather than stacking in forty pixels.
              "sm:absolute sm:top-1/2 sm:right-3 sm:-translate-y-1/2 sm:flex-nowrap sm:bg-muted sm:pl-2",
              "sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 sm:group-has-[[data-state=open]]:opacity-100",
            )}
          >
            {/* The row's own acts, drawn by what each one is: replying is the act a reply exists
                for, so it is the filled control; everything else the person came for is an outline;
                the menu behind them keeps spam and a misread report at the end, in the destructive
                colour (DESIGN.md §1). */}
            {/* The two quick acts need about 290 px and the list pane is 348 px at 1024, where they
                would cover the name as well as the first line. So below 1280 the row's menu is the
                whole strip: it carries both acts and everything else, and nothing is lost. */}
            <span className="hidden xl:flex xl:items-center">
              <Actions
                surface="card"
                items={actions.map((k) => ({
                  kind: KIND[k] ?? "secondary",
                  label: labelFor(k, r),
                  onClick: () => doAction(k, r),
                  keys: KEYS[k],
                }))}
              />
            </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-sm" variant="ghost" data-row-menu aria-label={`${r.contact}: the contact and the deal, reply, route, read as, record`}><MoreHorizontal className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-96 w-72 overflow-y-auto">
              {/* Four labelled groups, in the order the work goes: what this reply is about, how to
                  answer it, where it goes next, what it was read as, and the record. The label says
                  what is behind it (rule 4), and nothing appears twice. */}
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">The people and deals behind this reply</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => doAction("open-contact", r)}>Open {r.contact} beside the thread</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => doAction("create-deal", r)}>
                {r.dealId ? `Open ${dealOf(r)?.name ?? "the deal"} beside the thread` : "Create a deal from this reply"}
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Reply</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => doAction("reply", r)}>Reply<DropdownMenuShortcut>r</DropdownMenuShortcut></DropdownMenuItem>
              {available("book") && (
                <DropdownMenuItem onSelect={() => doAction("book", r)}>Book a meeting<DropdownMenuShortcut>b</DropdownMenuShortcut></DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={() => doAction("forward", r)}>Forward the thread</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => doAction("open-in-mailbox", r)}>
                Open in {seed.mailboxes[0]?.provider === "Microsoft 365" ? "Outlook" : "Gmail"}
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Route: who takes it, and when it comes back</DropdownMenuLabel>
              {available("hand") && aes.map((a) => (
                <DropdownMenuItem key={a.user} onSelect={() => doAction("hand", r, a.user)}>Hand to {a.user} · {a.title}</DropdownMenuItem>
              ))}
              {sdrSeats(session.business).filter((x) => x.user !== session.user).map((x) => (
                <DropdownMenuItem key={x.user} onSelect={() => doAction("assign", r, x.user)}>Assign to {x.user}</DropdownMenuItem>
              ))}
              {r.outcome === "Not now" && (
                <DropdownMenuItem onSelect={() => doAction("follow-up", r)}>Follow up on {day(r.followUpOn)}</DropdownMenuItem>
              )}
              {r.outcome === "Out of office" && (
                <DropdownMenuItem onSelect={() => doAction("resume", r)}>Resume on {day(r.returnsOn)}</DropdownMenuItem>
              )}
              {r.outcome === "Unsubscribe" && (
                <DropdownMenuItem onSelect={() => doAction("confirm-unsub", r)}>Confirm the unsubscribe<DropdownMenuShortcut>u</DropdownMenuShortcut></DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={() => doAction("done", r)}>Mark done<DropdownMenuShortcut>d</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuItem onSelect={() => doAction("not-interested", r)}>Mark not interested · ends the sequence<DropdownMenuShortcut>n</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuItem onSelect={() => doAction("remove-from-sequence", r)}>Remove from the sequence, keep the history</DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Read as {r.outcome} · change it to</DropdownMenuLabel>
              {MEANINGS.filter((m) => m !== r.outcome).map((m) => (
                <DropdownMenuItem key={m} onSelect={() => doAction("change-meaning", r, m)}>{m}</DropdownMenuItem>
              ))}
              <DropdownMenuItem variant="destructive" onSelect={() => doAction("misread", r)}>Report a misread reply</DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Record</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => doAction("note", r)}>Add a note</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => doAction("add-to-list", r)}>Add to a list</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => doAction("unread", r)}>Mark unread</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { setSelecting(true); setSelection([r.id]) }}>Select this reply<DropdownMenuShortcut>x</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => doAction("spam", r)}>Mark as spam or a bot reply</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </span>
          </>
          )}
        </span>
      </div>
    )
  }

  /* The page header's one line under the title. The template draws the title, the family icon and
     the count; everything the header used to say in its own paragraphs is said here. */
  const description = (
    <>
      <span className="block tabular-nums text-foreground">
        {waitingCount} waiting{longest > 0 && <> · longest {longest} d</>}
      </span>
      {session.business === "meridian" && (
        <span className="t-small block pt-0.5">
          You see replies to your mailbox. {admin?.user ?? "Your admin"} can widen this in Settings › Team and access.
        </span>
      )}
      {!calendar && (
        <span className="t-small block pt-0.5">
          No calendar is connected.{" "}
          <button type="button" className="underline underline-offset-4"
                  onClick={() => follow("/ollopa/settings/integrations?row=int.calendar", originHere(open?.contactId))}>
            Connect a calendar to book from here
          </button>.
        </span>
      )}
      {import.meta.env.DEV && (
        <span data-renders="inbox" className="mt-1 inline-block rounded border px-1.5 py-0.5 font-mono t-small font-normal tabular-nums">
          inbox renders: {renders}
        </span>
      )}
    </>
  )

  /* The master: the replies, one container, with the tabs, the search and the filter door in its
     header, its rows divided inside it, and what is selected in its footer. Never a card per row,
     and never a box inside it (DESIGN.md §5, containment). */
  const listPane = (
          <Container
            component="list"
            as="div"
            padded={false}
            className="flex h-full min-h-0 min-w-0 flex-col"
            actions={(
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                {/* One row where the pane has the width for it: which meaning the list is showing,
                    the search taking what is left, and the count at the end. One control per row on a
                    phone. Six meanings never fit across a 430 px pane, so they are one Select naming
                    the one in view and its count, with the rest as its options. */}
                <div className="flex w-full min-w-0 flex-col gap-2 pt-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Select value={group} onValueChange={(v) => { setGroup(v as GroupKey); setSelection([]) }}>
                    <SelectTrigger className="h-8 w-full shrink-0 sm:w-36" aria-label="What the person meant" data-inbox-group>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {groupOptions.map((g) => (
                        <SelectItem key={g.key} value={g.key}>
                          {g.key} <span className="tabular-nums">· {counts[g.key]}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* The pane is 430 px at 1440 and 348 px at 1024, so the search keeps a small
                      floor and takes whatever the meaning control and the count leave. Below that
                      floor it wraps under them rather than squeezing both (LAYOUTS.md §5). */}
                  {searchAtLevelOne && (
                    <Input aria-label="Search name, company or reply text" placeholder="Search replies" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-full min-w-0 sm:w-auto sm:grow sm:basis-20" />
                  )}
                  {shownFilters.map((f) => (
                    <Select key={f.key} value={filters[f.key] ?? "all"} onValueChange={(v) => setFilters((a) => ({ ...a, [f.key]: v }))}>
                      <SelectTrigger className="h-8 w-full text-xs sm:w-48" aria-label={f.label}><SelectValue placeholder={f.label} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{f.label}: all</SelectItem>
                        {f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ))}
                  {activeFilters.length > 0 && (
                    <Button size="sm" variant="ghost" className="shrink-0" onClick={() => setFilters({})}>
                      Clear {activeFilters.length} {activeFilters.length === 1 ? "filter" : "filters"}
                    </Button>
                  )}
                  <span className="t-small shrink-0 tabular-nums text-muted-foreground sm:ml-auto">{filtered.length} shown</span>
                </div>

                {doorFilters.length > 0 && (
                <div className="pt-1">
                <Door
                id="inbox.filters"
                label={`${searchAtLevelOne ? "Filter" : "Search and filter"} by ${doorFilters.map((f) => f.label.toLowerCase()).join(", ")}`}
                count={activeFilters.length || undefined}
                >
                <div className="flex flex-wrap items-center gap-2">
                {!searchAtLevelOne && (
                <Input aria-label="Search name, company or reply text" placeholder="Search replies" value={q} onChange={(e) => setQ(e.target.value)} className="h-8 w-56" />
                )}
                {doorFilters.map((f) => (
                <Select key={f.key} value={filters[f.key] ?? "all"} onValueChange={(v) => setFilters((a) => ({ ...a, [f.key]: v }))}>
                <SelectTrigger className="h-8 w-48 text-xs" aria-label={f.label}><SelectValue placeholder={f.label} /></SelectTrigger>
                <SelectContent>
                <SelectItem value="all">{f.label}: all</SelectItem>
                {f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
                </Select>
                ))}
                </div>
                </Door>
                </div>
                )}
              </div>
            )}
            bodyClassName="min-h-0 flex-1 overflow-y-auto"
            footer={selection.length > 0 ? (
              <>
                <span className="tabular-nums">{selection.length} selected</span>
                {/* Comparable acts on a bar, so none of them is filled. Confirming an unsubscribe cannot
                be undone, so it asks first and the affirmative carries the verb (DESIGN.md §2). */}
                <Actions
                surface="page"
                items={([
                { kind: "secondary", label: "Mark done", onClick: () => { selection.forEach((id) => { const r = rows.find((x) => x.id === id); if (r) change(id, { handled: true }, `${selection.length} replies marked done.`) }); setSelection([]) } },
                { kind: "secondary", label: "Mark not interested", onClick: () => { selection.forEach((id) => change(id, { handled: true }, `${selection.length} replies marked not interested.`)); setSelection([]) } },
                ...(aes.length > 0 && session.role === "sdr"
                ? [{ kind: "secondary" as const, label: `Hand to ${aes[0].user}`, onClick: () => { selection.forEach((id) => change(id, { handled: true, handedTo: aes[0].user }, `${selection.length} replies handed to ${aes[0].user}.`)); setSelection([]) } }]
                : []),
                ...(selection.every((id) => rows.find((r) => r.id === id)?.outcome === "Unsubscribe")
                ? [{
                kind: "secondary" as const,
                label: "Confirm unsubscribes",
                onClick: () => { selection.forEach((id) => change(id, { handled: true }, `${selection.length} unsubscribes confirmed.`)); setSelection([]) },
                irreversible: {
                title: `Confirm ${selection.length} ${selection.length === 1 ? "unsubscribe" : "unsubscribes"}?`,
                consequence: "Those addresses are never emailed from any sequence again. It cannot be undone.",
                confirmLabel: "Confirm unsubscribes",
                },
                }]
                : []),
                { kind: "secondary", label: "Export CSV", onClick: () => say(`${selection.length} replies exported as CSV.`) },
                ]) as Action[]}
                />
                <Button size="sm" variant="ghost" className="h-7" onClick={() => { setSelection([]); setSelecting(false) }}>Clear</Button>
              </>
            ) : undefined}
          >
            {filtered.length === 0
              ? <div className="p-6">{q || activeFilters.length ? <EmptyState title="Nothing matches." body="Clear the search or a filter." action={<Actions surface="card" items={[{ kind: "secondary", label: "Clear", onClick: () => { setQ(""); setFilters({}) } }]} />} /> : emptyBody}</div>
              : (
                // The grid the rows are rows of. `Section` drops a `role` it is handed, so the list
                // declares itself here rather than on the card — otherwise every `role="row"` on the
                // page is an orphan and a screen reader reads a heap of cells.
                <div role="grid" aria-label={`${group} replies`} className="divide-y">
                  {filtered.map((r) => <Row key={r.id} r={r} />)}
                </div>
              )}
          </Container>
  )

  /* The detail: the thread as the open half of the page, never a disclosure. The template puts the
     real `Split` handle between the two and, at 400, shows one of them and keeps the selection. */
  const detailPane = open ? (
    <Thread
      session={session}
      disclosure={d}
      reply={open}
      meantBy={changes[open.id]?.meantBy === "you" ? "you" : classifier(open)}
      showMeant={showMeantLine}
      onChangeMeaning={(m) => doAction("change-meaning", open, m)}
      say={say}
      onBook={() => setBooking(open)}
      focusComposer={focusComposer}
      onOpenContact={(opener) => doAction("open-contact", open, undefined, opener)}
      onOpenDeal={(opener) => doAction("create-deal", open, undefined, opener)}
    />
  ) : null

  return (
    <>
      <DoorGroup>
        <MasterDetail
          id="inbox"
          family="inbox"
          title="Inbox"
          count={waitingCount}
          description={description}
          list={listPane}
          detail={detailPane}
          selected={onPhoneThread && !!open}
          onBack={() => setOnPhoneThread(false)}
          backLabel="Back to the list"
        />
      </DoorGroup>

      {booking && (
        <MeetingPanel
          session={session}
          open
          onOpenChange={(o) => { if (!o) setBooking(null) }}
          contactId={booking.contactId}
          contactName={booking.contact}
          company={booking.company}
          meeting={null}
          dealId={booking.dealId}
          sequence={booking.sequence}
          say={say}
        />
      )}
      {bar}
    </>
  )
}

/**
 * X-thread as a deep link. The thread is the open half of the Inbox, never a page of its own, so
 * `/ollopa/inbox/<id>` renders the same page with that thread selected and the list still in view.
 */
export function ThreadRoute({ session, id }: { session: Session; id?: string }) {
  // "?meeting=new" is the one thing the query says here, and it is a real instruction rather than a
  // decoration: the page opens the meeting panel on that thread so the link does what it says.
  const route = useRoute()
  return <Inbox session={session} thread={id} book={route.query.get("meeting") === "new"} />
}
