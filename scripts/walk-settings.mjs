// Walk the two settings chains of BUILD-CHAINS.md and photograph every step.
//
// Chain 4 — a page › a setting it links to › back to the row. Meridian admin, from the sequence's
//           sending rules into Email sending, the row lit, then the crumb back to the sequence.
// Chain 5 — Settings › change the set-up answers › back to the row, with the sidebar redrawn and a
//           line saying what moved. Meridian admin.
//
//   node scripts/walk-settings.mjs shots/chains/settings 1440 900
//   node scripts/walk-settings.mjs shots/chains/settings 400 860
//
// It expects a preview server on OPD_BASE (default http://localhost:4174).
//
// The outbound click of chain 4 lives on the sequence page, which belongs to the engage builder.
// If that link already follows the trail the walk clicks it. If it is still a bare href, the walk
// says so and seeds the trail with exactly what `follow` writes — same route, same title, same
// anchor — so the settings half of the chain is still walked for real and not mimed.
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const [dir = "shots/chains/settings", w = "1440", h = "900"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4174"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const seq = process.env.OPD_SEQUENCE ?? "seq-1"
const USER = "Daniel Okafor"          // Meridian's RevOps admin
const CHAIN_KEY = `ollopa.chain.meridian.${USER}`

mkdirSync(dir, { recursive: true })

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const page = await browser.newPage()
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 })
page.on("console", (m) => { if (m.type() === "error") console.log("  browser error:", m.text()) })

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const shot = async (name) => {
  const out = `${dir}/${name}-${w}.png`
  await page.screenshot({ path: out, fullPage: false })
  console.log("  wrote", out)
}
const trail = () => page.evaluate(() =>
  document.querySelector('nav[aria-label="Your path"]')?.innerText.replace(/\n/g, " ") ?? "")
const lit = () => page.evaluate(() =>
  document.querySelector(".ollopa-returned")?.innerText.replace(/\s+/g, " ").slice(0, 80) ?? "(nothing lit)")
const focused = () => page.evaluate(() => {
  const el = document.activeElement
  if (!el || el === document.body) return "(body)"
  return `${el.tagName.toLowerCase()} ${(el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").slice(0, 50)}`
})

// Signed in as the Meridian admin, the seat both chains belong to.
await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate(() => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "admin" })))

/* ------------------------------------------------------------------------------------- chain 4 */

console.log("\nCHAIN 4 — the sequence's sending rules › Email sending › back to the row")

await page.goto(`${base}/#/ollopa/sequences/${seq}`, { waitUntil: "networkidle0" })
await page.reload({ waitUntil: "networkidle0" })
await wait(600)

// The sending settings are behind the sequence's own door; open it and bring it into view.
await page.evaluate(() => {
  const root = document.querySelector('[data-page-active="true"]') ?? document
  const door = root.querySelector('[data-door="seq.settings"]')
  if (door?.getAttribute("data-open") !== "true") door?.querySelector("button")?.click()
  root.querySelector("#seq-settings")?.scrollIntoView({ block: "start" })
})
await wait(500)
await shot("1-sequence-rules")

// The outbound leg: engage's link into Settings, if it already follows the trail.
const clicked = await page.evaluate(() => {
  const root = document.querySelector('[data-page-active="true"]') ?? document
  const el = Array.from(root.querySelectorAll("#seq-settings a, #seq-settings button"))
    .find((e) => /bounce guard|email sending|mailboxes and limits/i.test(e.textContent ?? ""))
  if (!el) return null
  el.click()
  return el.textContent.trim()
})
await wait(700)
let path = await trail()
if (path) {
  console.log(`  followed "${clicked}" — trail: ${path}`)
} else {
  console.log(`  the sequence's link ("${clicked ?? "none found"}") is still a bare navigate: engage owns it.`)
  console.log("  seeding the trail with exactly what follow() writes, and walking the settings half for real.")
  await page.goto(`${base}/#/ollopa/settings/email-sending?row=mail.bounce-guard`, { waitUntil: "networkidle0" })
  await page.evaluate(([key, route]) => sessionStorage.setItem(key, JSON.stringify([
    { route, title: "Q4 enterprise outbound · Sequences", anchor: "seq.settings" },
  ])), [CHAIN_KEY, `/ollopa/sequences/${seq}`])
  await page.reload({ waitUntil: "networkidle0" })
  await wait(900)
  path = await trail()
  console.log("  trail:", path || "(none)")
}

console.log("  lit on arrival:", await lit())
console.log("  focused:", await focused())
console.log("  the sequence is still mounted:", await page.evaluate(() =>
  !!document.querySelector(`[data-page]`) && document.querySelectorAll("[data-page]").length > 1))
await shot("2-setting-lit")

// The crumb back: the sequence exactly as it was, scrolled to the door that was left.
await page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Your path"]')
  const crumb = nav?.querySelector("ol button") ?? nav?.querySelector("button")
  crumb?.click()
})
await wait(700)
console.log("  back — lit:", await lit())
console.log("  back — focused:", await focused())
await shot("3-back-to-the-sequence")

/* ------------------------------------------------------------------------------------- chain 5 */

console.log("\nCHAIN 5 — Settings › change the set-up answers › back to the row, with what moved")

await page.goto(`${base}/#/ollopa/settings/how-your-team-works`, { waitUntil: "networkidle0" })
await page.reload({ waitUntil: "networkidle0" })
await wait(700)

// "Workspace profile" sits behind the area's one door for this seat; open it and go to the row.
await page.evaluate(() => {
  const root = document.querySelector('[data-page-active="true"]') ?? document
  const door = root.querySelector('[data-door="settings.how-your-team-works"]')
  if (door?.getAttribute("data-open") !== "true") door?.querySelector("button")?.click()
})
await wait(400)
await page.evaluate(() => {
  const root = document.querySelector('[data-page-active="true"]') ?? document
  root.querySelector('[data-row="work.profile"]')?.scrollIntoView({ block: "center" })
})
await wait(400)
await shot("4-settings-profile")

const wentToSetup = await page.evaluate(() => {
  const root = document.querySelector('[data-page-active="true"]') ?? document
  const el = Array.from(root.querySelectorAll('[data-row="work.profile"] button'))
    .find((b) => /change the answers/i.test(b.textContent ?? ""))
  if (!el) return false
  el.click()
  return true
})
if (!wentToSetup) throw new Error('no "Change the answers" button on the workspace profile row')
await wait(800)
console.log("  route:", await page.evaluate(() => location.hash))
console.log("  trail:", (await trail()) || "(none)")
console.log("  the sidebar is there:", await page.evaluate(() => !!document.querySelector("nav a, nav button")))
await shot("5-setup-in-the-shell")

// Change an answer, then finish. The answers save as they are made; the button is the way back.
await page.evaluate(() => {
  const labels = Array.from(document.querySelectorAll("label"))
  const grow = labels.find((l) => /grow existing accounts/i.test(l.textContent ?? ""))
  grow?.querySelector("input")?.click()
})
await wait(300)
await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll("button"))
    .find((b) => /^(save the answers|start)$/i.test(b.textContent.trim()))
  el?.click()
})
await wait(900)
console.log("  route:", await page.evaluate(() => location.hash))
console.log("  back — lit:", await lit())
console.log("  back — focused:", await focused())
console.log("  the line:", await page.evaluate(() =>
  document.querySelector('[data-row="work.profile"] [role="status"]')?.textContent?.replace(/\s+/g, " ") ?? "(no line)"))
await shot("6-back-with-the-line")

/* ------------------------------------------------- the setting pane, where a full trip is not needed */

console.log("\nTHE SETTING PANE — a request record reads the setting it touches beside itself")

await page.goto(`${base}/#/ollopa/requests`, { waitUntil: "networkidle0" })
await page.reload({ waitUntil: "networkidle0" })
await wait(700)
// Requests touch different things; walk the queue until one touches a setting.
const ids = await page.evaluate(() => Array.from(
  document.querySelectorAll('[data-page-active="true"] a[href*="/ollopa/requests/"]'))
  .map((a) => a.getAttribute("href")).slice(0, 12))
let opened = null
for (const id of ids) {
  await page.goto(base + "/" + id, { waitUntil: "networkidle0" })
  await wait(500)
  opened = await page.evaluate(() => {
    const root = document.querySelector('[data-page-active="true"]') ?? document
    const el = Array.from(root.querySelectorAll("button[data-item]"))
      .find((b) => /^(pipe|team|plan)\./.test(b.getAttribute("data-item") ?? ""))
    if (!el) return null
    el.click()
    return el.textContent.trim()
  })
  if (opened) break
}
await wait(600)
console.log("  opened beside:", opened ?? "(no touched setting on this request)")
console.log("  pane:", await page.evaluate(() =>
  document.querySelector("aside h2")?.textContent ?? "(no pane)"))
console.log("  a door in the pane:", await page.evaluate(() =>
  document.querySelectorAll("aside [data-door]").length))
await shot("7-setting-beside-a-request")

// The Save bar is the page's one convention and it travels into the pane: a change marks the row
// and raises the bar, nothing saves on its own. It only raises for a row whose control is inline —
// a row whose control is one of the page's drawers says so and leaves "Open the page" as the way on.
const control = await page.evaluate(() => {
  const el = document.querySelector("aside input, aside [role=switch], aside [role=combobox]")
  if (!el) return null
  if (el.tagName === "INPUT") { el.focus(); return "input" }
  el.click()
  return el.getAttribute("role")
})
if (control === "input") { await page.keyboard.type("4"); await wait(400) }
console.log("  the pane's control:", control ?? "a drawer that belongs to the page")
console.log("  save bar:", await page.evaluate(() =>
  document.querySelector('aside [aria-label="Unsaved changes"]')?.innerText.replace(/\n/g, " ") ?? "(not raised)"))
await shot("8-setting-beside-save-bar")

await browser.close()
