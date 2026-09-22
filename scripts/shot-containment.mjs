// The two surfaces the containment pass asks for, in both themes: a sequence record with the pane
// open, and the Sequences index.
//
//   node scripts/shot-identity.mjs shots/containment/engage
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"
const [dir = "shots/containment/engage"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4193"
mkdirSync(dir, { recursive: true })
const b = await puppeteer.launch({ executablePath: process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--hide-scrollbars"] })
const page = await b.newPage()
await page.setViewport({ width: 1440, height: 1100 })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

for (const theme of ["light", "dark"]) {
  await page.goto(base + "/#/", { waitUntil: "networkidle0" })
  await page.evaluate((t) => {
    localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "sdr" }))
    localStorage.setItem("ollopa.theme", t)
  }, theme)
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: theme }])

  await page.goto(`${base}/#/ollopa/sequences`, { waitUntil: "networkidle0" })
  await page.reload({ waitUntil: "networkidle0" }); await wait(1000)
  await page.screenshot({ path: `${dir}/sequences-index-${theme}-1440.png` })
  console.log("wrote", `${dir}/sequences-index-${theme}-1440.png`)

  await page.goto(`${base}/#/ollopa/sequences/seq-1`, { waitUntil: "networkidle0" })
  await page.reload({ waitUntil: "networkidle0" }); await wait(1000)
  await page.evaluate(() => document.querySelector("#seq-people")?.scrollIntoView({ block: "start" })); await wait(400)
  await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] #seq-people [data-item] button')).find((x) => x.offsetParent !== null)?.click())
  await wait(800)
  await page.screenshot({ path: `${dir}/sequence-record-pane-${theme}-1440.png` })
  console.log("wrote", `${dir}/sequence-record-pane-${theme}-1440.png`)
}
await b.close()
