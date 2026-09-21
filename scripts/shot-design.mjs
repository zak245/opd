// The five surfaces DESIGN.md §4 names, at both widths and in both themes.
//   node scripts/shot-design.mjs shots/design 1440 900
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"
const [dir = "shots/design", w = "1440", h = "900"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4170"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdirSync(dir, { recursive: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })

for (const theme of ["light", "dark"]) {
  const page = await browser.newPage()
  await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 })
  const shot = async (n) => { const out = `${dir}/${n}-${theme}-${w}.png`; await page.screenshot({ path: out }); console.log("wrote", out) }
  const as = async (role, route) => {
    await page.goto(base + "/#/", { waitUntil: "networkidle0" })
    await page.evaluate((r, t) => {
      localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: r }))
      localStorage.setItem("ollopa.theme", JSON.stringify(t))
    }, role, theme)
    await page.goto(base + "/#" + route, { waitUntil: "networkidle0" })
    await page.reload({ waitUntil: "networkidle0" })
    await wait(900)
  }

  // 1. the person pane — a stack under the fields, 32 px acts, no primary
  await as("sdr", "/ollopa/sequences/seq-1")
  await page.evaluate(() => document.querySelector("#seq-people")?.scrollIntoView()); await wait(300)
  await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] #seq-people [data-item] button')).find((b) => b.offsetParent !== null)?.click())
  await wait(700)
  await shot("1-person-pane")

  // 2. the deal record header — the acts row beside the title, 36 px
  await as("ae", "/ollopa/deals/d-118")
  await shot("2-deal-header")

  // 3. a dialog — the affirmative at the trailing edge, in the destructive hue
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('[data-page-active="true"] button, [data-page-active="true"] a'))
      .find((b) => /^(Mark lost and archive|Delete deal|Close won|Mark won)$/.test(b.textContent.trim()))
    el?.setAttribute("data-probe", "1")
  })
  await page.click('[data-probe="1"]').catch(() => {})
  await wait(600)
  await shot("3-dialog")

  // 4. the Tasks queue footer — primary first at the leading edge
  await as("admin", "/ollopa/tasks")
  await page.evaluate(() => document.querySelector('[data-page-active="true"]')?.scrollTo({ top: 99999 })); await wait(400)
  await shot("4-queue-footer")

  // 5. the Settings Save bar — the bar at the bottom, Save leading
  await as("admin", "/ollopa/settings/email-sending")
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('[data-page-active="true"] input[type="number"], [data-page-active="true"] input[type="text"]'))
      .find((i) => i.offsetParent !== null && !i.readOnly && !i.disabled)
    if (el) { el.focus(); el.setAttribute("data-probe2", "1") }
  })
  await page.type('[data-probe2="1"]', "9").catch(() => {})
  await wait(700)
  await shot("5-save-bar")
  await page.close()
}
await browser.close()
