// The three People surfaces at 1440, for the before-and-after of the action pass.
//
//   node scripts/actions-shots.mjs before
//   node scripts/actions-shots.mjs after
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const when = process.argv[2] ?? "after"
const dir = "shots/actions/people"
const base = process.env.OPD_BASE ?? "http://localhost:4176"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

mkdirSync(dir, { recursive: true })
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const page = await browser.newPage()
page.on("console", (m) => { if (m.type() === "warning" && /Actions/.test(m.text())) console.log("  [warn]", m.text().slice(0, 180)) })
await page.setViewport({ width: 1440, height: 900 })
const shot = async (n) => { const o = `${dir}/${n}-${when}-1440.png`; await page.screenshot({ path: o }); console.log("wrote", o) }

await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate(() => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "sdr" })))
await page.goto(`${base}/#/ollopa/people`, { waitUntil: "networkidle0" })
await page.reload({ waitUntil: "networkidle0" })
await wait(700)
await shot("1-table")

await page.evaluate(() => document.querySelector('[data-page-active="true"] tbody tr[data-item] td a')?.click())
await wait(900)
await shot("2-record")

await page.evaluate(() => {
  const card = Array.from(document.querySelectorAll('[data-page-active="true"] [data-record-card]'))
    .find((c) => /People at/.test(c.textContent))
  card?.scrollIntoView({ block: "center" })
  card?.querySelector("[data-item] button")?.click()
})
await wait(800)
await shot("3-pane")
console.log("pane actions:", await page.evaluate(() => Array.from(document.querySelectorAll('aside[aria-label*="beside"] button'))
  .map((b) => b.textContent.trim()).filter(Boolean).join(" | ")))
console.log("pane sentences:", await page.evaluate(() => Array.from(document.querySelectorAll('aside[aria-label*="beside"] p'))
  .map((b) => b.textContent.trim()).filter(Boolean).join(" || ")))

// The picker's helper is the reason the control is off, so it goes the moment one is chosen.
await page.click('aside[aria-label*="beside"] [role="combobox"]')
await wait(400)
await page.evaluate(() => document.querySelector('[role="option"]')?.click())
await wait(400)
console.log("after choosing — button:", await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('aside[aria-label*="beside"] button')).find((x) => /^(Add|Move) to /.test(x.textContent.trim()))
  return (b?.disabled ? "disabled · " : "enabled · ") + b?.textContent.trim()
}))
console.log("after choosing — sentences:", await page.evaluate(() => Array.from(document.querySelectorAll('aside[aria-label*="beside"] p'))
  .map((b) => b.textContent.trim()).filter(Boolean).join(" || ")))
await shot("4-pane-chosen")

await browser.close()
