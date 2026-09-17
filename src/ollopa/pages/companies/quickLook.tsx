// `Q-company`: one quick look, two field sets.
//
// Companies opens it on a prospect and Accounts opens it on the same object in its customer state.
// It is the top of the company record cut short — same labels, same order — and it is flat: the four
// health drivers are lines under the health field, never a door, because a score and the reasons that
// sum to it never sit on opposite sides of one (rule 5).
//
// Both tables and the record build their fields from here, so the drawer and the page cannot drift.
import type { QuickLookField } from "../../templates/QuickLook"
import { ago, day, delta, money, renewalText } from "./format"
import { isCustomer, type CompanyView } from "./data"

/** The health number, its band and its 30-day move, in one line of words. */
export function healthLine(health: number, band: string, delta30: number): string {
  return `${health} · ${band} · ${delta(delta30)}`
}

export function riskLine(v: CompanyView): string {
  const open = (v.account?.risks ?? []).filter((r) => !r.resolved)
  if (open.length === 0) return "None"
  const newest = [...open].sort((a, b) => (a.opened < b.opened ? 1 : -1))[0]
  return `${open.length} open · newest ${newest.type}${newest.type === "Churn notice" ? " — they have given notice" : ""}`
}

/** The prospect field set: what a glance down Companies needs. */
export function prospectFields(v: CompanyView): QuickLookField[] {
  return [
    { label: "Company", value: <span>{v.company.name} <span className="font-mono text-xs text-muted-foreground">{v.company.domain}</span></span> },
    { label: "Stage", value: v.company.stage },
    { label: "Owner", value: v.company.owner },
    { label: "Contacts held", value: `${v.contacts.length}` },
    { label: "Contacts in a sequence", value: `${v.inSequence.length}` },
    { label: "Last activity", value: `${day(v.lastActivity)} · ${ago(v.lastActivity)}` },
    { label: "Open deals", value: `${v.openDeals.length}` },
  ]
}

/** The customer-state field set: what a glance down fifty renewals needs. */
export function customerFields(v: CompanyView, currency: string): QuickLookField[] {
  const a = v.account
  if (!a) return prospectFields(v)
  return [
    { label: "Account", value: <span>{a.name} <span className="font-mono text-xs text-muted-foreground">{a.domain}</span></span> },
    { label: "Health", value: healthLine(a.health, a.band, a.healthDelta30) },
    {
      label: "What makes up the score",
      value: (
        <ul className="space-y-0.5">
          {a.drivers.map((x) => (
            <li key={x.label} className="flex justify-between gap-3">
              <span className="min-w-0">{x.label}</span>
              <span className="shrink-0 tabular-nums">{x.points > 0 ? "+" : ""}{x.points}</span>
            </li>
          ))}
        </ul>
      ),
    },
    { label: "Renewal", value: renewalText(a.renewal) },
    { label: "Contract value", value: `${money(a.value, currency)} a year` },
    { label: "Open risks", value: riskLine(v) },
    { label: "Last touch", value: `${day(a.lastTouch)} · ${ago(a.lastTouch)}` },
    { label: "Champion", value: a.champion },
    { label: "Owner", value: a.owner },
    { label: "Next step", value: `${a.nextStep.text} · ${day(a.nextStep.due)}` },
  ]
}

/** Which of the two a row gets, from the object's state and nothing else. */
export function quickLookFields(v: CompanyView, currency: string): QuickLookField[] {
  return isCustomer(v.company) && v.account ? customerFields(v, currency) : prospectFields(v)
}
