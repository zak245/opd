// Walk the three People chains and photograph every step. Same shape as scripts/walk.mjs.
//
//   node walk-people.mjs shots/chains/people 1440 900
//
// The pictures, in order:
//   1-table       the People table, nothing open
//   2-quicklook   Enter on a row: the quick look, the table still behind it
//   3-record      "Open": the contact record, with the trail in the header
//   4-back        the crumb: the table again, the row lit and focused
//   5-company     the record, the company open beside it
//   6-closed      Esc: the pane gone, focus back on the company control
//   7-colleague   a colleague open beside the record, with 1 of N
//   8-next        "]" walked to the next colleague
//   9-acted       an action in the pane, and the row behind it saying the same thing
//  10-openpage    "Open the page": the colleague's record, trail in the header
//  11-backrec     the crumb: the first contact again, the colleague row lit
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const [dir = "shots/chains/people", w = "1440", h = "900"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4176"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const role = process.env.OPD_ROLE ?? "ae"

mkdirSync(dir, { recursive: true })
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const page = await browser.newPage()
page.on("console", (m) => { if (m.type() === "error") console.log("  [console]", m.text().slice(0, 160)) })
page.on("pageerror", (e) => console.log("  [pageerror]", String(e).slice(0, 200)))
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 })

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const shot = async (n) => { const o = `${dir}/${n}-${w}.png`; await page.screenshot({ path: o }); console.log("wrote", o) }
const trail = () => page.evaluate(() => document.querySelector('nav[aria-label="Your path"]')?.innerText.replace(/\n/g, " ") ?? "(none)")
const lit = () => page.evaluate(() => {
  const root = document.querySelector('[data-page-active="true"]') ?? document.body
  const els = Array.from(root.querySelectorAll(".ollopa-returned"))
  if (els.length === 0) return "(nothing lit)"
  return els.map((e) => `[${e.getAttribute("data-item") ?? e.tagName}] ${e.innerText.replace(/\s+/g, " ").slice(0, 60)}`).join(" || ")
})
const focused = () => page.evaluate(() => (document.activeElement?.innerText || document.activeElement?.getAttribute("aria-label") || document.activeElement?.tagName || "(none)").replace(/\s+/g, " ").slice(0, 70))
const PANE = 'aside[aria-label*="beside"], aside[data-beside], [data-slot="beside"], aside'
const paneTitle = () => page.evaluate((sel) => {
  const pane = Array.from(document.querySelectorAll(sel)).find((a) => a.querySelector("h2") && /Open the page/.test(a.innerText ?? ""))
  return pane?.querySelector("h2")?.textContent ?? "(no pane)"
}, PANE)
const paneCount = () => page.evaluate(() => document.querySelector("aside footer span")?.textContent ?? "(no list)")
const besideMarked = () => page.evaluate(() => document.querySelector(".ollopa-beside-open")?.innerText.replace(/\s+/g, " ").slice(0, 60) ?? "(nothing marked)")

/** A real pointer click on the first visible control whose text matches. The pane's "Open the page"
 *  is a link now, and a link only follows the page's own handler on a real click. */
const clickText = async (text) => {
  const h = await page.evaluateHandle((t) => Array.from(document.querySelectorAll("a, button"))
    .filter((e) => e.getClientRects().length)
    .find((e) => (e.innerText ?? "").trim() === t), text)
  const el = h.asElement()
  if (!el) throw new Error(`no control reads "${text}"`)
  await el.click()
}

await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate((r) => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: r })), role)
await page.goto(`${base}/#/ollopa/people`, { waitUntil: "networkidle0" })
await page.reload({ waitUntil: "networkidle0" })
await wait(600)

console.log("\n== chain 1: table > quick look > open > back to the row lit ==")
await shot("1-table")

// Focus the second row and press Enter: the quick look, the way the keyboard opens it.
// At phone width the same rows are a card list, so take whichever copy is on screen.
const rowName = await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('[data-page-active="true"] tbody tr[data-item], [data-page-active="true"] li[data-item]'))
    .filter((el) => el.offsetParent !== null)
  const row = rows[1] ?? rows[0]
  if (!row) return null
  if (row.tagName === "TR") row.focus()
  else row.querySelector("a")?.focus()
  return row.getAttribute("data-item-label")
})
if (!rowName) throw new Error("no rows in the People table")
console.log("row:", rowName)
// The table takes Enter on the focused row. The phone's card list has no focusable row, so the
// quick look opens the way a thumb opens it: from "Quick look" at the top of the row's own menu.
const onPhone = Number(w) < 768
if (onPhone) {
  // Radix opens on a real pointer event, so the menu is clicked the way a thumb clicks it.
  const more = (await page.$$('[data-page-active="true"] li[data-item] [data-item="people.row.more"]'))[1]
  await more.click()
  await wait(400)
  await page.click('[data-item="people.row.quick-look"]')
} else {
  await page.keyboard.press("Enter")
}
await wait(600)
await shot("2-quicklook")
// The quick look is the beside pane now, not a modal of its own (layouts README, overlays).
console.log("quick look:", await paneTitle())

// "Open the page" leaves for the record through the trail.
await clickText("Open the page")
await wait(800)
console.log("trail:", await trail())
await shot("3-record")

// The crumb back: the table, the row lit and focused.
await page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Your path"]')
  ;(nav?.querySelector("ol button") ?? nav?.querySelector("button"))?.click()
})
await wait(700)
console.log("lit:", await lit())
console.log("focused:", await focused())
await shot("4-back")

console.log("\n== chain 2: contact record > the company beside it > back ==")
// Into a record by the row's own name link, which is a step in a chain, not a jump. Take the row
// whose company has the most people in this table, so "People at this company" has a list to walk.
await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('[data-page-active="true"] tbody tr[data-item], [data-page-active="true"] li[data-item]'))
    .filter((el) => el.offsetParent !== null)
  const company = (tr) => {
    const cell = tr.querySelectorAll("td")[2]
    if (cell) return cell.innerText.trim()
    // The phone's card puts "Title · Company" on one line.
    const line = tr.querySelector(".text-xs.text-muted-foreground")?.innerText ?? ""
    return line.split("·").pop().trim()
  }
  const counts = new Map()
  rows.forEach((tr) => counts.set(company(tr), (counts.get(company(tr)) ?? 0) + 1))
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  const tr = rows.find((r) => company(r) === best) ?? rows[0]
  tr.querySelector("a")?.click()
})
await wait(800)
const recordTitle = await page.evaluate(() => document.querySelector('[data-page-active="true"] h2')?.textContent ?? "(none)")
console.log("record:", recordTitle, "· trail:", await trail())

// The company in the header opens beside. Half-type a note first: if the page re-rendered or was
// replaced, the draft would be gone, and that is the property the whole mechanic rests on.
await page.type('[data-page-active="true"] textarea[aria-label="Add a note"]', "half-typed, do not lose me")
const scroll = () => page.evaluate(() => document.querySelector('[data-page-active="true"]')?.scrollTop ?? -1)
const draft = () => page.evaluate(() => document.querySelector('[data-page-active="true"] textarea[aria-label="Add a note"]')?.value ?? "(no composer)")
const before = await scroll()
await page.evaluate(() => {
  // The company is the record's subtitle: a real link whose plain click opens it beside.
  const head = document.querySelector('[data-page-active="true"] h2')?.closest("div")?.parentElement
  const a = head?.querySelector('a[href*="/ollopa/companies/"]')
  a?.click()
})
await wait(600)
console.log("pane:", await paneTitle(), "· page scroll unchanged:", (await scroll()) === before)
console.log("the half-typed note behind it:", JSON.stringify(await draft()))
await shot("5-company")

await page.keyboard.press("Escape")
await wait(500)
console.log("after Esc — pane:", await paneTitle(), "· focus:", await focused())
await shot("6-closed")

console.log("\n== chain 3: contact > a colleague beside > next > act > page > back ==")
await page.evaluate(() => {
  const card = Array.from(document.querySelectorAll('[data-page-active="true"] [data-record-card]'))
    .find((c) => /People at/.test(c.textContent))
  card?.scrollIntoView({ block: "center" })
  const b = card?.querySelector("[data-item] button")
  b?.click()
})
await wait(700)
console.log("pane:", await paneTitle(), "·", await paneCount(), "· marked behind:", await besideMarked())
await shot("7-colleague")

await page.keyboard.press("BracketRight")
await wait(500)
console.log("after ] :", await paneTitle(), "·", await paneCount(), "· marked behind:", await besideMarked())
await shot("8-next")

// Act in the pane. The destination is chosen, never guessed: the picker first, then the button.
console.log("before choosing, the button reads:", await page.evaluate(() =>
  (Array.from(document.querySelectorAll("aside button, aside a")).find((x) => /^(Add|Move) to /.test(x.textContent.trim()))?.outerHTML.match(/disabled/) ? "disabled · " : "enabled · ")
  + (Array.from(document.querySelectorAll("aside button, aside a")).find((x) => /^(Add|Move) to /.test(x.textContent.trim()))?.textContent.trim() ?? "(none)")))
await page.click('aside [role="combobox"]')
await wait(400)
const chose = await page.evaluate(() => {
  const opt = document.querySelector('[role="option"]')
  const name = opt?.textContent.trim()
  opt?.click()
  return name
})
await wait(400)
const acted = await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("aside button, aside a")).find((x) => /^(Add|Move) to /.test(x.textContent.trim()))
  const label = b?.textContent.trim()
  b?.click()
  return label
})
await wait(600)
console.log("chose:", chose, "· clicked:", acted)
console.log("pane result line:", await page.evaluate(() => (document.querySelector('aside [role="status"]')?.innerText ?? "").replace(/\s+/g, " ") ?? "(none)"))
console.log("row behind now says:", await besideMarked())
await shot("9-acted")

// A second click must not move them again by surprise: the picker is empty and the button is off.
console.log("after acting, the button reads:", await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("aside button, aside a")).find((x) => /^(Add|Move) to /.test(x.textContent.trim()))
  return (b?.disabled ? "disabled · " : "ENABLED · ") + (b?.textContent.trim() ?? "(none)")
}))

// Undo puts it back, in the pane and on the row behind, at once.
await page.evaluate(() => Array.from(document.querySelectorAll("aside button, aside a")).find((b) => b.textContent.trim() === "Undo")?.click())
await wait(500)
console.log("after Undo — row behind:", await besideMarked(), "· result line:", await page.evaluate(() => (document.querySelector('aside [role="status"]')?.innerText ?? "").replace(/\s+/g, " ") ?? "(none)"))
await shot("9b-undone")

// Put it back so the rest of the walk shows the acted state.
await page.click('aside [role="combobox"]')
await wait(400)
await page.evaluate(() => document.querySelector('[role="option"]')?.click())
await wait(300)
await page.evaluate(() => Array.from(document.querySelectorAll("aside button, aside a")).find((x) => /^(Add|Move) to /.test(x.textContent.trim()))?.click())
await wait(500)

await page.evaluate(() => Array.from(document.querySelectorAll("aside button, aside a")).find((b) => b.textContent.trim() === "Open the page")?.click())
await wait(800)
console.log("trail:", await trail())
await shot("10-openpage")

await page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Your path"]')
  const crumbs = nav?.querySelectorAll("ol button")
  ;(crumbs?.[crumbs.length - 1] ?? nav?.querySelector("button"))?.click()
})
await wait(800)
console.log("back on:", await page.evaluate(() => document.querySelector('[data-page-active="true"] h2')?.textContent ?? "(none)"))
console.log("lit:", await lit())
console.log("focused:", await focused())
console.log("trail:", await trail())
await shot("11-backrec")

console.log("\n== leaving for the whole set: the filter and the trail travel with it ==")
await page.evaluate(() => {
  const card = Array.from(document.querySelectorAll('[data-page-active="true"] [data-record-card]'))
    .find((c) => /People at/.test(c.textContent))
  card?.scrollIntoView({ block: "center" })
  Array.from(card?.querySelectorAll("a, button") ?? []).find((b) => /in People$/.test(b.textContent.trim()))?.click()
})
await wait(800)
console.log("route:", await page.evaluate(() => location.hash))
console.log("chips:", await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] button'))
  .map((b) => b.innerText.replace(/\s+/g, " ").trim()).filter((t) => /^Company/.test(t)).join(" | ") || "(none)"))
console.log("count:", await page.evaluate(() => document.querySelector('[data-item="people.count"]')?.textContent ?? document.querySelector('[data-slot="card-header"] [aria-live="polite"]')?.textContent ?? "(none)"))
console.log("trail:", await trail())
await shot("12-allinpeople")

await page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Your path"]')
  const crumbs = nav?.querySelectorAll("ol button")
  ;(crumbs?.[crumbs.length - 1] ?? nav?.querySelector("button"))?.click()
})
await wait(800)
console.log("back on:", await page.evaluate(() => document.querySelector('[data-page-active="true"] h2')?.textContent ?? "(none)"), "· lit:", await lit())
await shot("13-backfromset")

await browser.close()
