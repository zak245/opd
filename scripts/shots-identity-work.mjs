// The three Work surfaces, in both themes, after the identity pass (DESIGN.md §5).
//
//   node scripts/shots-identity-work.mjs shots/identity/work
//
// The Inbox with the deal behind a reply open beside it, the Tasks queue on its current task, and
// the Tasks list — each at 1440, light and dark, so a family hue and a status chip can be checked
// in both.
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const [dir = "shots/identity/work"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4177"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

mkdirSync(dir, { recursive: true })

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

for (const mode of ["light", "dark"]) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  const shot = async (name) => {
    await page.screenshot({ path: `${dir}/${name}-${mode}-1440.png` })
    console.log("wrote", `${dir}/${name}-${mode}-1440.png`)
  }
  const go = async (route) => {
    await page.goto(`${base}/#${route}`, { waitUntil: "networkidle0" })
    await page.reload({ waitUntil: "networkidle0" })
    await wait(700)
  }

  await page.goto(base + "/#/", { waitUntil: "networkidle0" })
  await page.evaluate((t) => {
    localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "sdr" }))
    // The store keeps JSON, so the theme is written the way the product writes it.
    localStorage.setItem("ollopa.theme", JSON.stringify(t))
  }, mode)

  // The Inbox, with the deal behind the open reply read beside it.
  await go("/ollopa/inbox")
  await page.evaluate(() => {
    const el = document.querySelector('[data-page-active="true"] section[aria-label^="Thread"] header button.underline')
    el?.click()
  })
  await wait(700)
  await shot("inbox-deal-beside")

  // The queue, on the task it is on.
  await go("/ollopa/tasks")
  await shot("tasks-queue")

  // The same page as a list.
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('[data-page-active="true"] button')).find((b) => b.textContent.trim().startsWith("All tasks"))
    el?.click()
  })
  await wait(700)
  await shot("tasks-list")

  await page.close()
}

await browser.close()
