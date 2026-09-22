// Home, the Inbox and Tasks after the shadcn pass, in both themes (DESIGN.md §4).
//
//   node scripts/shots-shadcn-work.mjs shots/shadcn/work
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const [dir = "shots/shadcn/work"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4180"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

mkdirSync(dir, { recursive: true })
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const noise = []

for (const mode of ["light", "dark"]) {
  const page = await browser.newPage()
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") noise.push(`${mode}: ${m.text().slice(0, 140)}`) })
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  await page.goto(base + "/#/", { waitUntil: "networkidle0" })
  await page.evaluate((t) => {
    localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "sdr" }))
    localStorage.setItem("ollopa.theme", JSON.stringify(t))
  }, mode)
  for (const [name, route] of [["home", "/ollopa"], ["inbox", "/ollopa/inbox"], ["tasks", "/ollopa/tasks"]]) {
    await page.goto(`${base}/#${route}`, { waitUntil: "networkidle0" })
    await page.reload({ waitUntil: "networkidle0" })
    await wait(800)
    await page.screenshot({ path: `${dir}/${name}-${mode}-1440.png` })
    console.log("wrote", `${dir}/${name}-${mode}-1440.png`)
  }
  await page.close()
}
console.log(noise.length === 0 ? "console: silent" : `console:\n  ${noise.join("\n  ")}`)
await browser.close()
