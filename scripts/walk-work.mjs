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
/** The window a send can be pulled back in, the same ten seconds src/ollopa/pages/work/acts.ts holds. */
const SEND_WINDOW = 10_000

mkdirSync(dir, { recursive: true })

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const page = await browser.newPage()

// Anything the browser complains about, kept and printed at the end: a warning in the console is a
// defect like any other, and a walk that does not look at it is not a walk.
const noise = []
page.on("pageerror", (e) => noise.push(`page error: ${e.message.split("\n")[0]}`))
page.on("response", (r) => { if (r.status() >= 400) noise.push(`${r.status()} ${r.url()}`) })
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") noise.push(`${m.type()}: ${m.text().replace(/\s+/g, " ").slice(0, 160)}`)
})
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
const paneRaw = () => page.evaluate(() => {
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
/** The pane in one line: name, the one step back, and what its walker says. */
const pane = async () => {
  const p = await paneRaw()
  return p ? `${p.name}${p.stepBack ? ` (‹ ${p.stepBack})` : ""}${p.count ? ` · ${p.count}` : " · no walker"}` : "(no pane)"
}
/** The pane's field labels, in the order it shows them: what the seat's level one actually is. */
const paneFields = () => page.evaluate(() =>
  Array.from(document.querySelectorAll("aside dl dt")).map((el) => el.textContent.trim()).join(" · ") || "(no fields)")
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
  await page.click('[data-page-active="true"] [role="row"] button[data-row-menu]')
  await wait(400)
  console.log("A menu items:", await page.evaluate(() => Array.from(document.querySelectorAll('[role="menuitem"],[role="menu"] [data-slot="dropdown-menu-label"]')).map((el) => el.textContent.trim()).join(" | ")))
console.log("A opened the contact:", await clickReal('[role="menuitem"]', "Open "))
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

// Defect 7: the same pane opened from the thread's own "Contact details" must carry the same list.
await page.keyboard.press("Escape")
await wait(400)
await clickReal('[data-page-active="true"] button', "Contact details")
await wait(300)
await clickReal('[data-page-active="true"] button', "Open ")
await wait(600)
console.log("A the same pane from the thread:", await pane())
await page.keyboard.press("]")
await wait(400)
console.log("A after ] from that route:      ", await pane())
await page.keyboard.press("Escape")
await wait(300)

await wait(200)
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
console.log("B queue says:", await page.evaluate(() =>
  document.querySelector('[data-page-active="true"] [role="main"], [data-page-active="true"]')?.innerText.split("\n").find((l) => /more behind|last/.test(l)) ?? "(no line)"))
console.log("B see-the-list control:", await page.evaluate(() =>
  !!Array.from(document.querySelectorAll('[data-page-active="true"] button')).find((b) => b.textContent.trim() === "See the list")))
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

// Done on the page behind the pane: the queue moves on and the pane moves with it. On a phone the
// pane is the whole screen, so the page behind it cannot be pressed at all: close it first, which is
// what a person on a phone does, and the same lap carries on.
if (phone) { await page.keyboard.press("Escape"); await wait(400) }
console.log("B Done pressed:", await clickReal('[data-page-active="true"] button', "Done"))
await wait(700)
console.log("B task after Done:", await page.evaluate(() => document.querySelector('[data-page-active="true"] h3')?.textContent ?? ""))
console.log("B pane after Done:", await pane(), phone
  ? "· (phone: the pane was closed to reach the page, so there is nothing to move)"
  : "· the pane and the page must name the same person, and the count must be one shorter")
if (phone) { await page.evaluate(() => document.querySelector('[data-page-active="true"] [data-item] button')?.click()); await wait(600) }
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
  const row = document.querySelector('[data-page-active="true"] [data-section="home-replies"] [data-row]')
  if (!row) return null
  row.focus()
  row.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
  return row.getAttribute("data-item")
})
await wait(600)
console.log("C row:", opened, "pane:", await pane())
console.log("C reply pane fields:", await paneFields())
const cAfter = await renders()
console.log("C after the pane: ", cAfter, cBefore === cAfter ? "· the page did not re-render" : "· THE PAGE RE-RENDERED")
await shot("c2-reply-beside")

console.log("C open the page:", await clickReal("aside button, aside a", "Open the page"))
await wait(800)
console.log("C trail:", await trail())
console.log("C lit on arrival:", await page.evaluate(() => document.querySelector(".ollopa-returned")?.textContent?.replace(/\s+/g, " ").slice(0, 40) ?? "(nothing lit)"))
console.log("C focused on arrival:", await page.evaluate(() => {
  const el = document.activeElement
  return el && el !== document.body ? `${el.tagName} "${(el.textContent ?? "").replace(/\s+/g, " ").slice(0, 34)}"` : "BODY — focus lost"
}))
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
// A mouse, not the keyboard: the task's own name on the row is the control that opens it.
const task = await page.evaluate(() => {
  const row = document.querySelector('[data-page-active="true"] [data-section="home-today"] [data-row]')
  const name = row?.querySelector("button")
  if (!name) return null
  name.click()
  return row.textContent.replace(/\s+/g, " ").slice(0, 50)
})
await wait(600)
console.log("D row:", task, "pane:", await pane())
console.log("D task pane fields:", await paneFields())
await shot("d1-task-beside")

console.log("D Done in the pane:", await clickReal("aside button", "Done"))
await wait(700)
console.log("D pane moved to:", await pane())
console.log("D Home says:", await page.evaluate(() =>
  document.querySelector('[data-page-active="true"] [data-section="home-today"] [role="status"]')?.textContent ?? "(no line)"))
await shot("d2-done-on-the-row")

// And an agent's proposal, read and declined from the pane.
await page.evaluate(() => {
  const row = document.querySelector('[data-page-active="true"] [data-section="home-approvals"] [data-row]')
  row?.focus()
  row?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
})
await wait(600)
console.log("D approval pane:", await pane())
await shot("d3-approval-beside")

console.log("D Decline in the pane:", await clickReal("aside button", "Decline"))
await wait(700)
console.log("D pane moved to:", await pane())
console.log("D Home says:", await page.evaluate(() =>
  document.querySelector('[data-page-active="true"] [data-section="home-approvals"] [role="status"]')?.textContent ?? "(no line)"))
await shot("d4-declined-on-the-row")

/* ------------------------- E. The Tasks list: the task itself, beside the list it is in */

await go("/ollopa/tasks")
await clickReal('[data-page-active="true"] button', "All tasks")
await wait(600)
console.log("E list mode:", await page.evaluate(() => document.querySelectorAll('[data-page-active="true"] [data-task-row]').length + " rows"))
console.log("E opened the task:", await clickReal('[data-page-active="true"] button', "Open the task beside"))
await wait(700)
console.log("E task pane:", await pane())
console.log("E task pane fields:", await paneFields())
await shot("e1-task-beside-the-list")
await page.keyboard.press("]")
await wait(500)
console.log("E after ]:", await pane())
// The one step in: the contact, which is the record's own Contact line made a destination.
console.log("E the one step in:", await page.evaluate(() => {
  const el = document.querySelector("aside dd a")
  if (!el) return false
  el.click()
  return el.textContent.trim()
}))
await wait(600)
console.log("E in-pane step:", await pane())
await shot("e2-contact-one-step-in")

/* ------------- F. The same pane, two seats: the fields are the seat's level one, not a list */

for (const [biz, role] of [["meridian", "sdr"], ["ridgeline", "sdr"]]) {
  await page.goto(base + "/#/", { waitUntil: "networkidle0" })
  await page.evaluate(([bz, rl]) => localStorage.setItem("ollopa.session", JSON.stringify({ business: bz, role: rl })), [biz, role])
  await go("/ollopa")
  await page.evaluate(() => {
    const el = document.querySelector('[data-page-active="true"] [data-section="home-today"] [data-row] button')
    el?.click()
  })
  await wait(700)
  console.log(`F ${biz}/${role} task pane:`.padEnd(30), await paneFields())
}

/* ------------------- G. The send that can be pulled back: ten seconds, twice over */

await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate(() => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "sdr" })))
await go("/ollopa/inbox")

/** The meaning in view and its count: what the page says is still waiting. */
const counts = () => page.evaluate(() =>
  document.querySelector('[data-page-active="true"] [data-inbox-group]')?.textContent.trim() ?? "(no group control)")

/** The state of the open thread and of its row in the list, in one line each. */
const sending = () => page.evaluate(() => {
  const root = document.querySelector('[data-page-active="true"]')
  const thread = root?.querySelector('section[aria-label^="Thread"]')
  const line = (el) => Array.from(el?.querySelectorAll("[role=status], .text-xs") ?? [])
    .map((x) => x.textContent.trim())
    .find((t) => t.startsWith("Sending") || t.startsWith("Sent")) ?? "(nothing)"
  return { thread: line(thread), row: line(root?.querySelector('[role="row"]')) }
})
const write = async (text) => {
  await page.evaluate(() => document.querySelector('[data-page-active="true"] textarea[aria-label^="Reply to"]')?.focus())
  await page.keyboard.type(text)
}

console.log("G counts before:      ", await counts())
console.log("G thread before:      ", await page.evaluate(() => document.querySelector('[data-page-active="true"] section[aria-label^="Thread"] h2')?.textContent ?? ""))
await write("Thursday works — I will send an invite.")
console.log("G sent:", await clickReal('[data-page-active="true"] button', "Send"))
await wait(700)
console.log("G within the window:", JSON.stringify(await sending()))
console.log("G counts sending:     ", await counts())

// Pulled back inside the ten seconds: nothing was sent, and the words come back.
await clickReal('[data-page-active="true"] button', "Undo")
await wait(600)
console.log("G after undo:       ", JSON.stringify(await sending()))
console.log("G composer after undo:", JSON.stringify(await page.evaluate(() =>
  document.querySelector('[data-page-active="true"] textarea[aria-label^="Reply to"]')?.value ?? "")))
console.log("G counts after undo:  ", await counts())
await shot("g1-undo-put-it-back")

// Sent again and left alone: after ten seconds it has gone and says so.
console.log("G sent again:", await clickReal('[data-page-active="true"] button', "Send"))
await wait(SEND_WINDOW + 1500)
console.log("G after the window: ", JSON.stringify(await sending()))
console.log("G counts after:       ", await counts())
console.log("G thread moved on to: ", await page.evaluate(() => document.querySelector('[data-page-active="true"] section[aria-label^="Thread"] h2')?.textContent ?? ""))
await shot("g2-sent")

// The reply that was answered is in Handled, and its row says so. The meanings are one Select, so
// open it and pick Handled.
await page.click('[data-page-active="true"] [data-inbox-group]')
await wait(300)
await clickReal('[role="option"]', "Handled")
await wait(700)
console.log("G in Handled:         ", await page.evaluate(() => {
  const row = Array.from(document.querySelectorAll('[data-page-active="true"] [role="row"]'))
    .find((r) => r.textContent.includes("Sent"))
  return row ? row.textContent.replace(/\s+/g, " ").slice(0, 60) : "(not there)"
}))
await shot("g3-handled")

console.log(noise.length === 0 ? "\nconsole: silent" : `\nconsole: ${noise.length} complaint(s)\n  ${[...new Set(noise)].join("\n  ")}`)

await browser.close()
