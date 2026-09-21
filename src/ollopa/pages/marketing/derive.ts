// What the seed says, turned into the facts these pages print: the net size of an audience after its
// six suppressions, the eight pre-send checks in words, and the run rows a workflow's SLA block and
// exception queue are built from. Nothing is invented here that the seed could answer.
import { BOUNCE_GUARD, TODAY, type Audience, type Campaign, type MailDomain, type Seed, type Workflow, type WorkflowRun } from "../../data/seed"
import { clockOf, daysBetween, minutesOver, num, overBy, windowHours } from "./format"

/* ----------------------------------------------------------------------------------- audiences */

export interface SuppressionCount { key: string; label: string; count: number; always: boolean; on: boolean }

/**
 * Six counts, not three. Unsubscribed and bounced are always applied and are marked so; the four
 * below them are the marketer's choice and each says whether it is on. Who will not receive the send
 * is part of the decision to send, so these are level one on the record and never behind a door.
 */
export function suppressionCounts(a: Audience): SuppressionCount[] {
  return [
    { key: "unsubscribed", label: "unsubscribed", count: a.suppressed.unsubscribed, always: true, on: true },
    { key: "bounced", label: "bounced", count: a.suppressed.bounced, always: true, on: true },
    { key: "customers", label: "customers", count: a.suppressed.customers, always: false, on: a.suppressionsOn.customers },
    { key: "openDeals", label: "open deals", count: a.suppressed.openDeals, always: false, on: a.suppressionsOn.openDeals },
    { key: "closedLost", label: "closed-lost", count: a.suppressed.closedLost, always: false, on: a.suppressionsOn.closedLost },
    { key: "inSequence", label: "in sequence", count: a.suppressed.inSequence, always: false, on: a.suppressionsOn.inSequence },
  ]
}

export const suppressedTotal = (a: Audience) => suppressionCounts(a).filter((s) => s.on).reduce((n, s) => n + s.count, 0)
export const netSize = (a: Audience) => Math.max(0, a.size - suppressedTotal(a))
export const rulesApplied = (a: Audience) => suppressionCounts(a).filter((s) => !s.always && s.on).length

/* ----------------------------------------------------------------------- the eight pre-send checks */

export type CheckState = "pass" | "fail" | "not run"

/**
 * Where a failed check is fixed. Never a bare href to another object: `hash` is somewhere on this
 * same page and is not a move at all, `to` is a page the campaign follows to and stays on the trail
 * behind, and `beside` is a related object read in the pane without leaving the campaign at all.
 */
export interface Fix {
  label: string
  hash?: string
  to?: string
  beside?: { kind: string; id: string }
}
export interface Check { n: number; title: string; state: CheckState; words: string; fix?: Fix }

/**
 * Eight checks, flat, each pass, fail or not run, each failure stated in words with a Fix link that
 * navigates to the thing that is wrong. Nothing is a red dot.
 *
 * The result of each check is the campaign's own, from `qa.checks`, so all eight come from one place.
 * The words beside it are written here from the rows the check is about, so a failure names the thing
 * that is wrong rather than reporting that something is.
 */
export function preSendChecks(c: Campaign, audience: Audience | undefined, seed: Seed, domain: MailDomain | undefined, sends: { dailyCap: number; usedToday: number }): Check[] {
  const stateOf = (n: number): CheckState => c.qa.checks[n - 1]?.state ?? "not run"
  const failed = (n: number) => stateOf(n) === "fail"
  const noFirstName = seed.contacts.filter((p) => p.name.trim().split(/\s+/).length < 2).length
  const bounceRate = c.sent ? (c.bounced / c.sent) * 100 : seed.bounceGuard.observedPercent
  const guardTripped = bounceRate >= BOUNCE_GUARD.pausePercent || c.pausedBy === "Bounce guard"
  const alsoMailed = seed.campaigns.filter((x) => x.id !== c.id && x.audienceId === c.audienceId && x.sent > 0)[0]
  const subjectLength = c.subject.length

  return [
    {
      n: 1, title: "Every merge field resolves for every recipient", state: stateOf(1),
      words: noFirstName === 0
        ? "Every recipient has a first name, so nobody reads “Hi ,”."
        : `${num(noFirstName)} of ${num(audience?.size ?? c.audienceSize)} recipients have no first name; they will read “Hi ,”.`,
      fix: failed(1) ? { label: "Fix: open the people without a first name", to: "/ollopa/people" } : undefined,
    },
    {
      n: 2, title: "Every link works and is tracked", state: stateOf(2),
      words: domain?.trackingSubdomain
        ? `Links are rewritten through ${domain.trackingSubdomain}.`
        : "No tracking subdomain is set up, so clicks will not be counted.",
      fix: failed(2) ? { label: "Fix: open the sending domain in Settings", to: "/ollopa/settings/email-sending?row=mail.domains" } : undefined,
    },
    {
      n: 3, title: "The unsubscribe link is present and points at the workspace footer", state: stateOf(3),
      words: "The workspace footer carries the unsubscribe link, and a test send unsubscribes nobody.",
    },
    {
      n: 4, title: "The plain-text version exists", state: stateOf(4),
      words: c.previewText.length > 0
        ? "A plain-text version is generated from the body and the preview text."
        : "There is no preview text, so the plain-text version is empty.",
      fix: failed(4) ? { label: "Fix: write the preview text", hash: "#content" } : undefined,
    },
    {
      n: 5, title: "The from mailbox is warmed and under its daily cap", state: stateOf(5),
      words: guardTripped
        ? `${c.fromMailbox} bounced ${bounceRate.toFixed(1)}% on the last send, past the ${BOUNCE_GUARD.pausePercent}% pause threshold, so the guard holds it.`
        : `${c.fromMailbox} is warmed · ${num(sends.usedToday)} of ${num(sends.dailyCap)} sends used today.`,
      fix: failed(5) ? { label: "Fix: open the bounce guard in Settings", to: "/ollopa/settings/email-sending?row=mail.bounce-guard" } : undefined,
    },
    {
      n: 6, title: "The subject renders under 60 characters on a phone", state: stateOf(6),
      words: subjectLength < 60
        ? `“${c.subject}” is ${subjectLength} characters.`
        : `“${c.subject}” is ${subjectLength} characters and will be cut on a phone.`,
      fix: failed(6) ? { label: "Fix: shorten the subject", hash: "#content" } : undefined,
    },
    {
      n: 7, title: "The audience's suppressions are applied and its mode is what the sender expects", state: stateOf(7),
      words: audience
        ? `${audience.name}: ${num(suppressedTotal(audience))} suppressed, ${rulesApplied(audience)} of the 4 optional rules on, mode ${audience.mode}.`
        : "The audience was removed; the size at send time is kept on the campaign.",
      fix: failed(7) ? (audience ? { label: "Fix: read the audience beside this", beside: { kind: "audience", id: audience.id } } : { label: "Fix: open Campaigns", to: "/ollopa/campaigns" }) : undefined,
    },
    {
      n: 8, title: "No recipient has had another campaign in the frequency-cap window", state: stateOf(8),
      words: alsoMailed
        ? `${alsoMailed.name} sent to the same audience and reached ${num(alsoMailed.sent)} of these people.`
        : "Nobody in this audience has had another campaign this week.",
      fix: failed(8) && alsoMailed ? { label: `Fix: read ${alsoMailed.name} beside this`, beside: { kind: "campaign", id: alsoMailed.id } } : undefined,
    },
  ]
}

/** The one line that sits above Schedule, never disabled and never blocking. */
export function qaLine(c: Campaign, checks: Check[]): string {
  if (c.qa.on === null) return "QA not run"
  const failed = checks.filter((k) => k.state === "fail")
  return failed.length === 0
    ? "QA: 8 checks passed"
    : `QA: ${failed.length} check${failed.length === 1 ? "" : "s"} failed — ${failed.map((k) => shortName(k.n)).join(", ")}`
}

function shortName(n: number): string {
  return ["merge fields", "links", "unsubscribe link", "plain-text version", "from mailbox", "subject length", "suppressions", "frequency cap"][n - 1]
}

/* ----------------------------------------------------------------------------------- workflows */

export const runsOf = (runs: WorkflowRun[], id: string) => runs.filter((r) => r.workflowId === id)
export const enrolledRuns = (runs: WorkflowRun[]) => runs.filter((r) => r.outcome !== "not-routed")
export const notRoutedRuns = (runs: WorkflowRun[]) => runs.filter((r) => r.outcome === "not-routed")
export const erroredRuns = (runs: WorkflowRun[]) => runs.filter((r) => r.outcome === "errored")
export const enrolled7d = (runs: WorkflowRun[]) => runs.filter((r) => r.outcome !== "not-routed" && daysBetween(r.at.slice(0, 10)) <= 7).length

/**
 * The leads past the window, each with its elapsed time in text. The clock is the workspace's own
 * close of business, which is the last moment a breach could still have been answered; the runs are
 * the workflow's most recent enrolments, which is who is on the clock.
 */
export function breachedRows(w: Workflow, runs: WorkflowRun[]): { run: WorkflowRun; over: string; overMinutes: number }[] {
  if (!w.sla) return []
  const hours = windowHours(w.sla.windows.hot)
  const clock = w.hours.to
  return enrolledRuns(runs)
    .map((run) => ({ run, over: overBy(clockOf(run.at), clock, hours), overMinutes: minutesOver(clockOf(run.at), clock, hours) }))
    .filter((row) => row.overMinutes > 0)
    .sort((a, b) => b.overMinutes - a.overMinutes)
    .slice(0, w.sla.breachedToday)
}

/** Every exception carries its reason and the rule that produced it, one link away. */
export function ruleForReason(w: Workflow, reason: string | null): { label: string; ruleId: string | null } {
  if (!reason) return { label: "no rule", ruleId: null }
  if (reason.includes("pool is away")) return { label: "rule 1", ruleId: w.rules[0]?.id ?? null }
  if (reason.includes("no owner on the matched account")) return { label: "rule 4", ruleId: w.rules[3]?.id ?? null }
  if (reason.includes("daily enrolment limit")) return { label: "enrolment limits", ruleId: null }
  if (reason.includes("credit ceiling")) return { label: "the credit ceiling", ruleId: null }
  if (reason.includes("mailbox")) return { label: "rule 3", ruleId: w.rules[2]?.id ?? null }
  return { label: "no rule matched", ruleId: null }
}

export const sentence = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const isToday = (at: string) => at.slice(0, 10) === TODAY
