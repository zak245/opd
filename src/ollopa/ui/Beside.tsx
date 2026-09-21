// The pane: a related object read beside the page, not instead of it.
//
// The frame is all this file is. It knows nothing about people, companies or deals: the page folder
// that owns the object registers a renderer under a kind (`besides` in its register.tsx) and this
// draws the frame around it — name, one line of context, close, "Open the page", the body, and
// previous and next when the pane was opened from a list.
//
// What the frame guarantees, so no page has to:
//   · the page shrinks to make room and stays mounted, scrollable and clickable behind it;
//   · 28 rem on a desktop, the whole width on a phone, about 200 ms, nothing under reduced motion;
//   · Escape closes, focus moves in on open and back to the thing that opened it on close;
//   · [ and ] walk the list the pane was opened from, without closing;
//   · nothing inside it opens a door, and it never opens a second pane — a related object opened
//     from in here swaps the content and leaves one "‹ back", and past that the way on is the page.
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { ChevronLeft, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRoute } from "@/app/router"
import { besideBack, besideStep, closeBeside, useBeside, useBesideParent, type BesideHead, type BesideTarget } from "../beside"
import { clearHighlight, crumbName, findAnchor, follow, showReturn } from "../chain"
import { clearEdit, useEdit } from "../edits"
import { besides } from "../Product"
import type { Session } from "../session"
import type { Page } from "../usage/model"
import { useDisclosure } from "./useDisclosure"
import { FlatProvider } from "./Door"

const MS = 200

/** Below `sm` the pane takes the whole width, so the page behind it is not on screen at all. */
function phoneWidth() {
  return typeof window !== "undefined" && window.matchMedia?.("(max-width: 639px)").matches === true
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
}

/** The name and context for a target, from the renderer the owning folder registered. */
function headFor(session: Session, target: BesideTarget): BesideHead {
  const C = besides[target.kind]
  return C?.head?.({ session, id: target.id, target }) ?? { name: target.id, context: "", route: "" }
}


/**
 * Hold a row where it is on screen while the page beside it changes width. Opening and closing the
 * pane reflows the page, which would slide the row the person is looking at up or down; this
 * watches it for the length of the transition and corrects the page's own scroll to match.
 */
function pinRow(row: HTMLElement | null, ms: number) {
  if (!row?.isConnected) return
  const scroller = row.closest<HTMLElement>("[data-page]")
  if (!scroller) return
  const start = row.getBoundingClientRect().top
  const until = performance.now() + ms
  const step = () => {
    if (!row.isConnected) return
    const drift = row.getBoundingClientRect().top - start
    if (Math.abs(drift) > 0.5) scroller.scrollTop += drift
    if (performance.now() < until) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

/**
 * Where focus goes when the pane closes and the row that opened it has gone — a task marked done, a
 * reply handled. The row that took its place in the same list, else the one before it, else the
 * list itself. Never the top of the page, and never nowhere.
 */
function tookItsPlace(target: BesideTarget, container: HTMLElement | null): HTMLElement | null {
  const list = target.list
  if (list) {
    for (let i = list.index + 1; i < list.ids.length; i++) {
      const el = findAnchor(list.ids[i])
      if (el?.isConnected) return el
    }
    for (let i = list.index - 1; i >= 0; i--) {
      const el = findAnchor(list.ids[i])
      if (el?.isConnected) return el
    }
  }
  if (container?.isConnected) {
    const next = container.querySelector<HTMLElement>("[data-item]")
    if (next) return next
  }
  return container?.isConnected ? container : null
}



/* ------------------------------------------------------------------- what the pane's fields are */

export interface PaneField {
  /** The usage-model item id for this field on the record's page: "person.title", "deal.amount". */
  item: string
  label: string
  value: ReactNode
}

/** Set by the body, read by the frame, so development can say when a pane has not asked. */
const DeclaredPage = createContext<(page: Page) => void>(() => {})

/**
 * The pane's fields: the record's own first level for this seat at this business, in the record's
 * order. Never a hand-written list — the whole point of the pane is that it is the top of the
 * record page cut short, and what sits at the top of the record page is decided by the usage model
 * and nothing else. Hand a field its usage item id and this drops the ones at level two.
 *
 * ```tsx
 * const fields = usePaneFields("people", [
 *   { item: "person.title",   label: "Title",   value: p.title },
 *   { item: "person.company", label: "Company", value: p.company },
 * ])
 * ```
 *
 * A body that renders fields without calling this gets a warning in development, because it is
 * showing one set of fields to five seats that do not use the same ones.
 */
export function usePaneFields(page: Page, fields: PaneField[]): PaneField[] {
  const d = useDisclosure(page)
  declarePaneFields(page)
  return fields.filter((f) => d.level(f.item) === 1)
}

/**
 * The same promise without the filtering: "my fields came from this page's usage model, and I did
 * the level test myself". A body that builds its fields in a shape `usePaneFields` cannot take —
 * groups, a mix of fields and cards — calls this instead, and the warning stays quiet.
 */
export function declarePaneFields(page: Page) {
  const declare = useContext(DeclaredPage)
  // Every render, not only when `page` changes: the frame asks again for each object it draws.
  useEffect(() => { declare(page) })
}

/* ------------------------------------------------------------------- what the last action did */

export interface BesideDone {
  /** What happened, in the words the row shows: "Moved to Warm inbound follow-up". */
  note: string
  /** Put it back. The pane and the row both drop the record, so neither can go on saying it. */
  onUndo: () => void
}

const DoneSlot = createContext<(done: BesideDone | null) => void>(() => {})

/**
 * A pane body calls this to put a line in the pane's footer: "Done · what happened · Undo".
 *
 * Most bodies do not need it. An action in the pane writes `recordEdit(kind, id, { note })` to the
 * shared edits store, the row behind reads it with `useEdits(kind)` and changes in place, and this
 * frame draws the same note with an Undo that clears the record — so undo is one click in the pane
 * as well as on the row. Use this hook only when undoing has to do more than drop that record.
 */
export function useBesideDone(done: BesideDone | null) {
  const set = useContext(DoneSlot)
  const note = done?.note ?? null
  useEffect(() => {
    set(note ? { note, onUndo: done!.onUndo } : null)
    return () => set(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note, set])
}

export function Beside({ session, pageTitle }: { session: Session; pageTitle: string }) {
  const target = useBeside()
  const parent = useBesideParent()
  const route = useRoute()
  // What is drawn. It outlives `target` by one closing animation, so the pane slides out with its
  // content still in it rather than emptying first.
  const [shown, setShown] = useState<BesideTarget | null>(target)
  const [open, setOpen] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  /** The row the pane is reading, and the list it sits in, for pinning and for focus on close. */
  const row = useRef<HTMLElement | null>(null)
  const rowList = useRef<HTMLElement | null>(null)
  const last = useRef<BesideTarget | null>(null)
  /** What the row behind is called, for the phone header's one line of where you came from. */
  const [fromRow, setFromRow] = useState<string | null>(null)
  const [bodyDone, setBodyDone] = useState<BesideDone | null>(null)
  /** Which page's usage model the body said its fields came from, this commit. Development only. */
  const declaredPage = useRef<Page | null>(null)
  const warned = useRef(new Set<string>())

  if (target && target !== shown) {
    // Render-phase, so the body and the header change in the same paint as the width.
    setShown(target)
  }

  useEffect(() => {
    const ms = reducedMotion() ? 0 : MS
    if (target) {
      // Opening a pane is a new answer to "which one are you on", so whatever a return lit three
      // seconds ago goes out: the marked row behind the pane is the only mark left.
      clearHighlight()
      opener.current = target.opener ?? opener.current
      last.current = target
      pinRow(row.current ?? opener.current, ms + 60)
      const id = requestAnimationFrame(() => setOpen(true))
      return () => cancelAnimationFrame(id)
    }
    setOpen(false)
    pinRow(row.current ?? opener.current, ms + 60)
    const t = window.setTimeout(() => setShown(null), ms)
    return () => window.clearTimeout(t)
  }, [target])

  // Focus in on open, and back to the row that opened it on close.
  const wasOpen = useRef(false)
  useLayoutEffect(() => {
    if (target && !wasOpen.current) {
      wasOpen.current = true
      panel.current?.focus()
      // A pane opened from a "…" menu loses the focus again a moment later: the menu puts focus
      // back on its own trigger as it closes, and it does that whenever it finishes closing, not
      // on a frame we can name. So for a third of a second after the pane opens, any focus that
      // lands outside it comes back — unless the person has said otherwise by pressing a key or
      // a pointer, which stops this at once and leaves focus exactly where they put it.
      let theirs = false
      const stop = () => { theirs = true }
      const grab = () => {
        const el = panel.current
        if (theirs || !el || el.contains(document.activeElement)) return
        el.focus()
      }
      document.addEventListener("pointerdown", stop, true)
      document.addEventListener("keydown", stop, true)
      document.addEventListener("focusin", grab)
      const until = window.setTimeout(stop, 350)
      return () => {
        window.clearTimeout(until)
        document.removeEventListener("pointerdown", stop, true)
        document.removeEventListener("keydown", stop, true)
        document.removeEventListener("focusin", grab)
      }
    }
    if (!target && wasOpen.current) {
      wasOpen.current = false
      const back = opener.current
      const gone = last.current
      opener.current = null
      // On a phone the pane covered the page, so coming back is a return: the row is scrolled back
      // into view and lit, not merely focused. On a desktop the row never left the screen and a
      // flash would be noise. The anchor goes in by id, so focus lands on the row's own name.
      if (phoneWidth() && gone && findAnchor(gone.id)) { showReturn(gone.id); return }
      if (back?.isConnected) { back.focus(); return }
      // The row that opened the pane has been acted on and removed. Focus does not fall to the top
      // of the page: it goes to whatever took that row's place, lit the same way a return is.
      const next = gone ? tookItsPlace(gone, rowList.current) : null
      if (next) showReturn(next)
    }
  }, [target])

  // Mark the row the pane is reading, on the page itself, so the effect shows where it was caused.
  // Written straight to the DOM on purpose: asking the page for it would re-render the page, which
  // is the one thing opening a pane must not do.
  useEffect(() => {
    if (!target) return
    const root = document.querySelector<HTMLElement>('[data-page-active="true"]') ?? document.body
    const hit = Array.from(root.querySelectorAll<HTMLElement>(`[data-item="${CSS.escape(target.id)}"]`))
      .find((el) => el.offsetParent !== null)
    const marked = (hit?.closest("tr, li") as HTMLElement | null) ?? hit
    row.current = marked ?? null
    rowList.current = marked?.parentElement ?? null
    setFromRow(hit?.getAttribute("data-item-label") ?? hit?.textContent?.trim().split("\n")[0].slice(0, 40) ?? null)
    marked?.classList.add("ollopa-beside-open")
    return () => marked?.classList.remove("ollopa-beside-open")
  }, [target])

  // The keyboard runs the lap from anywhere on the page, not only from inside the pane.
  useEffect(() => {
    if (!target) return
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === "Escape") { e.preventDefault(); closeBeside(); return }
      if (typing) return
      if (e.key === "[") { e.preventDefault(); besideStep(-1) }
      if (e.key === "]") { e.preventDefault(); besideStep(1) }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [target])

  // The frame is inside a hook-free branch below, so read the store before the early return.
  const recorded = useEdit(shown?.kind ?? "", shown?.id ?? "")

  // Development only. Child effects run before this one, so a body that called `usePaneFields` has
  // already said which page it read. One warning per kind; nothing of this exists in a build.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const kind = shown?.kind
    if (kind && !declaredPage.current && !warned.current.has(kind)) {
      warned.current.add(kind)
      console.warn(
        `[ollopa] The "${kind}" pane draws its fields without saying which page's usage model they came from. ` +
        "Build them with usePaneFields(page, items) so the pane shows this seat's first level and not a fixed list.",
      )
    }
    declaredPage.current = null
  })

  if (!shown) return null

  const head = headFor(session, shown)
  // "Done · what happened · Undo". The default comes from the shared edits store — the same record
  // the row behind is reading, so the pane and the row can never say different things — and a body
  // with more to undo than that record replaces it with `useBesideDone`.
  const done: BesideDone | null = bodyDone
    ?? (typeof recorded?.note === "string"
      ? { note: recorded.note, onUndo: () => clearEdit(shown.kind, shown.id) }
      : null)
  const Body = besides[shown.kind]
  const list = shown.list
  const hasPrev = !!list && list.index > 0
  const hasNext = !!list && list.index < list.ids.length - 1
  const parentHead = parent ? headFor(session, parent) : null

  const declarePage = (page: Page) => { declaredPage.current = page }

  const openPage = () => {
    if (!head.route) return
    // The trail remembers the row this pane came from, so the crumb lands back on it.
    follow(head.route, { route: route.raw, title: pageTitle, anchor: shown.id })
  }

  return (
    <aside
      data-beside={shown.kind}
      aria-label={`${head.name}, beside ${pageTitle}`}
      style={{ width: open ? "min(100%, 28rem)" : 0 }}
      className={cn(
        "z-40 shrink-0 overflow-hidden border-l bg-background",
        "transition-[width] duration-200 ease-out motion-reduce:transition-none",
        "max-sm:absolute max-sm:inset-y-0 max-sm:right-0",
      )}
    >
      <div ref={panel} tabIndex={-1} className="flex h-full w-[min(100vw,28rem)] flex-col outline-none">
        <header className="shrink-0 border-b px-4 py-3">
          {parentHead && (
            <button
              type="button"
              className="mb-1 -ml-1 inline-flex items-center gap-1 rounded px-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={besideBack}
            >
              <ChevronLeft className="size-3" aria-hidden="true" />
              {parentHead.name}
            </button>
          )}
          {/* On a phone the pane covers the page, so the header says what it is covering. */}
          <p className="mb-1 truncate text-xs text-muted-foreground sm:hidden">
            From {crumbName(pageTitle)}{fromRow ? ` · row ${fromRow}` : ""}
          </p>
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold">{head.name}</h2>
              {head.context && <p className="truncate text-xs text-muted-foreground">{head.context}</p>}
            </div>
            <Button variant="ghost" size="icon" className="-mr-1 size-7 shrink-0" aria-label="Close (Esc)" onClick={closeBeside}>
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>
          {head.route && (
            <Button size="sm" variant="outline" className="mt-2 w-full" onClick={openPage}>Open the page</Button>
          )}
        </header>

        {/* Flat by construction: a door rendered in here renders in place instead. */}
        <FlatProvider value={true}>
          <DoneSlot.Provider value={setBodyDone}>
          <DeclaredPage.Provider value={declarePage}>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm">
            {Body ? <Body session={session} id={shown.id} target={shown} /> : (
              <p className="text-muted-foreground">Nothing is registered to show a {shown.kind} here yet.</p>
            )}
          </div>
          </DeclaredPage.Provider>
          </DoneSlot.Provider>
        </FlatProvider>

        {done && (
          <div role="status" className="flex shrink-0 items-baseline gap-2 border-t bg-muted/60 px-4 py-2 text-xs">
            <span className="min-w-0 flex-1">Done · {done.note}</span>
            <button type="button" className="shrink-0 font-medium underline underline-offset-4" onClick={done.onUndo}>Undo</button>
          </div>
        )}

        {list && (
          <footer className="flex shrink-0 items-center gap-2 border-t px-4 py-2">
            <Button size="sm" variant="ghost" disabled={!hasPrev} onClick={() => besideStep(-1)}>
              Previous
              <kbd className="ml-1 rounded border px-1 font-mono text-[10px]">[</kbd>
            </Button>
            <span className="text-xs tabular-nums text-muted-foreground">{list.index + 1} of {list.ids.length}</span>
            <Button size="sm" variant="ghost" className="ml-auto" disabled={!hasNext} onClick={() => besideStep(1)}>
              Next
              <kbd className="ml-1 rounded border px-1 font-mono text-[10px]">]</kbd>
            </Button>
          </footer>
        )}
      </div>
    </aside>
  )
}
