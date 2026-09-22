// The three screens the owner asked to see, plus the token sheet, at both widths and both themes.
//   node scripts/shot-identity.mjs shots/identity 1440 900
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"
const [dir = "shots/identity", w = "1440", h = "900"] = process.argv.slice(2)
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
    await wait(1000)
  }

  await as("sdr", "/ollopa")
  await shot("1-home")

  await as("sdr", "/ollopa/people")
  await page.evaluate(() => {
    const tr = document.querySelector('[data-page-active="true"] tbody tr')
    tr?.focus()
    tr?.dispatchEvent(new KeyboardEvent("keydown", { key: "b", bubbles: true }))
  })
  await wait(400)
  // Whatever the People table binds, fall back to opening the pane from the row's menu.
  if (!(await page.evaluate(() => !!document.querySelector("[data-beside]")))) {
    const n = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('[data-page-active="true"] button')).filter((b) => b.getAttribute("aria-haspopup") === "menu" && b.offsetParent !== null)
      all.forEach((el, i) => el.setAttribute("data-probe", String(i)))
      return all.length
    })
    for (let i = 0; i < n; i++) {
      await page.click(`[data-probe="${i}"]`)
      await wait(300)
      const hit = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('[role="menuitem"]')).filter((x) => /beside/i.test(x.textContent))
        // The person, not the company they work at: this shot is of the person pane.
        const el = items.find((x) => !/compan|account/i.test(x.textContent)) ?? items[0]
        if (!el) return false
        el.click(); return true
      })
      if (hit) break
      await page.keyboard.press("Escape"); await wait(150)
    }
  }
  await wait(800)
  await shot("2-people-pane")

  // People's own rows open the company beside them; the person pane lives where a chain reaches a
  // person from somewhere else, so it is photographed there.
  await as("sdr", "/ollopa/sequences/seq-1")
  await page.evaluate(() => document.querySelector("#seq-people")?.scrollIntoView()); await wait(300)
  await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] #seq-people [data-item] button')).find((b) => b.offsetParent !== null)?.click())
  await wait(800)
  await shot("5-person-pane")

  await as("ae", "/ollopa/deals/d-118")
  await shot("3-deal-record")

  await page.goto(base + "/#/design", { waitUntil: "networkidle0" })
  await page.reload({ waitUntil: "networkidle0" }); await wait(700)
  await shot("4-tokens")
  await page.close()
}
await browser.close()
