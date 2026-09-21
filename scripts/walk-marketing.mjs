// Walk chain 2 — campaign › audience beside › open the page › a person in it beside › back to the
// audience › back to the campaign — and photograph every step, as the Ridgeline marketer.
//
// The same shape as `walk.mjs`, which walks the sequence chain: one Chrome, one lap, a picture at
// every step. Every move here is a keyboard move — focus the control and press Enter, Escape to
// close the pane — because the rule is that the keyboard runs the whole lap.
//
//   node scripts/walk-marketing.mjs shots/chains/marketing 1440 900
//   node scripts/walk-marketing.mjs shots/chains/marketing 400 860
//
// It expects a preview server on OPD_BASE (default http://localhost:4172).
// The six pictures, in order:
//   1-campaign   the campaign record, nothing open
//   2-pane       the audience open beside it, the campaign still there and untouched
//   3-audience   "Open the page" — the audience record, with the campaign on the trail
//   4-person     a person in the audience open beside the audience
//   5-back-aud   Escape — back on the audience, focus returned to the row
//   6-back-camp  the crumb — the campaign again, with the audience row lit
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const [dir = "shots/chains/marketing", w = "1440", h = "900"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4172"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const campaign = process.env.OPD_CAMPAIGN ?? "camp-1"

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
const trail = () => page.evaluate(() => document.querySelector('nav[aria-label="Your path"]')?.innerText.replace(/\n/g, " ") ?? "(none)")
const focused = () => page.evaluate(() => document.activeElement?.innerText?.replace(/\n/g, " ").slice(0, 60) ?? "(none)")

/** Focus a control found by its text and press Enter: a keyboard move, not a click. */
const press = async (selector, text) => {
  const found = await page.evaluate((sel, want) => {
    const el = Array.from(document.querySelectorAll(sel))
      .find((e) => e.offsetParent !== null && (want === null || e.textContent.trim() === want))
    if (!el) return null
    el.focus()
    return el.textContent.trim()
  }, selector, text ?? null)
  if (!found) throw new Error(`nothing to press: ${selector} ${text ?? ""}`)
  await page.keyboard.press("Enter")
  return found
}

// Sign in as the Ridgeline marketer, the seat this chain belongs to.
await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate(() => localStorage.setItem("ollopa.session", JSON.stringify({ business: "ridgeline", role: "marketer" })))
await page.goto(`${base}/#/ollopa/campaigns/${campaign}`, { waitUntil: "networkidle0" })
await page.reload({ waitUntil: "networkidle0" })
await wait(500)

console.log("trail on arrival (a deep link starts empty):", await trail())
await shot("1-campaign")

// 1 → 2. The audience row in the campaign's header opens the audience beside the campaign.
const audienceName = await page.evaluate(() => {
  const el = document.querySelector('[data-page-active="true"] [data-item] button')
  if (!el) return null
  el.focus()
  return el.textContent.trim()
})
if (!audienceName) throw new Error("no audience row on this campaign")
await page.keyboard.press("Enter")
await wait(600)
console.log("pane:", await page.evaluate(() => document.querySelector("aside h2")?.textContent ?? "(no pane)"))
console.log("row marked on the page:", await page.evaluate(() => !!document.querySelector(".ollopa-beside-open")))
await shot("2-pane")

// 2 → 3. "Open the page": the trail takes the campaign and the audience row with it.
await press("aside button", "Open the page")
await wait(700)
console.log("trail:", await trail())
await shot("3-audience")

// 3 → 4. A person in the audience, read beside the audience.
const person = await page.evaluate(() => {
  // The People section of the audience, not the campaign row in its header grid.
  const el = Array.from(document.querySelectorAll('[data-page-active="true"] #people [data-item] button'))
    .find((e) => e.offsetParent !== null)
  if (!el) return null
  el.focus()
  return el.textContent.trim()
})
if (!person) throw new Error("no person in this audience")
await page.keyboard.press("Enter")
await wait(600)
console.log("person pane:", await page.evaluate(() => document.querySelector("aside h2")?.textContent ?? "(no pane)"))
console.log("previous and next:", await page.evaluate(() => document.querySelector("aside footer")?.innerText.replace(/\n/g, " ") ?? "(no list)"))
await shot("4-person")

// 4 → 5. Escape: back on the audience, with focus on the row that opened the pane.
await page.keyboard.press("Escape")
await wait(500)
console.log("pane after Escape:", await page.evaluate(() => (document.querySelector("aside h2") ? "still open" : "closed")))
console.log("focus is back on:", await focused())
await shot("5-back-aud")

// 5 → 6. The crumb: back to the campaign, scrolled to the audience row, lit and focused.
// The shell draws the full crumbs from `sm` up and one "‹ back" step on a phone; take whichever
// one is actually on screen.
const crumb = await page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Your path"]')
  const el = Array.from(nav?.querySelectorAll("button") ?? []).find((b) => b.offsetParent !== null)
  if (!el) return null
  el.focus()
  return el.textContent.trim()
})
if (!crumb) throw new Error("no crumb to go back to")
console.log("crumb pressed:", crumb)
await page.keyboard.press("Enter")
await wait(700)
console.log("lit:", await page.evaluate(() => document.querySelector(".ollopa-returned")?.innerText.replace(/\n/g, " ").slice(0, 60) ?? "(nothing lit)"))
console.log("focused:", await focused())
console.log("trail now:", await trail())
await shot("6-back-camp")

await browser.close()
