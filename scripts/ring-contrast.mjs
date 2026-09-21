// The focus ring is measured, not guessed. WCAG 1.4.11 asks a component boundary for 3:1 against
// its adjacent colours; DESIGN.md §4 asks the ring to clear it against the page background AND
// against the primary fill it may sit beside, in both themes.
//
//   node scripts/ring-contrast.mjs
const f = (t) => (t <= 0.0031308 ? 12.92 * t : 1.055 * Math.pow(t, 1 / 2.4) - 0.055)
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
const hex = (lin) => "#" + lin.map((v) => Math.round(Math.max(0, Math.min(1, f(v))) * 255).toString(16).padStart(2, "0")).join("")

// The tokens as src/index.css ships them.
const T = {
  "light background": oklch(1, 0, 0),
  "light primary fill": oklch(0.205, 0, 0),
  "light card": oklch(1, 0, 0),
  "light muted": oklch(0.97, 0, 0),
  "dark background": oklch(0.145, 0, 0),
  "dark primary fill": oklch(0.922, 0, 0),
  "dark card": oklch(0.205, 0, 0),
  "dark muted": oklch(0.269, 0, 0),
}
const RING = { light: oklch(0.55, 0.16, 264), dark: oklch(0.58, 0.16, 264) }
console.log("ring, light:", hex(RING.light), "· ring, dark:", hex(RING.dark), "\n")
let worst = Infinity
for (const [name, colour] of Object.entries(T)) {
  const ring = name.startsWith("dark") ? RING.dark : RING.light
  const r = ratio(ring, colour)
  worst = Math.min(worst, r)
  console.log(`ring vs ${name.padEnd(20)} ${r.toFixed(2)}:1  ${r >= 3 ? "clears 3:1" : "FAILS"}`)
}
console.log(`\nworst: ${worst.toFixed(2)}:1`)
process.exit(worst >= 3 ? 0 : 1)
