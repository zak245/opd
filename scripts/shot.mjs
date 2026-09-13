// Screenshot a route of the local build with the Chrome on this machine.
// usage: node scripts/shot.mjs <hash-route> <out.png> [business:role] [width] [height]
// example: node scripts/shot.mjs "/ollopa/people" shots/people.png meridian:sdr
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"
import { dirname } from "node:path"

const [route = "/", out = "shot.png", as = "", w = "1440", h = "900"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4173"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

mkdirSync(dirname(out), { recursive: true })
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const page = await browser.newPage()
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 })
await page.goto(base + "/#/", { waitUntil: "networkidle0" })
if (as) {
  const [business, role] = as.split(":")
  await page.evaluate((s) => localStorage.setItem("ollopa.session", JSON.stringify(s)), { business, role })
}
await page.goto(base + "/#" + route, { waitUntil: "networkidle0" })
await page.reload({ waitUntil: "networkidle0" })   // the app reads the session once at load
await new Promise((r) => setTimeout(r, 400))
await page.screenshot({ path: out, fullPage: false })
await browser.close()
console.log("wrote", out)
