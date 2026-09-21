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
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ChevronLeft, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRoute } from "@/app/router"
import { besideBack, besideStep, closeBeside, useBeside, useBesideParent, type BesideHead, type BesideTarget } from "../beside"
import { follow } from "../chain"
import { besides } from "../Product"
import type { Session } from "../session"
import { FlatProvider } from "./Door"

const MS = 200

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
}

/** The name and context for a target, from the renderer the owning folder registered. */
function headFor(session: Session, target: BesideTarget): BesideHead {
  const C = besides[target.kind]
  return C?.head?.({ session, id: target.id, target }) ?? { name: target.id, context: "", route: "" }
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

  if (target && target !== shown) {
    // Render-phase, so the body and the header change in the same paint as the width.
    setShown(target)
  }

  useEffect(() => {
    if (target) {
      opener.current = target.opener ?? opener.current
      const id = requestAnimationFrame(() => setOpen(true))
      return () => cancelAnimationFrame(id)
    }
    setOpen(false)
    const t = window.setTimeout(() => setShown(null), reducedMotion() ? 0 : MS)
    return () => window.clearTimeout(t)
  }, [target])

  // Focus in on open, and back to the row that opened it on close.
  const wasOpen = useRef(false)
  useLayoutEffect(() => {
    if (target && !wasOpen.current) { wasOpen.current = true; panel.current?.focus() }
    if (!target && wasOpen.current) {
      wasOpen.current = false
      const back = opener.current
      opener.current = null
      if (back?.isConnected) back.focus()
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
    const row = (hit?.closest("tr, li") as HTMLElement | null) ?? hit
    row?.classList.add("ollopa-beside-open")
    return () => row?.classList.remove("ollopa-beside-open")
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

  if (!shown) return null

  const head = headFor(session, shown)
  const Body = besides[shown.kind]
  const list = shown.list
  const hasPrev = !!list && list.index > 0
  const hasNext = !!list && list.index < list.ids.length - 1
  const parentHead = parent ? headFor(session, parent) : null

  const openPage = () => {
    if (!head.route) return
    // The trail remembers the row this pane came from, so the crumb lands back on it.
    follow(head.route, { route: route.raw, title: pageTitle, anchor: shown.id })
  }

  return (
    <aside
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
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm">
            {Body ? <Body session={session} id={shown.id} target={shown} /> : (
              <p className="text-muted-foreground">Nothing is registered to show a {shown.kind} here yet.</p>
            )}
          </div>
        </FlatProvider>

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
