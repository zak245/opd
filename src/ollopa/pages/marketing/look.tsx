// The two things this folder needs from the identity registry, and nothing else.
//
// DESIGN.md §5: colour has five jobs, and a page never picks a hue. Every state word in here is a
// `Chip`; every number that has passed a threshold takes its ink from the status set, with the word
// that explains it always beside it — a bounce rate is amber because the guard warns, not because
// amber looked right.
import { STATUSES, type Status } from "../../identity"
import { inkOf } from "../../ui/Identity"

/** The ink of a status, for a number whose word sits beside it. */
export const ink = (status: Status) => ({ color: STATUSES[status].ink })

/** The same, from one of the words the product already shows. */
// A word that is not a state gets the muted category ink, never a status colour.
export const inkFor = (word: string | undefined | null) => ({ color: inkOf(word) })

/**
 * The family every object in this folder belongs to: campaigns, audiences, forms and workflows are
 * all Engagement, because they are all ways of reaching somebody.
 */
export const FAMILY = "engagement"

/** The family a recipient, a submission or an enrolled person belongs to. */
export const PERSON_FAMILY = "people"
