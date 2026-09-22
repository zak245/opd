// Which component takes which surface role, and whether it casts a shadow.
//
// One object. Containment and elevation are two different jobs (DESIGN.md §5, memo 29): the role
// groups, the shadow says a thing floats over the page. A container on the page is flat and
// outlined; only the pane, menus, popovers, dialogs and sheets cast anything.
//
// Changing where a component sits is an edit here and in `src/theme/theme.css`, and nowhere else.

/** The five colour roles. Not a ladder: a role says what a thing is, not how high it is. */
export type Role = "canvas" | "container" | "container-low" | "chrome" | "overlay"

/** The two shadows, and the absence of one. */
export type Elevation = "none" | "small" | "large"

export interface LevelSpec {
  role: Role
  elevation: Elevation
  /** Dialogs and sheets take the page: they dim what is behind them. */
  scrim?: boolean
  /** The strong border sits on a container's edge; inside it, a divider is enough. */
  border?: "strong" | "soft" | "none"
}

/**
 * The map, from the rule's own table.
 *
 *   canvas          the page behind everything
 *   container       every content container: a table, a form, a section, a list, a card
 *   container-low   one region inside a container that must read as a group
 *   chrome          the frame: sidebar, header, bottom bar
 *   overlay         what floats over the page
 */
export const LEVELS = {
  page: { role: "canvas", elevation: "none", border: "none" },

  section: { role: "container", elevation: "none", border: "strong" },
  card: { role: "container", elevation: "none", border: "strong" },
  table: { role: "container", elevation: "none", border: "strong" },
  form: { role: "container", elevation: "none", border: "strong" },
  list: { role: "container", elevation: "none", border: "strong" },

  rowOn: { role: "container-low", elevation: "none", border: "none" },
  cardHeader: { role: "container-low", elevation: "none", border: "none" },
  summaryStrip: { role: "container-low", elevation: "none", border: "soft" },

  pane: { role: "overlay", elevation: "small", border: "strong" },
  menu: { role: "overlay", elevation: "small", border: "strong" },
  popover: { role: "overlay", elevation: "small", border: "strong" },

  dialog: { role: "overlay", elevation: "large", scrim: true, border: "strong" },
  sheet: { role: "overlay", elevation: "large", scrim: true, border: "strong" },

  sidebar: { role: "chrome", elevation: "none", border: "strong" },
  header: { role: "chrome", elevation: "none", border: "strong" },
  bottomBar: { role: "chrome", elevation: "none", border: "strong" },
  chrome: { role: "chrome", elevation: "none", border: "strong" },
} as const satisfies Record<string, LevelSpec>

export type Component = keyof typeof LEVELS

export interface SurfaceTokens extends LevelSpec {
  /** The class that paints the role. */
  className: string
  /** The class that casts the shadow, or "" where nothing floats. */
  elevationClass: string
  /** The raw token names, for the rare place that needs a value rather than a class. */
  background: string
  borderColor: string
  shadow: string
}

const SHADOW: Record<Elevation, string> = {
  none: "none",
  small: "var(--shadow-small)",
  large: "var(--shadow-large)",
}

const BORDER: Record<string, string> = {
  strong: "var(--border-strong)",
  soft: "var(--border-soft)",
  none: "transparent",
}

/** Everything a component needs to be drawn at its place, from the one map. */
export function surfaceFor(what: Component | Role): SurfaceTokens {
  const spec: LevelSpec = (LEVELS as Record<string, LevelSpec>)[what]
    ?? { role: what as Role, elevation: "none", border: "none" }
  return {
    ...spec,
    className: `surface-${spec.role}`,
    elevationClass: spec.elevation === "none" ? "" : `elev-${spec.elevation}`,
    background: `var(--surface-${spec.role})`,
    borderColor: BORDER[spec.border ?? "none"],
    shadow: SHADOW[spec.elevation],
  }
}

/** Does this take the page behind it? Only a dialog and a sheet do, and only they get a scrim. */
export function takesThePage(what: Component | Role): boolean {
  return surfaceFor(what).scrim === true
}
