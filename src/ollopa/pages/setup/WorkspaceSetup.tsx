// Workspace set-up: the only page a person sees once — and the one page an admin comes back to.
//
// Three questions on one screen, because the sidebar cannot be decided without them and because the
// three are interdependent — how many people, and which jobs exist, are answered together. The result
// block updates as the answers change, so the cause and the effect are on the same screen. One door.
// What the answers change, and that Settings changes them again, is beside the button, never behind it.
//
// It runs in two places. A fresh workspace has no sidebar yet, so it fills the window with no shell
// around it. An admin who reached it from Settings › Workspace profile is in the middle of something:
// the trail is not empty, so it runs inside the shell with the crumb back to Settings above it, and
// Start and Skip return along that crumb to the row instead of dropping the person on Home.
import { useMemo, useRef, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Actions } from "../../ui/Actions"
import { WizardPage } from "../../layouts"
import { Chip } from "../../ui/Identity"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Input } from "@/components/ui/input"
import { navigate } from "@/app/router"
import { back, useTrail } from "../../chain"
import { movedLine, noteSidebarMove } from "./moved"
import { seedFor } from "../../data/seed"
import { NAV } from "../../nav"
import { PROFILE_LEAVES_OUT } from "../../map"
import { ROLE_LABEL, type Role } from "../../usage/model"
import {
  declaredBy,
  PROFILE_LABEL,
  profileFrom,
  profileOf,
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

/** The shape the three questions share: a full-width stack of the library's toggle items. */
const GROUP = "grid w-full grid-cols-1 gap-2 sm:grid-cols-2"
const ITEM = "h-auto justify-start whitespace-normal px-3 py-2.5 text-left"
/** The one answer that is not a seat: everybody does everything. */
const EVERY = "everything"

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
 * The jobs a workspace's seats cover, once each. The question is which jobs exist, not how many
 * people hold one: Meridian has two seats on "ae" (Account executive and Sales manager) and running
 * the workspace is not on the list at all.
 */
function jobs(seats: Role[]): Role[] {
  return Array.from(new Set(seats.filter((s) => s !== "admin")))
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
    case "product-led": return { firstJob: "grow", people: "6-25", seats: jobs(seats), everything: false }
    case "separated": return { firstJob: "reach", people: "100+", seats: jobs(seats), everything: false }
    default: return { firstJob: null, people: null, seats: [], everything: false }
  }
}

/** The three answers in the words the page put on them, for a row that reports what is set now. */
export function answerWords(a: SetupAnswers): string {
  const job = JOBS.find((j) => j.id === a.firstJob)?.label
  const size = SIZES.find((s) => s.id === a.people)?.label
  const kinds = new Set(a.seats).size
  const which = a.everything ? "everyone does everything" : `${kinds || "no"} of the four jobs`
  return [job ? `"${job.toLowerCase()}"` : null, size ? `${size.toLowerCase()} people` : null, which]
    .filter(Boolean).join(", ")
}

/** "2026-04-21" reads as a date, not a key. */
function longDate(iso: string): string {
  const d = new Date(iso.slice(0, 10) + "T00:00:00")
  if (Number.isNaN(d.getTime())) return iso
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function ProfileBlock({ profile, seats }: { profile: Profile; seats: Role[] }) {
  // The question is which jobs exist, not how many people hold each one: Meridian has two seats on
  // the "ae" role (Account executive and Sales manager) and they read the same sidebar. The list is
  // deduplicated so it says each job once, and keyed by role and position so that even if a caller
  // passes the same role twice both rows render and React never drops or swaps one.
  const shown = Array.from(new Set(seats.length ? seats : (["admin"] as Role[])))
  const out = leftOutList(profile)
  return (
    <div className="grid gap-3">
      {shown.map((r, i) => (
        <div key={`${r}-${i}`} className="t-body">
          <div className="t-label">{ROLE_LABEL[r]}</div>
          <div className="text-muted-foreground">{sidebarPreview(profile, r).join(" · ")}</div>
        </div>
      ))}
      <div className="t-body">
        <div className="t-label">Not in the sidebar</div>
        {out.length === 0 ? (
          <div className="text-muted-foreground">Nothing. Every seat exists and every page has a seat that lives in it.</div>
        ) : (
          <ul className="t-body mt-1 grid gap-1 text-muted-foreground">
            {out.map((o) => (
              <li key={o.label}>{o.label} ({o.seats}) — comes back on {o.signal}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function WorkspaceSetup({ session, inShell = false }: { session: Session; inShell?: boolean }) {
  const declared = declaredBy(session.business)
  const trail = useTrail()
  // The shape the workspace was in when this page opened. Answers save as they are made, so this is
  // the only honest "before" for the line that says what moved.
  const shapeOnArrival = useRef(profileOf(session.business)).current
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
  const [step, setStep] = useState("job")
  const [invites, setInvites] = useState<{ email: string; seat: Role }[]>([{ email: "", seat: "sdr" }])

  const answers: SetupAnswers = { firstJob, people, seats, everything }
  const answered = !!firstJob && !!people && (everything || seats.length > 0)
  const profile = useMemo(() => profileFrom(answers), [firstJob, people, seats, everything])
  const others = (["founder-led", "separated", "agency", "product-led"] as Profile[]).filter((p) => p !== profile)

  if (session.role !== "admin") {
    // The same type at a dead end: one step, and the sentence naming who can change it (RULES.md
    // rule 4). The template sets the measure; this page sets no width.
    return (
      <WizardPage
        family="settings"
        title="How your team works"
        actions={[]}
        steps={[{ id: "done", name: "Your workspace is already set up" }]}
        current="done"
        footer={<Actions surface="form" items={[{ label: "Back to Home", kind: "secondary", onClick: () => navigate("/ollopa") }]} />}
      >
        <p className="t-body text-muted-foreground">
          {declared.user} set it up on {longDate(declared.on)}. They can change how your team works in Settings › How your team works.
        </p>
      </WizardPage>
    )
  }

  const save = (next: Partial<SetupAnswers>) => saveSetupAnswers(session.business, { ...answers, ...next })

  /**
   * Finishing, either way. The answers are written, then the sidebars either side of the write are
   * compared so the line the person reads on the way back says what actually moved rather than what
   * probably moved. Reached from Settings, the way out is the crumb back to the row that sent you;
   * reached fresh, it is Home, because there is nothing behind this page.
   */
  const finish = (next: Partial<SetupAnswers>) => {
    save(next)
    const after = profileOf(session.business)
    if (trail.length > 0) {
      noteSidebarMove(movedLine(session.business, session.role, shapeOnArrival, after))
      back(trail.length - 1)
      return
    }
    navigate("/ollopa")
  }

  /**
   * The three questions, as the Wizard type draws them: a step list beside the card at `lg` and
   * above it below, one card for the step you are on (LAYOUTS.md §1). The answers still save as they
   * are made and the page still holds all three — the steps are how it is read, not a gate.
   */
  const steps = [
    { id: "job", name: "What are you here to do first?", note: JOBS.find((j) => j.id === firstJob)?.label },
    { id: "people", name: "How many people will use it?", note: SIZES.find((x) => x.id === people)?.label },
    { id: "jobs", name: "Which of these jobs exist here?", note: everything ? "Everyone does everything" : `${new Set(seats).size || "No"} of the four` },
  ]

  const result = (
    <div aria-live="polite" className="grid gap-3">
      <Separator />
      <h3 className="t-label">
        {answered ? PROFILE_LABEL[profile] : "Answer the three questions and this will say what your team gets"}
        {!answered && (firstJob || people || seats.length) ? ` · ${PROFILE_LABEL[profile]} so far` : ""}
      </h3>
      {(answered || firstJob || people || seats.length > 0) && (
        <ProfileBlock profile={profile} seats={everything ? (["sdr", "admin"] as Role[]) : [...seats, "admin" as Role]} />
      )}
      <div>
        <h4>
          <button className="t-label flex items-center gap-1" aria-expanded={doorOpen} onClick={() => setDoorOpen((v) => !v)}>
            {doorOpen ? <ChevronDown className="size-4" aria-hidden="true" /> : <ChevronRight className="size-4" aria-hidden="true" />}
            The other three profiles: {others.map((x) => PROFILE_LABEL[x]).join(", ")}
          </button>
        </h4>
        {doorOpen && (
          <div className="mt-3 grid gap-4">
            {others.map((x) => (
              <div key={x}>
                <div className="t-label">{PROFILE_LABEL[x]}</div>
                <div className="mt-1"><ProfileBlock profile={x} seats={everything ? (["sdr", "admin"] as Role[]) : [...seats, "admin" as Role]} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {!inShell && (
        <header className="relative flex h-14 items-center gap-3 bg-sidebar px-4">
          <span className="inline-block size-5 rounded-sm bg-foreground" aria-hidden="true" />
          <span className="t-label">{workspace.name}</span>
          <span className="t-body text-muted-foreground">· {session.user}</span>
          <Separator orientation="horizontal" className="absolute inset-x-0 bottom-0" />
        </header>
      )}

      <WizardPage
        family="settings"
        title="How your team works"
        description={workspace.name}
        actions={[]}
        steps={steps}
        current={step}
        onGo={setStep}
        footer={
          <Actions surface="form" items={[
            { label: trail.length > 0 ? "Save the answers" : "Start", kind: "primary",
              disabledBecause: answered ? undefined : "Answer all three questions",
              onClick: () => finish({ skipped: false }) },
            { label: "Skip", kind: "secondary", onClick: () => finish({ skipped: true }) },
          ]} />
        }
      >
        {step === "job" && (
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="t-label">
                <span className="text-muted-foreground">Workspace name</span>
                <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="t-label">
                <span className="text-muted-foreground">Timezone</span>
                <Input className="mt-1" value={zone} onChange={(e) => setZone(e.target.value)} />
              </label>
              <label className="t-label">
                <span className="text-muted-foreground">Currency</span>
                <Input className="mt-1" value={currency} onChange={(e) => setCurrency(e.target.value)} />
              </label>
            </div>
            <Separator />
            <ToggleGroup
              type="single" variant="outline" className={GROUP} aria-label="What are you here to do first?"
              value={firstJob ?? ""}
              onValueChange={(v) => { if (!v) return; const id = v as NonNullable<SetupAnswers["firstJob"]>; setFirstJob(id); save({ firstJob: id }) }}
            >
              {JOBS.map((j) => <ToggleGroupItem key={j.id} value={j.id} className={ITEM}>{j.label}</ToggleGroupItem>)}
            </ToggleGroup>
            {result}
          </div>
        )}

        {step === "people" && (
          <div className="grid gap-4">
            <ToggleGroup
              type="single" variant="outline" className="flex-wrap justify-start" aria-label="How many people will use it?"
              value={people ?? ""}
              onValueChange={(v) => { if (!v) return; const id = v as NonNullable<SetupAnswers["people"]>; setPeople(id); save({ people: id }) }}
            >
              {SIZES.map((x) => <ToggleGroupItem key={x.id} value={x.id}>{x.label}</ToggleGroupItem>)}
            </ToggleGroup>
            <p><Chip status="new">{priceLine(people)}</Chip></p>
            {result}
          </div>
        )}

        {step === "jobs" && (
          <div className="grid gap-4">
            <ToggleGroup
              type="multiple" variant="outline" className={GROUP} aria-label="Which of these jobs exist here?"
              value={everything ? [EVERY] : seats}
              onValueChange={(next) => {
                const was = everything ? [EVERY] : (seats as string[])
                const added = next.find((v) => !was.includes(v))
                const gone = was.find((v) => !next.includes(v))
                if (added === EVERY) { setEverything(true); setSeats([]); save({ everything: true, seats: [] }); return }
                if (gone === EVERY) { setEverything(false); save({ everything: false, seats }); return }
                const kept = next.filter((v) => v !== EVERY) as Role[]
                setSeats(kept); setEverything(false); save({ seats: kept, everything: false })
              }}
            >
              {SEAT_JOBS.map((x) => <ToggleGroupItem key={x.id} value={x.id} className={ITEM}>{x.label}</ToggleGroupItem>)}
              <ToggleGroupItem value={EVERY} className={ITEM}>We all do everything</ToggleGroupItem>
            </ToggleGroup>
            {result}
            <Separator />
            <div className="grid gap-2">
              <h3 className="t-label">Invite the people you counted</h3>
              {invites.map((row, i) => (
                <div key={i} className="flex flex-wrap gap-2">
                  <Input
                    className="min-w-48 flex-1"
                    placeholder="name@company.com"
                    value={row.email}
                    onChange={(e) => setInvites(invites.map((r, j) => (j === i ? { ...r, email: e.target.value } : r)))}
                  />
                  <Select value={row.seat} onValueChange={(v) => setInvites(invites.map((r, j) => (j === i ? { ...r, seat: v as Role } : r)))}>
                    <SelectTrigger aria-label="Seat" className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(["sdr", "ae", "marketer", "cs", "admin"] as Role[]).map((r) => <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <Actions className="mt-1" surface="card" items={[{ label: "Add another person", kind: "secondary", onClick: () => setInvites([...invites, { email: "", seat: "sdr" }]) }]} />
            </div>
          </div>
        )}
      </WizardPage>
    </>
  )
}
