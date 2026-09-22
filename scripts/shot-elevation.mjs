// The four levels and the chrome, where they actually appear.
//   node scripts/shot-elevation.mjs shots/elevation 1440 900
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"
const [dir = "shots/elevation", w = "1440", h = "900"] = process.argv.slice(2)
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
    await page.reload({ waitUntil: "networkidle0" }); await wait(1000)
  }
  await as("sdr", "/ollopa"); await shot("1-home")
  await as("ae", "/ollopa/deals/d-118"); await shot("2-deal-record")

  // People with a pane open: page, raised rows, floating pane, chrome around all of it.
  await as("sdr", "/ollopa/people")
  const n = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('[data-page-active="true"] button'))
      .filter((b) => b.getAttribute("aria-haspopup") === "menu" && b.offsetParent !== null)
    all.forEach((el, i) => el.setAttribute("data-probe", String(i)))
    return all.length
  })
  for (let i = 0; i < n; i++) {
    await page.click(`[data-probe="${i}"]`); await wait(300)
    const hit = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('[role="menuitem"]')).find((x) => /beside/i.test(x.textContent))
      if (!el) return false
      el.click(); return true
    })
    if (hit) break
    await page.keyboard.press("Escape"); await wait(150)
  }
  await wait(800); await shot("3-people-pane")

  // A dialog: the large shadow over a dimmed page.
  await as("ae", "/ollopa/deals/d-118")
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('[data-page-active="true"] button, [data-page-active="true"] a'))
      .find((b) => /^(Delete deal|Mark lost and archive|Mark won)$/.test(b.textContent.trim()))
    el?.setAttribute("data-probe2", "1")
  })
  await page.click('[data-probe2="1"]').catch(() => {})
  await wait(700); await shot("4-dialog")

  await page.goto(base + "/#/design", { waitUntil: "networkidle0" })
  await page.reload({ waitUntil: "networkidle0" }); await wait(700); await shot("5-tokens")
  await page.close()
}
await browser.close()
