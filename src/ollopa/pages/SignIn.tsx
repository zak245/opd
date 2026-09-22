// Sign-in picks the business and the seat. Everything after it follows from that choice.
//
// Never lose sight of which workspace you are about to act in (spec 00 §1): the chosen card stays
// marked, the seat heading names it, and the button names the person. The seat is the whole reason
// this page exists — it decides every sidebar, every level-one set and every number after it — so
// the chosen seat says in words what it is before you press the button.
import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { businesses } from "../data/businesses"
import { lastBusiness, signIn } from "../session"
import { navigate } from "@/app/router"
import { ROLE_LABEL, type Business } from "../usage/model"

export function SignIn() {
  const [business, setBusiness] = useState<Business>(() => lastBusiness() ?? "meridian")
  const [user, setUser] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const cards = useRef<HTMLDivElement>(null)
  const chips = useRef<HTMLDivElement>(null)

  const b = businesses.find((x) => x.id === business)!
  const seat = b.roles.find((r) => r.user === user)
  const admin = b.roles.find((r) => r.role === "admin")

  // Arrow keys move inside a group; Tab still moves between the groups. The container comes from the
  // event, not from a ref read during render, so the first key press behaves like the tenth.
  const arrows = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowDown" && e.key !== "ArrowUp") return
    const all = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"))
    const i = all.indexOf(document.activeElement as HTMLButtonElement)
    if (i < 0) return
    e.preventDefault()
    const next = e.key === "ArrowRight" || e.key === "ArrowDown" ? (i + 1) % all.length : (i - 1 + all.length) % all.length
    all[next].focus()
  }

  const submit = () => {
    if (!seat) return
    signIn({ business, role: seat.role, user: seat.user })
    navigate("/ollopa")
  }

  // Set-up is the admin's screen and the workspace has to exist before its three questions can be
  // answered, so this signs in to the chosen workspace's admin seat and opens set-up there. The
  // line under the button says exactly that before it is pressed.
  const setUp = () => {
    if (!admin) return
    signIn({ business, role: admin.role, user: admin.user })
    navigate("/ollopa/setup")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <form
        className="mx-auto max-w-3xl px-4 pb-32 pt-10 sm:px-6 sm:pb-14 sm:pt-14"
        onSubmit={(e) => { e.preventDefault(); submit() }}
      >
        <div className="t-section mb-8 flex items-center gap-2 sm:mb-10">
          <span className="inline-block size-5 rounded-sm bg-foreground" aria-hidden="true" /> ollopA
        </div>
        <h1 className="t-title">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose the workspace and the seat you are signing in to. The seat decides what you see.</p>

        <h2 id="workspace-label" className="mt-8 text-xs font-medium uppercase tracking-wider text-muted-foreground">Workspace</h2>
        <div ref={cards} onKeyDown={arrows} aria-labelledby="workspace-label" className="mt-2 grid gap-3 sm:grid-cols-2">
          {businesses.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => { setBusiness(x.id); setUser(null); setMessage(null) }}
              aria-pressed={business === x.id}
              className={cn(
                "rounded-lg border bg-background p-4 text-left hover:border-foreground/40",
                business === x.id && "border-foreground ring-1 ring-foreground",
              )}
            >
              <div className="font-medium">{x.name}</div>
              <div className="text-xs text-muted-foreground">{x.size} · {x.tagline}</div>
              <p className="mt-2 text-sm text-muted-foreground">{x.how}</p>
            </button>
          ))}
        </div>

        <h2 id="seat-label" className="mt-8 text-xs font-medium uppercase tracking-wider text-muted-foreground">Seat at {b.name}</h2>
        <div ref={chips} onKeyDown={arrows} aria-labelledby="seat-label" className="mt-2 flex flex-wrap gap-2">
          {b.roles.map((r) => (
            <button
              key={r.user}
              type="button"
              onClick={() => setUser(r.user)}
              aria-pressed={user === r.user}
              className={cn(
                "max-w-full truncate rounded-full border bg-background px-3 py-1.5 text-sm hover:border-foreground/40",
                user === r.user && "border-foreground bg-foreground text-background",
              )}
            >
              {r.user} · {r.title}
            </button>
          ))}
        </div>

        {/* What the chosen seat is, in the product's own words: the role it holds, and — for the one
            seat that manages others — who reports to it, because a manager's screens differ from an
            account executive's without being a sixth seat. */}
        <p className="mt-3 min-h-5 text-sm text-muted-foreground">
          {seat
            ? `${seat.title}${ROLE_LABEL[seat.role] === seat.title ? "" : ` · ${ROLE_LABEL[seat.role]}`}${seat.reports?.length ? `, manages ${seat.reports.join(", ")}` : ""}. Signs in to ${b.name}.`
            : `${b.roles.length} seats at ${b.name}. The seat decides which pages you get.`}
        </p>

        <div className="mt-6 flex items-center gap-3 max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:z-10 max-sm:border-t max-sm:bg-background max-sm:p-4">
          <Button type="submit" disabled={!seat} className="max-sm:flex-1">{seat ? `Sign in as ${seat.user}` : "Sign in"}</Button>
          {!seat && <span className="text-sm text-muted-foreground">Pick a seat to continue.</span>}
        </div>
        {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}

        <div className="mt-6 border-t pt-6">
          <Button type="button" variant="outline" onClick={setUp} disabled={!admin}>Set up a new workspace</Button>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Three questions decide what each seat sees first. Set-up is the admin's screen, so this opens it at {b.name}
            {admin ? ` as ${admin.user} (${admin.title})` : ""}.
          </p>
        </div>

        <p className="mt-6 text-sm">
          <button type="button" className="underline underline-offset-4" onClick={() => setMessage("Password reset is not part of this demo.")}>
            Forgot password
          </button>
        </p>
      </form>
    </div>
  )
}
