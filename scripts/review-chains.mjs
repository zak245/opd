// Stage 3 review harness. Written by the reviewer, not by any builder: it drives the built app
// through each chain in BUILD-CHAINS.md, photographs every step, and writes down what it observed
// (the trail, the pane, what is focused, what is lit, whether the page behind re-rendered) so the
// scoring rests on observation rather than on reading the source.
//
//   node scripts/review-chains.mjs <chain> <width> <height>
//   node scripts/review-chains.mjs probe            # a DOM dump for working out selectors
//
// Preview on OPD_BASE (default http://localhost:4180); dev build on OPD_DEV for the render counters.
import puppeteer from "puppeteer-core"
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs"

const base = process.env.OPD_BASE ?? "http://localhost:4180"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

export const log = []
export function note(...a) {
  const line = a.join(" ")
  log.push(line)
  console.log(line)
}

export async function browser(width, height, opts = {}) {
  const b = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ["--hide-scrollbars", ...(opts.reducedMotion ? ["--force-prefers-reduced-motion"] : [])],
  })
  const page = await b.newPage()
  // Everything the page says to the console, kept so a run against the dev build can be reported
  // rather than guessed at. React's own dev warnings and the pane's usage-model warning land here.
  page.__console = []
  page.on("console", (msg) => {
    const t = msg.type()
    const text = msg.text().replace(/\s+/g, " ").slice(0, 300)
    // The only thing neither server has is a favicon; it says nothing about the product.
    const where = msg.location?.().url ?? ""
    if (/favicon\.ico/.test(text) || /favicon\.ico/.test(where)) return
    if (t === "warning" || t === "error" || t === "assert") page.__console.push(`${t}: ${text}`)
  })
  page.on("pageerror", (err) => page.__console.push(`pageerror: ${String(err).replace(/\s+/g, " ").slice(0, 300)}`))
  page.on("requestfailed", (r) => { if (!/favicon\.ico/.test(r.url())) page.__console.push(`requestfailed: ${r.url().slice(0, 120)}`) })
  page.on("response", (r) => { if (r.status() >= 400 && !/favicon\.ico/.test(r.url())) page.__console.push(`http ${r.status()}: ${r.url().slice(0, 120)}`) })
  await page.setViewport({ width: Number(width), height: Number(height), deviceScaleFactor: 1 })
  if (opts.reducedMotion) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }])
  return { b, page }
}

export const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export function shotter(page, dir, width) {
  mkdirSync(dir, { recursive: true })
  let n = 0
  return async (name) => {
    n += 1
    const out = `${dir}/${String(n).padStart(2, "0")}-${name}-${width}.png`
    await page.screenshot({ path: out, fullPage: false })
    note(`  [shot] ${out}`)
    return out
  }
}

/** Sign in the way scripts/shot.mjs does, then land on `route` with the session already read. */
export async function signIn(page, business, role, route, urlBase = base) {
  await page.goto(urlBase + "/#/", { waitUntil: "networkidle0" })
  await page.evaluate((s) => localStorage.setItem("ollopa.session", JSON.stringify(s)), { business, role })
  await page.goto(urlBase + "/#" + route, { waitUntil: "networkidle0" })
  await page.reload({ waitUntil: "networkidle0" })
  await wait(600)
}

/** Everything a person could see, read back as text. This is the evidence for the scorecards. */
export const observe = (page) => page.evaluate(() => {
  const txt = (el, n = 90) => (el?.innerText ?? el?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, n)
  const active = document.querySelector('[data-page-active="true"]')
  const pane = document.querySelector('aside[aria-label*=" beside "]')
  const nav = document.querySelector('nav[aria-label="Your path"]')
  const focused = document.activeElement
  const lit = document.querySelector(".ollopa-returned")
  const marked = document.querySelector(".ollopa-beside-open")
  const mounted = Array.from(document.querySelectorAll("[data-page]")).map((el) => ({
    key: el.getAttribute("data-page"),
    active: el.getAttribute("data-page-active") === "true",
    hidden: el.style.visibility === "hidden",
    inert: el.hasAttribute("inert"),
    display: getComputedStyle(el).display,
    scroll: el.scrollTop,
  }))
  const paneButtons = pane ? Array.from(pane.querySelectorAll("button")).map((b) => txt(b, 60)).filter(Boolean) : []
  return {
    hash: location.hash,
    h1: txt(document.querySelector("header h1")),
    trail: nav ? txt(nav, 200) : null,
    trailCrumbs: nav ? Array.from(nav.querySelectorAll("button")).map((b) => txt(b, 60)) : [],
    pane: pane
      ? {
          label: pane.getAttribute("aria-label"),
          width: Math.round(pane.getBoundingClientRect().width),
          head: txt(pane.querySelector("h2"), 60),
          context: txt(pane.querySelector("h2 + p"), 80),
          buttons: paneButtons,
          counter: txt(pane.querySelector("footer"), 60),
          body: txt(pane.querySelector("div > div:not(header)"), 400),
          doors: pane.querySelectorAll("[data-door]").length,
          transition: getComputedStyle(pane).transitionDuration,
        }
      : null,
    fullText: txt(pane, 900),
    focused: focused ? `${focused.tagName}${focused.getAttribute("aria-label") ? `[${focused.getAttribute("aria-label")}]` : ""} "${txt(focused, 60)}"` : "(none)",
    focusInPane: !!(pane && focused && pane.contains(focused)),
    lit: lit ? txt(lit, 80) : null,
    besideOpenRow: marked ? txt(marked, 80) : null,
    mounted,
    renders: Array.from(document.querySelectorAll("[data-renders]")).map((el) => `${el.getAttribute("data-renders")}=${txt(el, 20)}`),
    pageWidth: active ? Math.round(active.getBoundingClientRect().width) : null,
    docScrollW: document.documentElement.scrollWidth,
  }
})

export function report(o, label) {
  note(`  ${label}`)
  note(`    hash      ${o.hash}`)
  note(`    h1        ${o.h1}`)
  note(`    trail     ${o.trail ?? "(empty)"}`)
  if (o.pane) {
    note(`    pane      "${o.pane.head}" / "${o.pane.context}" w=${o.pane.width} doors=${o.pane.doors} trans=${o.pane.transition}`)
    note(`    buttons   ${o.pane.buttons.join(" | ")}`)
    note(`    walker    ${o.pane.counter || "(none)"}`)
    note(`    body      ${o.pane.body}`)
  } else note(`    pane      (none)`)
  note(`    focus     ${o.focused}${o.focusInPane ? "  [inside the pane]" : ""}`)
  note(`    lit       ${o.lit ?? "(nothing lit)"}`)
  note(`    row mark  ${o.besideOpenRow ?? "(none)"}`)
  note(`    mounted   ${o.mounted.map((m) => `${m.key}${m.active ? "*" : ""}${m.hidden ? " hidden" : ""}${m.inert ? " inert" : ""}${m.display === "none" ? " DISPLAY-NONE" : ""}@${m.scroll}`).join(" , ")}`)
  if (o.renders.length) note(`    renders   ${o.renders.join(" · ")}`)
  note(`    h-scroll  doc=${o.docScrollW}`)
}

/** What the page said to the console during this walk, de-duplicated. */
export function dumpConsole(page, label = "") {
  const all = page.__console ?? []
  const seen = new Map()
  for (const line of all) seen.set(line, (seen.get(line) ?? 0) + 1)
  note(`  [console${label ? " " + label : ""}] ${seen.size === 0 ? "nothing — no warning, no error, no failed request" : ""}`)
  for (const [line, n] of seen) note(`    ${n > 1 ? `x${n} ` : ""}${line}`)
  return seen
}

export function saveLog(path) {
  mkdirSync(path.replace(/\/[^/]+$/, ""), { recursive: true })
  writeFileSync(path, log.join("\n") + "\n")
  note(`[log] ${path}`)
}
export { base, appendFileSync }

/* ============================================================== the chains, one function each */

const DIR = process.env.OPD_SHOTS ?? "shots/chains/review3"
/** The pane, told apart from the shell's own <aside> sidebar by its aria-label. */
export const PANE = 'aside[aria-label*=" beside "]' 

/** Tab from wherever focus is until `match` is true, so "reachable by keyboard" is counted, not assumed. */
export async function tabTo(page, match, max = 60) {
  for (let i = 1; i <= max; i++) {
    await page.keyboard.press("Tab")
    const hit = await page.evaluate((m) => {
      const el = document.activeElement
      if (!el || el.tagName === "BODY" || el.tagName === "HTML") return null
      const text = (el.innerText || el.value || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim()
      return new RegExp(m, "i").test(text) ? `${el.tagName} "${text.slice(0, 50)}"` : null
    }, match)
    if (hit) return { tabs: i, on: hit }
  }
  return { tabs: -1, on: "(never reached)" }
}

/** Focus the very first tabbable thing on the page, so Tab has somewhere to start from. */
export async function focusTop(page) {
  await page.evaluate(() => {
    const first = document.querySelector('a[href="#main"], a.sr-only, header a, a, button')
    first?.focus()
  })
  await wait(120)
}

/** Shift+Tab backwards from wherever focus is, looking for `match`. */
export async function shiftTabTo(page, match, max = 20) {
  for (let i = 1; i <= max; i++) {
    await page.keyboard.down("Shift"); await page.keyboard.press("Tab"); await page.keyboard.up("Shift")
    const hit = await page.evaluate((m) => {
      const el = document.activeElement
      if (!el || el.tagName === "BODY" || el.tagName === "HTML") return null
      const text = (el.innerText || el.value || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim()
      return new RegExp(m, "i").test(text) ? `${el.tagName} "${text.slice(0, 50)}"` : null
    }, match)
    if (hit) return { tabs: -i, on: hit }
  }
  return { tabs: 0, on: "(not found backwards)" }
}

/**
 * How far the crumb is from wherever the page put focus on arrival: backwards first, because the
 * header sits above the content, then forwards. Never re-seeds focus, so the count is the one a
 * person actually pays.
 */
/**
 * Do the first real thing the pane offers: pick a destination if it asks for one, then press the
 * action. Returns what was pressed and the row's text before and after, which is the whole of
 * "the effect shows where it was caused".
 */
export async function actInPane(page) {
  const before = await page.evaluate(() => (document.querySelector(".ollopa-beside-open")?.innerText || "").replace(/\s+/g, " ").trim())
  const picker = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('aside[aria-label*=" beside "] button'))
      .find((x) => /^choose a/i.test((x.innerText || "").trim()))
    if (!el) return null
    el.click()
    return (el.innerText || "").replace(/\s+/g, " ").trim()
  })
  let option = null
  if (picker) {
    await wait(600)
    option = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('[role="option"], [role="menuitem"]')).find((x) => x.offsetParent !== null && (x.innerText || "").trim())
      if (!el) return null
      const t = (el.innerText || "").replace(/\s+/g, " ").trim()
      el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))
      el.click()
      return t
    })
    await wait(500)
  }
  const pressed = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('aside[aria-label*=" beside "] button'))
      .find((x) => !x.disabled && /^(move to|add to|mark |stop |research|create )/i.test((x.innerText || "").trim()))
    if (!el) return null
    const t = (el.innerText || "").replace(/\s+/g, " ").trim()
    el.click()
    return t
  })
  await wait(1300)
  const after = await page.evaluate(() => (document.querySelector(".ollopa-beside-open")?.innerText || "").replace(/\s+/g, " ").trim())
  note(`    picker    ${picker ? `"${picker}" → "${option}"` : "(no picker)"}`)
  note(`    pressed   ${pressed ?? "(no action button found)"}`)
  note(`    row was   ${before}`)
  note(`    row now   ${after}`)
  note(`    effect    ${before === after ? "NONE — the page behind still says the old thing" : "landed on the row"}`)
  return { before, after, pressed }
}

export async function reach(page, match, label = "it") {
  const from = await focusInfo(page)
  const back = await shiftTabTo(page, match, 15)
  if (back.tabs < 0) return { ...back, from, how: `${-back.tabs} Shift+Tab` }
  const fwd = await tabTo(page, match, 60)
  return { ...fwd, from, how: fwd.tabs > 0 ? `${fwd.tabs} Tab` : "never reached" }
}

export async function reachCrumb(page, match) {
  const from = await focusInfo(page)
  const back = await shiftTabTo(page, match, 15)
  if (back.tabs < 0) return { ...back, from, how: `${-back.tabs} Shift+Tab` }
  const fwd = await tabTo(page, match, 60)
  return { ...fwd, from, how: fwd.tabs > 0 ? `${fwd.tabs} Tab` : "never reached" }
}

export const focusInfo = (page) => page.evaluate(() => {
  const el = document.activeElement
  if (!el) return "(none)"
  const t = (el.innerText || el.value || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 50)
  const vis = el.offsetParent !== null || el.tagName === "BODY"
  return `${el.tagName} "${t}" visible=${vis}`
})

/** Click a button anywhere on the page (or in the pane) by its exact text. */
export const clickText = (page, text, scope = "body") => page.evaluate((text, scope) => {
  const root = document.querySelector(scope) ?? document.body
  const el = Array.from(root.querySelectorAll("button, a")).find(
    (b) => (b.innerText || "").replace(/\s+/g, " ").trim() === text && b.offsetParent !== null)
  if (!el) return false
  el.click()
  return true
}, text, scope)

/** Put focus on the first visible person name inside a section, by keyboard, and say how many tabs it took. */
export async function keyboardToFirstName(page, sectionSel, label) {
  await page.evaluate((s) => {
    const sec = document.querySelector(`[data-page-active="true"] ${s}`)
    const input = sec?.querySelector("input")
    if (input) input.focus()
    else sec?.scrollIntoView({ block: "start" })
  }, sectionSel)
  await wait(200)
  const r = await tabTo(page, label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  note(`    keyboard  ${r.tabs} tabs from the section's search box to "${label}" → ${r.on}`)
  return r
}

/** The ids and labels of the visible rows of a section. */
export const rowsOf = (page, sel) => page.evaluate((sel) => {
  const root = document.querySelector(`[data-page-active="true"] ${sel}`) ?? document.querySelector('[data-page-active="true"]')
  if (!root) return []
  return Array.from(root.querySelectorAll("[data-item]"))
    .filter((e) => e.offsetParent !== null)
    .map((e) => ({ id: e.getAttribute("data-item"), label: (e.innerText || "").replace(/\s+/g, " ").trim().slice(0, 40) }))
}, sel)

/* ------------------------------------------------------------------------------------ chain 1 */

export async function chain1(w, h) {
  note(`\n=== CHAIN 1 · sequence › enrolled person beside › next › previous › open the page › back (${w}) ===`)
  const { b, page } = await browser(w, h)
  const dir = `${DIR}/01-sequence`
  const shot = shotter(page, dir, w)
  await signIn(page, "meridian", "sdr", "/ollopa/sequences/seq-1")
  await page.evaluate(() => document.querySelector('[data-page-active="true"] #seq-people')?.scrollIntoView({ block: "start" }))
  await wait(500)
  const scroll0 = await page.evaluate(() => document.querySelector("[data-page]")?.scrollTop)
  report(await observe(page), "1. the sequence, enrolled list in view")
  note(`    scroll    ${scroll0}`)
  await shot("sequence")

  const rows = await rowsOf(page, "#seq-people")
  note(`    rows      ${rows.length} visible: ${rows.slice(0, 3).map((r) => r.label).join(" / ")}`)
  const first = rows[0]

  // 2. open beside, by keyboard
  await keyboardToFirstName(page, "#seq-people", first.label.split("\n")[0].slice(0, 20))
  await page.keyboard.press("Enter")
  await wait(500)
  const o2 = await observe(page)
  report(o2, "2. Enter on the first enrolled person — the pane")
  note(`    scroll    ${await page.evaluate(() => document.querySelector('[data-page-active="true"]')?.scrollTop)} (was ${scroll0})`)
  await shot("pane")

  // 3. ]
  await page.keyboard.press("BracketRight")
  await wait(400)
  report(await observe(page), "3. ] — next in the enrolled list")
  await shot("next")

  // 4. [
  await page.keyboard.press("BracketLeft")
  await wait(400)
  report(await observe(page), "4. [ — previous, back to the first")
  await shot("previous")

  // 4b. Act from the pane, and watch the row behind it.
  const rowBefore = await page.evaluate(() => (document.querySelector(".ollopa-beside-open")?.innerText || "").replace(/\s+/g, " ").trim())
  const rBefore = (await observe(page)).renders
  const chose = await page.evaluate(() => {
    // The destination picker the pane now carries, then the act itself.
    const sel = Array.from(document.querySelectorAll('aside[aria-label*=" beside "] button, aside[aria-label*=" beside "] select'))
      .find((x) => /choose a sequence/i.test(x.innerText || x.getAttribute("aria-label") || ""))
    if (!sel) return null
    sel.click()
    return (sel.innerText || sel.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim()
  })
  await wait(600)
  const option = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('[role="option"], [role="menuitem"]')).find((x) => x.offsetParent !== null && (x.innerText || "").trim())
    if (!el) return null
    const t = (el.innerText || "").replace(/\s+/g, " ").trim()
    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))
    el.click()
    return t
  })
  await wait(500)
  note(`    picker    "${chose}" → chose "${option}"`)
  const acted = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('aside[aria-label*=" beside "] button'))
      .find((x) => /^Move to/i.test((x.innerText || "").trim()) && !x.disabled)
    if (!el) return "(no move button)"
    const t = (el.innerText || "").replace(/\s+/g, " ").trim()
    el.click()
    return `clicked "${t}"`
  })
  await wait(1200)
  const rowAfter = await page.evaluate(() => (document.querySelector(".ollopa-beside-open")?.innerText || "").replace(/\s+/g, " ").trim())
  const oAct = await observe(page)
  note(`    acted     ${acted}`)
  note(`    row was   ${rowBefore}`)
  note(`    row now   ${rowAfter}`)
  note(`    row moved ${rowBefore === rowAfter ? "NO — the page behind still says the old thing" : "yes"}`)
  note(`    renders   ${rBefore.join(" · ")}  →  ${oAct.renders.join(" · ")}`)
  note(`    heading   ${await page.evaluate(() => { const h = Array.from(document.querySelectorAll('[data-page-active="true"] h3')).find((x) => /^People \(/.test(x.innerText)); return h ? h.innerText.replace(/\s+/g, " ").trim() : "(no People heading)" })}`)
  report(oAct, "4b. after the pane's action")
  await shot("acted")

  // 5. Open the page, by keyboard, counted from wherever the action left focus.
  const op = await reach(page, "^Open the page$")
  note(`    keyboard  focus was ${op.from}; "Open the page" is ${op.how} away`)
  if (op.tabs === 0) { await clickText(page, "Open the page", PANE); note('    (not reachable by keyboard; clicked it)') }
  else await page.keyboard.press("Enter")
  await wait(800)
  report(await observe(page), "5. Open the page — the contact record with the trail")
  await shot("page")

  // 6. back by the crumb, by keyboard, counted from wherever the arrival put focus.
  const cr = await reachCrumb(page, "^Q4 enterprise outbound$")
  note(`    keyboard  arrived on ${cr.from}; crumb is ${cr.how} away → ${cr.on}`)
  if (cr.tabs === 0) { await clickText(page, "Q4 enterprise outbound"); note("    (crumb not reachable by keyboard; clicked it instead)") }
  else await page.keyboard.press("Enter")
  await wait(900)
  const o6 = await observe(page)
  report(o6, "6. the crumb — back on the sequence")
  note(`    scroll    ${await page.evaluate(() => document.querySelector('[data-page-active="true"]')?.scrollTop)} (was ${scroll0})`)
  note(`    focus vis ${await focusInfo(page)}`)
  await shot("back")
  dumpConsole(page); await b.close()
}

/* ------------------------------------------------------------------------------------ chain 2 */

export async function chain2(w, h) {
  note(`\n=== CHAIN 2 · campaign › audience beside › the page › a person beside › back, back (${w}) ===`)
  const { b, page } = await browser(w, h)
  const shot = shotter(page, `${DIR}/02-campaign`, w)
  await signIn(page, "ridgeline", "marketer", "/ollopa/campaigns/camp-4")
  report(await observe(page), "1. the campaign")
  await shot("campaign")

  note(`    ok=${await clickText(page, "Read the audience beside this")}  (the audience, beside)`)
  await wait(600)
  report(await observe(page), "2. the audience beside the campaign")
  await shot("audience-beside")

  note(`    ok=${await clickText(page, "Open the page", PANE)}`)
  await wait(900)
  report(await observe(page), "3. the audience record, campaign on the trail")
  await shot("audience-page")

  const rows = await rowsOf(page, "")
  note(`    items     ${rows.length}: ${rows.slice(0, 4).map((r) => r.label).join(" / ")}`)
  const person = rows.find((r) => /^c-/.test(r.id))
  if (person) {
    await page.evaluate((id) => {
      const el = document.querySelector(`[data-page-active="true"] [data-item="${id}"]`)
      ;(el.matches("button,a") ? el : el.querySelector("button,a"))?.click()
    }, person.id)
    await wait(600)
  } else note("    !! no person row found on the audience record")
  report(await observe(page), "4. a person beside the audience")
  await shot("person-beside")

  note(`    ok=${await clickText(page, "Open the page", PANE)}`)
  await wait(900)
  report(await observe(page), "5. the person's record, two crumbs")
  await shot("person-page")

  // back to the audience, then back to the campaign
  const c1 = await reachCrumb(page, "^Enterprise prospects, EMEA$")
  note(`    keyboard  arrived on ${c1.from}; audience crumb is ${c1.how} away → ${c1.on}`)
  if (c1.tabs !== 0) await page.keyboard.press("Enter"); else await page.evaluate(() => document.querySelectorAll('nav[aria-label="Your path"] ol button')[1]?.click())
  await wait(900)
  report(await observe(page), "6. back on the audience")
  await shot("back-audience")

  await page.evaluate(() => document.querySelector('nav[aria-label="Your path"] ol button')?.click())
  await wait(900)
  report(await observe(page), "7. back on the campaign")
  await shot("back-campaign")
  dumpConsole(page); await b.close()
}

/* ------------------------------------------------------------------------------------ chain 3 */

export async function chain3(w, h) {
  note(`\n=== CHAIN 3 · company › search a person inside it › beside › act › next › back (${w}) ===`)
  const { b, page } = await browser(w, h)
  const shot = shotter(page, `${DIR}/03-company`, w)
  await signIn(page, "meridian", "ae", "/ollopa/companies/co-1")
  const o1 = await observe(page)
  report(o1, "1. Northwind Analytics, the biggest account in the seed")
  const contacts = await page.evaluate(() => {
    const t = (e) => (e?.innerText || "").replace(/\s+/g, " ").trim()
    const h = Array.from(document.querySelectorAll('[data-page-active="true"] h3')).find((x) => /Contacts at this company/.test(t(x)))
    const sec = h?.closest("section") ?? h?.parentElement?.parentElement
    return {
      heading: t(h),
      search: Array.from(sec?.querySelectorAll("input") ?? []).map((i) => i.getAttribute("aria-label") || i.placeholder),
      filters: Array.from(sec?.querySelectorAll("button[role=combobox], button[aria-haspopup]") ?? []).map((x) => t(x).slice(0, 30)),
      rows: sec?.querySelectorAll("[data-item]").length,
      paging: t(sec).slice(-160),
    }
  })
  note(`    contacts  ${JSON.stringify(contacts)}`)
  await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] h3')).find((x) => /Contacts at this company/.test(x.innerText))?.scrollIntoView({ block: "start" }))
  await wait(400)
  await shot("company")

  // search inside the company
  const typed = await page.evaluate(() => {
    const h = Array.from(document.querySelectorAll('[data-page-active="true"] h3')).find((x) => /Contacts at this company/.test(x.innerText))
    const sec = h?.closest("section") ?? h?.parentElement?.parentElement
    const i = sec?.querySelector("input")
    if (!i) return null
    i.focus()
    return i.getAttribute("aria-label") || i.placeholder
  })
  note(`    search box ${typed ?? "(NONE — there is no search inside the company)"}`)
  if (typed) { await page.keyboard.type("a"); await wait(600) }
  const after = await rowsOf(page, "")
  note(`    after "a" ${after.filter((r) => /^c-/.test(r.id)).length} contact rows`)
  await shot("searched")

  const target = after.find((r) => /^c-/.test(r.id))
  if (target) {
    const r = await tabTo(page, target.label.split(" ").slice(0, 2).join(" ").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), 30)
    note(`    keyboard  ${r.tabs} tabs from the search box to the row → ${r.on}`)
    if (r.tabs > 0) await page.keyboard.press("Enter")
    else await page.evaluate((id) => { const e = document.querySelector(`[data-page-active="true"] [data-item="${id}"]`); (e.matches("button,a") ? e : e.querySelector("button,a"))?.click() }, target.id)
    await wait(600)
  }
  const o3 = await observe(page)
  report(o3, "2. the contact beside the company")
  await shot("beside")

  // act: the first real action the pane offers
  await actInPane(page)
  report(await observe(page), "3. after the action — is the effect visible where it was caused?")
  note(`    page says ${await page.evaluate(() => (document.querySelector('[data-page-active="true"]')?.innerText || "").replace(/\s+/g, " ").match(/.{0,80}(sequence|added|Added).{0,60}/)?.[0] ?? "(no mention)")}`)
  await shot("acted")

  await page.keyboard.press("BracketRight")
  await wait(500)
  report(await observe(page), "4. ] — the next contact at this company")
  await shot("next")

  await clickText(page, "Open the page", PANE)
  await wait(900)
  report(await observe(page), "5. Open the page")
  await shot("page")

  await page.evaluate(() => document.querySelector('nav[aria-label="Your path"] ol button, nav[aria-label="Your path"] button')?.click())
  await wait(900)
  report(await observe(page), "6. back on the company")
  await shot("back")
  dumpConsole(page); await b.close()
}

/* ------------------------------------------------------------------------------------ chain 4 */

export async function chain4(w, h) {
  note(`\n=== CHAIN 4 · sequence › sending-rules link › Settings, row lit › back to the row (${w}) ===`)
  const { b, page } = await browser(w, h)
  const shot = shotter(page, `${DIR}/04-setting`, w)
  await signIn(page, "meridian", "admin", "/ollopa/sequences/seq-1")
  await page.evaluate(() => document.querySelector('[data-page-active="true"] #seq-settings')?.scrollIntoView({ block: "start" }))
  await wait(400)
  report(await observe(page), "1. the sequence's sending settings")
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] a[href*="settings"]')).map((a) => `${a.innerText.replace(/\s+/g, " ").trim()} → ${a.getAttribute("href")}`))
  note(`    links     ${links.join(" | ")}`)
  await shot("sequence")

  await focusTop(page)
  const r = await tabTo(page, "Bounce guard", 80)
  note(`    keyboard  ${r.tabs} tabs from the top of the page to the settings link → ${r.on}`)
  if (r.tabs > 0) await page.keyboard.press("Enter")
  else await clickText(page, "Bounce guard thresholds (Settings)")
  await wait(1200)
  const o2 = await observe(page)
  report(o2, "2. Settings, arrived by follow")
  note(`    door open ${await page.evaluate(() => { const d = document.querySelector('[data-page-active="true"] [data-door]'); return Array.from(document.querySelectorAll('[data-page-active="true"] [aria-expanded="true"]')).map((x) => x.innerText.replace(/\s+/g, " ").slice(0, 40)).join(" | ") })}`)
  await shot("settings")

  await page.evaluate(() => document.querySelector('nav[aria-label="Your path"] ol button, nav[aria-label="Your path"] button')?.click())
  await wait(1000)
  report(await observe(page), "3. back on the sequence, at the row we left")
  await shot("back")
  dumpConsole(page); await b.close()
}

/* ------------------------------------------------------------------------------------ chain 5 */

export async function chain5(w, h) {
  note(`\n=== CHAIN 5 · Settings › change the answers › finish › back to the row with the notice (${w}) ===`)
  const { b, page } = await browser(w, h)
  const shot = shotter(page, `${DIR}/05-setup`, w)
  await signIn(page, "meridian", "admin", "/ollopa/settings")
  const rows = await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] a, [data-page-active="true"] button')).map((b) => b.innerText.replace(/\s+/g, " ").trim()).filter((t) => /team works|answers|set-up|setup/i.test(t)))
  note(`    candidates ${rows.join(" | ")}`)
  report(await observe(page), "1. Settings")
  await shot("settings")

  let ok = await clickText(page, "How your team works")
  if (!ok) ok = await page.evaluate(() => { const el = Array.from(document.querySelectorAll('[data-page-active="true"] a,[data-page-active="true"] button')).find((b) => /team works/i.test(b.innerText)); el?.click(); return !!el })
  await wait(900)
  report(await observe(page), "2. How your team works")
  await shot("how-your-team-works")

  const changed = await page.evaluate(() => { const el = Array.from(document.querySelectorAll('[data-page-active="true"] a,[data-page-active="true"] button')).find((b) => /change the answers|change these answers|answers/i.test(b.innerText)); el?.click(); return el?.innerText.replace(/\s+/g, " ").trim() ?? null })
  note(`    clicked   ${changed ?? "(no 'change the answers' control found)"}`)
  await wait(1200)
  const o3 = await observe(page)
  report(o3, "3. the set-up questions — inside the shell, or fallen out of it?")
  note(`    sidebar   ${await page.evaluate(() => !!document.querySelector('nav[aria-label="Pages"], aside nav, [data-sidebar]') || /Home/.test(document.body.innerText.slice(0, 400)))}`)
  note(`    chrome    ${await page.evaluate(() => (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 200))}`)
  await shot("setup")

  // Change an answer, then finish. The set-up is one page with three questions and "Start".
  const changedAnswer = await page.evaluate(() => {
    const opts = Array.from(document.querySelectorAll('[role="radio"], [aria-pressed], label, button'))
      .filter((e) => e.offsetParent !== null && /Run campaigns|Grow existing accounts|Campaigns and audiences/.test(e.innerText || ""))
    const el = opts[0]
    if (!el) return null
    el.click()
    return (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 40)
  })
  note(`    answer    changed to "${changedAnswer ?? "(could not find an option to change)"}"`)
  await wait(500)
  await shot("answer-changed")
  const finished = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll("button")).find((b) => b.offsetParent !== null && /^(Save the answers|Start|Save and finish|Finish|Done)$/i.test((b.innerText || "").trim()))
    el?.click()
    return (el?.innerText || "").trim() || null
  })
  note(`    finished  by "${finished}"`)
  await wait(1500)
  const o4 = await observe(page)
  report(o4, "4. after finishing")
  note(`    notice    ${await page.evaluate(() => { const m = (document.body.innerText || "").replace(/\s+/g, " ").match(/[^.]{0,90}(moved|added to your sidebar|no longer in|now in your sidebar)[^.]{0,90}/i); return m ? m[0].trim() : "(no line saying what moved)" })}`)
  note(`    sidebar   ${await page.evaluate(() => Array.from(document.querySelectorAll('aside nav a, nav a')).map((a) => a.innerText.replace(/\s+/g, " ").trim()).filter(Boolean).join(" · ").slice(0, 220))}`)
  await shot("finished")
  dumpConsole(page); await b.close()
}

/* ------------------------------------------------------------------------------------ chain 6 */

export async function chain6(w, h) {
  note(`\n=== CHAIN 6 · deals board › quick look › open › back; deal › contact; deal › company (${w}) ===`)
  const { b, page } = await browser(w, h)
  const shot = shotter(page, `${DIR}/06-deals`, w)
  await signIn(page, "meridian", "ae", "/ollopa/deals")
  report(await observe(page), "1. the board")
  await shot("board")
  const cards = await rowsOf(page, "")
  const card = cards.find((c) => /^d-/.test(c.id))
  note(`    cards     ${cards.length}, first deal ${card?.id} "${card?.label}"`)

  // First by keyboard: focus the card and press Enter, the way a person on the keyboard would.
  await page.evaluate((id) => {
    const a = document.querySelector(`[data-page-active="true"] [data-item="${id}"]`)
    a?.closest("li[tabindex]")?.focus()
  }, card.id)
  note(`    focused   ${await focusInfo(page)}`)
  await page.keyboard.press("Enter")
  await wait(900)
  const ok = await observe(page)
  note(`    Enter →   hash=${ok.hash} drawer=${await page.evaluate(() => !!document.querySelector('[role="dialog"]'))}  (a quick look, or straight to the record?)`)
  await shot("card-enter")

  // Now by mouse: a click on the card body.
  await signIn(page, "meridian", "ae", "/ollopa/deals")
  await page.evaluate((id) => {
    const a = document.querySelector(`[data-page-active="true"] [data-item="${id}"]`)
    a?.closest("li[tabindex]")?.click()
  }, card.id)
  await wait(900)
  const o2 = await observe(page)
  report(o2, "2. a click on the card body — the quick look")
  note(`    drawer    ${await page.evaluate(() => { const d = document.querySelector('[role="dialog"]'); return d ? (d.innerText || "").replace(/\s+/g, " ").slice(0, 260) : "(nothing opened)" })}`)
  note(`    doors in  ${await page.evaluate(() => document.querySelectorAll('[role="dialog"] [data-door]').length)}`)
  await shot("quick-look")

  const opened = await page.evaluate(() => { const el = Array.from(document.querySelectorAll('[role="dialog"] button, [role="dialog"] a')).find((x) => /open/i.test(x.innerText)); el?.click(); return el?.innerText.replace(/\s+/g, " ").trim() ?? null })
  note(`    opened by "${opened}"`)
  await wait(1000)
  report(await observe(page), "3. the deal record")
  await shot("deal")

  await page.evaluate(() => document.querySelector('nav[aria-label="Your path"] ol button, nav[aria-label="Your path"] button')?.click())
  await wait(1000)
  report(await observe(page), "4. back on the board, the card lit")
  await shot("back-board")

  // The company beside, from the board card
  const co = await page.evaluate((id) => {
    const a = document.querySelector(`[data-page-active="true"] [data-item="${id}"]`)
    const btn = a?.parentElement?.querySelector("button")
    btn?.click()
    return btn?.innerText.replace(/\s+/g, " ").trim() ?? null
  }, card.id)
  note(`    company   opened from the card by "${co}"`)
  await wait(800)
  report(await observe(page), "5. board card › company beside")
  await shot("board-company")
  await page.keyboard.press("Escape")
  await wait(500)
  note(`    after Esc focus=${await focusInfo(page)}`)

  // The deal record: contact beside, then the company
  await signIn(page, "meridian", "ae", `/ollopa/deals/${card.id}`)
  await wait(400)
  const contacts = await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] [data-item^="c-"]')).filter((e) => e.offsetParent !== null).map((e) => e.getAttribute("data-item")))
  note(`    contacts  ${contacts.length} on the deal record`)
  if (contacts[0]) {
    await page.evaluate((id) => { const e = document.querySelector(`[data-page-active="true"] [data-item="${id}"]`); (e.matches("button,a") ? e : e.querySelector("button,a"))?.click() }, contacts[0])
    await wait(700)
  }
  report(await observe(page), "6. deal record › contact beside")
  await shot("deal-contact")
  await page.keyboard.press("Escape")
  await wait(500)
  note(`    after Esc focus=${await focusInfo(page)}`)
  await shot("deal-contact-closed")

  // The company on the deal record
  const link = await page.evaluate(() => {
    const a = Array.from(document.querySelectorAll('[data-page-active="true"] a[href*="/ollopa/companies/"]')).find((x) => x.offsetParent !== null)
    if (!a) return null
    const txt = a.innerText.replace(/\s+/g, " ").trim()
    a.click()
    return txt
  })
  note(`    company   the deal record's company control is "${link}"`)
  await wait(1000)
  const o7 = await observe(page)
  report(o7, "7. deal record › company — beside, or a whole page with no way back?")
  await shot("deal-company")
  dumpConsole(page); await b.close()
}

/* ------------------------------------------------------------------------------------ chain 7 */

export async function chain7(w, h) {
  note(`\n=== CHAIN 7 · inbox / tasks / home (${w}) ===`)
  const { b, page } = await browser(w, h)
  const shot = shotter(page, `${DIR}/07-work`, w)

  // --- Inbox
  await signIn(page, "meridian", "sdr", "/ollopa/inbox")
  report(await observe(page), "1. Inbox")
  await shot("inbox")
  const replies = await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] [id^="reply-"]')).map((e) => `${e.id}/${e.getAttribute("data-item")}:${e.getAttribute("data-item-label")}`))
  note(`    replies   ${replies.join(" | ")}`)

  const menuSel = '[data-page-active="true"] [data-row-menu], [data-page-active="true"] button[aria-label^="More actions"]'
  const menu = await page.evaluate((sel) => document.querySelector(sel)?.getAttribute("aria-label") ?? null, menuSel)
  await page.click(menuSel)   // a real mouse press: the menu opens on pointerdown, not on .click()
  await wait(700)
  const items = await page.evaluate(() => Array.from(document.querySelectorAll('[role="menuitem"]')).map((x) => x.innerText.replace(/\s+/g, " ").trim()))
  note(`    menu      "${menu}" → ${items.join(" | ")}`)
  await shot("inbox-menu")
  const picked = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('[role="menuitem"]')).find((x) => /beside the thread/i.test(x.innerText) && !/·/.test(x.innerText.split("beside")[0]))
      ?? Array.from(document.querySelectorAll('[role="menuitem"]')).find((x) => /contact|person|profile|beside/i.test(x.innerText))
    if (!el) return null
    const t = el.innerText.replace(/\s+/g, " ").trim()
    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))
    el.click()
    return t
  })
  note(`    chose     "${picked}"`)
  await wait(800)
  const o2 = await observe(page)
  report(o2, "2. the contact beside the reply")
  await shot("inbox-contact")

  // The one in-pane step: the deal behind the reply, from inside the contact's pane or from the
  // thread beside it.
  const nested = await page.evaluate(() => {
    const inPane = Array.from(document.querySelectorAll('aside[aria-label*=" beside "] button, aside[aria-label*=" beside "] a')).find((x) => /deal|·\s*(Platform|Pilot|Growth)/i.test(x.innerText))
    const onPage = Array.from(document.querySelectorAll('[data-page-active="true"] button')).find((x) => x.offsetParent !== null && /beside the thread/i.test(x.innerText) && /·/.test(x.innerText))
    const el = inPane ?? onPage
    if (!el) return null
    const t = el.innerText.replace(/\s+/g, " ").trim()
    el.click()
    return `${t}${inPane ? " (from inside the pane)" : " (from the thread)"}`
  })
  note(`    nested    "${nested ?? "(no deal offered inside the pane)"}"`)
  await wait(800)
  report(await observe(page), "3. one step inside the pane")
  note(`    header    ${await page.evaluate(() => (document.querySelector('aside[aria-label*=" beside "] header')?.innerText || "").replace(/\s+/g, " ").slice(0, 120))}`)
  await shot("inbox-nested")

  const deeper = await page.evaluate(() => { const el = Array.from(document.querySelectorAll('aside[aria-label*=" beside "] button, aside[aria-label*=" beside "] a')).find((x) => /contact|person|company|account/i.test(x.innerText) && !/Open the page/.test(x.innerText)); if (!el) return "(nothing deeper offered — correct)"; el.click(); return el.innerText.replace(/\s+/g, " ").trim() })
  await wait(700)
  note(`    deeper?   "${deeper}" → header "${await page.evaluate(() => (document.querySelector('aside[aria-label*=" beside "] header')?.innerText || "").replace(/\s+/g, " ").slice(0, 120))}"`)
  await shot("inbox-deeper")

  await page.evaluate(() => { const el = Array.from(document.querySelectorAll('aside[aria-label*=" beside "] header button')).find((x) => x.innerText.trim() && !/Open the page/.test(x.innerText)); el?.click() })
  await wait(700)
  report(await observe(page), "4. the one step back inside the pane")
  await shot("inbox-back")

  await page.keyboard.press("BracketRight")
  await wait(600)
  report(await observe(page), "5. ] — the next reply")
  await shot("inbox-next")
  await page.keyboard.press("Escape")
  await wait(500)
  note(`    after Esc focus=${await focusInfo(page)}`)

  // --- Tasks
  await signIn(page, "meridian", "sdr", "/ollopa/tasks")
  report(await observe(page), "6. Tasks")
  await shot("tasks")
  const first = await page.evaluate(() => { const e = Array.from(document.querySelectorAll('[data-page-active="true"] [data-item^="c-"]')).find((x) => x.offsetParent !== null); const btn = e?.matches("button,a") ? e : e?.querySelector("button,a"); const name = btn?.innerText.replace(/\s+/g, " ").trim(); btn?.click(); return name ?? null })
  note(`    opened    "${first}"`)
  await wait(800)
  const o7 = await observe(page)
  report(o7, "7. the contact beside the task")
  await shot("task-contact")
  const doneBtn = await page.evaluate(() => { const el = Array.from(document.querySelectorAll('[data-page-active="true"] button')).find((x) => /^(Done|Mark complete)$/i.test(x.innerText.trim()) && x.offsetParent !== null); el?.click(); return el?.innerText.trim() ?? null })
  note(`    done      clicked "${doneBtn}"`)
  await wait(1000)
  report(await observe(page), "8. after Done — the next task, and where focus went")
  note(`    now on    ${await page.evaluate(() => (document.querySelector('[data-page-active="true"] h3')?.innerText || "").replace(/\s+/g, " ").slice(0, 60))}`)
  await shot("task-done")

  // --- Home
  await signIn(page, "meridian", "sdr", "/ollopa")
  report(await observe(page), "9. Home")
  await shot("home")
  const hr = await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] [data-item]')).filter((e) => e.offsetParent !== null).map((e) => `${e.getAttribute("data-item")}:${(e.innerText || "").replace(/\s+/g, " ").slice(0, 26)}`))
  note(`    items     ${hr.length}: ${hr.slice(0, 8).join(" | ")}`)
  const replyRow = await page.evaluate(() => {
    const e = Array.from(document.querySelectorAll('[data-page-active="true"] [data-item^="r-"]')).find((x) => x.offsetParent !== null)
    if (!e) return null
    const btn = e.matches("button,a") ? e : e.querySelector("button,a")
    btn?.click()
    return `${e.getAttribute("data-item")} "${btn?.innerText.replace(/\s+/g, " ").trim().slice(0, 30)}"`
  })
  note(`    home reply ${replyRow ?? "(no reply row with data-item r-* on Home)"}`)
  await wait(900)
  report(await observe(page), "10. a Home reply, opened")
  await shot("home-open")
  const back = await page.evaluate(() => { const el = document.querySelector('nav[aria-label="Your path"] ol button, nav[aria-label="Your path"] button'); el?.click(); return !!el })
  await wait(1100)
  report(await observe(page), `11. back on Home by the crumb (${back})`)
  await shot("home-back")
  dumpConsole(page); await b.close()
}

/* ------------------------------------------------------------------------------------ chain 8 */

const INDEXES = [
  ["sequences", "/ollopa/sequences", "Sequences", "meridian", "sdr"],
  ["people", "/ollopa/people", "People", "meridian", "sdr"],
  ["companies", "/ollopa/companies", "Companies", "meridian", "sdr"],
  ["lists", "/ollopa/lists", "Lists", "meridian", "sdr"],
  ["templates", "/ollopa/templates", "Templates", "meridian", "sdr"],
  // Campaigns is not in the Meridian SDR's seat — it opens a no-access page — so the lap is run
  // by the seat that owns it.
  ["campaigns", "/ollopa/campaigns", "Campaigns", "ridgeline", "marketer"],
]

export async function chain8(w, h) {
  note(`\n=== CHAIN 8 · index laps: row › record › back to the row lit (${w}) ===`)
  const { b, page } = await browser(w, h)
  const shot = shotter(page, `${DIR}/08-indexes`, w)
  for (const [name, route, title, biz, role] of INDEXES) {
    note(`\n  -- ${title} (${biz} ${role})`)
    await signIn(page, biz, role, route)
    const o0 = await observe(page)
    note(`    landed    h1="${o0.h1}" trail=${o0.trail ?? "(empty)"}`)
    await shot(`${name}-index`)
    // The row's own name control: the first link or button with real text inside the row.
    const clicked = await page.evaluate(() => {
      const root = document.querySelector('[data-page-active="true"]')
      const row = Array.from(root.querySelectorAll("tbody tr, ul li, ol li")).find((e) => e.offsetParent !== null && (e.hasAttribute("data-row-key") || e.hasAttribute("data-item") || e.querySelector("[data-item]")))
      if (!row) return null
      // The row's own name: the first control with real text, cell by cell from the left, skipping
      // the select checkbox and the row menu. Some tables put the name in the first cell and some
      // in the second, behind a checkbox column.
      const cells = [...row.querySelectorAll("td"), row.querySelector("[data-item]"), row].filter(Boolean)
      let el = null
      for (const cell of cells) {
        el = Array.from(cell.querySelectorAll("a,button")).find((x) => (x.innerText || "").trim().length > 1
          && !/^(select|actions)/i.test(x.getAttribute("aria-label") || "")
          && !/^(open|resume|pause|add to sequence)$/i.test((x.innerText || "").trim()))
        if (el) break
      }
      if (el) { const t = (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 40); el.click(); return `the name "${t}"` }
      // No link or button on the name: the row itself, which is what the table makes clickable.
      row.click()
      return "the row itself — there is no link or button on the name"
    })
    await wait(1100)
    const o1 = await observe(page)
    note(`    opened    "${clicked}" → hash=${o1.hash} h1="${o1.h1}" trail=${o1.trail ?? "(EMPTY — no crumb)"} pane=${o1.pane ? `"${o1.pane.head}"` : "none"}`)
    await shot(`${name}-record`)
    const wentBack = await page.evaluate(() => {
      const el = document.querySelector('nav[aria-label="Your path"] ol button, nav[aria-label="Your path"] button')
      if (el) { el.click(); return "crumb" }
      const a = Array.from(document.querySelectorAll('[data-page-active="true"] a, [data-page-active="true"] button')).find((x) => /^(←|‹)/.test(x.innerText.trim()))
      if (a) { a.click(); return `back link "${a.innerText.trim().slice(0, 24)}"` }
      return null
    })
    await wait(1100)
    const o2 = await observe(page)
    note(`    back by   ${wentBack ?? "(nothing to go back with)"} → h1="${o2.h1}" lit=${o2.lit ? o2.lit.slice(0, 50) : "(NOTHING LIT)"} focus=${o2.focused.slice(0, 60)}`)
    await shot(`${name}-back`)
  }
  dumpConsole(page); await b.close()
}

/* ------------------------------------------------------------------------------------ chain 9 */

const DEV = process.env.OPD_DEV ?? "http://localhost:4181"

export async function chain9(w, h) {
  note(`\n=== CHAIN 9 · cross-cutting (${w}) ===`)
  const dir = `${DIR}/09-cross`
  {
    const { b, page } = await browser(w, h)
    const shot = shotter(page, dir, w)

    // a: the trail after a sidebar click
    await signIn(page, "meridian", "sdr", "/ollopa/sequences/seq-1")
    await page.evaluate(() => document.querySelector('[data-page-active="true"] #seq-people')?.scrollIntoView({ block: "start" }))
    await wait(300)
    await page.evaluate(() => { const e = Array.from(document.querySelectorAll('[data-page-active="true"] [data-item^="c-"]')).find((x) => x.offsetParent !== null); (e.matches("button,a") ? e : e.querySelector("button,a"))?.click() })
    await wait(500)
    await clickText(page, "Open the page", PANE)
    await wait(900)
    note(`  trail before the sidebar click: ${(await observe(page)).trail}`)
    await shot("a-trail-before-sidebar")
    const side = await page.evaluate(() => { const el = Array.from(document.querySelectorAll('a[href^="#/ollopa/companies"], nav a')).find((a) => /Companies/.test(a.innerText)); el?.click(); return el?.innerText.trim() ?? null })
    await wait(900)
    const oa = await observe(page)
    note(`  a. sidebar "${side}" → h1="${oa.h1}" trail=${oa.trail ?? "(EMPTY — correct)"} mounted=${oa.mounted.length}`)
    await shot("a-after-sidebar")

    // b: the trail after a palette jump
    await signIn(page, "meridian", "sdr", "/ollopa/sequences/seq-1")
    await page.evaluate(() => document.querySelector('[data-page-active="true"] #seq-people')?.scrollIntoView({ block: "start" }))
    await wait(300)
    await page.evaluate(() => { const e = Array.from(document.querySelectorAll('[data-page-active="true"] [data-item^="c-"]')).find((x) => x.offsetParent !== null); (e.matches("button,a") ? e : e.querySelector("button,a"))?.click() })
    await wait(500)
    await clickText(page, "Open the page", PANE)
    await wait(900)
    await page.keyboard.down("Meta"); await page.keyboard.press("k"); await page.keyboard.up("Meta")
    await wait(600)
    await page.keyboard.type("Companies")
    await wait(700)
    await shot("b-palette")
    await page.keyboard.press("Enter")
    await wait(1000)
    const ob = await observe(page)
    note(`  b. palette jump → h1="${ob.h1}" hash=${ob.hash} trail=${ob.trail ?? "(EMPTY — correct)"}`)
    await shot("b-after-palette")

    // c: a deep link
    await signIn(page, "meridian", "sdr", "/ollopa/people/c-13")
    const oc = await observe(page)
    note(`  c. deep link → h1="${oc.h1}" trail=${oc.trail ?? "(EMPTY — correct)"}`)
    await shot("c-deep-link")

    // d: sign-out
    await signIn(page, "meridian", "sdr", "/ollopa/sequences/seq-1")
    await page.evaluate(() => document.querySelector('[data-page-active="true"] #seq-people')?.scrollIntoView({ block: "start" }))
    await wait(300)
    await page.evaluate(() => { const e = Array.from(document.querySelectorAll('[data-page-active="true"] [data-item^="c-"]')).find((x) => x.offsetParent !== null); (e.matches("button,a") ? e : e.querySelector("button,a"))?.click() })
    await wait(500)
    await clickText(page, "Open the page", PANE)
    await wait(900)
    const stored = await page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.includes("chain")).map((k) => `${k}=${sessionStorage.getItem(k).slice(0, 60)}`))
    note(`  d. sessionStorage before sign-out: ${stored.join(" ; ") || "(nothing)"}`)
    await page.evaluate(() => { document.dispatchEvent(new CustomEvent("ollopa:signout")) })
    await wait(1200)
    const after = await page.evaluate(() => ({
      keys: Object.keys(sessionStorage).filter((k) => k.includes("chain")).map((k) => `${k}=${sessionStorage.getItem(k).slice(0, 60)}`),
      local: localStorage.getItem("ollopa.session"),
      body: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 120),
    }))
    note(`  d. after sign-out: keys=${after.keys.join(" ; ") || "(none)"} session=${after.local} screen="${after.body}"`)
    await shot("d-signed-out")
    // sign back in and see whether a trail comes back
    await signIn(page, "meridian", "sdr", "/ollopa/people/c-13")
    const od = await observe(page)
    note(`  d. signed back in → trail=${od.trail ?? "(EMPTY — correct)"}`)
    await shot("d-signed-back-in")
    dumpConsole(page); await b.close()
  }

  // e + f: a half-typed value, and the render counters, on the dev build
  {
    const { b, page } = await browser(w, h)
    const shot = shotter(page, dir, w)
    await signIn(page, "meridian", "sdr", "/ollopa/sequences/seq-1", DEV)
    await page.evaluate(() => document.querySelector('[data-page-active="true"] #seq-steps')?.scrollIntoView({ block: "start" }))
    await wait(400)
    // The step's own door has to be open before there is a field to half-type into — which also
    // gives us the open-door half of "returning lands with the page as it was".
    const doorOpened = await page.evaluate(() => {
      // The door holding the field: the panel the field sits in, and the control that names it.
      const i = document.querySelector('[data-page-active="true"] #subj-seq-1-st1')
      let panel = i?.parentElement
      while (panel && !panel.hasAttribute("hidden")) panel = panel.parentElement
      if (!panel) return "(already open)"
      const el = document.querySelector(`[aria-controls="${panel.id}"]`)
      el?.click()
      return el ? (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 40) : `(no control for #${panel.id})`
    })
    note(`  e. opened the step door: "${doorOpened}"`)
    await wait(500)
    const typedInto = await page.evaluate(() => {
      const i = document.querySelector('[data-page-active="true"] #subj-seq-1-st1')
      if (!i) return null
      i.focus()
      return document.activeElement === i ? i.id : `${i.id} (WOULD NOT TAKE FOCUS)`
    })
    await page.keyboard.press("End")
    await page.keyboard.type(" HALF-TYPED")
    await wait(400)
    const draft0 = await page.evaluate(() => document.querySelector("#subj-seq-1-st1")?.value)
    note(`  e. typed into ${typedInto}: "${draft0}"`)
    await shot("e-half-typed")
    await page.evaluate(() => document.querySelector('[data-page-active="true"] #seq-people')?.scrollIntoView({ block: "start" }))
    await wait(400)
    const before = await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] [data-renders]')).map((e) => `${e.getAttribute("data-renders")}=${e.textContent.trim()}`))
    note(`  f. render counters before the pane: ${before.join(" · ") || "(none found)"}`)
    await page.evaluate(() => { const e = Array.from(document.querySelectorAll('[data-page-active="true"] [data-item^="c-"]')).find((x) => x.offsetParent !== null); (e.matches("button,a") ? e : e.querySelector("button,a"))?.click() })
    await wait(700)
    const afterR = await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] [data-renders]')).map((e) => `${e.getAttribute("data-renders")}=${e.textContent.trim()}`))
    note(`  f. render counters with the pane open: ${afterR.join(" · ") || "(none found)"}  → ${before.join() === afterR.join() ? "NO re-render" : "THE PAGE RE-RENDERED"}`)
    await shot("f-counters")
    // g: Esc closes and focus returns to the opener
    const openerText = await focusInfo(page)
    await page.keyboard.press("Escape")
    await wait(500)
    note(`  g. Esc → pane=${(await observe(page)).pane ? "still open" : "closed"} focus=${await focusInfo(page)} (was, in the pane: ${openerText})`)
    await shot("g-esc")
    // e continued: follow and come back, is the half-typed value still there?
    await page.evaluate(() => { const e = Array.from(document.querySelectorAll('[data-page-active="true"] [data-item^="c-"]')).find((x) => x.offsetParent !== null); (e.matches("button,a") ? e : e.querySelector("button,a"))?.click() })
    await wait(500)
    await clickText(page, "Open the page", PANE)
    await wait(1000)
    await shot("e-away")
    await page.evaluate(() => document.querySelector('nav[aria-label="Your path"] ol button, nav[aria-label="Your path"] button')?.click())
    await wait(1200)
    const draft1 = await page.evaluate(() => document.querySelector('[data-page-active="true"] #subj-seq-1-st1')?.value ?? "(the field is gone)")
    note(`  e. after follow and back, the field reads: "${draft1}"  → ${draft1 === draft0 ? "the draft survived" : "THE DRAFT WAS LOST"}`)
    note(`  e. the step door on return: ${await page.evaluate(() => { const i = document.querySelector('[data-page-active="true"] #subj-seq-1-st1'); const d = i && !i.closest("[hidden]") ? i : null; return d ? "still open" : "CLOSED AGAIN" })}`)
    const afterBack = await page.evaluate(() => Array.from(document.querySelectorAll('[data-page-active="true"] [data-renders]')).map((e) => `${e.getAttribute("data-renders")}=${e.textContent.trim()}`))
    note(`  f. render counters after the return: ${afterBack.join(" · ")}`)
    await shot("e-back")
    dumpConsole(page); await b.close()
  }

  // h: prefers-reduced-motion
  {
    const { b, page } = await browser(w, h, { reducedMotion: true })
    const shot = shotter(page, dir, w)
    await signIn(page, "meridian", "sdr", "/ollopa/sequences/seq-1")
    await page.evaluate(() => document.querySelector('[data-page-active="true"] #seq-people')?.scrollIntoView({ block: "start" }))
    await wait(300)
    await page.evaluate(() => { const e = Array.from(document.querySelectorAll('[data-page-active="true"] [data-item^="c-"]')).find((x) => x.offsetParent !== null); (e.matches("button,a") ? e : e.querySelector("button,a"))?.click() })
    await wait(600)
    const o = await page.evaluate(() => {
      const a = document.querySelector('aside[aria-label*=" beside "]')
      const cs = a ? getComputedStyle(a) : null
      return { reduce: matchMedia("(prefers-reduced-motion: reduce)").matches, dur: cs ? cs.transitionDuration : "(no pane)", prop: cs ? cs.transitionProperty : "-", w: a ? Math.round(a.getBoundingClientRect().width) : 0 }
    })
    note(`  h. reduced motion=${o.reduce} → the pane transitions "${o.prop}" over ${o.dur}, width ${o.w}`)
    await shot("h-reduced-motion")
    // i: a Door inside the pane, and how deep the pane goes
    const doors = await page.evaluate(() => {
      const a = document.querySelector('aside[aria-label*=" beside "]')
      return {
        doors: a ? a.querySelectorAll("[data-door], [aria-expanded]").length : -1,
        detail: a ? Array.from(a.querySelectorAll("[data-door],[aria-expanded]")).map((x) => `${x.getAttribute("data-door") || x.tagName}:${(x.innerText || "").replace(/\s+/g, " ").slice(0, 30)}`) : [],
      }
    })
    note(`  i. things that look like a door inside the pane: ${doors.doors} ${JSON.stringify(doors.detail)}`)
    dumpConsole(page); await b.close()
  }
}

/* --------------------------------------------------------------------------------- dispatcher */

const chains = { chain1, chain2, chain3, chain4, chain5, chain6, chain7, chain8, chain9 }
const [which, w = "1440", h = "900"] = process.argv.slice(2)
if (which && chains[which]) {
  await chains[which](Number(w), Number(h))
  saveLog(`${DIR}/logs/${which}-${w}.txt`)
}
