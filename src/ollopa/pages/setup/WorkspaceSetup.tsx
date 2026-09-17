// Workspace set-up: the only page a person sees once.
//
// Three questions on one screen, because the sidebar cannot be decided without them and because the
// three are interdependent — how many people, and which jobs exist, are answered together. The result
// block updates as the answers change, so the cause and the effect are on the same screen. One door.
// What the answers change, and that Settings changes them again, is beside the button, never behind it.
import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { navigate } from "@/app/router"
import { seedFor } from "../../data/seed"
import { NAV } from "../../nav"
import { PROFILE_LEAVES_OUT } from "../../map"
import { ROLE_LABEL, type Role } from "../../usage/model"
import {
  declaredBy,
  PROFILE_LABEL,
  profileFrom,
  saveSetupAnswers,
  setupAnswersFor,
  type Profile,
  type SetupAnswers,
  type Session,
} from "../../session"

const JOBS: { id: NonNullable<SetupAnswers["firstJob"]>; label: string }[] = [
  { id: "reach", label: "Find and reach new companies" },
  { id: "replies", label: "Work replies and book meetings" },
  { id: "grow", label: "Grow existing accounts" },
  { id: "campaigns", label: "Run campaigns" },
]

const SIZES: { id: NonNullable<SetupAnswers["people"]>; label: string; seats: number }[] = [
  { id: "1", label: "Just me", seats: 1 },
  { id: "2-5", label: "2 to 5", seats: 5 },
  { id: "6-25", label: "6 to 25", seats: 25 },
  { id: "26-100", label: "26 to 100", seats: 100 },
  { id: "100+", label: "More than 100", seats: 150 },
]

const SEAT_JOBS: { id: Role; label: string }[] = [
  { id: "sdr", label: "Prospecting and outreach" },
  { id: "ae", label: "Running deals to close" },
  { id: "marketer", label: "Campaigns and audiences" },
  { id: "cs", label: "Keeping customers and renewals" },
]

const STARTER_SEATS = 3
const PRICE = { Starter: 49, Growth: 79, Scale: 129 }

function priceLine(people: SetupAnswers["people"]) {
  const seats = SIZES.find((s) => s.id === people)?.seats ?? STARTER_SEATS
  const starterTotal = STARTER_SEATS * PRICE.Starter
  if (seats <= STARTER_SEATS) {
    return `Starter includes ${STARTER_SEATS} seats. $${starterTotal} a month for ${STARTER_SEATS}.`
  }
  return `Starter includes ${STARTER_SEATS} seats at $${starterTotal} a month. ${seats} seats need Growth: $${seats * PRICE.Growth} a month for ${seats}.`
}

/** The sidebar a seat gets under a profile: the seat's pages, minus what the profile leaves out. */
function sidebarPreview(profile: Profile, role: Role): string[] {
  return NAV.filter((n) => n.roles.includes(role))
    .filter((n) => !PROFILE_LEAVES_OUT[profile].some((o) => o.page === n.page && (!o.seats || o.seats.includes(role))))
    .map((n) => n.label)
}

function leftOutList(profile: Profile): { label: string; signal: string; seats: string }[] {
  return PROFILE_LEAVES_OUT[profile].map((o) => ({
    label: NAV.find((n) => n.page === o.page)?.label ?? o.page,
    signal: o.signal,
    seats: o.seats ? o.seats.map((r) => ROLE_LABEL[r]).join(" and ") : "every seat",
  }))
}

/**
 * The answers a workspace already gave, so an admin opening this page reads its own set-up rather
 * than an empty form (spec 16 §3, "Already set up" and "By role and by business"). The profile the
 * workspace declared is what these answers produce, checked by `profileFrom`.
 */
function declaredAnswers(profile: Profile, seats: Role[]): SetupAnswers {
  switch (profile) {
    case "founder-led": return { firstJob: "reach", people: "2-5", seats: [], everything: true }
    case "agency": return { firstJob: "reach", people: "6-25", seats: [], everything: true }
    case "product-led": return { firstJob: "grow", people: "6-25", seats: seats.filter((s) => s !== "admin"), everything: false }
    case "separated": return { firstJob: "reach", people: "100+", seats: seats.filter((s) => s !== "admin"), everything: false }
    default: return { firstJob: null, people: null, seats: [], everything: false }
  }
}

/** "2026-04-21" reads as a date, not a key. */
function longDate(iso: string): string {
  const d = new Date(iso.slice(0, 10) + "T00:00:00")
  if (Number.isNaN(d.getTime())) return iso
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function ProfileBlock({ profile, seats }: { profile: Profile; seats: Role[] }) {
  const shown = seats.length ? seats : (["admin"] as Role[])
  const out = leftOutList(profile)
  return (
    <div className="grid gap-3">
      {shown.map((r) => (
        <div key={r} className="text-sm">
          <div className="font-medium">{ROLE_LABEL[r]}</div>
          <div className="text-muted-foreground">{sidebarPreview(profile, r).join(" · ")}</div>
        </div>
      ))}
      <div className="text-sm">
        <div className="font-medium">Not in the sidebar</div>
        {out.length === 0 ? (
          <div className="text-muted-foreground">Nothing. Every seat exists and every page has a seat that lives in it.</div>
        ) : (
          <ul className="mt-1 grid gap-1 text-muted-foreground">
            {out.map((o) => (
              <li key={o.label}>{o.label} ({o.seats}) — comes back on {o.signal}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function WorkspaceSetup({ session }: { session: Session }) {
  const declared = declaredBy(session.business)
  const workspace = seedFor(session.business).workspace
  const start = setupAnswersFor(session.business) ?? declaredAnswers(session.profile, workspace.seats)

  const [name, setName] = useState(workspace.name)
  const [zone, setZone] = useState(workspace.timezone)
  const [currency, setCurrency] = useState(workspace.currency)
  const [firstJob, setFirstJob] = useState<SetupAnswers["firstJob"]>(start.firstJob)
  const [people, setPeople] = useState<SetupAnswers["people"]>(start.people)
  const [seats, setSeats] = useState<Role[]>(start.seats)
  const [everything, setEverything] = useState(start.everything)
  const [doorOpen, setDoorOpen] = useState(false)
  const [invites, setInvites] = useState<{ email: string; seat: Role }[]>([{ email: "", seat: "sdr" }])

  const answers: SetupAnswers = { firstJob, people, seats, everything }
  const answered = !!firstJob && !!people && (everything || seats.length > 0)
  const profile = useMemo(() => profileFrom(answers), [firstJob, people, seats, everything])
  const others = (["founder-led", "separated", "agency", "product-led"] as Profile[]).filter((p) => p !== profile)

  if (session.role !== "admin") {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-lg font-semibold">Your workspace is already set up</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {declared.user} set it up on {longDate(declared.on)}. They can change how your team works in Settings › How your team works.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => navigate("/ollopa")}>Back to Home</Button>
      </div>
    )
  }

  const save = (next: Partial<SetupAnswers>) => saveSetupAnswers(session.business, { ...answers, ...next })

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
        <span className="inline-block size-5 rounded-sm bg-foreground" aria-hidden="true" />
        <span className="text-sm font-semibold">{workspace.name}</span>
        <span className="text-sm text-muted-foreground">· {session.user}</span>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold">How your team works</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Three questions decide what each seat sees first. {declared.user} answered them on {longDate(declared.on)}; changing an answer changes every sidebar, and Settings changes them again at any time.
        </p>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="text-muted-foreground">Workspace name</span>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Timezone</span>
            <Input className="mt-1" value={zone} onChange={(e) => setZone(e.target.value)} />
          </label>
          <label className="text-sm">
            <span className="text-muted-foreground">Currency</span>
            <Input className="mt-1" value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </label>
        </section>

        <fieldset className="mt-8">
          <legend className="text-sm font-medium">What are you here to do first?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {JOBS.map((j) => (
              <label key={j.id} className={cn("flex items-center gap-2 rounded-lg border bg-background p-3 text-sm", firstJob === j.id && "border-foreground")}>
                <input
                  type="radio"
                  name="firstJob"
                  checked={firstJob === j.id}
                  onChange={() => { setFirstJob(j.id); save({ firstJob: j.id }) }}
                />
                {j.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="text-sm font-medium">How many people will use it?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <label key={s.id} className={cn("flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm", people === s.id && "border-foreground")}>
                <input type="radio" name="people" checked={people === s.id} onChange={() => { setPeople(s.id); save({ people: s.id }) }} />
                {s.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm">{priceLine(people)}</p>
        </fieldset>

        <fieldset className="mt-8">
          <legend className="text-sm font-medium">Which of these jobs exist here?</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {SEAT_JOBS.map((s) => (
              <label key={s.id} className={cn("flex items-center gap-2 rounded-lg border bg-background p-3 text-sm", seats.includes(s.id) && !everything && "border-foreground", everything && "opacity-60")}>
                <input
                  type="checkbox"
                  checked={seats.includes(s.id) && !everything}
                  onChange={() => {
                    const next = seats.includes(s.id) ? seats.filter((x) => x !== s.id) : [...seats, s.id]
                    setSeats(next); setEverything(false); save({ seats: next, everything: false })
                  }}
                />
                {s.label}
              </label>
            ))}
            <label className={cn("flex items-center gap-2 rounded-lg border bg-background p-3 text-sm sm:col-span-2", everything && "border-foreground")}>
              <input type="checkbox" checked={everything} onChange={() => { const v = !everything; setEverything(v); setSeats(v ? [] : seats); save({ everything: v, seats: v ? [] : seats }) }} />
              We all do everything
            </label>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Running the workspace is not on the list: the seat you are signed in with holds it. A job nobody does here produces no screens and costs nothing.</p>
        </fieldset>

        <section aria-live="polite" className="mt-8 rounded-lg border bg-background p-4">
          <h2 className="text-sm font-semibold">
            {answered ? PROFILE_LABEL[profile] : "Answer the three questions and this will say what your team gets"}
            {!answered && (firstJob || people || seats.length) ? ` · ${PROFILE_LABEL[profile]} so far` : ""}
          </h2>
          {(answered || firstJob || people || seats.length > 0) && (
            <div className="mt-3">
              <ProfileBlock profile={profile} seats={everything ? (["sdr", "admin"] as Role[]) : [...seats, "admin" as Role]} />
            </div>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            A page left out still opens, by ⌘K or by link, and its header offers “Add to sidebar”; an added page goes to the end of its group and stays.
            When a strong signal arrives, a left-out page appears in the sidebar by itself for two weeks and then asks whether to keep it. All of it changes later in Settings › How your team works.
          </p>

          <div className="mt-4 border-t pt-3">
            <h3>
              <button
                className="flex items-center gap-1 text-sm font-medium"
                aria-expanded={doorOpen}
                onClick={() => setDoorOpen((v) => !v)}
              >
                {doorOpen ? <ChevronDown className="size-4" aria-hidden="true" /> : <ChevronRight className="size-4" aria-hidden="true" />}
                The other three profiles: {others.map((p) => PROFILE_LABEL[p]).join(", ")}
              </button>
            </h3>
            {doorOpen && (
              <div className="mt-3 grid gap-4">
                {others.map((p) => (
                  <div key={p}>
                    <div className="text-sm font-medium">{PROFILE_LABEL[p]}</div>
                    <div className="mt-1"><ProfileBlock profile={p} seats={everything ? (["sdr", "admin"] as Role[]) : [...seats, "admin" as Role]} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-medium">Invite the people you counted</h2>
          <div className="mt-2 grid gap-2">
            {invites.map((row, i) => (
              <div key={i} className="flex flex-wrap gap-2">
                <Input
                  className="min-w-48 flex-1"
                  placeholder="name@company.com"
                  value={row.email}
                  onChange={(e) => setInvites(invites.map((r, j) => (j === i ? { ...r, email: e.target.value } : r)))}
                />
                <select
                  className="rounded-md border bg-background px-2 text-sm"
                  aria-label="Seat"
                  value={row.seat}
                  onChange={(e) => setInvites(invites.map((r, j) => (j === i ? { ...r, seat: e.target.value as Role } : r)))}
                >
                  {(["sdr", "ae", "marketer", "cs", "admin"] as Role[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                </select>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setInvites([...invites, { email: "", seat: "sdr" }])}>Add another person</Button>
          <p className="mt-2 text-sm text-muted-foreground">Sent when you press Start. Skipping this is normal; Settings invites later.</p>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-6">
          <Button disabled={!answered} onClick={() => { save({}); navigate("/ollopa") }}>Start</Button>
          <Button variant="outline" onClick={() => { saveSetupAnswers(session.business, { ...answers, skipped: true }); navigate("/ollopa") }}>Skip</Button>
          <span className="text-sm text-muted-foreground">
            {answered
              ? `Every seat gets ${PROFILE_LABEL[profile]}. Skipping gives every page to every seat instead — more, never less.`
              : "Answer all three to start, or skip and get every page for every seat."}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Answers are saved as you make them. Leaving and coming back returns this page exactly as it is.</p>
      </div>
    </div>
  )
}
