import puppeteer from "puppeteer-core"
const base = process.env.OPD_BASE ?? "http://localhost:4170"
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900 })
await p.goto(base + "/#/", { waitUntil: "networkidle0" })
await p.evaluate((s) => localStorage.setItem("ollopa.session", JSON.stringify(s)), { business: "meridian", role: "ae" })
await p.goto(base + "/#/ollopa/companies/co-1", { waitUntil: "networkidle0" })
await p.reload({ waitUntil: "networkidle0" })
await wait(1500)
console.log(await p.evaluate(() => {
  const root = document.querySelector('[data-page-active="true"]')
  return {
    headings: Array.from(root.querySelectorAll("h1,h2,h3,h4")).map((h) => `${h.tagName}:${h.innerText.replace(/\s+/g," ").slice(0,40)}`),
    items: root.querySelectorAll("[data-item]").length,
    contactItems: Array.from(root.querySelectorAll('[data-item^="c-"]')).length,
    inputs: Array.from(root.querySelectorAll("input")).map((i) => i.getAttribute("aria-label") || i.placeholder),
    cardTitles: Array.from(root.querySelectorAll('[data-slot="card-title"]')).map((x) => x.tagName + ":" + x.innerText.replace(/\s+/g," ").slice(0,40)),
    sections: Array.from(root.querySelectorAll("section[id], [data-section]")).map((x) => x.id || x.dataset.section),
  }
}))
await b.close()
