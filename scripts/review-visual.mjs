// Round 9, the visual pass. Walks every page of the map as the seat that holds it, at two widths
// and in both themes, photographs each, and reads back the things DESIGN.md §5 can be checked on:
// the title's icon and ink, the lit sidebar item, the family tokens in use, every status chip and
// whether it carries a word, the three surface levels, and the type scale actually in play.
import { browser, signIn, wait, note, saveLog } from "./review-chains.mjs"
import { mkdirSync } from "node:fs"

const DIR = "shots/chains/review9"

/** Every page of the map, with a seat that holds it. */
export const PAGES = [
  ["home", "meridian:sdr", "/ollopa"],
  ["people", "meridian:sdr", "/ollopa/people"],
  ["companies", "meridian:sdr", "/ollopa/companies"],
  ["lists", "meridian:sdr", "/ollopa/lists"],
  ["sequences", "meridian:sdr", "/ollopa/sequences"],
  ["templates", "meridian:sdr", "/ollopa/templates"],
  ["inbox", "meridian:sdr", "/ollopa/inbox"],
  ["tasks", "meridian:sdr", "/ollopa/tasks"],
  ["deals-board", "meridian:ae", "/ollopa/deals"],
  ["deal-record", "meridian:ae", "/ollopa/deals/d-118"],
  ["campaigns", "ridgeline:marketer", "/ollopa/campaigns"],
  ["accounts", "meridian:cs", "/ollopa/accounts"],
  ["workflows", "ridgeline:marketer", "/ollopa/workflows"],
  ["requests", "meridian:admin", "/ollopa/requests"],
  ["reports", "meridian:admin", "/ollopa/reports"],
  ["agents", "meridian:admin", "/ollopa/agents"],
  ["settings", "meridian:admin", "/ollopa/settings"],
  ["connect", "meridian:admin", "/ollopa/connect/salesforce"],
  ["setup", "meridian:admin", "/ollopa/setup"],
]

/** What the eye is supposed to be able to use, read back as facts. */
export const lookAt = (page) => page.evaluate(() => {
  const txt = (el, n = 60) => (el?.innerText ?? "").replace(/\s+/g, " ").trim().slice(0, n)
  const on = (e) => e.getClientRects().length > 0 && !e.closest("[hidden]")
  const root = document.documentElement
  const cs = getComputedStyle(root)

  // Resolve every token to the rgb the browser actually paints, so anything painted off-token shows.
  const FAM = ["people", "companies", "deals", "engagement", "work", "agents", "neutral"]
  const STAT = ["danger", "warning", "success", "info", "paused"]
  const probe = document.createElement("span")
  document.body.appendChild(probe)
  const resolve = (v) => { probe.style.color = ""; probe.style.color = v; return getComputedStyle(probe).color }
  const token = {}
  for (const f of FAM) { token[`family:${f}`] = resolve(`var(--family-${f})`); token[`family:${f}:ink`] = resolve(`var(--family-${f}-ink)`); token[`family:${f}:tint`] = resolve(`var(--family-${f}-tint)`) }
  for (const s of STAT) { token[`status:${s}:ink`] = resolve(`var(--${s}-ink)`); token[`status:${s}:tint`] = resolve(`var(--${s}-tint)`) }
  for (const n of ["background", "foreground", "muted", "muted-foreground", "border", "card", "popover", "primary", "primary-foreground", "accent", "accent-foreground", "ring", "destructive", "input", "secondary", "secondary-foreground", "sidebar", "sidebar-accent", "surface-page", "surface-raised", "surface-overlay"])
    token[`neutral:${n}`] = resolve(`var(--${n})`)
  probe.remove()
  const nameOf = (rgb) => Object.entries(token).find(([, v]) => v === rgb)?.[0] ?? null

  const all = Array.from(document.querySelectorAll("*")).filter(on)
  const seen = { family: {}, status: {}, neutral: 0, offToken: [] }
  for (const e of all) {
    const st = getComputedStyle(e)
    for (const [prop, val] of [["color", st.color], ["background-color", st.backgroundColor], ["border-top-color", st.borderTopColor]]) {
      if (!val || val === "rgba(0, 0, 0, 0)" || val === "transparent") continue
      if (prop === "border-top-color" && st.borderTopWidth === "0px") continue
      const n = nameOf(val)
      if (!n) { if (seen.offToken.length < 14) seen.offToken.push(`${e.tagName.toLowerCase()}${e.getAttribute("data-slot") ? "[" + e.getAttribute("data-slot") + "]" : ""} ${prop}=${val} "${txt(e, 22)}"`); continue }
      if (n.startsWith("family:")) seen.family[n.split(":")[1]] = (seen.family[n.split(":")[1]] ?? 0) + 1
      else if (n.startsWith("status:")) seen.status[n.split(":")[1]] = (seen.status[n.split(":")[1]] ?? 0) + 1
      else seen.neutral++
    }
  }

  // The title: its ink, and the icon beside it.
  const header = document.querySelector("header")
  const h1 = header?.querySelector("h1")
  const icon = h1?.parentElement?.querySelector("svg") ?? header?.querySelector("svg")
  const iconName = icon ? (icon.getAttribute("class") || "").split(" ").find((c) => c.startsWith("lucide-") && c !== "lucide") : null
  const h1Ink = h1 ? getComputedStyle(h1).color : null

  // The lit sidebar item.
  const links = Array.from(document.querySelectorAll("aside a, nav a")).filter(on)
  const lit = links.find((a) => a.getAttribute("aria-current") === "page")
    ?? links.find((a) => { const b = getComputedStyle(a).backgroundColor; return b && b !== "rgba(0, 0, 0, 0)" && b !== token["neutral:background"] })

  // Status chips and lines: every tinted box, and whether it carries a word.
  const chips = all.filter((e) => { const bg = getComputedStyle(e).backgroundColor; const n = nameOf(bg); return n && n.startsWith("status:") && n.endsWith(":tint") })
    .map((e) => ({ status: nameOf(getComputedStyle(e).backgroundColor).split(":")[1], word: txt(e, 30) }))

  // Surface levels and shadow.
  const raised = all.find((e) => getComputedStyle(e).backgroundColor === token["neutral:surface-raised"])
  const overlay = document.querySelector("[role='dialog'], [role='menu']")
  const shadowed = all.filter((e) => { const s = getComputedStyle(e).boxShadow; return s && s !== "none" && !/inset/.test(s) })
  const shadowKinds = [...new Set(shadowed.map((e) => `${e.tagName.toLowerCase()}${e.getAttribute("data-slot") ? "[" + e.getAttribute("data-slot") + "]" : ""}`))]

  // The type scale on screen.
  const sizes = {}
  for (const e of all) {
    if (!e.firstChild || e.firstChild.nodeType !== 3 || !e.textContent.trim()) continue
    const s = Math.round(parseFloat(getComputedStyle(e).fontSize))
    sizes[s] = (sizes[s] ?? 0) + 1
  }
  const fonts = [...new Set(all.slice(0, 200).map((e) => getComputedStyle(e).fontFamily.split(",")[0].replace(/["']/g, "")))]

  return {
    theme: root.classList.contains("dark") ? "dark" : "light",
    h1: txt(h1, 46),
    h1Ink, h1Family: nameOf(h1Ink),
    h1Size: h1 ? Math.round(parseFloat(getComputedStyle(h1).fontSize)) : null,
    icon: iconName ?? "(no icon beside the title)",
    iconInk: icon ? nameOf(getComputedStyle(icon).color) : null,
    lit: lit ? `${txt(lit, 22)} bg=${nameOf(getComputedStyle(lit).backgroundColor) ?? getComputedStyle(lit).backgroundColor}` : "(nothing lit)",
    families: seen.family, statuses: seen.status, neutralHits: seen.neutral, offToken: seen.offToken,
    chips: chips.length, wordless: chips.filter((c) => !/[a-z]/i.test(c.word)).length,
    chipSample: chips.slice(0, 5).map((c) => `${c.status}:"${c.word}"`),
    levels: { page: token["neutral:surface-page"], raised: token["neutral:surface-raised"], overlay: token["neutral:surface-overlay"], raisedUsed: !!raised, overlayOnScreen: !!overlay },
    shadows: shadowed.length, shadowKinds,
    sizes, fonts,
  }
})

const [only] = process.argv.slice(2)
for (const [name, seat, route] of PAGES) {
  if (only && only !== name) continue
  const [biz, role] = seat.split(":")
  for (const w of [1440, 400]) {
    for (const theme of ["light", "dark"]) {
      const { b, page } = await browser(w, w === 400 ? 860 : 900)
      await page.goto("http://localhost:4180/#/", { waitUntil: "networkidle0" })
      await page.evaluate((t) => localStorage.setItem("ollopa.theme", JSON.stringify(t)), theme)
      await page.evaluate((t) => localStorage.setItem("ollopa.theme", t), theme)
      await signIn(page, biz, role, route)
      await page.evaluate((t) => document.documentElement.classList.toggle("dark", t === "dark"), theme)
      await wait(500)
      const dir = `${DIR}/${theme}`
      mkdirSync(dir, { recursive: true })
      await page.screenshot({ path: `${dir}/${name}-${w}.png` })
      if (w === 1440) {
        const o = await lookAt(page)
        note(`\n== ${name} (${seat}) ${theme}`)
        note(`   h1        "${o.h1}" ${o.h1Size}px ink=${o.h1Family ?? o.h1Ink + "  ← OFF-TOKEN"}`)
        note(`   icon      ${o.icon} ink=${o.iconInk ?? "(off-token or none)"}`)
        note(`   sidebar   ${o.lit}`)
        note(`   families  ${JSON.stringify(o.families)}`)
        note(`   statuses  ${JSON.stringify(o.statuses)} · chips=${o.chips} wordless=${o.wordless} ${o.chipSample.join(" ")}`)
        note(`   levels    raisedUsed=${o.levels.raisedUsed} page=${o.levels.page} raised=${o.levels.raised} overlay=${o.levels.overlay}`)
        note(`   shadows   ${o.shadows} on ${o.shadowKinds.join(",")}`)
        note(`   type      ${Object.entries(o.sizes).sort((x, y) => y[1] - x[1]).map(([s, n]) => `${s}px×${n}`).join(" ")}`)
        note(`   fonts     ${o.fonts.join("/")}`)
        note(`   off-token ${o.offToken.length}${o.offToken.length ? ": " + o.offToken.slice(0, 5).join(" | ") : ""}`)
      }
      await b.close()
    }
  }
}
saveLog(`${DIR}/logs/visual.txt`)
