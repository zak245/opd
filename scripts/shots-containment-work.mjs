// The Inbox and the Tasks queue after the containment pass, in both themes (DESIGN.md §5).
//
//   node scripts/shots-containment-work.mjs shots/containment/work
//
// The Inbox is two containers side by side — the reply list and the open thread — and the queue is
// one container holding the task being worked, with what is behind it in the footer.
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const [dir = "shots/containment/work"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4177"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

mkdirSync(dir, { recursive: true })

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const noise = []

for (const mode of ["light", "dark"]) {
  const page = await browser.newPage()
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") noise.push(`${mode} ${m.type()}: ${m.text().slice(0, 160)}`) })
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
  const shot = async (name) => {
    await page.screenshot({ path: `${dir}/${name}-${mode}-1440.png` })
    console.log("wrote", `${dir}/${name}-${mode}-1440.png`)
  }
  const go = async (route) => {
    await page.goto(`${base}/#${route}`, { waitUntil: "networkidle0" })
    await page.reload({ waitUntil: "networkidle0" })
    await wait(800)
  }

  await page.goto(base + "/#/", { waitUntil: "networkidle0" })
  await page.evaluate((t) => {
    localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "sdr" }))
    localStorage.setItem("ollopa.theme", JSON.stringify(t))
    localStorage.removeItem("ollopa.tasks.meridian.sdr.mode")
  }, mode)

  await go("/ollopa/inbox")
  await shot("inbox")

  await go("/ollopa/tasks")
  await shot("tasks-queue")

  await page.close()
}

console.log(noise.length === 0 ? "console: silent" : `console:\n  ${noise.join("\n  ")}`)
await browser.close()
