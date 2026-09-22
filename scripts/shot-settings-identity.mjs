// Settings, the Requests queue and set-up, in both themes, for the identity rollout.
//   node scripts/shot-settings-identity.mjs shots/identity/settings
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const dir = process.argv[2] ?? "shots/identity/settings"
const base = process.env.OPD_BASE ?? "http://localhost:4174"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdirSync(dir, { recursive: true })

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const noise = []
page.on("console", (m) => { if (m.type() === "warning" || m.type() === "error") noise.push(m.text().slice(0, 140)) })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate(() => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "admin" })))

const SHOTS = [
  ["settings", "/#/ollopa/settings", null],
  ["requests", "/#/ollopa/requests", null],
  ["setup", "/#/ollopa/setup", null],
]

for (const theme of ["light", "dark"]) {
  await page.evaluate((t) => localStorage.setItem("ollopa.theme", JSON.stringify(t)), theme)
  for (const [name, hash, prepare] of SHOTS) {
    await page.goto(base + hash, { waitUntil: "networkidle0" })
    await page.reload({ waitUntil: "networkidle0" })
    await wait(900)
    if (prepare) { await page.evaluate(prepare); await wait(400) }
    const out = `${dir}/${name}-${theme}-1440.png`
    await page.screenshot({ path: out })
    console.log("wrote", out)
  }
}
console.log("console warnings:", noise.length ? noise.join(" | ") : "none")
await browser.close()
