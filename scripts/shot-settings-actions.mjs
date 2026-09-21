// The three settings surfaces at 1440, for the before-and-after of the actions and copy pass.
// The "before" pictures are the same three surfaces photographed by walk-settings.mjs before it.
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const dir = process.argv[2] ?? "shots/actions/settings"
const tag = process.argv[3] ?? "after"
const base = process.env.OPD_BASE ?? "http://localhost:4174"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdirSync(dir, { recursive: true })

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const warned = []
page.on("console", (m) => { if (m.type() === "warning" || m.type() === "error") warned.push(m.text().slice(0, 160)) })

await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate(() => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "admin" })))

async function shot(name, hash, prepare) {
  await page.goto(base + hash, { waitUntil: "networkidle0" })
  await page.reload({ waitUntil: "networkidle0" })
  await wait(900)
  if (prepare) { await page.evaluate(prepare); await wait(500) }
  const out = `${dir}/${name}-${tag}-1440.png`
  await page.screenshot({ path: out })
  console.log("wrote", out)
}

await shot("settings", "/#/ollopa/settings/how-your-team-works", () => {
  const root = document.querySelector('[data-page-active="true"]') ?? document
  root.querySelector('[data-row="work.profile"]')?.scrollIntoView({ block: "center" })
})
await shot("email-sending", "/#/ollopa/settings/email-sending?row=mail.bounce-guard")
await shot("setup", "/#/ollopa/setup")

console.log("console warnings:", warned.length ? warned.join(" | ") : "none")
await browser.close()
