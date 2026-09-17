// A feature this workspace's plan does not include, shown where it would live.
//
// Permission hiding and plan gating are opposites: a role without permission gets the thing hidden and
// told who can grant it; a plan without a feature gets the thing shown, because discovery is the sale.
// So this wraps the real control in place, adds a lock and the plan name, and on click opens a panel
// with what it does, the plan, the total for the period and one button. Nothing moves when it unlocks.
// Someone who cannot buy asks the admin from the same panel, with the feature, the cost and where the
// request came from, because the approver is making a price decision too.
import { useState, type ReactNode } from "react"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { businessById } from "../data/businesses"
import { useSession } from "../session"
import { Panel } from "./Panel"
import { money, type Plan } from "./gate"

export interface LockedProps {
  feature: string
  plan: Plan
  pricePerMonth: number
  what: string
  children: ReactNode
}

export function Locked({ feature, plan, pricePerMonth, what, children }: LockedProps) {
  const session = useSession()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [asked, setAsked] = useState(false)
  const business = session?.business ?? "meridian"
  const b = businessById(business)
  const isAdmin = session?.role === "admin"
  const admin = b.roles.find((r) => r.role === "admin")

  /** Non-admins send the request from here: the feature, the cost, where it came from and a reason. */
  const askAdmin = (why: string) => {
    setAsked(true)
    document.dispatchEvent(new CustomEvent("ollopa:toast", {
      detail: `Asked ${admin?.user ?? "your admin"} for ${feature} · ${plan} · ${money(pricePerMonth)} a month`,
    }))
    document.dispatchEvent(new CustomEvent("ollopa:upgrade-request", {
      detail: { feature, plan, pricePerMonth, from: session?.user, origin: location.hash, reason: why },
    }))
  }

  return (
    <>
      {/* The control stays real and focusable; the click opens the panel instead of doing the thing. */}
      <span
        className="relative inline-flex items-center gap-2"
        onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true) }}
        onKeyDownCapture={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setOpen(true) } }}
      >
        {children}
        <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
          <Lock className="size-3" aria-hidden="true" />
          {plan}
        </span>
      </span>

      <Panel id={`gate-${feature}`} title={feature} open={open} onOpenChange={setOpen}
        footer={
          isAdmin ? (
            <Button className="w-full" onClick={() => { setOpen(false); document.dispatchEvent(new CustomEvent("ollopa:toast", { detail: `Upgrade to ${plan}: ${money(pricePerMonth)} a month for ${b.plan.seats} seats.` })) }}>
              Upgrade to {plan} · {money(pricePerMonth)} a month
            </Button>
          ) : (
            <Button className="w-full" disabled={asked} onClick={() => { askAdmin(reason); setOpen(false) }}>
              {asked ? "Asked" : `Ask ${admin?.user ?? "your admin"} to upgrade`}
            </Button>
          )
        }
      >
        <p>{what}</p>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t pt-4">
          <dt className="text-muted-foreground">Plan</dt>
          <dd className="font-medium">{plan}</dd>
          <dt className="text-muted-foreground">Your plan</dt>
          <dd>{b.plan.name}</dd>
          <dt className="text-muted-foreground">Total</dt>
          <dd className="font-medium tabular-nums">{money(pricePerMonth)} a month for {b.plan.seats} seats</dd>
        </dl>
        {!isAdmin && (
          <div className="mt-4 border-t pt-4">
            <Label htmlFor={`why-${feature}`} className="text-xs">Why you need it — {admin?.user ?? "your admin"} sees this with the cost</Label>
            <Textarea id={`why-${feature}`} value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1" rows={3}
              placeholder="What you are trying to do" />
          </div>
        )}
      </Panel>
    </>
  )
}
