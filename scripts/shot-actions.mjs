// The five surfaces this folder owns, at 1440, for the before/after pair the actions pass asks for.
//
//   node scripts/shot-actions.mjs shots/actions/engage before
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"
const [dir = "shots/actions/engage", tag = "before"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4181"
mkdirSync(dir, { recursive: true })
const b = await puppeteer.launch({ executablePath: process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true, args: ["--hide-scrollbars"] })
const page = await b.newPage()
await page.setViewport({ width: 1440, height: 1200 })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const seat = async (role) => {
  await page.goto(base + "/#/", { waitUntil: "networkidle0" })
  await page.evaluate((r) => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: r })), role)
}
const go = async (route) => { await page.goto(`${base}/#/ollopa/${route}`, { waitUntil: "networkidle0" }); await page.reload({ waitUntil: "networkidle0" }); await wait(1000) }
const shot = async (name) => { await page.screenshot({ path: `${dir}/${name}-${tag}-1440.png` }); console.log("wrote", `${dir}/${name}-${tag}-1440.png`) }

await seat("sdr")
await go("sequences/seq-1"); await shot("sequence-record")
await go("lists/list-13"); await shot("list-record")

// the list pane, from the sequence's "Fed by"
await go("sequences/seq-1")
await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] a, [data-page-active="true"] button')).find(x => x.closest("p")?.textContent.startsWith("Fed by") && x.offsetParent !== null)?.click())
await wait(800); await shot("pane-list")
await page.keyboard.press("Escape"); await wait(400)

// the template pane, from a step
await page.evaluate(() => document.querySelectorAll('[data-page-active="true"] button').forEach(x => { if (x.textContent.trim()==="Open step" && x.offsetParent) x.click() }))
await wait(700)
await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] a, [data-page-active="true"] button')).find(x => x.closest("p")?.textContent.includes("Linked to template") && x.offsetParent !== null)?.click())
await wait(800); await shot("pane-template")
await page.keyboard.press("Escape"); await wait(400)

// the sequence pane, from a template record's "used by"
await go("templates/tpl-1")
await page.evaluate(() => document.querySelector('[data-page-active="true"] section ul li a, [data-page-active="true"] section ul li button')?.click())
await wait(800); await shot("pane-sequence")
await b.close()
