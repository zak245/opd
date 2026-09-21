// What the person pane shows each seat, read out of the running product.
//
//   node scripts/pane-fields.mjs
//
// One seat at a time: sign in, get a contact open beside a page that seat actually holds, and
// print the pane's field labels and its action buttons. The point is that the three differ, and
// that they differ the way `useDisclosure("people")` says they should.
import puppeteer from "puppeteer-core"

const base = process.env.OPD_BASE ?? "http://localhost:4176"
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const seats = [
  { business: "meridian", role: "sdr" },
  { business: "meridian", role: "ae" },
  { business: "meridian", role: "marketer" },
  { business: "ridgeline", role: "sdr" },
  { business: "ridgeline", role: "cs" },
]

const browser = await puppeteer.launch({ executablePath: chrome, headless: true })

for (const seat of seats) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 1000 })
  await page.goto(base + "/#/", { waitUntil: "networkidle0" })
  await page.evaluate((s) => localStorage.setItem("ollopa.session", JSON.stringify(s)), seat)

  // A person opens beside on the contact record (the colleague card) where the seat holds People,
  // and on Tasks where it does not.
  let where = "contact record · People at this company"
  await page.goto(`${base}/#/ollopa/people`, { waitUntil: "networkidle0" })
  await page.reload({ waitUntil: "networkidle0" })
  await wait(700)
  let opened = await page.evaluate(() => {
    const a = document.querySelector('[data-page-active="true"] tbody tr[data-item] td a')
    if (!a) return false
    a.click()
    return true
  })
  if (opened) {
    await wait(900)
    opened = await page.evaluate(() => {
      const card = Array.from(document.querySelectorAll('[data-page-active="true"] [data-record-card]'))
        .find((c) => /People at/.test(c.textContent))
      const b = card?.querySelector("[data-item] button")
      if (!b) return false
      card.scrollIntoView({ block: "center" })
      b.click()
      return true
    })
    await wait(700)
  }
  if (!opened || !(await page.$('aside[aria-label*="beside"] h2'))) {
    where = "Tasks · the contact beside the task"
    await page.goto(`${base}/#/ollopa/tasks`, { waitUntil: "networkidle0" })
    await page.reload({ waitUntil: "networkidle0" })
    await wait(900)
    await page.evaluate(() => {
      const b = document.querySelector('[data-page-active="true"] button[data-row-focus]')
      b?.click()
    })
    await wait(700)
  }

  const out = await page.evaluate(() => {
    const pane = document.querySelector('aside[aria-label*="beside"]') ?? document.createElement("aside")
    return ({
    name: pane.querySelector("h2")?.textContent ?? "(no pane)",
    fields: Array.from(pane.querySelectorAll("dt")).map((d) => d.textContent.trim()),
    actions: Array.from(pane.querySelectorAll("button"))
      .map((b) => b.textContent.trim())
      .filter((t) => t && t !== "Open the page" && t !== "Undo" && !/^(Previous|Next)/.test(t)),
  })})
  console.log(`\n${seat.business} · ${seat.role}  (${where})`)
  console.log("  pane:    ", out.name)
  console.log("  fields:  ", out.fields.join(" · ") || "(none)")
  console.log("  actions: ", out.actions.join(" | ") || "(none)")
  await page.close()
}

await browser.close()
