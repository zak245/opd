// Walk chain 3 — company › find a person at it › open beside › act › back, then next — and
// photograph every step.
//
//   node scripts/walk-companies.mjs shots/chains/companies 1440 900
//   node scripts/walk-companies.mjs shots/chains/companies 400 860
//
// It expects a preview server on OPD_BASE (default http://localhost:4173) and drives the lap with
// the keyboard: Enter opens the person beside the company, the pane's buttons are reached with the
// keyboard, "]" walks the list, and the crumb brings the company back with the row lit.
//
// The seven pictures, in order:
//   1-company   the company record at its contacts list, nothing open
//   2-search    a search typed inside the list: three of the twenty-four people
//   3-pane      the first match open beside, the record still there and not re-rendered
//   4-acted     an action taken in the pane, shown on the row behind it at once
//   5-page      "Open the page" — the contact record, with the trail in the header
//   6-back      the crumb clicked — the company again, the search intact and the row lit
//   7-next      the row re-opened and "]" walked to the next person in the list
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const [dir = "shots/chains/companies", w = "1440", h = "900"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4173"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const company = process.env.OPD_COMPANY ?? "co-1"
const query = process.env.OPD_QUERY ?? "Costa"

mkdirSync(dir, { recursive: true })

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const page = await browser.newPage()
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 })

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const shot = async (name) => {
  const out = `${dir}/${name}-${w}.png`
  await page.screenshot({ path: out, fullPage: false })
  console.log("wrote", out)
}
const renders = () => page.evaluate(() =>
  Array.from(document.querySelectorAll("[data-renders]")).map((el) => el.textContent.trim()).join(" · "))
const rows = () => page.evaluate(() =>
  Array.from(document.querySelectorAll('[data-page-active="true"] #contacts [data-item]'))
    .map((el) => el.innerText.replace(/\n/g, " · ")))

// Sign in as the Meridian account executive, the seat this chain belongs to.
await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate(() => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "ae" })))
await page.goto(`${base}/#/ollopa/companies/${company}`, { waitUntil: "networkidle0" })
await page.reload({ waitUntil: "networkidle0" })
await wait(600)

// The contacts list is a section down the record; bring it into view before anything is clicked.
await page.evaluate(() => document.querySelector("#contacts")?.scrollIntoView({ block: "start" }))
await wait(400)
console.log("contacts section:", await page.evaluate(() => document.querySelector("#contacts h3, #contacts h2")?.textContent ?? "(none)"))
console.log("rows on the first page:", (await rows()).length)
await shot("1-company")

// 1 → 2. Search inside the company: the whole set, not only the page on screen.
await page.evaluate(() => {
  const input = document.querySelector('[data-page-active="true"] #contacts input')
  input?.focus()
})
await page.keyboard.type(query, { delay: 30 })
await wait(400)
const matched = await rows()
console.log(`search "${query}" →`, matched.length, "rows:", matched.map((r) => r.split(" · ")[0]).join(", "))
await shot("2-search")

// 2 → 3. Enter on the first match opens that person beside the company.
const before = await renders()
console.log("before the pane:", before || "(no counter: this is a production build)")
const scrollBefore = await page.evaluate(() => document.scrollingElement.scrollTop || document.querySelector("[data-page-active='true'] [class*='overflow-y']")?.scrollTop || 0)
await page.evaluate(() => {
  const first = document.querySelector('[data-page-active="true"] #contacts [data-item] button')
  first?.focus()
})
await page.keyboard.press("Enter")
await wait(600)
const after = await renders()
console.log("after the pane: ", after || "(no counter)")
console.log(before === after ? "the record did not re-render" : "THE RECORD RE-RENDERED")
console.log("pane:", await page.evaluate(() => document.querySelector("aside h2")?.textContent ?? "(no pane)"))
console.log("list position:", await page.evaluate(() => document.querySelector("aside footer")?.innerText.replace(/\n/g, " ") ?? "(no list)"))
await shot("3-pane")

// 3 → 4. Act in the pane. The row behind it says the same thing, at once, where it was caused.
const acted = await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("aside button")).find((x) => /^Add to |^Move to /.test(x.textContent.trim()))
  if (!b) return null
  b.focus()
  return b.textContent.trim()
})
if (acted) await page.keyboard.press("Enter")
await wait(500)
console.log("acted:", acted ?? "(no action button found)")
console.log("the row behind now reads:", (await rows())[0] ?? "(none)")
await shot("4-acted")

// 4 → 5. "Open the page": the trail takes the company and the row with it.
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll("aside button")).find((x) => x.textContent.trim() === "Open the page")
  b?.focus()
})
await page.keyboard.press("Enter")
await wait(800)
console.log("trail:", await page.evaluate(() => document.querySelector('nav[aria-label="Your path"]')?.innerText.replace(/\n/g, " ") ?? "(none)"))
await shot("5-page")

// 5 → 6. The crumb: back to the company, the search still typed, the row lit and focused.
await page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Your path"]')
  const crumb = nav?.querySelector("ol button") ?? nav?.querySelector("button")
  crumb?.click()
})
await wait(700)
console.log("search box still says:", await page.evaluate(() => document.querySelector('[data-page-active="true"] #contacts input')?.value ?? "(gone)"))
console.log("lit:", await page.evaluate(() => document.querySelector(".ollopa-returned")?.innerText.replace(/\n/g, " ").slice(0, 70) ?? "(nothing lit)"))
console.log("focused:", await page.evaluate(() => document.activeElement?.innerText?.replace(/\n/g, " ").slice(0, 70) ?? "(none)"))
console.log("scroll kept:", await page.evaluate((b) => Math.abs((document.scrollingElement.scrollTop || 0) - b) < 400, scrollBefore))
await shot("6-back")

// 6 → 7. Open the row again and walk the list with "]", without closing the pane.
await page.evaluate(() => {
  const first = document.querySelector('[data-page-active="true"] #contacts [data-item] button')
  first?.focus()
})
await page.keyboard.press("Enter")
await wait(500)
await page.keyboard.press("BracketRight")
await wait(500)
console.log("next is:", await page.evaluate(() => document.querySelector("aside h2")?.textContent ?? "(no pane)"))
console.log("list position:", await page.evaluate(() => document.querySelector("aside footer")?.innerText.replace(/\n/g, " ") ?? "(no list)"))
console.log("renders now:", (await renders()) || "(no counter)")
await shot("7-next")

// Escape closes and focus goes back to the row that opened it.
await page.keyboard.press("Escape")
await wait(400)
console.log("after Escape, focus is on:", await page.evaluate(() => document.activeElement?.innerText?.replace(/\n/g, " ").slice(0, 40) ?? "(none)"))

await browser.close()
