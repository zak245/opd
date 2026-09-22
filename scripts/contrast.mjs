// Every colour pair in the product, measured against the floor it has to clear, plus a colour-vision
// check on the eleven hues that carry meaning, plus a lint that keeps them all in one file.
//
// Reads `src/theme/theme.css` directly, so it cannot drift from what ships. The owner's rule is that
// a visual change is a single-file edit, so the second half of this script fails when a value
// escapes that file.
//
//   node scripts/contrast.mjs            every pair, both themes, and the colour-vision distances
//   node scripts/contrast.mjs --quiet    only the failures and the summary
//
// Floors (WCAG 2.2, restated by every system in memo 28): 4.5:1 for text under 24 px, 3:1 for icons,
// borders and other non-text information. Exits non-zero if anything is under, or if two families
// or two statuses collapse into each other for a dichromat.
import { readFileSync } from "node:fs"

const quiet = process.argv.includes("--quiet")

/* ------------------------------------------------------------------ colour, from oklch to sRGB */

const srgb = (t) => (t <= 0.0031308 ? 12.92 * t : 1.055 * Math.pow(t, 1 / 2.4) - 0.055)
function oklch(L, C, Hdeg) {
  const h = (Hdeg * Math.PI) / 180
  const a = C * Math.cos(h), b = C * Math.sin(h)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ]
}
const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
/** Alpha compositing happens in sRGB, so mix there and come back. */
const mix = (fg, bg, a) => {
  if (!fg || !bg || fg.alias || bg.alias) return fg
  const toS = (lin) => lin.map(srgb)
  const back = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))
  const f = toS(fg), b = toS(bg)
  return f.map((v, i) => back(v * a + b[i] * (1 - a)))
}
const hex = (lin) => "#" + lin.map((v) => Math.round(Math.max(0, Math.min(1, srgb(v))) * 255).toString(16).padStart(2, "0")).join("")

/* ----------------------------------------------------------------- the tokens, read from the CSS */

/** Every `--name: oklch(L C H)` in one block, with `var(--other)` followed to its value. */
function tokensIn(css, selector) {
  const at = css.indexOf(selector)
  const open = css.indexOf("{", at)
  const close = css.indexOf("\n}", open)
  const body = css.slice(open, close)
  const out = {}
  for (const m of body.matchAll(/--([a-z0-9-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g)) {
    out[m[1]] = oklch(Number(m[2]), Number(m[3]), Number(m[4]))
  }
  for (const m of body.matchAll(/--([a-z0-9-]+):\s*var\(--([a-z0-9-]+)\)/g)) {
    if (!out[m[1]]) out[m[1]] = { alias: m[2] }
  }
  // Resolve aliases, twice, which is as deep as they go.
  for (let pass = 0; pass < 3; pass++) {
    for (const [k, v] of Object.entries(out)) if (v && v.alias) out[k] = out[v.alias] ?? v
  }
  return out
}

const css = readFileSync(new URL("../src/theme/theme.css", import.meta.url), "utf8")
const THEMES = { light: tokensIn(css, ":root {"), dark: tokensIn(css, ".dark {") }

/** The five colour roles. Not a ladder — a role says what a thing is (DESIGN.md §5, memo 29). */
const ROLES = ["surface-canvas", "surface-container", "surface-container-low", "surface-chrome", "surface-overlay"]

/**
 * The pairs that must be told apart, and why. A role is only ever compared with a role it can
 * actually touch: a container sits on the canvas, a band sits inside a container, the chrome runs
 * beside the canvas, an overlay floats over it.
 */
const ROLE_PAIRS = [
  ["surface-container", "surface-canvas", "a container on the page"],
  ["surface-container-low", "surface-container", "a band inside a container"],
  ["surface-chrome", "surface-canvas", "the chrome beside the content"],
  ["surface-overlay", "surface-canvas", "an overlay over the page"],
]
/** A step the eye can see. Containment does the grouping; this only has to be visible. */
const STEP = { light: 0.02, dark: 0.03 }

const FAMILIES = ["people", "companies", "deals", "engagement", "work", "agents", "neutral"]
const STATUSES = ["danger", "warning", "success", "info", "paused"]

/* ------------------------------------------------------------------------------ the pairs to check */

function pairs(T) {
  const p = []
  const text = (name, fg, bg, floor = 4.5) => p.push({ name, fg, bg, floor, kind: "text" })
  const nontext = (name, fg, bg) => p.push({ name, fg, bg, floor: 3, kind: "non-text" })
  // A tint or a divider carries no information on its own — the chip's word and ink do, and a
  // divider only has to be seen. So these are held to "perceptibly different from the surface",
  // not to a contrast ratio a tint could never reach and still be a tint.
  const seen = (name, fg, bg) => p.push({ name, fg, bg, floor: 0.015, kind: "seen" })

  // Paused is a state and the neutral family is not; they must never read as the same ink.
  seen("paused ink against the neutral family ink", T["paused-ink"], T["family-neutral-ink"])

  // The border that carries meaning reaches 3:1 against every surface it can sit on.
  for (const role of ROLES) nontext(`strong border on ${role}`, T["border-strong"], T[role])
  for (const role of ROLES) seen(`soft divider on ${role}`, T["border-soft"], T[role])

  for (const surface of ROLES) {
    text(`body text on ${surface}`, T.foreground, T[surface])
    text(`muted text on ${surface}`, T["muted-foreground"], T[surface])
    seen(`divider on ${surface}`, T.border, T[surface])
    nontext(`control boundary on ${surface}`, T.input, T[surface])
    nontext(`ring on ${surface}`, T.ring, T[surface])
  }
  text("primary label on the primary fill", T["primary-foreground"], T.primary)
  nontext("primary fill on the page", T.primary, T["surface-page"])
  // The printed shortcut on a filled primary: the label's colour at 80%, composited on the fill.
  nontext("shortcut kbd on the primary fill", mix(T["primary-foreground"], T.primary, 0.8), T.primary)
  text("link ink on the page", T["brand-ink"], T["surface-page"])
  text("link ink on the brand tint", T["brand-ink"], T["brand-tint"])
  seen("brand tint on the page", T["brand-tint"], T["surface-page"])

  for (const f of FAMILIES) {
    text(`${f} ink on the page`, T[`family-${f}-ink`], T["surface-page"])
    text(`${f} ink on its chip`, T[`family-${f}-ink`], T[`family-${f}-tint`])
    nontext(`${f} bar on the page`, T[`family-${f}`], T["surface-page"])
    seen(`${f} chip on the page`, T[`family-${f}-tint`], T["surface-page"])
  }
  for (const s of STATUSES) {
    text(`${s} ink on the page`, T[`${s}-ink`], T["surface-page"])
    text(`${s} ink on its chip`, T[`${s}-ink`], T[`${s}-tint`])
    seen(`${s} chip on the page`, T[`${s}-tint`], T["surface-page"])
  }
  return p
}

/* ------------------------------------------------------- what a dichromat sees, and how far apart */

// Brettel/Viénot-style: linear sRGB → LMS, collapse one cone, back. Enough to tell whether two
// meanings survive as different colours; not a calibrated rendering.
const toLMS = [[0.31399, 0.63951, 0.04650], [0.15537, 0.75789, 0.08670], [0.01775, 0.10945, 0.87259]]
const fromLMS = [[5.47221, -4.64196, 0.16963], [-1.12524, 2.29317, -0.16789], [0.02980, -0.19318, 1.16364]]
const mul = (M, v) => M.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2])
const SIM = {
  deuteranopia: [[1, 0, 0], [0.49421, 0, 1.24827], [0, 0, 1]],
  protanopia: [[0, 2.02344, -2.52581], [0, 1, 0], [0, 0, 1]],
}
const simulate = (lin, kind) => mul(fromLMS, mul(SIM[kind], mul(toLMS, lin)))

/** Distance in a perceptual space. Lab-ish via OKLab is enough to say "these two collapsed". */
function oklab(lin) {
  const f = (t) => Math.cbrt(Math.max(0, t))
  const l = f(0.4122214708 * lin[0] + 0.5363325363 * lin[1] + 0.0514459929 * lin[2])
  const m = f(0.2119034982 * lin[0] + 0.6806995451 * lin[1] + 0.1073969566 * lin[2])
  const s = f(0.0883024619 * lin[0] + 0.2817188376 * lin[1] + 0.6299787005 * lin[2])
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ]
}
const apart = (a, b) => { const x = oklab(a), y = oklab(b); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) }

let failures = 0
for (const [theme, T] of Object.entries(THEMES)) {
  if (!quiet) console.log(`\n=== ${theme} ===`)
  let worstText = Infinity, worstNon = Infinity, worstSeen = Infinity
  for (const { name, fg, bg, floor, kind } of pairs(T)) {
    if (!fg || !bg || fg.alias || bg.alias) { console.log(`  ?  ${name} — token missing`); failures++; continue }
    const r = kind === "seen" ? apart(fg, bg) : ratio(fg, bg)
    if (kind === "text") worstText = Math.min(worstText, r)
    else if (kind === "non-text") worstNon = Math.min(worstNon, r)
    else worstSeen = Math.min(worstSeen, r)
    const ok = r >= floor
    if (!ok) failures++
    const shown = kind === "seen" ? `${r.toFixed(3)} apart` : `${r.toFixed(2)}:1`
    if (!quiet || !ok) console.log(`  ${ok ? " " : "✗"} ${name.padEnd(40)} ${shown.padStart(11)}  (needs ${floor})`)
  }
  console.log(`  worst text ${worstText.toFixed(2)}:1 (needs 4.5) · worst non-text ${worstNon.toFixed(2)}:1 (needs 3)` +
    ` · faintest tint ${worstSeen.toFixed(3)} apart (needs 0.015)`)

  // The roles: every pair that can meet on screen, measured in OKLab lightness.
  const floor = STEP[theme]
  let worstStep = Infinity
  for (const [a, b, why] of ROLE_PAIRS) {
    const x = T[a], y = T[b]
    if (!x || !y || x.alias || y.alias) { console.log(`  ?  ${a} vs ${b} — token missing`); failures++; continue }
    const step = Math.abs(oklab(x)[0] - oklab(y)[0])
    worstStep = Math.min(worstStep, step)
    const ok = step >= floor
    if (!ok) failures++
    if (!quiet || !ok) console.log(`  ${ok ? " " : "✗"} ${why}`.padEnd(45) + `${step.toFixed(3)}  (needs ${floor})`)
  }
  console.log(`  faintest role step ${worstStep.toFixed(3)} (needs ${floor})`)
}


/**
 * The floor. Two meanings whose inks land closer than this are, for that viewer, one colour — and
 * the product would be leaning on colour alone to tell them apart. Every family and every status in
 * this product also carries an icon or a word, which is why this is a warning line and not the
 * only defence; it still has to pass.
 */
const COLLAPSE = 0.06

console.log("\n=== colour vision ===")
for (const [theme, T] of Object.entries(THEMES)) {
  for (const [group, names] of [["families", FAMILIES], ["statuses", STATUSES]]) {
    const inks = names.map((n) => ({
      name: n,
      lin: group === "families" ? T[`family-${n}-ink`] : T[`${n}-ink`],
    }))
    for (const kind of ["deuteranopia", "protanopia"]) {
      let worst = { d: Infinity, a: "", b: "" }
      for (let i = 0; i < inks.length; i++) {
        for (let j = i + 1; j < inks.length; j++) {
          const d = apart(simulate(inks[i].lin, kind), simulate(inks[j].lin, kind))
          if (d < worst.d) worst = { d, a: inks[i].name, b: inks[j].name }
        }
      }
      const ok = worst.d >= COLLAPSE
      if (!ok) failures++
      console.log(`  ${ok ? " " : "✗"} ${theme} ${group} under ${kind}: closest pair ${worst.a}/${worst.b} at ${worst.d.toFixed(3)} (needs ${COLLAPSE})`)
    }
  }
}

if (!quiet) {
  console.log("\n=== the inks as hex ===")
  for (const [theme, T] of Object.entries(THEMES)) {
    console.log(` ${theme}: ` + [...FAMILIES.map((f) => `${f} ${hex(T[`family-${f}-ink`])}`), ...STATUSES.map((s) => `${s} ${hex(T[`${s}-ink`])}`)].join(" · "))
  }
}


/* ----------------------------------------------------------- one file holds the visual values */

// The owner's rule: a visual change is a single-file edit. So no file outside `src/theme` declares
// a colour, a shadow, a radius or a raw pixel size. Tailwind's own scale utilities (`px-3`,
// `rounded-md`, `gap-2`) are not values — they read the theme — so what is hunted here is a literal:
// an oklch or hex colour, a shadow utility with a size in it, or an arbitrary `[…px]`.
import { readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

/** The mockups exist to show the version we are criticising; they keep the look they criticise. */
const ALLOW = [
  /\/pages\/[a-z]+\/parody\.tsx$/,
  /\/pages\/agents\/Parody\.tsx$/,
  /\/pages\/connect\/lesson\.tsx$/,
  /\/learn\//,
  /\/site\/Tokens\.tsx$/,
]

const RULES = [
  { what: "an oklch colour", re: /oklch\(/g },
  { what: "a hex colour", re: /#[0-9a-fA-F]{6}\b/g },
  { what: "a sized shadow", re: /\bshadow-(xs|sm|md|lg|xl|2xl)\b/g },
  { what: "a raw pixel size", re: /\[[-\d.]+px\]/g },
  // A shadow whose geometry is written out is fine; a shadow that names its own colour is not.
  { what: "a box-shadow with a colour in it", re: /box-shadow:[^;]*(?:oklch\(|#[0-9a-fA-F]{3,8}\b|rgba?\()/g },
]

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(tsx?|css)$/.test(p)) out.push(p)
  }
  return out
}

const root = new URL("../src", import.meta.url).pathname
let escaped = 0
for (const file of walk(root)) {
  const rel = relative(root, file)
  if (rel.startsWith("theme/")) continue
  if (ALLOW.some((re) => re.test("/" + rel))) continue
  const text = readFileSync(file, "utf8")
  for (const { what, re } of RULES) {
    const hits = text.match(re)
    if (!hits) continue
    escaped += hits.length
    failures++
    console.log(`  ✗ ${rel}: ${hits.length} × ${what} — move it to src/theme/theme.css`)
  }
}
console.log(escaped === 0
  ? "\nevery visual value is in src/theme/theme.css"
  : `\n${escaped} value(s) outside src/theme/theme.css`)

console.log(failures === 0 ? "\nall pairs clear their floor and no two meanings collapse" : `\n${failures} failure(s)`)
process.exit(failures === 0 ? 0 : 1)
