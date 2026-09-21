// Walk the sequence › a setting it links to › back to the row, and photograph every step.
//
// The sibling of `walk.mjs`: same Chrome, same preview server, a different lap. This is chain 4 of
// BUILD-CHAINS — the Meridian admin goes from the sequence's sending settings to Email sending in
// Settings and comes back to the exact link they left.
//
//   node scripts/walk-setting.mjs shots/chains/engage/chain4 1440 900
//
// The four pictures, in order:
//   1-sequence   the sequence, sending settings open (the keyboard did it: "s")
//   2-link       the link focused by the keyboard, about to be followed
//   3-settings   Settings, landed on the row the link named, with the trail in the header
//   4-back       the crumb clicked — the sequence again, at the link, lit and focused
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const [dir = "shots/chains/engage/chain4", w = "1440", h = "900"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4170"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const seq = process.env.OPD_SEQUENCE ?? "seq-1"
// Which link, and the row it names in Settings. The default is chain 4 of the brief.
const anchor = process.env.OPD_ANCHOR ?? "seq.link.mailboxes"

mkdirSync(dir, { recursive: true })

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const page = await browser.newPage()
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 })

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const shot = async (name) => {
  const out = `${dir}/${name}-${w}.png`
  await page.screenshot({ path: out, fullPage: false })
  console.log("wrote", out)
}
const trail = () => page.evaluate(() =>
  document.querySelector('nav[aria-label="Your path"]')?.innerText.replace(/\n/g, " ") ?? "(none)")

// The admin seat: sending settings and the schedules and rulesets behind them are theirs to change.
await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate(() => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "admin" })))
await page.goto(`${base}/#/ollopa/sequences/${seq}`, { waitUntil: "networkidle0" })
await page.reload({ waitUntil: "networkidle0" })
await wait(500)

// "s" is the page's own accelerator for the sending settings door. The keyboard opens it.
await page.keyboard.press("s")
await wait(400)
await page.evaluate((a) => document.querySelector(`[data-item="${a}"]`)?.scrollIntoView({ block: "center" }), anchor)
await wait(300)
console.log("trail before:", await trail())
await shot("1-sequence")

// Focus the link with the keyboard, so the lap is walked the way a keyboard user walks it.
await page.evaluate((a) => document.querySelector(`[data-item="${a}"]`)?.focus(), anchor)
await wait(200)
console.log("focused:", await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 60)))
await shot("2-link")

// Enter follows it. `follow` remembers the sequence and this link.
await page.keyboard.press("Enter")
await wait(900)
console.log("route:", await page.evaluate(() => location.hash))
console.log("trail after:", await trail())
console.log("lit in Settings:", await page.evaluate(() =>
  document.querySelector(".ollopa-returned")?.innerText.replace(/\n/g, " ").slice(0, 80) ?? "(nothing lit)"))
console.log("focused in Settings:", await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent?.trim().slice(0, 60)))
await shot("3-settings")

// The crumb, with the keyboard: back to the sequence, at the link, lit and focused, door still open.
// The phone crumb is in the DOM at every width, so take the one that is actually on screen.
await page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Your path"]')
  Array.from(nav?.querySelectorAll("button") ?? []).find((b) => b.offsetParent !== null)?.focus()
})
await page.keyboard.press("Enter")
await wait(700)
console.log("back at:", await page.evaluate(() => location.hash))
console.log("lit:", await page.evaluate(() => document.querySelector(".ollopa-returned")?.innerText.replace(/\n/g, " ").slice(0, 80) ?? "(nothing lit)"))
console.log("focused:", await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 60) ?? "(none)"))
await shot("4-back")

await browser.close()
