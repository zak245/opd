// See the product. Runs the scene catalogue and writes a contact sheet of images.
//
//   npm run see              every scene, every width, every theme
//   npm run see -- settings  only the scenes whose id starts with "settings"
//
// It starts its own preview on 4200, so it never fights another builder's server, and it writes:
//   shots/see/<id>-<width>-<theme>.png   one image per scene per width per theme
//   shots/see/manifest.json              what was shot and what was measured
//   shots/see/index.html                 the contact sheet, grouped by page
//
// The measurements are the things a picture makes you ask about: how much chrome sits above the
// page, how many cards there are and whether any nests inside another, how much text is clipped,
// how many things scroll sideways, and where the focus ended up.
import puppeteer from "puppeteer-core"
import { spawn } from "node:child_process"
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs"
import { SCENES } from "./scenes.mjs"

const OUT = "shots/see"
const PORT = Number(process.env.OPD_PORT ?? 4200)
const BASE = `http://localhost:${PORT}`
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const filter = process.argv.slice(2).find((a) => !a.startsWith("-"))

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// ------------------------------------------------------------------------------- the preview

async function up() {
  const server = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
    stdio: "ignore", detached: false,
  })
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE + "/")
      if (r.ok) return server
    } catch { /* not yet */ }
    await wait(500)
  }
  server.kill()
  throw new Error(`the preview never answered on ${BASE}`)
}

// ------------------------------------------------------------------------------- the steps

/** A row's own menu button, never the toolbar's: rows first, and the page's menus only as a last
 *  resort, so "row 1" means the first row and not the control above the table. */
const ROW_MENU = '[data-page-active="true"] tbody tr button[aria-haspopup="menu"], [data-page-active="true"] li button[aria-haspopup="menu"], [data-page-active="true"] [data-item] button[aria-haspopup="menu"]'
const MENU = '[data-page-active="true"] button[aria-haspopup="menu"]'

/** The nth visible match of the first selector that matches anything at all. */
async function firstOf(page, selectors, n = 1) {
  for (const sel of selectors) {
    const el = await visible(page, sel, n)
    if (el) return el
  }
  return null
}

async function visible(page, selector, n = 1) {
  const handles = await page.$$(selector)
  const shown = []
  for (const h of handles) {
    const box = await h.boundingBox()
    if (box && box.width > 0 && box.height > 0) shown.push(h)
  }
  return shown[n - 1] ?? null
}

async function clickByText(page, text) {
  const hit = await page.evaluateHandle((t) => {
    const want = t.toLowerCase()
    const all = Array.from(document.querySelectorAll('button, a, [role="tab"], [role="radio"], [role="menuitem"]'))
    return all.find((el) => el.offsetParent !== null && (
      (el.textContent || "").trim().toLowerCase().includes(want)
      || (el.getAttribute("aria-label") || "").toLowerCase().includes(want)
    )) ?? null
  }, text)
  const el = hit.asElement()
  if (!el) return false
  await el.click()
  return true
}

async function run(page, step, notes) {
  switch (step.do) {
    case "wait": return wait(step.ms)
    case "press": return page.keyboard.press(step.key)
    case "scroll": {
      await page.evaluate((y) => { (document.querySelector("#ollopa-main") ?? document.scrollingElement).scrollBy(0, y) }, step.y)
      return wait(250)
    }
    case "hover": {
      const el = await visible(page, step.selector)
      if (!el) return notes.push(`nothing to hover: ${step.selector}`)
      return el.hover()
    }
    case "focus": {
      const el = await visible(page, step.selector)
      if (!el) return notes.push(`nothing to focus: ${step.selector}`)
      return el.evaluate((n) => n.focus())
    }
    case "click": {
      const el = await visible(page, step.selector)
      if (!el) return notes.push(`nothing to click: ${step.selector}`)
      return el.click()
    }
    case "clickText": {
      const ok = await clickByText(page, step.text)
      if (!ok) notes.push(`no control called "${step.text}"`)
      return wait(250)
    }
    case "openMenu": {
      const el = await firstOf(page, [ROW_MENU, MENU], step.row)
      if (!el) return notes.push(`no row menu ${step.row}`)
      await el.click()
      return wait(300)
    }
    case "openPane": {
      const el = await firstOf(page, [ROW_MENU, MENU], step.row)
      if (!el) return notes.push(`no row menu ${step.row}`)
      await el.click()
      await wait(300)
      const opened = await page.evaluate(() => {
        const item = Array.from(document.querySelectorAll('[role="menuitem"]')).find((x) => /beside/i.test(x.textContent || ""))
        if (!item) return false
        item.click(); return true
      })
      if (!opened) { await page.keyboard.press("Escape"); notes.push("no beside item in the row menu") }
      return wait(400)
    }
    case "next": {
      await page.keyboard.press("]")
      return wait(300)
    }
    case "inPaneStep": {
      // The pane is flat by construction, so a door inside it renders in place. A step deeper is
      // therefore the pane's own act, and only if it has neither is there nothing to show.
      const done = await page.evaluate(() => {
        const pane = document.querySelector("aside[data-beside]")
        if (!pane) return "no pane"
        const door = pane.querySelector('[data-door] button[aria-expanded="false"]')
        if (door) { door.click(); return true }
        // Not the header's own controls: close, previous, next, and the one that widens the pane.
        // Those are the frame; a step deeper is something the body offers.
        const act = Array.from(pane.querySelectorAll("button")).find((b) =>
          b.offsetParent !== null && !b.hasAttribute("aria-expanded")
          && !/close|previous|next/i.test(b.getAttribute("aria-label") || "") && (b.textContent || "").trim())
        if (act) { act.click(); return true }
        return "nothing to step into inside the pane"
      })
      if (done !== true) notes.push(String(done))
      return wait(300)
    }
    case "expandPane": {
      const done = await page.evaluate(() => {
        const pane = document.querySelector("aside[data-beside]")
        if (!pane) return "no pane"
        const control = pane.querySelector("header button[aria-expanded]")
        if (!control) return "no widen control in the pane header"
        control.click()
        return true
      })
      if (done !== true) notes.push(String(done))
      return wait(400)
    }
    case "openDialog": {
      const ok = await clickByText(page, step.label)
      if (!ok) notes.push(`no act called "${step.label}"`)
      return wait(400)
    }
    case "openDoor": {
      const done = await page.evaluate((label) => {
        const doors = Array.from(document.querySelectorAll('[data-page-active="true"] [data-door] button[aria-expanded="false"]'))
        const hit = label ? doors.find((d) => (d.textContent || "").toLowerCase().includes(label.toLowerCase())) : doors[0]
        if (!hit) return false
        hit.click(); return true
      }, step.label ?? null)
      if (!done) notes.push("no closed door on the page")
      return wait(350)
    }
    case "expandAll": {
      const ok = await clickByText(page, "Expand all")
      if (!ok) notes.push("no Expand all on the page")
      return wait(500)
    }
    case "openPalette": {
      await page.keyboard.down("Meta"); await page.keyboard.press("k"); await page.keyboard.up("Meta")
      return wait(400)
    }
    case "openBell": {
      const el = await visible(page, 'button[aria-label^="Notifications"]')
      if (!el) return notes.push("no bell")
      await el.click()
      return wait(400)
    }
    case "quickLook": {
      const el = await firstOf(page, ['[data-page-active="true"] tbody tr', '[data-page-active="true"] [data-item]'], step.row)
      if (!el) return notes.push(`no row ${step.row} to glance at`)
      await el.click()
      return wait(400)
    }
    case "dragDivider": {
      const box = await page.evaluate(() => {
        const h = document.querySelector('[data-slot="resizable-handle"], [data-inbox-divider], [role="separator"][aria-orientation="vertical"]')
        if (!h) return null
        const r = h.getBoundingClientRect()
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
      })
      if (!box) return notes.push("the inbox split has no draggable divider")
      await page.mouse.move(box.x, box.y)
      await page.mouse.down()
      await page.mouse.move(box.x + step.px, box.y, { steps: 12 })
      await page.mouse.up()
      return wait(300)
    }
    case "dragCard": {
      // The board paints its columns after the first frame, so give it a second chance before
      // deciding there is nothing to pick up.
      const findCards = () => page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('[data-card-id]')).filter((c) => c.offsetParent !== null)
        const cols = Array.from(document.querySelectorAll('[data-column], [data-stage-column]')).filter((c) => c.offsetParent !== null)
        const at = (el) => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + 20 } }
        return { card: cards[0] ? at(cards[0]) : null, columns: cols.map(at) }
      })
      let boxes = await findCards()
      if (!boxes.card) { await wait(1200); boxes = await findCards() }
      if (!boxes.card) return notes.push("no deal card to pick up")
      const target = boxes.columns[step.to - 1] ?? { x: boxes.card.x + 320, y: boxes.card.y }
      await page.mouse.move(boxes.card.x, boxes.card.y)
      await page.mouse.down()
      await page.mouse.move(target.x, target.y + 60, { steps: 16 })
      // held, not dropped: the picture is the card in the air
      return wait(300)
    }
    case "follow": {
      const el = await firstOf(page, ['[data-page-active="true"] tbody tr a', '[data-page-active="true"] [data-item] a', '[data-page-active="true"] tbody tr button[data-open]'], step.row)
      if (el) { await el.click(); return wait(700) }
      const ok = await page.evaluate((n) => {
        const rows = Array.from(document.querySelectorAll('[data-page-active="true"] tbody tr')).filter((r) => r.offsetParent !== null)
        const link = rows[n - 1]?.querySelector("a")
        if (!link) return false
        link.click(); return true
      }, step.row)
      if (!ok) notes.push(`no link on row ${step.row} to follow`)
      return wait(700)
    }
    case "returnBack": {
      const ok = await page.evaluate(() => {
        const nav = document.querySelector('nav[aria-label="Your path"]')
        const b = Array.from(nav?.querySelectorAll("button") ?? []).find((x) => x.offsetParent !== null)
        if (!b) return false
        b.click(); return true
      })
      if (!ok) notes.push("no crumb to go back to")
      return wait(600)
    }
    case "openSheet": {
      const el = await visible(page, 'button[data-sidebar="trigger"], button[aria-label="Toggle Sidebar"]')
      if (!el) return notes.push("no sidebar trigger")
      await el.click()
      return wait(400)
    }
    default:
      return notes.push(`unknown step: ${step.do}`)
  }
}

// ------------------------------------------------------------------------------- the measuring

async function measure(page) {
  return page.evaluate(() => {
    const main = document.querySelector("#ollopa-main")
    const chrome = main ? Math.round(main.getBoundingClientRect().top) : null
    const cards = Array.from(document.querySelectorAll('[data-slot="card"]'))
    const nested = cards.filter((c) => c.parentElement?.closest('[data-slot="card"]')).length
    // Text that does not fit the box it is in: the box is narrower than its own content and it hides
    // the rest. A scroller is not clipping — it is offering.
    let clipped = 0
    let sideways = 0
    for (const el of document.querySelectorAll("*")) {
      const cs = getComputedStyle(el)
      if (cs.display === "none" || cs.visibility === "hidden") continue
      const over = el.scrollWidth - el.clientWidth
      if (over <= 1 || el.clientWidth === 0) continue
      const x = cs.overflowX
      if (x === "auto" || x === "scroll") { sideways++; continue }
      if (x === "hidden" || x === "clip" || cs.textOverflow === "ellipsis") {
        if ((el.textContent || "").trim().length > 0) clipped++
      }
    }
    const doc = document.scrollingElement
    const pageScrollsSideways = doc ? doc.scrollWidth - doc.clientWidth > 1 : false
    const a = document.activeElement
    const focused = !a || a === document.body ? "body" :
      `${a.tagName.toLowerCase()}${a.id ? "#" + a.id : ""}${a.getAttribute("aria-label") ? `[${a.getAttribute("aria-label")}]` : ""} "${(a.textContent || "").trim().slice(0, 40)}"`
    return { chrome, cards: cards.length, nestedCards: nested, clipped, sideways, pageScrollsSideways, focused }
  })
}

// ------------------------------------------------------------------------------- the contact sheet

function sheet(rows) {
  const byPage = new Map()
  for (const r of rows) {
    if (!byPage.has(r.page)) byPage.set(r.page, new Map())
    const scenes = byPage.get(r.page)
    if (!scenes.has(r.scene)) scenes.set(r.scene, [])
    scenes.get(r.scene).push(r)
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))
  const shot = (r) => `
    <figure>
      <a href="${esc(r.file)}" target="_blank"><img src="${esc(r.file)}" loading="lazy" alt="${esc(r.caption)}"></a>
      <figcaption>
        <b>${r.width}px · ${r.theme}</b>
        ${r.error ? `<span class="bad">did not render: ${esc(r.error)}</span>` : `
        <span>chrome ${r.measured.chrome ?? "—"}px</span>
        <span>cards ${r.measured.cards}${r.measured.nestedCards ? ` · <b class="bad">${r.measured.nestedCards} nested</b>` : ""}</span>
        <span${r.measured.clipped > 4 ? ' class="warn"' : ""}>clipped ${r.measured.clipped}</span>
        <span${r.measured.sideways > 2 ? ' class="warn"' : ""}>sideways ${r.measured.sideways}${r.measured.pageScrollsSideways ? " · page" : ""}</span>
        <span class="focus">focus: ${esc(r.measured.focused)}</span>`}
        ${r.notes?.length ? `<span class="warn">${esc(r.notes.join(" · "))}</span>` : ""}
      </figcaption>
    </figure>`
  const body = [...byPage.entries()].map(([page, scenes]) => `
    <section>
      <h2>${esc(page)}</h2>
      ${[...scenes.entries()].map(([id, shots]) => `
        <article>
          <h3>${esc(id)} <small>${esc(shots[0].caption)}</small></h3>
          <div class="row">${shots.map(shot).join("")}</div>
        </article>`).join("")}
    </section>`).join("")
  return `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ollopA · every scene</title>
<style>
  :root { color-scheme: light dark; --ink: #1a1a1a; --quiet: #6b6b6b; --line: #e3e0da; --bg: #faf9f7; --card: #fff; }
  @media (prefers-color-scheme: dark) { :root { --ink: #ececec; --quiet: #a0a0a0; --line: #2e2e2e; --bg: #141414; --card: #1c1c1c; } }
  * { box-sizing: border-box }
  body { margin: 0; padding: 24px; background: var(--bg); color: var(--ink); font: 14px/1.5 ui-sans-serif, system-ui, sans-serif }
  h1 { font-size: 24px; margin: 0 0 4px }
  p.lede { color: var(--quiet); margin: 0 0 24px }
  section { margin: 0 0 40px }
  h2 { font-size: 18px; border-bottom: 1px solid var(--line); padding-bottom: 6px; position: sticky; top: 0; background: var(--bg) }
  article { margin: 16px 0 24px }
  h3 { font-size: 13px; font-weight: 600; margin: 0 0 8px; font-family: ui-monospace, monospace }
  h3 small { font-weight: 400; color: var(--quiet); font-family: inherit; margin-left: 8px }
  .row { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start }
  figure { margin: 0; width: 320px; background: var(--card); border: 1px solid var(--line); border-radius: 10px; overflow: hidden }
  img { display: block; width: 100%; height: auto; border-bottom: 1px solid var(--line) }
  figcaption { display: grid; gap: 2px; padding: 8px 10px; font-size: 11px; color: var(--quiet) }
  figcaption b { color: var(--ink) }
  .warn { color: #8a5a00 }
  .bad { color: #a33 }
  .focus { font-family: ui-monospace, monospace; overflow-wrap: anywhere }
</style>
<h1>ollopA · every scene</h1>
<p class="lede">${rows.length} images · ${new Set(rows.map((r) => r.scene)).size} scenes · ${new Date().toISOString().slice(0, 16).replace("T", " ")}</p>
${body}`
}

// ------------------------------------------------------------------------------- the run

const scenes = SCENES.filter((s) => !filter || s.id.startsWith(filter))
if (scenes.length === 0) {
  console.error(`no scene starts with "${filter}"`)
  process.exit(1)
}

if (!filter) rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const server = await up()
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--hide-scrollbars"] })
const rows = []
let failed = 0

try {
  for (const scene of scenes) {
    const [business, role] = scene.seat.split(":")
    for (const width of scene.widths) {
      for (const theme of scene.themes) {
        const file = `${scene.id}-${width}-${theme}.png`
        const notes = []
        const page = await browser.newPage()
        const record = { scene: scene.id, page: scene.page, caption: scene.caption, route: scene.route,
          seat: scene.seat, width, theme, file, notes }
        try {
          await page.setViewport({ width, height: width === 400 ? 860 : 900, deviceScaleFactor: 1 })
          page.on("pageerror", (e) => notes.push(`console: ${e.message.slice(0, 80)}`))
          // The seat and the theme are written before the app's first line runs, so one load is
          // enough: no visit-then-reload, which is three page loads for one picture.
          await page.evaluateOnNewDocument((b, r, t) => {
            // Every scene starts from nothing remembered. The product keeps a great deal in storage
            // — the board's view, a page's doors, the trail — and a scene that inherited the last
            // one's memory is not the scene that was asked for.
            try { localStorage.clear(); sessionStorage.clear() } catch { /* private mode */ }
            localStorage.setItem("ollopa.session", JSON.stringify({ business: b, role: r }))
            localStorage.setItem("ollopa.theme", JSON.stringify(t))
          }, business, role, theme)
          await page.goto(BASE + "/#" + scene.route, { waitUntil: "load" })
          await wait(600)
          for (const step of scene.steps) await run(page, step, notes)
          await wait(200)
          record.measured = await measure(page)
          await page.screenshot({ path: `${OUT}/${file}` })
        } catch (e) {
          record.error = String(e.message ?? e).split("\n")[0].slice(0, 120)
          failed++
        }
        await page.close()
        rows.push(record)
        process.stdout.write(record.error ? "x" : notes.length ? "!" : ".")
      }
    }
  }
} finally {
  await browser.close()
  server.kill()
}

// A filtered run re-shoots one page; the contact sheet still shows the whole product, so the rows
// it did not touch are kept from the last full run.
let all = rows
if (filter && existsSync(`${OUT}/manifest.json`)) {
  try {
    const was = JSON.parse(readFileSync(`${OUT}/manifest.json`, "utf8"))
    const fresh = new Set(rows.map((r) => r.scene))
    const order = SCENES.map((s) => s.id)
    all = [...was.filter((r) => !fresh.has(r.scene)), ...rows]
      .sort((a, b) => order.indexOf(a.scene) - order.indexOf(b.scene))
  } catch { /* a manifest we cannot read is a manifest we replace */ }
}
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(all, null, 2))
writeFileSync(`${OUT}/index.html`, sheet(all))

const worst = rows.filter((r) => r.measured)
  .sort((a, b) => (b.measured.clipped + b.measured.sideways * 2) - (a.measured.clipped + a.measured.sideways * 2))
  .slice(0, 10)

console.log(`\n\n${new Set(rows.map((r) => r.scene)).size} scenes · ${rows.length} images · ${failed} failed`)
for (const r of rows.filter((r) => r.error)) console.log(`  did not render: ${r.scene} ${r.width} ${r.theme} — ${r.error}`)
const noted = rows.filter((r) => !r.error && r.notes.length)
if (noted.length) {
  console.log(`\nsteps that found nothing (${noted.length}):`)
  for (const r of noted.slice(0, 20)) console.log(`  ${r.scene} ${r.width} ${r.theme} — ${r.notes.join(" · ")}`)
}
console.log(`\nthe ten with the most clipped text and sideways scrollers:`)
for (const r of worst) {
  console.log(`  ${String(r.measured.clipped).padStart(3)} clipped · ${String(r.measured.sideways).padStart(2)} sideways  ${r.scene} ${r.width} ${r.theme}`)
}
console.log(`\n${OUT}/index.html`)
