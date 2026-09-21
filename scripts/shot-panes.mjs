// Photograph the two panes the design system's Actions primitive is adopted in.
//   node scripts/shot-panes.mjs shots/actions 1440 900
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"
const [dir = "shots/actions", w = "1440", h = "900"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4170"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdirSync(dir, { recursive: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const page = await browser.newPage()
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 })
const shot = async (n) => { const out = `${dir}/${n}-${w}.png`; await page.screenshot({ path: out }); console.log("wrote", out) }

// the person pane, beside a sequence
await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate(() => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "sdr" })))
await page.goto(base + "/#/ollopa/sequences/seq-1", { waitUntil: "networkidle0" })
await page.reload({ waitUntil: "networkidle0" }); await wait(700)
await page.evaluate(() => document.querySelector("#seq-people")?.scrollIntoView()); await wait(300)
await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] #seq-people [data-item] button')).find((b) => b.offsetParent !== null)?.click())
await wait(700)
console.log("person pane acts:", await page.evaluate(() => Array.from(document.querySelectorAll("[data-beside] button, [data-beside] a")).map((b) => b.textContent.trim()).join(" | ")))
await shot("person-pane")

// the deal pane, beside Home's pipeline — the AE's own deals, read without leaving the page
await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate(() => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "ae" })))
await page.goto(base + "/#/ollopa", { waitUntil: "networkidle0" })
await page.reload({ waitUntil: "networkidle0" }); await wait(1000)
const opened = await page.evaluate(() => {
  const row = Array.from(document.querySelectorAll('[data-page-active="true"] [data-item]'))
    .find((el) => /^d-/.test(el.getAttribute("data-item") ?? ""))
  if (!row) return null
  row.scrollIntoView({ block: "center" })
  const el = row.matches("button,a,[tabindex]") ? row : row.querySelector("button,a,[tabindex]")
  el?.focus()
  return row.getAttribute("data-item")
})
if (opened) await page.keyboard.press("Enter")
await wait(900)
console.log("deal pane:", await page.evaluate(() => document.querySelector("[data-beside] h2")?.textContent ?? "(none)"))
console.log("deal pane acts:", await page.evaluate(() => Array.from(document.querySelectorAll("[data-beside] button, [data-beside] a")).map((b) => b.textContent.trim()).join(" | ")))
await shot("deal-pane")
await browser.close()
