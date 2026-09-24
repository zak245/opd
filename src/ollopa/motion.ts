// Motion tokens. One easing, three durations, and one switch that turns all of it off.
//
// Motion in this product only ever explains cause and effect: a surface arriving from the side it
// came from, a marker landing on the row being read, content moving the way you asked it to move.
// Nothing decorative, nothing that delays a click, no bounce, no fade through white, and none of it
// at all under `prefers-reduced-motion: reduce`.
//
// Everything is between 150 and 250 ms because that is the band where a movement reads as one thing
// happening rather than as two screens or as a wait (memo 21: motion between states buys orientation
// and object identity, and buys no speed — so it is paid for in orientation or it is not paid for).
//
// Where this lives: here, at the root of the product, because both the shell and the pane need it.
// Another builder is putting shared tokens in `src/ollopa/layouts/`; when those land, this file is
// the one to merge into them — the names below are the whole contract.

export const MOTION = {
  /** A thing changing in place: a marker arriving on a row, a line appearing. */
  quick: 150,
  /** Content swapping inside a surface that stays put: the pane stepping to the next in a list. */
  swap: 180,
  /** A surface arriving, leaving or changing size: the pane opening, widening, closing. */
  surface: 200,
  /** One easing everywhere. Tailwind's own `ease-out` curve, so nothing here invents one. */
  ease: "cubic-bezier(0, 0, 0.2, 1)",
} as const

export function reducedMotion(): boolean {
  return typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
}

/** A duration, or 0 when the person has asked for no motion — so a timer waits for nothing. */
export function ms(duration: number): number {
  return reducedMotion() ? 0 : duration
}
