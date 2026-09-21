// Walk the three laps the Inbox, Tasks and Home own, and photograph every step.
//
//   node scripts/walk-work.mjs shots/chains/work 1440 900
//   node scripts/walk-work.mjs shots/chains/work 400 860
//
// It expects a preview server on OPD_BASE (default http://localhost:4177), and signs in as the
// Meridian SDR, whose day these three laps are.
//
//   A. Inbox › reply › contact beside › the deal beside (one step in) › back › next reply,
//      with the half-typed reply checked before and after the pane.
//   B. Tasks › the task in the queue › the contact beside › Done on the page › ] to the next.
//   C. Home › a reply beside › "Open the page" › the crumb › the Home row lit and focused.
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const [dir = "shots/chains/work", w = "1440", h = "900"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4177"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
// At phone width the Inbox is the list, and the thread is a page reached by tapping a row; the same
// lap is walked, from the thread's own controls rather than from the row's menu.
const phone = Number(w) < 640

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
const go = async (route) => {
  await page.goto(`${base}/#${route}`, { waitUntil: "networkidle0" })
  await page.reload({ waitUntil: "networkidle0" })
  await wait(500)
}
const pane = () => page.evaluate(() => {
  const el = document.querySelector("aside[aria-label*='beside']")
  if (!el) return null
  return {
    name: el.querySelector("h2")?.textContent ?? "",
    stepBack: el.querySelector("header button:first-child")?.textContent?.trim() ?? "",
    count: el.querySelector("footer span")?.textContent ?? "",
    body: (el.querySelector("div > div:nth-child(2)")?.textContent ?? "").slice(0, 70),
  }
})
/** A real mouse click on the first visible element matching `selector` whose text starts with `text`. */
const clickReal = async (selector, text) => {
  for (const h of await page.$$(selector)) {
    const ok = await h.evaluate((el, t) => el.textContent.trim().startsWith(t) && el.offsetParent !== null, text)
    if (ok) { await h.click(); return true }
  }
  return false
}

const clickText = (selector, text) => page.evaluate((s, t) => {
  const el = Array.from(document.querySelectorAll(s)).find((b) => b.textContent.trim().startsWith(t) && b.offsetParent !== null)
  if (!el) return false
  el.click()
  return true
}, selector, text)
/** The dev-only render counters, so "the page did not re-render" is read rather than assumed. */
const renders = () => page.evaluate(() =>
  Array.from(document.querySelectorAll("[data-renders]")).map((el) => el.textContent.trim()).join(" · ") || "(no counter: production build)")
const trail = () => page.evaluate(() => document.querySelector('nav[aria-label="Your path"]')?.innerText.replace(/\n/g, " ") ?? "(none)")

await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate(() => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "sdr" })))

/* ------------------------------------------------------- A. Inbox › contact › deal › back › next */

await go("/ollopa/inbox")
await shot("a1-inbox")

if (phone) {
  await page.click('[data-page-active="true"] [role="row"]')
  await wait(500)
}

// Half a reply, typed and not sent. It has to be here at the end of the lap.
await page.evaluate(() => {
  const t = document.querySelector('[data-page-active="true"] textarea[aria-label^="Reply to"]')
  if (t) t.focus()
})
await page.keyboard.type("Thanks Nadia — Thursday works, I will send")
const draftBefore = await page.evaluate(() => document.querySelector('[data-page-active="true"] textarea[aria-label^="Reply to"]')?.value ?? "")
console.log("A draft typed:", JSON.stringify(draftBefore))
const aBefore = await renders()
console.log("A before the pane:", aBefore)

// The reply's contact, beside the thread. Opened from the row's own menu.
if (phone) {
  // The thread's own "Contact details" door, and the contact inside it.
  await clickReal('[data-page-active="true"] button', "Contact details")
  await wait(300)
  console.log("A contact opened:", await clickReal('[data-page-active="true"] button', "Open "))
} else {
  await page.click('[data-page-active="true"] [role="row"] button[aria-label^="More actions"]')
  await wait(400)
  console.log("A menu opened:", await clickReal('[role="menuitem"]', "Open contact"))
}
await wait(700)
console.log("A contact pane:", await pane())
const draftWithPane = await page.evaluate(() => document.querySelector('[data-page-active="true"] textarea[aria-label^="Reply to"]')?.value ?? "")
console.log("A draft with the pane open:", JSON.stringify(draftWithPane), draftWithPane === draftBefore ? "· unchanged" : "· LOST")
const aAfter = await renders()
console.log("A after the pane: ", aAfter, aBefore === aAfter ? "· the page did not re-render" : "· THE PAGE RE-RENDERED")
await shot("a2-contact-beside")

// One step in: the deal behind the same reply, from the thread, with "‹ the contact" in the header.
// Whichever deal this reply carries: the underlined button in the thread's own header.
const wentToDeal = await page.evaluate(() => {
  const el = document.querySelector('[data-page-active="true"] section[aria-label^="Thread"] header button.underline')
  if (!el) return false
  el.click()
  return true
})
await wait(600)
console.log("A deal pane:", wentToDeal ? await pane() : "(this reply has no deal)")
await shot("a3-deal-beside")

// Back out the one step, then close, then the next reply.
await page.evaluate(() => {
  const el = document.querySelector("aside[aria-label*='beside'] header button")
  if (el && el.textContent.trim()) el.click()
})
await wait(400)
console.log("A after ‹ back:", await pane())
await shot("a4-back-to-contact")

await page.keyboard.press("Escape")
await wait(400)
const draftClosed = await page.evaluate(() => document.querySelector('[data-page-active="true"] textarea[aria-label^="Reply to"]')?.value ?? "")
console.log("A draft after the pane closed:", JSON.stringify(draftClosed), draftClosed === draftBefore ? "· unchanged" : "· LOST")
if (!phone) { await page.keyboard.press("j"); await wait(400) }
const draftAfter = await page.evaluate(() => document.querySelector('[data-page-active="true"] textarea[aria-label^="Reply to"]')?.value ?? "")
console.log("A next reply open:", await page.evaluate(() => document.querySelector('[data-page-active="true"] section[aria-label^="Thread"] h2')?.textContent ?? ""))
console.log("A draft after the pane closed (previous reply):", JSON.stringify(draftAfter))
await shot("a5-next-reply")

/* ---------------------------------------------------- B. Tasks › contact beside › done › next */

await go("/ollopa/tasks")
await shot("b1-tasks-queue")
const bBefore = await renders()
console.log("B before the pane:", bBefore)
console.log("B task 1:", await page.evaluate(() => document.querySelector('[data-page-active="true"] h3')?.textContent ?? ""))

await page.evaluate(() => {
  const el = document.querySelector('[data-page-active="true"] [data-item] button')
  el?.click()
})
await wait(600)
console.log("B contact pane:", await pane())
const bAfter = await renders()
console.log("B after the pane: ", bAfter, bBefore === bAfter ? "· the page did not re-render" : "· THE PAGE RE-RENDERED")
await shot("b2-contact-beside")

// Done on the page behind the pane: the queue moves on, the pane stays open.
console.log("B Done pressed:", await clickReal('[data-page-active="true"] button', "Done"))
await wait(700)
console.log("B task after Done:", await page.evaluate(() => document.querySelector('[data-page-active="true"] h3')?.textContent ?? ""))
console.log("B pane still open:", await pane())
await shot("b3-done")

await page.keyboard.press("BracketRight")
await wait(500)
console.log("B pane after ]:", await pane())
await shot("b4-next")

/* ------------------------------------------- C. Home › a reply beside › the page › the crumb */

await go("/ollopa")
await shot("c1-home")
const cBefore = await renders()
console.log("C before the pane:", cBefore)

const opened = await page.evaluate(() => {
  const row = document.querySelector('[data-page-active="true"] [data-section="home-replies"] li[data-row]')
  if (!row) return null
  row.focus()
  row.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
  return row.getAttribute("data-item")
})
await wait(600)
console.log("C row:", opened, "pane:", await pane())
const cAfter = await renders()
console.log("C after the pane: ", cAfter, cBefore === cAfter ? "· the page did not re-render" : "· THE PAGE RE-RENDERED")
await shot("c2-reply-beside")

console.log("C open the page:", await clickReal("aside button", "Open the page"))
await wait(800)
console.log("C trail:", await trail())
await shot("c3-thread-page")

await page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Your path"]')
  ;(nav?.querySelector("ol button") ?? nav?.querySelector("button"))?.click()
})
await wait(700)
console.log("C lit:", await page.evaluate(() => document.querySelector(".ollopa-returned")?.innerText.replace(/\n/g, " ").slice(0, 60) ?? "(nothing lit)"))
console.log("C focused:", await page.evaluate(() => document.activeElement?.innerText?.replace(/\n/g, " ").slice(0, 60) ?? "(none)"))
await shot("c4-back-home-lit")

/* ------------------------- D. Home › the task beside › Done in the pane › the row says so */

await go("/ollopa")
const task = await page.evaluate(() => {
  const row = document.querySelector('[data-page-active="true"] [data-section="home-today"] li[data-row]')
  if (!row) return null
  row.focus()
  row.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
  return row.textContent.replace(/\s+/g, " ").slice(0, 50)
})
await wait(600)
console.log("D row:", task, "pane:", await pane())
await shot("d1-task-beside")

console.log("D Done in the pane:", await clickReal("aside button", "Done"))
await wait(700)
console.log("D Home says:", await page.evaluate(() =>
  document.querySelector('[data-page-active="true"] [data-section="home-today"] [role="status"]')?.textContent ?? "(no line)"))
await shot("d2-done-on-the-row")

// And an agent's proposal, read and declined from the pane.
await page.evaluate(() => {
  const row = document.querySelector('[data-page-active="true"] [data-section="home-approvals"] li[data-row]')
  row?.focus()
  row?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
})
await wait(600)
console.log("D approval pane:", await pane())
await shot("d3-approval-beside")

console.log("D Decline in the pane:", await clickReal("aside button", "Decline"))
await wait(700)
console.log("D Home says:", await page.evaluate(() =>
  document.querySelector('[data-page-active="true"] [data-section="home-approvals"] [role="status"]')?.textContent ?? "(no line)"))
await shot("d4-declined-on-the-row")

await browser.close()
