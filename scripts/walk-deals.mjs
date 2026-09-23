// Walk the three deal chains and photograph every step.
//
//   node scripts/walk-deals.mjs shots/chains/deals 1440 900
//   node scripts/walk-deals.mjs shots/chains/deals 400 860
//
// It expects a preview server on OPD_BASE (default http://localhost:4175). The lap is driven from
// the keyboard wherever the product offers a key, so the pictures are of the keyboard's path.
//
// Chain 1, board › quick look › open › back to the card:
//   1-board  2-quicklook  3-record  4-back
// Chain 2, deal › contact beside › back:
//   5-contact-pane  6-contact-next  7-contact-record  8-contact-back
// Chain 3, deal › company beside › back:
//   9-company-pane  10-company-closed
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const [dir = "shots/chains/deals", w = "1440", h = "900"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4175"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

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
const trail = () => page.evaluate(() => document.querySelector('nav[aria-label="Your path"]')?.innerText.replace(/\n/g, " › ") ?? "(none)")
const lit = () => page.evaluate(() => document.querySelector(".ollopa-returned")?.innerText.replace(/\n/g, " ").slice(0, 60) ?? "(nothing lit)")
const focused = () => page.evaluate(() => document.activeElement?.innerText?.replace(/\n/g, " ").slice(0, 60) ?? "(none)")
const paneName = () => page.evaluate(() => document.querySelector('aside[aria-label*=" beside "] h2')?.textContent ?? "(no pane)")
const openBesideRow = () => page.evaluate(() => document.querySelector(".ollopa-beside-open")?.innerText.replace(/\n/g, " ").slice(0, 60) ?? "(no row marked)")
/** Focus a control and press Enter: the keyboard's way of using it. */
const press = async (find, key = "Enter") => {
  const ok = await page.evaluate((f) => {
    const el = eval(f)
    if (!el) return false
    el.focus()
    return true
  }, find)
  if (!ok) throw new Error(`nothing to press: ${find}`)
  await page.keyboard.press(key)
}

// The Meridian AE, whose board this is.
await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate(() => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "ae" })))
await page.goto(`${base}/#/ollopa/deals`, { waitUntil: "networkidle0" })
await page.reload({ waitUntil: "networkidle0" })
await wait(700)

/* ---------------------------------------------- chain 1: board › quick look › open › back to card */

await shot("1-board")
const card = await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('[data-page-active="true"] li[data-card-id]')).find((x) => x.offsetParent !== null)
  if (!el) return null
  el.scrollIntoView({ block: "center" })
  return { id: el.dataset.cardId, name: el.querySelector("a[data-item]")?.textContent.trim() }
})
if (!card) throw new Error("no card on the board")
console.log("the card:", card.name, card.id)

// Enter on the focused card is the quick look, the same key the People table uses. No mouse.
await page.evaluate((id) => document.querySelector(`li[data-card-id="${id}"]`).focus(), card.id)
await page.keyboard.press("Enter")
await wait(700)
// The quick look is the beside pane now (LAYOUTS.md §3), so it is an aside, not a dialog.
console.log("Enter on the card:", await page.evaluate(() => `hash=${location.hash} pane=${!!document.querySelector("aside[data-beside]")}`))
console.log("the card says:", await page.evaluate((id) => document.querySelector(`li[data-card-id="${id}"]`).getAttribute("aria-label"), card.id))
await shot("2-quicklook")

// The drawer walks its own column with [ and ], the same keys and the same "n of m" as the pane.
const drawer = () => page.evaluate(() => {
  const pane = document.querySelector("aside[data-beside]")
  if (!pane) return "(no pane)"
  const count = Array.from(pane.querySelectorAll("span")).find((el) => /^\d+ of \d+$/.test(el.textContent.trim()))
  return `${pane.querySelector("h2")?.textContent?.trim()} · ${count?.textContent.trim() ?? "(no n of m)"}`
})
console.log("the drawer opened on:", await drawer())
await page.keyboard.press("BracketRight")
await wait(400)
console.log("after ] in the drawer:", await drawer())
await shot("2b-quicklook-next")
await page.keyboard.press("BracketLeft")
await wait(400)
console.log("after [ in the drawer:", await drawer())

// The drawer opens with the one editable field focused, so Tab down to "Open" and press it.
await press(`Array.from(document.querySelectorAll('aside[data-beside] button, aside[data-beside] a')).find((b) => /^Open the page$/.test(b.textContent.trim()))`)
await wait(900)
console.log("chain 1 trail:", await trail())
await shot("3-record")

// The crumb, from the keyboard: back to the board with the card lit and focused.
await press(`Array.from(document.querySelectorAll('nav[aria-label="Your path"] button')).find((b) => b.offsetParent !== null)`)
await wait(1400)
console.log("chain 1 lit:    ", await lit())
console.log("chain 1 focused:", await focused())
await shot("4-back")

/* ------------------------------------------------------- chain 2: deal › contact beside › back */

// Into the deal record again, by the same move, and down to the Contacts card.
await page.evaluate((id) => document.querySelector(`li[data-card-id="${id}"]`).focus(), card.id)
await page.keyboard.press("Enter")
await wait(600)
await press(`Array.from(document.querySelectorAll('aside[data-beside] button, aside[data-beside] a')).find((b) => /^Open the page$/.test(b.textContent.trim()))`)
await wait(900)
const dealRoute = await page.evaluate(() => location.hash)
console.log("the deal:", dealRoute)

await page.evaluate(() => document.querySelector('[data-page-active="true"] [data-item="contacts.list"]')?.scrollIntoView({ block: "center" }))
await wait(400)
/** Every scroller inside the page that is actually scrolled, so "the page did not move" is checked. */
const scrollOf = () => page.evaluate(() => {
  const root = document.querySelector('[data-page-active="true"]')
  if (!root) return "(no page)"
  return [root, ...root.querySelectorAll("*")].filter((el) => el.scrollTop > 0).map((el) => el.scrollTop).join(",") || "0"
})

// Watch the deal for any change at all while the pane opens. The pane has its own store, so the
// only thing that may touch this page is the one class that marks the row being read.
await page.evaluate(() => {
  window.__mutations = []
  const root = document.querySelector('[data-page-active="true"]')
  window.__observer = new MutationObserver((records) => {
    for (const r of records) {
      const marker = r.type === "attributes" && r.attributeName === "class" && r.target.className.includes("ollopa-beside-open")
      if (!marker) window.__mutations.push(`${r.type} ${r.attributeName ?? ""} ${r.target.nodeName}`)
    }
  })
  window.__observer.observe(root, { attributes: true, childList: true, characterData: true, subtree: true })
})
await press(`Array.from(document.querySelectorAll('[data-page-active="true"] [data-item="contacts.list"] button[data-item]')).find((b) => b.offsetParent !== null)`)
await wait(700)
const churn = await page.evaluate(() => { window.__observer.disconnect(); return window.__mutations })
console.log("chain 2 the deal changed:", churn.length === 0 ? "not at all while the pane opened" : `${churn.length} CHANGES · ${churn.slice(0, 3).join(" | ")}`)
console.log("chain 2 pane:", await paneName(), "· row marked:", await openBesideRow())
const scrollBefore = await scrollOf()
await shot("5-contact-pane")

// "]" walks the deal's own contacts without closing the pane or moving the page.
await page.keyboard.press("BracketRight")
await wait(500)
console.log("chain 2 after ]:", await paneName())
const scrollAfter = await scrollOf()
console.log("chain 2 the deal's scroll:", scrollBefore, "→", scrollAfter, scrollBefore === scrollAfter ? "(unmoved)" : "(MOVED)")
await shot("6-contact-next")

// "Open the page": the contact record, with the deal and the row it came from on the trail.
await press(`Array.from(document.querySelectorAll('aside[aria-label*=" beside "] button, aside[aria-label*=" beside "] a')).find((b) => b.textContent.trim() === "Open the page")`)
await wait(900)
console.log("chain 2 trail:", await trail())
await shot("7-contact-record")

await press(`Array.from(document.querySelectorAll('nav[aria-label="Your path"] button')).filter((b) => b.offsetParent !== null).pop()`)
await wait(800)
console.log("chain 2 lit:    ", await lit())
console.log("chain 2 focused:", await focused())
await shot("8-contact-back")

/* -------------------------------------------------------- chain 3: deal › company beside › back */

await page.evaluate(() => document.querySelector('[data-page-active="true"] [data-item="company.card"]')?.scrollIntoView({ block: "center" }))
await wait(400)
await press(`Array.from(document.querySelectorAll('[data-page-active="true"] [data-item="company.open"]')).find((b) => b.offsetParent !== null)`)
await wait(700)
console.log("chain 3 pane:", await paneName())
await shot("9-company-pane")

// Escape closes it and hands focus back to the button that opened it. The deal never moved.
await page.keyboard.press("Escape")
await wait(600)
console.log("chain 3 pane after Escape:", await paneName())
console.log("chain 3 focused:", await focused())
await shot("10-company-closed")

/* ------------------------------- the deal pane itself: "]" on the record opens the next deal beside */

await page.evaluate(() => document.body.focus())
await page.keyboard.press("BracketRight")
await wait(700)
console.log("the deal beside:", await paneName())
console.log("the record is still here:", await page.evaluate(() => location.hash))
await shot("11-deal-pane")

/* ------------------------------------ the side trip: the stage gate into Settings, at its own row */

await page.keyboard.press("Escape")
await wait(400)
await page.evaluate(() => document.querySelector('[data-page-active="true"] #stage-gate')?.scrollIntoView({ block: "center" }))
await wait(300)
await press(`document.querySelector('[data-page-active="true"] #stage-gate a')`)
await wait(1200)
console.log("settings route:", await page.evaluate(() => location.hash))
console.log("settings trail:", await trail())
console.log("settings lit:  ", await page.evaluate(() => Array.from(document.querySelectorAll(".ollopa-returned")).map((el) => el.innerText.replace(/\n/g, " ").slice(0, 48)).join(" | ") || "(nothing lit)"))
console.log("settings focused:", await focused())
await shot("12-settings-row")

/* ----------------- acting in the pane, with the board it came from still mounted behind the record */

// The admin, whose board shows every deal at any close date, so the deal the pane walks to is one
// the board behind is also showing. The board stays mounted on the trail while the record is open,
// so "the card behind updates at once" can be read off the page rather than argued.
await page.evaluate(() => {
  localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: "admin" }))
  localStorage.setItem("ollopa.deals.meridian.admin.scope", JSON.stringify("all"))
  localStorage.setItem("ollopa.deals.meridian.admin.period", JSON.stringify("any"))
})
await page.goto(`${base}/#/ollopa/deals`, { waitUntil: "networkidle0" })
await page.reload({ waitUntil: "networkidle0" })
// Every deal at any close date is a long board: wait for the first card rather than for a clock.
await page.waitForSelector('[data-page-active="true"] li[data-card-id]', { timeout: 15000 })
await wait(400)

const adminCard = await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('[data-page-active="true"] li[data-card-id]')).find((x) => x.offsetParent !== null)
  el?.focus()
  return el?.dataset.cardId ?? null
})
if (!adminCard) throw new Error("no card on the admin board")
await page.keyboard.press("o")          // the record, with the board remembered
await wait(900)

let acted = null
for (let i = 0; i < 25 && !acted; i++) {
  await page.keyboard.press("BracketRight")
  await wait(220)
  acted = await page.evaluate(() => {
    const name = document.querySelector('aside[aria-label*=" beside "] h2')?.textContent?.trim()
    // The one act the pane carries: winning and losing cannot be undone, so they stayed on the page.
    const set = Array.from(document.querySelectorAll('aside[aria-label*=" beside "] button, aside[aria-label*=" beside "] a')).find((b) => b.textContent.trim() === "Set the next step")
    if (!name || !set) return null
    // The card on the board behind: the mounted page that is not the one on screen.
    const link = Array.from(document.querySelectorAll("a[data-item][data-item-label]"))
      .find((a) => a.dataset.itemLabel === name && !a.closest('[data-page-active="true"]'))
    if (!link) return null
    const card = link.closest("li")
    return { name, id: link.dataset.item, before: card.textContent.replace(/\s+/g, " ").slice(0, 80) }
  })
}
if (!acted) throw new Error("the pane never reached a deal with a card on the board behind")
console.log("the pane is on:", acted.name)
console.log("the card behind, before:", acted.before)

// Type the next step in the pane and set it. The card on the board behind is mounted on the trail
// and reads the same store, so it says the new step without the page being touched.
await page.evaluate(() => document.querySelector('aside[aria-label*=" beside "] input')?.focus())
await page.keyboard.type("Security review with the CISO")
await press(`Array.from(document.querySelectorAll("aside button")).find((b) => b.textContent.trim() === "Set the next step")`)
await wait(700)
console.log("the card behind, after: ", await page.evaluate((id) => {
  const link = Array.from(document.querySelectorAll(`a[data-item="${id}"]`)).find((a) => !a.closest('[data-page-active="true"]'))
  return link ? link.closest("li").textContent.replace(/\s+/g, " ").slice(0, 80) : "(the card has left the board)"
}, acted.id))
await shot("13-pane-acted")

/* ------------------------------------- Mark won on the page, through the question it has to ask */

// The pane closes and the record it was beside is the surface again: winning is the page's act.
await page.keyboard.press("Escape")
await wait(500)
console.log("on the record:", await page.evaluate(() => document.title.split(" · ")[0]))
await press(`Array.from(document.querySelectorAll('[data-page-active="true"] button')).find((b) => b.textContent.trim().startsWith("Mark won"))`)
await wait(600)
console.log("it asks:", await page.evaluate(() => {
  const d = document.querySelector('[role="dialog"]')
  if (!d) return "(nothing was asked)"
  const affirmative = Array.from(d.querySelectorAll("button")).map((b) => b.textContent.trim()).filter(Boolean)
  return `"${d.querySelector("h2")?.textContent?.trim()}" · ${d.querySelector("p")?.textContent?.trim().slice(0, 110)} · buttons: ${affirmative.join(", ")}`
}))
await shot("16-mark-won-asks")
await press(`Array.from(document.querySelectorAll('[role="dialog"] button')).find((b) => b.textContent.trim() === "Mark won")`)
await wait(800)
console.log("after it:", await page.evaluate(() => {
  const stage = Array.from(document.querySelectorAll('[data-page-active="true"] [role="radiogroup"] button')).find((b) => b.getAttribute("aria-checked") === "true" || b.dataset.state === "on")
  const ribbon = document.querySelector('[data-page-active="true"] [role="status"], [data-page-active="true"] [aria-live]')?.textContent?.trim().slice(0, 80)
  return `stage now ${stage?.textContent?.trim() ?? "?"} · ${ribbon ?? "(no ribbon)"}`
}))
await shot("17-mark-won-done")

/* --------------------------- the pane's fields are the model's answer, not a list anyone typed out */

for (const role of ["ae", "admin"]) {
  await page.evaluate((r) => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: r })), role)
  await page.goto(`${base}/#/ollopa/deals/d-118`, { waitUntil: "networkidle0" })
  await page.reload({ waitUntil: "networkidle0" })
  await wait(700)
  await page.evaluate(() => document.body.focus())
  await page.keyboard.press("BracketRight")
  await wait(1000)
  const labels = await page.evaluate(() => Array.from(document.querySelectorAll('aside[aria-label*=" beside "] dl dt')).map((el) => el.textContent.trim()))
  console.log(`the deal pane for the Meridian ${role}:`, labels.join(", ") || "(no pane)")
  await shot(`15-pane-fields-${role}`)
}

await browser.close()
