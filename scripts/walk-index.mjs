// Chain 8 for this folder: the index laps — Sequences, Lists, Templates.
//
// One lap each: open the row from its name, read the crumb, take the crumb back, and check the row
// is lit on arrival. It also checks the thing the review kept finding missing: that every row has a
// real, visible, focusable name control at the width it is run at, on every kind of row.
//
//   node scripts/walk-index.mjs shots/chains/engage/chain8 1440 900
import puppeteer from "puppeteer-core"
import { mkdirSync } from "node:fs"

const [dir = "shots/chains/engage/chain8", w = "1440", h = "900"] = process.argv.slice(2)
const base = process.env.OPD_BASE ?? "http://localhost:4170"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const role = process.env.OPD_ROLE ?? "sdr"

mkdirSync(dir, { recursive: true })

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const page = await browser.newPage()
await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

await page.goto(base + "/#/", { waitUntil: "networkidle0" })
await page.evaluate((r) => localStorage.setItem("ollopa.session", JSON.stringify({ business: "meridian", role: r })), role)

for (const route of ["sequences", "lists", "templates"]) {
  await page.goto(`${base}/#/ollopa/${route}`, { waitUntil: "networkidle0" })
  await page.reload({ waitUntil: "networkidle0" })
  await wait(900)

  const h1 = await page.evaluate(() => document.querySelector("header h1")?.innerText)
  // Every row, at this width: a visible, focusable control carrying the name.
  const names = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('[data-page-active="true"] tbody tr[data-row-key], [data-page-active="true"] ul > li'))
      .filter((r) => r.offsetParent !== null)
    const bad = rows.filter((r) => {
      const el = r.querySelector("[data-row-open]")
      return !(el && el.offsetParent !== null && el.tabIndex >= 0 && el.textContent.trim())
    })
    return `${rows.length} rows · without a name control: ${bad.length}`
  })

  const key = await page.evaluate(() => {
    const r = Array.from(document.querySelectorAll('[data-page-active="true"] tbody tr[data-row-key], [data-page-active="true"] ul > li'))
      .find((x) => x.offsetParent !== null)
    const el = r?.querySelector("[data-row-open]")
    el?.focus()
    el?.click()
    return r?.getAttribute("data-row-key") ?? el?.textContent.trim()
  })
  await wait(900)
  // The name opens the object beside the page; the record is the deliberate step after it, taken
  // from the pane's own "Open the page" (BUILD-CHAINS.md: beside, not instead).
  const pane = await page.evaluate(() => {
    const p = document.querySelector('aside[aria-label*=" beside "]')
    return p ? (p.innerText || "").replace(/\s+/g, " ").trim().slice(0, 34) : "(no pane)"
  })
  await page.evaluate(() => {
    const p = document.querySelector('aside[aria-label*=" beside "]')
    const go = Array.from(p?.querySelectorAll("a,button") ?? []).find((x) => /open the page/i.test(x.textContent || ""))
    go?.click()
  })
  await wait(900)
  const crumb = await page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Your path"]')
    if (!nav) return "(no crumb)"
    return Array.from(nav.querySelectorAll("button")).find((b) => b.offsetParent !== null)?.textContent.trim() ?? "(none)"
  })
  await page.screenshot({ path: `${dir}/${route}-record-${w}.png` })

  await page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Your path"]')
    Array.from(nav?.querySelectorAll("button") ?? []).find((b) => b.offsetParent !== null)?.focus()
  })
  await page.keyboard.press("Enter")
  await wait(800)
  const lit = await page.evaluate(() => document.querySelector(".ollopa-returned")?.innerText.replace(/\n/g, " ").slice(0, 44) ?? "(nothing lit)")
  console.log(`${route}: h1="${h1}" · ${names} · opened ${key} · beside "${pane}" · crumb "${crumb}" · back lit "${lit}"`)
  await page.screenshot({ path: `${dir}/${route}-back-${w}.png` })
}

await browser.close()
