import { browser, signIn, wait, observe, auditSurfaces } from "./review-chains.mjs"
const { b, page } = await browser(1440, 900)
await signIn(page, "meridian", "ae", "/ollopa/companies/co-1")
const probe = async (when) => console.log(when, await page.evaluate(() => ({
  bodyInner: document.body.innerText.slice(0, 40),
  titles: document.querySelectorAll('[data-slot="card-title"]').length,
  activeH: Math.round(document.querySelector('[data-page-active="true"]')?.getBoundingClientRect().height ?? -1),
})))
await probe("after signIn   ")
const o = await observe(page)
await probe("after observe  ")
await auditSurfaces(page)
await probe("after audit    ")
await wait(800)
await probe("after wait     ")
await b.close()
