// Which component sits at which depth, and nothing else.
//
// One object. A page never decides how deep it is, and a primitive never picks a surface class by
// hand: it names what it is, this says what level that is, and `Surface` draws it. When the
// containment memo lands, the tuning happens here and nowhere else.
//
// The values below are placeholders in the sense that the memo may move a component between levels.
// They are not placeholders in the sense of being wrong today: they are what the product ships.

/** 0 is the page; 1 rises to 4; the chrome is beside the ladder, not on it. */
export type Level = 0 | 1 | 2 | 3 | 4 | "chrome"

/**
 * The map. Left column is what a thing *is*; right column is how deep it sits.
 *
 *   0  the page
 *   1  what sits on the page and holds content: a section, a card, a table, a form, the row you are on
 *   2  what floats beside the page and keeps it: the pane
 *   3  what floats over the page for a moment: a popover, a menu
 *   4  what takes the page: a dialog, a sheet
 */
export const LEVELS = {
  page: 0,
  section: 1,
  card: 1,
  table: 1,
  form: 1,
  listRow: 1,
  pane: 2,
  popover: 3,
  menu: 3,
  dialog: 4,
  sheet: 4,
  chrome: "chrome",
} as const satisfies Record<string, Level>

export type Component = keyof typeof LEVELS

/** What a level is drawn with: the three token names, and nothing a caller has to choose. */
export interface SurfaceTokens {
  level: Level
  /** The Tailwind class that paints the level. One class, from `index.css`. */
  className: string
  /** The raw token names, for the rare place that needs a value rather than a class. */
  background: string
  border: string
  /** `none` below level 2: exactly two shadows exist and the lower levels cast neither. */
  shadow: string
}

const SHADOW: Record<string, string> = {
  0: "none",
  1: "none",
  2: "var(--shadow-small)",
  3: "var(--shadow-small)",
  4: "var(--shadow-large)",
  chrome: "none",
}

/** The tokens for a level, or for the component that sits at one. */
export function surfaceFor(what: Component | Level): SurfaceTokens {
  const level: Level = typeof what === "string" && what in LEVELS
    ? (LEVELS[what as Component] as Level)
    : (what as Level)
  const key = String(level)
  return {
    level,
    className: `surface-${key}`,
    background: `var(--surface-${key})`,
    border: "var(--border-strong)",
    shadow: SHADOW[key] ?? "none",
  }
}

/** Does this level take the page behind it? Only the top one does, and only it gets a scrim. */
export function takesThePage(what: Component | Level): boolean {
  return surfaceFor(what).level === 4
}
