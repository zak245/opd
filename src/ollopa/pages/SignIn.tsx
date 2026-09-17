import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { businesses } from "../data/businesses"
import { signIn } from "../session"
import { navigate } from "@/app/router"
import type { Business, Role } from "../usage/model"

export function SignIn() {
  const [business, setBusiness] = useState<Business>("meridian")
  const [role, setRole] = useState<Role | null>(null)
  const b = businesses.find((x) => x.id === business)!
  const seat = b.roles.find((r) => r.role === role)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="mb-10 flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="inline-block size-5 rounded-sm bg-foreground" aria-hidden="true" /> Ollopa
        </div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose the workspace and the seat you are signing in to.</p>

        <h2 className="mt-8 text-xs font-medium uppercase tracking-wider text-muted-foreground">Workspace</h2>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {businesses.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => { setBusiness(x.id); setRole(null) }}
              aria-pressed={business === x.id}
              className={cn("rounded-lg border bg-background p-4 text-left hover:border-foreground/40", business === x.id && "border-foreground ring-1 ring-foreground")}
            >
              <div className="font-medium">{x.name}</div>
              <div className="text-xs text-muted-foreground">{x.size} · {x.tagline}</div>
              <p className="mt-2 text-sm text-muted-foreground">{x.how}</p>
            </button>
          ))}
        </div>

        <h2 className="mt-8 text-xs font-medium uppercase tracking-wider text-muted-foreground">Seat</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {b.roles.map((r) => (
            <button
              key={r.user}
              type="button"
              onClick={() => setRole(r.role)}
              aria-pressed={role === r.role}
              className={cn("rounded-full border bg-background px-3 py-1.5 text-sm hover:border-foreground/40", role === r.role && "border-foreground bg-foreground text-background")}
            >
              {r.user} · {r.title}
            </button>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3">
          <Button disabled={!role} onClick={() => { if (role) { signIn({ business, role }); navigate("/ollopa") } }}>
            {seat ? `Sign in as ${seat.user}` : "Sign in"}
          </Button>
          {!role && <span className="text-sm text-muted-foreground">Pick a seat to continue.</span>}
        </div>
      </div>
    </div>
  )
}
