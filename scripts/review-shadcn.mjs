// Round 11. Is this the library's look? Walks every page of the map as a seat that holds it, at two
// widths in both themes, photographs each, and reads back the five things DESIGN.md §4 can be
// checked on: what is drawn by hand rather than by a shipped component, how tall the chrome above
// the content is, whether every table and section sits in a Card, the type actually painted, and
// what the console says.
import { browser, signIn, wait, note, saveLog, dumpConsole } from "./review-chains.mjs"
import { mkdirSync } from "node:fs"

const DIR = process.env.OPD_SHOTS ?? "shots/chains/review11"

export const PAGES = [
  ["home", "meridian:sdr", "/ollopa"],
  ["sequence-record", "meridian:sdr", "/ollopa/sequences/seq-1"],
  ["deal-record", "meridian:ae", "/ollopa/deals/d-118"],
  ["contact-record", "meridian:sdr", "/ollopa/people/c-13"],
  ["connect", "meridian:admin", "/ollopa/connect/salesforce"],
]

export const inspect = (page) => page.evaluate(() => {
  const txt = (el, n = 34) => (el?.innerText ?? "").replace(/\s+/g, " ").trim().slice(0, n)
  const on = (e) => e.getClientRects().length > 0 && !e.closest("[hidden]")
  const all = Array.from(document.querySelectorAll("*")).filter(on)
  const cls = (e) => (typeof e.className === "string" ? e.className : "")

  // A · drawn by hand: a box with a border, a radius or a shadow that is not a library slot and is
  // not the immediate child of one that would explain it.
  const handDrawn = all.filter((e) => {
    if (e.hasAttribute("data-slot")) return false
    if (e.closest("svg")) return false
    const c = cls(e)
    const boxy = /\bborder(\b|-[trbl]\b|-2\b)/.test(c) || /\brounded-(md|lg|xl|2xl|full)\b/.test(c) || /\bshadow(-|\b)/.test(c)
    if (!boxy) return false
    const st = getComputedStyle(e)
    const paints = st.borderTopWidth !== "0px" || st.borderLeftWidth !== "0px" || st.boxShadow !== "none"
      || (st.backgroundColor !== "rgba(0, 0, 0, 0)" && st.backgroundColor !== "transparent")
    return paints
  }).map((e) => `${e.tagName.toLowerCase()}.${cls(e).split(" ").filter((x) => /border|rounded|shadow|bg-/.test(x)).slice(0, 3).join(".")} "${txt(e, 26)}"`)

  // B · the chrome above the content.
  const active = document.querySelector('[data-page-active="true"]')
  const firstContent = active?.querySelector("h1,h2,h3,table,[data-slot='card'],p")
  const chromeBottom = firstContent ? Math.round(firstContent.getBoundingClientRect().top) : null
  // Distinct full-width bands above the content: the header, then any strip/alert rows.
  const bands = all.filter((e) => {
    const r = e.getBoundingClientRect()
    return r.top >= 0 && r.height > 8 && r.height < 200 && r.width > window.innerWidth * 0.6
      && r.bottom <= (chromeBottom ?? 0) + 2 && (e.tagName === "HEADER" || e.getAttribute("data-slot") === "alert" || /\bborder-b\b/.test(cls(e)))
  }).map((e) => `${e.tagName.toLowerCase()}${e.getAttribute("data-slot") ? "[" + e.getAttribute("data-slot") + "]" : ""} h=${Math.round(e.getBoundingClientRect().height)} "${txt(e, 30)}"`)

  // C · containment.
  const tables = Array.from(document.querySelectorAll("table")).filter(on)
  const tablesOutside = tables.filter((t) => !t.closest('[data-slot="card"]')).map((t) => `"${txt(t.closest("section") ?? t, 30)}"`)
  const cards = Array.from(document.querySelectorAll('[data-slot="card"]')).filter(on)
  const nested = cards.filter((c) => c.parentElement?.closest('[data-slot="card"]'))
    .map((c) => `"${txt(c, 26)}" inside "${txt(c.parentElement.closest('[data-slot="card"]'), 22)}"`)
  const sections = Array.from(active?.querySelectorAll("section") ?? []).filter(on)
  const sectionsOutside = sections.filter((s) => !s.closest('[data-slot="card"]') && !s.querySelector('[data-slot="card"]'))
    .map((s) => `"${txt(s, 30)}"`)

  // D/E · type and density.
  const sizes = {}
  for (const e of all) { if (!Array.from(e.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim())) continue
    const s = Math.round(parseFloat(getComputedStyle(e).fontSize)); sizes[s] = (sizes[s] ?? 0) + 1 }
  const slots = {}
  for (const e of all) { const s = e.getAttribute("data-slot"); if (s) slots[s] = (slots[s] ?? 0) + 1 }

  return {
    theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
    handDrawn: [...new Set(handDrawn)], handDrawnCount: handDrawn.length,
    chromeBottom, bands,
    tables: tables.length, tablesOutside, cards: cards.length, nested, sectionsOutside,
    sizes: Object.entries(sizes).sort((a, b) => Number(a[0]) - Number(b[0])).map(([s, n]) => `${s}px×${n}`),
    slots: Object.entries(slots).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([s, n]) => `${s}×${n}`),
    docScrollW: document.documentElement.scrollWidth,
  }
})

const [only] = process.argv.slice(2)
for (const [name, seat, route] of PAGES) {
  if (only && only !== name) continue
  const [biz, role] = seat.split(":")
  for (const w of [1440, 400]) {
    for (const theme of ["light", "dark"]) {
      const { b, page } = await browser(w, w === 400 ? 860 : 900)
      await page.goto((process.env.OPD_BASE ?? "http://localhost:4180") + "/#/", { waitUntil: "networkidle0" })
      await page.evaluate((t) => localStorage.setItem("ollopa.theme", t), theme)
      await signIn(page, biz, role, route)
      await page.evaluate((t) => document.documentElement.classList.toggle("dark", t === "dark"), theme)
      await wait(500)
      mkdirSync(`${DIR}/${theme}`, { recursive: true })
      await page.screenshot({ path: `${DIR}/${theme}/${name}-${w}.png` })
      const o = await inspect(page)
      note(`\n== ${name} (${seat}) ${theme} ${w}`)
      note(`   A hand-drawn ${o.handDrawnCount}${o.handDrawn.length ? ": " + o.handDrawn.slice(0, 6).join(" | ") : ""}`)
      note(`   B chrome ${o.chromeBottom}px, ${o.bands.length} band(s): ${o.bands.join(" / ")}`)
      note(`   C tables ${o.tables} (outside a card: ${o.tablesOutside.length ? o.tablesOutside.join(" ") : "none"}) · cards ${o.cards} · nested ${o.nested.length ? o.nested.join(" ; ") : "none"} · sections without a card ${o.sectionsOutside.length ? o.sectionsOutside.slice(0, 3).join(" ") : "none"}`)
      note(`   D type ${o.sizes.join(" ")}`)
      note(`   E slots ${o.slots.join(" ")} · h-scroll ${o.docScrollW}`)
      dumpConsole(page, `${name} ${theme} ${w}`)
      await b.close()
    }
  }
}
saveLog(`${DIR}/logs/shadcn.txt`)
