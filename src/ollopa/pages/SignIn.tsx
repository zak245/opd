// Sign-in picks the business and the seat. Everything after it follows from that choice.
// Never lose sight of which workspace you are about to act in: the chosen card stays marked, and the
// button names the person.
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

  const arrows = (container: HTMLDivElement | null) => (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowDown" && e.key !== "ArrowUp") return
    const all = Array.from(container?.querySelectorAll<HTMLButtonElement>("button") ?? [])
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

  return (
    <div className="min-h-screen bg-muted/30">
      <form
        className="mx-auto max-w-3xl px-6 pb-28 pt-14 sm:pb-14"
        onSubmit={(e) => { e.preventDefault(); submit() }}
      >
        <div className="mb-10 flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="inline-block size-5 rounded-sm bg-foreground" aria-hidden="true" /> Ollopa
        </div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose the workspace and the seat you are signing in to. The seat decides what you see.</p>

        <h2 id="workspace-label" className="mt-8 text-xs font-medium uppercase tracking-wider text-muted-foreground">Workspace</h2>
        <div ref={cards} onKeyDown={arrows(cards.current)} aria-labelledby="workspace-label" className="mt-2 grid gap-3 sm:grid-cols-2">
          {businesses.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => { setBusiness(x.id); setUser(null) }}
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
        <div ref={chips} onKeyDown={arrows(chips.current)} aria-labelledby="seat-label" className="mt-2 flex flex-wrap gap-2">
          {b.roles.map((r) => (
            <button
              key={r.user}
              type="button"
              onClick={() => setUser(r.user)}
              aria-pressed={user === r.user}
              title={ROLE_LABEL[r.role]}
              className={cn(
                "rounded-full border bg-background px-3 py-1.5 text-sm hover:border-foreground/40",
                user === r.user && "border-foreground bg-foreground text-background",
              )}
            >
              {r.user} · {r.title}
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3 max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:z-10 max-sm:border-t max-sm:bg-background max-sm:p-4">
          <Button type="submit" disabled={!seat}>{seat ? `Sign in as ${seat.user}` : "Sign in"}</Button>
          {!seat && <span className="text-sm text-muted-foreground">Pick a seat to continue.</span>}
        </div>

        <p className="mt-4 text-sm">
          <button type="button" className="underline underline-offset-4" onClick={() => setMessage("Password reset is not part of this demo.")}>
            Forgot password
          </button>
        </p>
        {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
      </form>
    </div>
  )
}
