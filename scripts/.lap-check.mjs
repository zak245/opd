// The keyboard lap and the must-not-break list, checked by observation against a running app.
import puppeteer from "puppeteer-core"
const base = process.env.OPD_BASE ?? "http://localhost:4170"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const out = []
const say = (...a) => { const s = a.join(" "); out.push(s); console.log(s) }

const b = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const page = await b.newPage()
const noise = []
page.on("console", (m) => { if (["warning","error","assert"].includes(m.type())) noise.push(`${m.type()}: ${m.text().slice(0,200)}`) })
page.on("pageerror", (e) => noise.push("pageerror: " + String(e).slice(0,200)))
await page.setViewport({ width: 1440, height: 900 })

async function seat(route, business = "meridian", role = "sdr") {
  await page.goto(`${base}/#/`, { waitUntil: "networkidle0" })
  await page.evaluate((s) => localStorage.setItem("ollopa.session", JSON.stringify(s)), { business, role })
  await page.goto(`${base}/#${route}`, { waitUntil: "networkidle0" })
  await page.reload({ waitUntil: "networkidle0" })
  await wait(800)
}

const counters = () => page.evaluate(() =>
  Object.fromEntries(Array.from(document.querySelectorAll("span[data-renders]")).map((e) => [e.dataset.renders, e.textContent.replace(/\D+/g, "")])))
const focused = () => page.evaluate(() => {
  const a = document.activeElement
  if (!a) return "none"
  return `${a.tagName.toLowerCase()}${a.getAttribute("aria-label") ? `[${a.getAttribute("aria-label")}]` : ""}${a.dataset?.item ? `#${a.dataset.item}` : ""} "${(a.textContent||"").trim().replace(/\s+/g," ").slice(0,40)}"`
})
const pane = () => page.evaluate(() => {
  const el = document.querySelector("aside[data-beside]")
  if (!el) return null
  const card = el.querySelector('[data-slot="card"]')
  return {
    kind: el.dataset.beside, mode: el.dataset.besideMode,
    asideW: Math.round(el.getBoundingClientRect().width),
    cardW: Math.round(card?.getBoundingClientRect().width ?? 0),
    cardLeft: Math.round(card?.getBoundingClientRect().left ?? 0),
    title: el.querySelector("h2")?.textContent ?? "",
    step: el.querySelector("footer span")?.textContent ?? "",
    inFocus: el.contains(document.activeElement),
  }
})
const marked = () => page.evaluate(() =>
  Array.from(document.querySelectorAll(".ollopa-reading")).map((e) => (e.textContent||"").trim().replace(/\s+/g," ").slice(0,30)))
const mainW = () => page.evaluate(() => Math.round(document.querySelector("#ollopa-main")?.getBoundingClientRect().width ?? -1))
const trail = () => page.evaluate(() => Array.from(document.querySelectorAll('nav[aria-label="Your path"] button')).map((b) => b.textContent.trim()))

/* ---------------------------------------------------------------- 1. the sequence, the lap */
await seat("/ollopa/sequences/seq-1")
say("== sequence record ==")
say("counters at rest      ", JSON.stringify(await counters()))
const before = await counters()
const mw0 = await mainW()

// Open a person beside from the enrolled list, by keyboard: focus the first BesideLink and Enter.
const OPEN_ROW = `const r = Array.from(document.querySelectorAll('[data-page-active="true"] tbody tr[data-item], [data-page-active="true"] [data-item]')).find((x) => x.offsetParent && /^c-/.test(x.dataset.item || ""));
  if (!r) return null;
  const hit = r.matches("button,a") ? r : r.querySelector("button,a") || r;
  hit.focus(); hit.click(); return (r.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);`
const openRow = () => page.evaluate(new Function(OPEN_ROW))
const opened = await openRow()
await wait(500)
say("opened beside from    ", JSON.stringify(opened))
say("counters after open   ", JSON.stringify(await counters()), "— same as before:", JSON.stringify(await counters()) === JSON.stringify(before))
say("pane                  ", JSON.stringify(await pane()))
say("focus in pane         ", await focused())
say("row marked            ", JSON.stringify(await marked()))
const mwBeside = await mainW()
say("main width rest/beside ", mw0, mwBeside)

// ] and [
await page.keyboard.press("]"); await wait(400)
const p1 = await pane(); say("after ]               ", p1?.title, p1?.step, "| marked:", JSON.stringify(await marked()))
await page.keyboard.press("["); await wait(400)
const p2 = await pane(); say("after [               ", p2?.title, p2?.step)

// expand
await page.evaluate(() => document.querySelector("aside[data-beside] header button[aria-expanded]").click())
await wait(400)
say("expanded              ", JSON.stringify(await pane()))
say("counters expanded     ", JSON.stringify(await counters()), "— same as before:", JSON.stringify(await counters()) === JSON.stringify(before))
say("main width expanded   ", await mainW(), "(same as beside:", (await mainW()) === mwBeside, ")")
say("trail while expanded  ", JSON.stringify(await trail()))
say("row still marked      ", JSON.stringify(await marked()))
// collapse
await page.evaluate(() => document.querySelector("aside[data-beside] header button[aria-expanded]").click())
await wait(400)
say("collapsed             ", JSON.stringify(await pane()))

// Esc closes, focus back on the opener
await page.keyboard.press("Escape"); await wait(500)
say("after Esc: pane       ", JSON.stringify(await pane()))
say("after Esc: focus      ", await focused())
say("after Esc: marked     ", JSON.stringify(await marked()))
say("counters after close  ", JSON.stringify(await counters()), "— same as before:", JSON.stringify(await counters()) === JSON.stringify(before))

/* ---------------------------------------------------------------- 2. expanded then close, mode resets */
await openRow(); await wait(400)
await page.evaluate(() => document.querySelector("aside[data-beside] header button[aria-expanded]").click())
await wait(400)
await page.keyboard.press("Escape"); await wait(400)
await openRow(); await wait(400)
say("reopened after expand ", JSON.stringify(await pane()))
await page.keyboard.press("Escape"); await wait(400)

/* ---------------------------------------------------------------- 3. the trail: leave and come back */
say("")
say("== the trail ==")
say("trail at rest         ", JSON.stringify(await trail()))
const left = await page.evaluate(() => {
  const a = Array.from(document.querySelectorAll('[data-page-active="true"] a[data-item], [data-page-active="true"] [data-item] a')).find((x) => x.offsetParent)
  if (!a) return null
  a.focus(); a.click(); return (a.textContent || "").trim()
})
await wait(900)
say("followed              ", JSON.stringify(left), "| route:", await page.evaluate(() => location.hash))
say("trail after follow    ", JSON.stringify(await trail()))
// back through the crumb
await page.evaluate(() => document.querySelector('nav[aria-label="Your path"] button').click())
await wait(300)
say("returned, lit         ", await page.evaluate(() => {
  const el = document.querySelector(".ollopa-returned")
  return el ? `${(el.textContent||"").trim().replace(/\s+/g," ").slice(0,40)} | ramp:${el.classList.contains("ollopa-returned-in")}` : "nothing lit"
}))
say("returned, focus       ", await focused())
say("trail after back      ", JSON.stringify(await trail()))
say("localStorage trail    ", await page.evaluate(() => Object.keys(localStorage).filter((k) => /chain|trail/i.test(k)).join(",") || "none"))

/* ---------------------------------------------------------------- 4. a fresh start clears the trail */
await page.evaluate(() => { const a = Array.from(document.querySelectorAll('[data-page-active="true"] a[data-item], [data-page-active="true"] [data-item] a')).find((x) => x.offsetParent); a?.click() })
await wait(700)
say("trail before sidebar  ", JSON.stringify(await trail()))
await page.evaluate(() => Array.from(document.querySelectorAll('[data-sidebar="menu-button"]')).find((a) => /People/.test(a.textContent))?.click())
await wait(700)
say("trail after sidebar   ", JSON.stringify(await trail()), "| route:", await page.evaluate(() => location.hash))
await page.goto(`${base}/#/ollopa/deals/d-118`, { waitUntil: "networkidle0" }); await wait(700)
say("trail after deep link ", JSON.stringify(await trail()))

/* ---------------------------------------------------------------- 5. reduced motion */
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }])
await seat("/ollopa/sequences/seq-1")
say("")
say("== reduced motion ==")
say("transition duration   ", await page.evaluate(() => getComputedStyle(document.querySelector("aside[data-beside]") ?? document.body).transitionDuration))
await openRow()
await wait(120)
say("pane 120 ms after open", JSON.stringify(await pane()))
say("pane transition        ", await page.evaluate(() => getComputedStyle(document.querySelector("aside[data-beside]")).transitionDuration))
say("marker animation      ", await page.evaluate(() => {
  const el = document.querySelector(".ollopa-reading")
  if (!el) return "no marker"
  const probe = el.tagName === "TR" ? el.querySelector("td") ?? el : el
  return getComputedStyle(probe).animationName
}))

say("")
say("console: " + (noise.length ? noise.join(" | ") : "silent"))
await b.close()
