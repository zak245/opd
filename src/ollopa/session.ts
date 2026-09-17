// The session: who is signed in, at which workspace, with which declared sidebar.
//
// Two human choices make the sidebar and nothing else does (RULES.md, the declared sidebar):
// the seat, declared when the person was invited, and the workspace profile, declared at set-up.
// Everything else here is state a person produced: pages they added by hand, and the answer they
// gave to a two-week exposure.
import { useSyncExternalStore } from "react"
import type { Business, Page, Role } from "./usage/model"
import { businessById } from "./data/businesses"
import { seedFor } from "./data/seed"

export type Profile = "founder-led" | "separated" | "agency" | "product-led" | "not-declared"

export const PROFILE_LABEL: Record<Profile, string> = {
  "founder-led": "Founder-led outbound",
  separated: "Separated sales team",
  agency: "Agency",
  "product-led": "Product-led growth",
  "not-declared": "Not declared",
}

/** `seed.workspace.profile` carries the label; these are the same four profiles, as ids. */
const FROM_LABEL: Record<string, Profile> = {
  "Founder-led outbound": "founder-led",
  "Separated sales team": "separated",
  Agency: "agency",
  "Product-led growth": "product-led",
}

/** Who declared the profile, and when: shown on set-up and in Settings › How your team works. */
export function declaredBy(business: Business): { user: string; on: string } {
  const w = seedFor(business).workspace
  return { user: w.declaredBy, on: w.declaredAt }
}

/** The three answers a workspace gave at set-up. Stored per workspace, editable in Settings. */
export interface SetupAnswers {
  firstJob: "reach" | "replies" | "grow" | "campaigns" | null
  people: "1" | "2-5" | "6-25" | "26-100" | "100+" | null
  seats: Role[]
  everything: boolean
  skipped?: boolean
}

export interface Exposure {
  page: Page
  /** The date the two-week exposure ends and the sidebar asks "Keep it?". */
  until: string
  /** What fired it, in plain words, for the question row. */
  because: string
  answer?: "keep" | "remove"
}

export interface Session {
  business: Business
  role: Role
  /** The person in the seat. */
  user: string
  /** An AE seat with direct reports: a modifier, never a sixth seat. */
  hasReports: boolean
  profile: Profile
  /** Pages added by hand with "Add to sidebar", in the order they were added. */
  sidebarAdded: Page[]
  exposures: Exposure[]
}

/** What sign-in writes. Everything else on the session is derived from the workspace and this seat. */
export interface SignedIn { business: Business; role: Role; user?: string }

const KEY = "ollopa.session"
const LAST = "ollopa.lastBusiness"
const addedKey = (b: Business, r: Role) => `ollopa.sidebar.added.${b}.${r}`
const exposureKey = (b: Business, r: Role) => `ollopa.sidebar.exposure.${b}.${r}`
const setupKey = (b: Business) => `ollopa.setup.${b}`

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode: state lives in memory only */ }
}

const listeners = new Set<() => void>()
function announce() { listeners.forEach((l) => l()) }

let signedIn: SignedIn | null = load<SignedIn | null>(KEY, null)
let snapshot: Session | null = build()

function build(): Session | null {
  if (!signedIn) return null
  const b = businessById(signedIn.business)
  const seat =
    b.roles.find((r) => r.role === signedIn!.role && (!signedIn!.user || r.user === signedIn!.user)) ??
    b.roles.find((r) => r.role === signedIn!.role) ??
    b.roles[0]
  return {
    business: signedIn.business,
    role: seat.role,
    user: seat.user,
    hasReports: (seat.reports?.length ?? 0) > 0,
    profile: profileOf(signedIn.business),
    sidebarAdded: load<Page[]>(addedKey(signedIn.business, seat.role), []),
    exposures: load<Exposure[]>(exposureKey(signedIn.business, seat.role), declaredExposures(signedIn.business)),
  }
}

/** An exposure the workspace already had running when this person signed in (`seed.workspace.exposure`). */
function declaredExposures(business: Business): Exposure[] {
  const w = seedFor(business).workspace
  if (!w.exposure || w.exposure.state !== "showing") return []
  const signal = w.leftOut.find((l) => l.page === w.exposure!.page)
  return [{ page: w.exposure.page as Page, until: w.exposure.ends, because: signal?.signalKind ?? "a signal on this page" }]
}

function refresh() { snapshot = build(); announce() }

/** The declared profile of a workspace: the answers this person changed, else what set-up declared. */
export function profileOf(business: Business): Profile {
  const answers = load<SetupAnswers | null>(setupKey(business), null)
  if (answers) return answers.skipped ? "not-declared" : profileFrom(answers)
  return FROM_LABEL[seedFor(business).workspace.profile] ?? "not-declared"
}

/** The table in spec 16 §3, "What the answers produce". Four names, each a shape of work. */
export function profileFrom(a: SetupAnswers): Profile {
  const prospectingOnly = a.everything || (a.seats.length > 0 && a.seats.every((s) => s === "sdr"))
  if (a.seats.length === 0 && !a.everything) return "not-declared"
  if (prospectingOnly) return a.people === "1" || a.people === "2-5" ? "founder-led" : "agency"
  if (a.firstJob === "grow" || a.firstJob === "campaigns") return "product-led"
  return "separated"
}

export function setupAnswersFor(business: Business): SetupAnswers | null {
  return load<SetupAnswers | null>(setupKey(business), null)
}

export function saveSetupAnswers(business: Business, answers: SetupAnswers) {
  save(setupKey(business), answers)
  refresh()
}

export function signIn(s: SignedIn) {
  signedIn = s
  save(KEY, s)
  save(LAST, s.business)
  refresh()
}

export function signOut(opts: { rememberWorkspace?: boolean } = {}) {
  if (!opts.rememberWorkspace) { try { localStorage.removeItem(LAST) } catch { /* ignore */ } }
  signedIn = null
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  refresh()
}

export function lastBusiness(): Business | null {
  return load<Business | null>(LAST, null)
}

/** "Add to sidebar": the page goes to the end of its group and stays there. */
export function addToSidebar(page: Page) {
  if (!signedIn || !snapshot) return
  const key = addedKey(snapshot.business, snapshot.role)
  const next = snapshot.sidebarAdded.includes(page) ? snapshot.sidebarAdded : [...snapshot.sidebarAdded, page]
  save(key, next)
  refresh()
}

/** "Remove from sidebar": the path out is as short as the path in. */
export function removeFromSidebar(page: Page) {
  if (!snapshot) return
  save(addedKey(snapshot.business, snapshot.role), snapshot.sidebarAdded.filter((p) => p !== page))
  refresh()
}

/** Start a two-week exposure. Never more than one at a time, and never mid-task: Home starts it on load. */
export function startExposure(page: Page, because: string, until: string) {
  if (!snapshot) return
  if (snapshot.exposures.some((e) => e.page === page)) return
  if (snapshot.exposures.some((e) => !e.answer)) return
  save(exposureKey(snapshot.business, snapshot.role), [...snapshot.exposures, { page, until, because }])
  refresh()
}

/** The answer to "Keep it?", final until a new signal. Keep adds the page for good; Remove ends the exposure. */
export function answerExposure(page: Page, answer: "keep" | "remove") {
  if (!snapshot) return
  const next = snapshot.exposures.map((e) => (e.page === page ? { ...e, answer } : e))
  save(exposureKey(snapshot.business, snapshot.role), next)
  if (answer === "keep") { addToSidebar(page); return }
  refresh()
}

export function useSession(): Session | null {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => snapshot,
    () => snapshot,
  )
}

/** Theme is the one thing in the account menu that changes the page itself. */
export type Theme = "light" | "dark" | "system"
const THEME = "ollopa.theme"

export function theme(): Theme {
  return load<Theme>(THEME, "system")
}

export function setTheme(t: Theme) {
  save(THEME, t)
  applyTheme(t)
  announce()
}

export function applyTheme(t: Theme = theme()) {
  const dark = t === "dark" || (t === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", !!dark)
}
