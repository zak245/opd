// One table and one quick look, in both themes: the three templates dressed (DESIGN.md §5).
//   node scripts/shot-templates.mjs shots/identity/templates 1440 900
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"
const [dir = "shots/identity/templates", w = "1440", h = "900"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4170"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdirSync(dir, { recursive: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
for (const theme of ["light", "dark"]) {
  const page = await browser.newPage()
  await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 })
  const shot = async (n) => { const out = `${dir}/${n}-${theme}-${w}.png`; await page.screenshot({ path: out }); console.log("wrote", out) }
  await page.goto(base + "/#/", { waitUntil: "networkidle0" })
  await page.evaluate((t) => {
    localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "ae" }))
    localStorage.setItem("ollopa.theme", JSON.stringify(t))
  }, theme)
  // The deals table: TablePage, with the deals family on its title.
  await page.goto(base + "/#/ollopa/deals?view=table", { waitUntil: "networkidle0" })
  await page.reload({ waitUntil: "networkidle0" }); await wait(900)
  if (!(await page.evaluate(() => !!document.querySelector('[data-page-active="true"] tbody tr')))) {
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('[data-page-active="true"] button')).find((b) => /table/i.test(b.textContent))
      el?.click()
    })
    await wait(800)
  }
  console.log("table title:", await page.evaluate(() => document.querySelector('[data-page-active="true"] h2')?.textContent?.trim().slice(0, 40)))
  await shot("1-table")
  // Enter on a row opens the quick look: same labels, same order, now with the family bar.
  await page.evaluate(() => { const tr = document.querySelector('[data-page-active="true"] tbody tr'); tr?.focus(); tr?.click() })
  await wait(700)
  console.log("quick look:", await page.evaluate(() => document.querySelector('[role="dialog"] h2, [data-slot="sheet-content"] h2')?.textContent?.trim().slice(0, 40) ?? "(none)"))
  await shot("2-quick-look")
  await page.close()
}
await browser.close()
