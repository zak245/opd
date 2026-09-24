import puppeteer from "puppeteer-core"
const base = process.env.OPD_BASE ?? "http://localhost:4170"
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const b = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] })
const p = await b.newPage()
p.on("pageerror", (e) => console.log("pageerror:", String(e).slice(0, 300)))
p.on("console", (m) => { if (m.type() === "error") console.log("console error:", m.text().slice(0, 300)) })
await p.setViewport({ width: 1440, height: 900 })
await p.goto(base + "/#/", { waitUntil: "networkidle0" })
await p.evaluate((s) => localStorage.setItem("ollopa.session", JSON.stringify(s)), { business: "meridian", role: "ae" })
await p.goto(base + "/#" + process.argv[2], { waitUntil: "networkidle0" })
await p.reload({ waitUntil: "networkidle0" })
await wait(1200)
if (process.argv[4]) {
  await p.evaluate((sel) => document.querySelector(sel)?.scrollIntoView({ block: "start" }), process.argv[4])
  await wait(600)
}
await p.screenshot({ path: process.argv[3] })
console.log(await p.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 300)))
await b.close()
