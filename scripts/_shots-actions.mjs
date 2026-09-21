// Three surfaces this pass changes, at 1440: the company record, the Accounts page, the company pane.
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"
const when = process.argv[2] ?? "before"
const base = process.env.OPD_BASE ?? "http://localhost:4173"
const dir = "shots/actions/companies"
mkdirSync(dir, { recursive: true })
const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--hide-scrollbars"] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const go = async (route, role = "ae", business = "meridian") => {
  await page.goto(base + "/#/", { waitUntil: "networkidle0" })
  await page.evaluate((s) => localStorage.setItem("ollopa.session", JSON.stringify(s)), { business, role })
  await page.goto(`${base}/#${route}`, { waitUntil: "networkidle0" })
  await page.reload({ waitUntil: "networkidle0" })
  await wait(900)
}
await go("/ollopa/companies/co-1")
await page.screenshot({ path: `${dir}/${when}-record-1440.png` })
await go("/ollopa/accounts")
await page.screenshot({ path: `${dir}/${when}-accounts-1440.png` })
// the company pane, opened from the subsidiaries door on the company record
await go("/ollopa/companies/co-1")
await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('[data-page-active="true"] button')).find((x) => /Parent and subsidiaries/.test(x.textContent))
  b?.click()
})
await wait(400)
await page.evaluate(() => document.querySelector('[data-page-active="true"] li[data-item] button')?.click())
await wait(700)
await page.screenshot({ path: `${dir}/${when}-pane-1440.png` })
console.log(when, "pane:", await page.evaluate(() => document.querySelector("aside h2")?.textContent))
console.log(when, "shots written to", dir)
await browser.close()
