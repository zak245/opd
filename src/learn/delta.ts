// The delta: what moved between two steps, found by comparing the stage's DOM before and after.
//
// The rules this file exists to keep (PLAN.md §4, "things learned building it"):
//   - Only real moves are marked: a change of container, or a change of order inside one. A thing
//     that shifts down because something above it left is not a move, so order is compared over the
//     items the two steps have in common, not by raw index.
//   - Ghosts go in the flow, at the old index inside the old container, never as an overlay at old
//     coordinates: an overlay sits on top of the new layout and is unreadable.
//   - A ghost is a clone of the thing as it was (`outerHTML` captured before the change). Nothing is
//     ever drawn by hand a second time.
//   - "Is it hidden" is answered by "is an ancestor door or container closed", never by measuring
//     size: a closed door keeps its content in the DOM and the browser reports stale boxes for it.
//
// A page makes this work by tagging: `data-item` on every thing, `data-container` +
// `data-container-label` on every place a thing can live. `Door` tags itself.

/** How a thing stood at one step. */
export interface ItemSnap {
  id: string
  /** For captions and tags: `data-item-label`, else the thing's own text, shortened. */
  label: string
  /** The id of the nearest enclosing `[data-container]`, or "root" for the page itself. */
  container: string
  containerLabel: string
  /** Position among the items of that container, in document order. */
  rank: number
  /** True when an ancestor door or container is closed. */
  hidden: boolean
  x: number
  y: number
  html: string
}

export type Snap = Map<string, ItemSnap>

export type MoveKind = "container" | "order" | "new" | "gone"

export interface Move {
  id: string
  kind: MoveKind
  from?: ItemSnap
  to?: ItemSnap
}

export const ROOT = "root"

/** Open or close a door by id, from anywhere: the event `Door` listens for. */
export function openDoor(id: string, open = true) {
  document.dispatchEvent(new CustomEvent("ollopa:door", { detail: { id, open } }))
}

function labelOf(el: HTMLElement): string {
  const explicit = el.getAttribute("data-item-label")
  if (explicit) return explicit
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim()
  if (!text) return el.getAttribute("data-item") ?? "it"
  return text.length > 34 ? text.slice(0, 33) + "…" : text
}

function hiddenFrom(el: HTMLElement, root: HTMLElement): boolean {
  let p: HTMLElement | null = el.parentElement
  while (p && p !== root.parentElement) {
    if ((p.hasAttribute("data-door") || p.hasAttribute("data-container")) && p.getAttribute("data-open") === "false") return true
    p = p.parentElement
  }
  return false
}

/** Every tagged thing on the stage, where it sits and whether it can be seen. */
export function snapshot(root: HTMLElement | null): Snap {
  const out: Snap = new Map()
  if (!root) return out
  const rootRect = root.getBoundingClientRect()
  const ranks = new Map<string, number>()
  for (const el of Array.from(root.querySelectorAll<HTMLElement>("[data-item]"))) {
    const id = el.getAttribute("data-item")
    if (!id || out.has(id)) continue
    if (el.closest("[data-lesson-ghost]")) continue
    const holder = el.parentElement?.closest<HTMLElement>("[data-container]") ?? null
    const container = holder?.getAttribute("data-container") || ROOT
    const containerLabel = holder?.getAttribute("data-container-label") || "the page"
    const rank = ranks.get(container) ?? 0
    ranks.set(container, rank + 1)
    const r = el.getBoundingClientRect()
    out.set(id, {
      id,
      label: labelOf(el),
      container,
      containerLabel,
      rank,
      hidden: hiddenFrom(el, root),
      x: r.left - rootRect.left,
      y: r.top - rootRect.top,
      html: el.outerHTML,
    })
  }
  return out
}

/** The ids of `a` that are in the same order in `b`, longest run first. Small lists, plain O(n²). */
function longestCommonOrder(a: string[], b: string[]): Set<string> {
  const n = a.length
  const m = b.length
  const table: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
    }
  }
  const keep = new Set<string>()
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) { keep.add(a[i]); i++; j++ }
    else if (table[i + 1][j] >= table[i][j + 1]) i++
    else j++
  }
  return keep
}

/** What changed between two steps. */
export function diff(before: Snap, after: Snap): Move[] {
  const moves: Move[] = []
  const orderChanged = new Set<string>()

  // Order, container by container, over the items both steps put in that container. An item that
  // simply closed a gap left by a departure keeps its place in that common order and is not a move.
  const containers = new Set<string>([...before.values()].map((s) => s.container))
  for (const c of containers) {
    const stayed = (snap: Snap) =>
      [...snap.values()]
        .filter((s) => s.container === c && before.get(s.id)?.container === c && after.get(s.id)?.container === c)
        .sort((x, y) => x.rank - y.rank)
        .map((s) => s.id)
    const b = stayed(before)
    const a = stayed(after)
    if (b.length < 2) continue
    const keep = longestCommonOrder(b, a)
    for (const id of b) if (!keep.has(id)) orderChanged.add(id)
  }

  for (const [id, b] of before) {
    const a = after.get(id)
    if (!a) { moves.push({ id, kind: "gone", from: b }); continue }
    if (a.container !== b.container) { moves.push({ id, kind: "container", from: b, to: a }); continue }
    if (orderChanged.has(id)) moves.push({ id, kind: "order", from: b, to: a })
  }
  for (const [id, a] of after) if (!before.has(id)) moves.push({ id, kind: "new", to: a })
  return moves
}

// ---------------------------------------------------------------- drawing the delta on the stage

const SLIDE_MS = 1000
const HIGHLIGHT_MS = 3000

let timers: number[] = []

/** Take every mark off the stage: ghosts, door tags, highlights. Called before each snapshot. */
export function clearDelta(root: HTMLElement | null) {
  timers.forEach((t) => window.clearTimeout(t))
  timers = []
  if (!root) return
  root.querySelectorAll("[data-lesson-ghost], [data-lesson-left]").forEach((n) => n.remove())
  root.querySelectorAll(".lesson-moved").forEach((n) => n.classList.remove("lesson-moved", "lesson-moved-stay"))
}

function find(root: HTMLElement, attr: string, value: string): HTMLElement | null {
  return root.querySelector<HTMLElement>(`[${attr}="${CSS.escape(value)}"]`)
}

/** The element that holds a container's items, and the door around it when there is one. */
function holderFor(root: HTMLElement, container: string) {
  if (container === ROOT) return { holder: root, door: null as HTMLElement | null }
  const holder = find(root, "data-container", container)
  return { holder, door: find(root, "data-door", container) }
}

/** Highlight the real thing where it is now, opening every door between it and the page. */
export function showMe(root: HTMLElement | null, id: string) {
  if (!root) return
  const el = find(root, "data-item", id)
  if (!el) return
  const doors: string[] = []
  let p: HTMLElement | null = el.parentElement
  while (p && p !== root.parentElement) {
    if (p.hasAttribute("data-door") && p.getAttribute("data-open") === "false") doors.push(p.getAttribute("data-door")!)
    p = p.parentElement
  }
  doors.forEach((d) => openDoor(d, true))
  const flash = () => {
    el.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
    el.classList.remove("lesson-moved")
    void el.offsetWidth
    el.classList.add("lesson-moved")
    timers.push(window.setTimeout(() => el.classList.remove("lesson-moved"), HIGHLIGHT_MS))
  }
  if (doors.length) timers.push(window.setTimeout(flash, 120))
  else flash()
}

function buildGhost(snap: ItemSnap, caption: string, onShowMe: (() => void) | null): HTMLElement {
  const ghost = document.createElement("div")
  ghost.setAttribute("data-lesson-ghost", snap.id)
  ghost.className = "lesson-ghost"

  const body = document.createElement("div")
  body.className = "lesson-ghost-body"
  body.setAttribute("aria-hidden", "true")
  body.innerHTML = snap.html
  // A ghost is a picture, not a second copy of the thing: it carries no tags and no focus stops.
  body.querySelectorAll("[data-item], [data-container], [data-door], [id]").forEach((x) => {
    x.removeAttribute("data-item")
    x.removeAttribute("data-container")
    x.removeAttribute("data-door")
    x.removeAttribute("id")
  })
  body.querySelectorAll<HTMLElement>("a, button, input, select, textarea, [tabindex]").forEach((x) => {
    x.setAttribute("tabindex", "-1")
    if (x instanceof HTMLButtonElement || x instanceof HTMLInputElement || x instanceof HTMLSelectElement || x instanceof HTMLTextAreaElement) x.disabled = true
  })

  const cap = document.createElement("p")
  cap.className = "lesson-ghost-caption"
  const words = document.createElement("span")
  words.textContent = caption
  cap.append(words)
  if (onShowMe) {
    const button = document.createElement("button")
    button.type = "button"
    button.className = "lesson-ghost-button"
    button.textContent = "Show me"
    button.addEventListener("click", onShowMe)
    cap.append(button)
  }

  ghost.append(body, cap)
  return ghost
}

function insertAtRank(holder: HTMLElement, ghost: HTMLElement, rank: number) {
  const here = Array.from(holder.querySelectorAll<HTMLElement>("[data-item], [data-lesson-ghost]")).filter(
    (el) => (el.parentElement?.closest("[data-container], [data-lesson-ghost]") ?? holder) === holder && !el.closest("[data-lesson-ghost]"),
  )
  const target = here[rank]
  if (!target) { holder.append(ghost); return }
  let node: HTMLElement = target
  while (node.parentElement && node.parentElement !== holder) node = node.parentElement
  if (node.parentElement === holder) holder.insertBefore(ghost, node)
  else holder.append(ghost)
}

/** "↑ left: Tax rate" on the place a thing left, so a closed door still says something went. */
function tagContainer(root: HTMLElement, container: string, name: string) {
  const { holder, door } = holderFor(root, container)
  if (!holder || container === ROOT) return
  const host = door ?? holder
  let tag = host.querySelector<HTMLElement>(":scope > [data-lesson-left]")
  if (!tag) {
    tag = document.createElement("p")
    tag.setAttribute("data-lesson-left", "")
    tag.className = "lesson-left"
    if (door) door.insertBefore(tag, door.firstElementChild?.nextElementSibling ?? null)
    else {
      // Under the place's own heading, never above it.
      const first = holder.firstElementChild
      const heading = first && /^H[1-6]$/.test(first.tagName) ? first : null
      if (heading) heading.after(tag)
      else holder.prepend(tag)
    }
  }
  const names = (tag.dataset.names ? tag.dataset.names + ", " : "") + name
  tag.dataset.names = names
  tag.textContent = `↑ left: ${names}`
}

export interface DeltaOptions {
  /** Ghosts and highlights stay until the next step. Off: they fade after the highlight. */
  trace: boolean
  /** Slow motion doubles every duration. */
  slow: boolean
}

/**
 * Draw the change: ghosts where things were, a tag on what they left, a glow where they are now, and
 * a slide from the old box to the new one. Call it right after the step has rendered, with the
 * snapshot taken before it did.
 */
export function applyDelta(root: HTMLElement | null, before: Snap, opts: DeltaOptions): Move[] {
  if (!root) return []
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const k = opts.slow ? 2 : 1
  const mid = snapshot(root)
  const moves = diff(before, mid)

  // Ghosts first, so the final measurement includes the room they take in the flow.
  for (const move of moves) {
    if (move.kind !== "container" && move.kind !== "gone") continue
    const from = move.from!
    const { holder } = holderFor(root, from.container)
    if (!holder) continue
    const to = move.to
    const caption = !to
      ? "was here → gone at this step"
      : to.container === ROOT
        ? "was here → now on the page itself"
        : to.hidden
          ? `was here → now behind ${to.containerLabel}`
          : `was here → now in ${to.containerLabel}`
    const ghost = buildGhost(from, caption, to ? () => showMe(root, move.id) : null)
    insertAtRank(holder, ghost, from.rank)
    tagContainer(root, from.container, from.label)
  }

  // Where things are now, with the ghosts in place.
  const after = snapshot(root)

  for (const move of moves) {
    if (move.kind === "gone") continue
    const el = find(root, "data-item", move.id)
    if (!el || after.get(move.id)?.hidden) continue
    el.classList.add("lesson-moved")
    if (opts.trace) el.classList.add("lesson-moved-stay")
  }

  // The slide: from the box it had to the box it has. Only things that can be seen at both ends.
  if (!reduce) {
    for (const [id, a] of after) {
      const b = before.get(id)
      const el = find(root, "data-item", id)
      if (!el || !b || a.hidden || b.hidden) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      if (Math.abs(dx) + Math.abs(dy) < 2) continue
      el.style.transition = "none"
      el.style.transform = `translate(${dx}px, ${dy}px)`
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transition = `transform ${SLIDE_MS * k}ms cubic-bezier(.2,.7,.2,1)`
        el.style.transform = ""
        timers.push(window.setTimeout(() => { el.style.transition = "" }, SLIDE_MS * k + 50))
      }))
    }
  }

  if (!opts.trace) {
    timers.push(window.setTimeout(() => {
      root.querySelectorAll(".lesson-moved").forEach((n) => n.classList.remove("lesson-moved"))
      root.querySelectorAll("[data-lesson-ghost], [data-lesson-left]").forEach((n) => {
        n.classList.add("lesson-fade")
        timers.push(window.setTimeout(() => n.remove(), 600))
      })
    }, HIGHLIGHT_MS * k))
  }

  return moves
}

/** One sentence for the delta list in the side panel. */
export function moveSentence(move: Move): string {
  switch (move.kind) {
    case "container":
      return `${move.from!.label}: ${move.from!.container === ROOT ? "the page" : move.from!.containerLabel} → ${move.to!.container === ROOT ? "the page" : move.to!.containerLabel}`
    case "order":
      return `${move.from!.label}: moved within ${move.to!.container === ROOT ? "the page" : move.to!.containerLabel}`
    case "new":
      return `${move.to!.label}: new here`
    case "gone":
      return `${move.from!.label}: gone from ${move.from!.container === ROOT ? "the page" : move.from!.containerLabel}`
  }
}
