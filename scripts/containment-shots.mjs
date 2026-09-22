// People and the contact record, both themes, for the containment pass.
//   node scripts/containment-shots.mjs
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"
const dir = "shots/containment/people"
const base = process.env.OPD_BASE ?? "http://localhost:4176"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
mkdirSync(dir, { recursive: true })
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
for (const theme of ["light", "dark"]) {
  const page = await browser.newPage()
  const warnings = []
  page.on("console", (m) => { if (/ollopa\/(Container|Actions)/.test(m.text())) warnings.push(m.text().slice(0, 150)) })
  await page.setViewport({ width: 1440, height: 950 })
  await page.goto(base + "/#/", { waitUntil: "networkidle0" })
  await page.evaluate((t) => {
    localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "sdr" }))
    localStorage.setItem("ollopa.theme", JSON.stringify(t))
  }, theme)
  await page.goto(`${base}/#/ollopa/people`, { waitUntil: "networkidle0" })
  await page.reload({ waitUntil: "networkidle0" })
  await wait(900)
  await page.screenshot({ path: `${dir}/1-people-${theme}-1440.png` })
  console.log("wrote", `${dir}/1-people-${theme}-1440.png`)
  // With rows selected, so the selection band shows as a group inside the container.
  await page.evaluate(() => {
    document.querySelectorAll('[data-page-active="true"] tbody tr input[type=checkbox]').forEach((c, i) => { if (i < 3) c.click() })
  })
  await wait(500)
  await page.screenshot({ path: `${dir}/2-people-selected-${theme}-1440.png` })
  console.log("wrote", `${dir}/2-people-selected-${theme}-1440.png`)

  await page.evaluate(() => document.querySelector('[data-page-active="true"] tbody tr[data-item] td a')?.click())
  await wait(900)
  await page.screenshot({ path: `${dir}/3-record-${theme}-1440.png` })
  console.log("wrote", `${dir}/3-record-${theme}-1440.png`)
  console.log(`  ${theme} · container/actions warnings:`, warnings.length ? warnings.join(" || ") : "none")
  await page.close()
}
await browser.close()
