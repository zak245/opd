// The six surfaces this folder owns, photographed at 1440 before and after the actions pass.
//
//   node scripts/shots-actions-work.mjs shots/actions/work before
//   node scripts/shots-actions-work.mjs shots/actions/work after
//
// Inbox, Tasks and Home as they open, then the three panes this folder registers: the reply beside
// Home, the task beside Home, and an agent's proposal beside Home.
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const [dir = "shots/actions/work", when = "before"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4177"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

mkdirSync(dir, { recursive: true })

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const shot = async (name) => {
  await page.screenshot({ path: `${dir}/${when}-${name}-1440.png` })
  console.log("wrote", `${dir}/${when}-${name}-1440.png`)
}
const go = async (route) => {
  await page.goto(`${base}/#${route}`, { waitUntil: "networkidle0" })
  await page.reload({ waitUntil: "networkidle0" })
  await wait(700)
}
const openRowIn = (section) => page.evaluate((s) => {
  const el = document.querySelector(`[data-page-active="true"] [data-section="${s}"] [data-row] button`)
  if (!el) return false
  el.click()
  return true
}, section)

await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate(() => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "sdr" })))

await go("/ollopa/inbox")
await shot("inbox")

await go("/ollopa/tasks")
await shot("tasks")

await go("/ollopa")
await shot("home")

// The task beside Home: the row's own name opens it.
console.log("task pane:", await openRowIn("home-today"))
await wait(700)
await shot("pane-task")
await page.keyboard.press("Escape")
await wait(400)

// The reply beside Home.
console.log("reply pane:", await page.evaluate(() => {
  const row = document.querySelector('[data-page-active="true"] [data-section="home-replies"] [data-row]')
  if (!row) return false
  row.focus()
  row.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
  return true
}))
await wait(700)
await shot("pane-reply")
await page.keyboard.press("Escape")
await wait(400)

// An agent's proposal beside Home.
console.log("approval pane:", await page.evaluate(() => {
  const row = document.querySelector('[data-page-active="true"] [data-section="home-approvals"] [data-row]')
  if (!row) return false
  row.focus()
  row.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
  return true
}))
await wait(700)
await shot("pane-approval")

await browser.close()
