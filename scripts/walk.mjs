// Walk the sequence › enrolled person › back chain and photograph every step.
//
// `shot.mjs` loads one route and takes one picture; a chain needs clicks between the pictures, so
// this drives the same Chrome through the whole lap, at whatever width it is given:
//
//   node scripts/walk.mjs shots/chains/stage1 1440 900
//   node scripts/walk.mjs shots/chains/stage1 400 860
//
// It expects a preview server on OPD_BASE (default http://localhost:4170).
// The five pictures, in order:
//   1-sequence      the sequence page, nothing open
//   2-pane          a person open beside it, the page still there and not re-rendered
//   3-next          "]" walked to the next person in the enrolled list
//   4-page          "Open the page" — the contact record, with the trail in the header
//   5-back          the crumb clicked — the sequence again, with the row lit
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const [dir = "shots/chains/stage1", w = "1440", h = "900"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4170"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const seq = process.env.OPD_SEQUENCE ?? "seq-1"
const phone = Number(w) < 640

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

// Sign in as the Meridian SDR, the seat this chain belongs to.
await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate(() => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "sdr" })))
await page.goto(`${base}/#/ollopa/sequences/${seq}`, { waitUntil: "networkidle0" })
await page.reload({ waitUntil: "networkidle0" })
await wait(500)

// The enrolled list lives down the page; bring it into view before anything is clicked.
await page.evaluate(() => document.querySelector("#seq-people")?.scrollIntoView({ block: "start" }))
await wait(400)

const renders = () => page.evaluate(() =>
  Array.from(document.querySelectorAll("[data-renders]")).map((el) => el.textContent.trim()).join(" · "))

const before = await renders()
console.log("before the pane:", before || "(no counter: this is a production build)")
await shot("1-sequence")

// 1 → 2. Open the first enrolled person beside the sequence.
const first = await page.evaluate(() => {
  // The table and the phone card list both render the name; take whichever one is on screen.
  const el = Array.from(document.querySelectorAll('[data-page-active="true"] #seq-people [data-item] button'))
    .find((b) => b.offsetParent !== null)
  if (!el) return null
  el.click()
  return el.textContent.trim()
})
if (!first) throw new Error("no enrolled person to open")
await wait(600)
const after = await renders()
console.log("after the pane: ", after || "(no counter)")
console.log(before === after ? "the page did not re-render" : "THE PAGE RE-RENDERED")
await shot("2-pane")

// 2 → 3. "]" walks to the next person in the enrolled list, in the order shown.
await page.keyboard.press("BracketRight")
await wait(500)
await shot("3-next")

// 3 → 4. "Open the page": the trail takes the sequence and the row with it.
await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll("aside button"))
  buttons.find((b) => b.textContent.trim() === "Open the page")?.click()
})
await wait(700)
console.log("trail:", await page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Your path"]')
  const h1 = document.querySelector("header h1")
  return nav ? `${nav.innerText.replace(/\n/g, " ")} ${h1?.innerText ?? ""}`.trim() : "(none)"
}))
await shot("4-page")

// 4 → 5. The crumb: back to the sequence, scrolled to the row, lit and focused.
await page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Your path"]')
  const crumb = nav?.querySelector("ol button") ?? nav?.querySelector("button")
  crumb?.click()
})
await wait(500)
console.log("lit:", await page.evaluate(() => document.querySelector(".ollopa-returned")?.innerText.replace(/\n/g, " ").slice(0, 60) ?? "(nothing lit)"))
console.log("focused:", await page.evaluate(() => document.activeElement?.innerText?.replace(/\n/g, " ").slice(0, 60) ?? "(none)"))
console.log("renders now:", await renders())
await shot("5-back")

if (phone) console.log("(phone width: the pane takes the whole width and the trail shows one step back)")

await browser.close()
