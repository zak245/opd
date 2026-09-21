// The workflow record (`R-workflow`) and its one door (`D-wf-runs`).
//
// The sections are in the order the questions are asked: what is on a clock and what has breached;
// what starts this and who enrols; the rules and who is on the receiving end of them; what it costs
// and what happens at the ceiling; who it never touches; and only then the switch that turns it on.
// One door at the foot holds the run history, and the two things inside it are sections, not doors,
// so nothing here is three levels deep.
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { href, navigate, useRoute } from "@/app/router"
import { openBeside } from "../../beside"
import { follow, type Origin } from "../../chain"
import { useEdits } from "../../edits"
import { RowNote, undoable, useTick } from "../engage/shared"
import { toast } from "../../templates/TablePage"
import { RecordPage, type RecordDoor, type RecordField, type RecordSection } from "../../templates/RecordPage"
import { Announcement } from "../../ui/Announcement"
import { EmptyState } from "../../ui/EmptyState"
import { Panel } from "../../ui/Panel"
import { useDoorState } from "../../ui/Door"
import { businessById } from "../../data/businesses"
import { TODAY, seedFor, type Contact, type Workflow } from "../../data/seed"
import type { Session } from "../../session"
import { breachedRows, enrolledRuns, notRoutedRuns, ruleForReason, runsOf, sentence } from "./derive"
import { ago, clockOf, day, num, windowHours } from "./format"
import { patchRow, useMarketing } from "./store"

const RUNS_DOOR = "workflow.runs"

/** The enrolment filter, run over the workspace's own contacts, so "how many match now" is true. */
function matches(c: Contact, f: { field: string; op: string; value: string }): boolean {
  const list = f.value.split(",").map((v) => v.trim())
  if (f.field === "country") return list.includes(c.location.country)
  if (f.field === "emailStatus") return c.emailStatus === f.value
  if (f.field === "industry") return list.includes(c.company)
  return true
}

export function WorkflowRecord({ session, id }: { session: Session; id?: string }) {
  const b = businessById(session.business)
  const seed = seedFor(session.business)
  const rows = useMarketing(session.business)
  const route = useRoute()
  const admin = b.roles.find((r) => r.role === "admin")?.user ?? "your admin"

  // What actions took on these people this session, from the one store every page reads: acting in
  // a pane beside this record redraws the run row it was caused on, here, at once (chain rule 8).
  const personEdits = useEdits("person")
  useTick(Object.values(personEdits).some(undoable))

  const w = rows.workflows.find((x) => x.id === id)
  const [, openRuns] = useDoorState(RUNS_DOOR)
  const [testOpen, setTestOpen] = useState(route.query.get("open") === "test")
  const [testPerson, setTestPerson] = useState(seed.contacts[0]?.id ?? "")
  const [tested, setTested] = useState(false)
  const [newCeiling, setNewCeiling] = useState("")
  const [announcement, setAnnouncement] = useState<string | null>(null)
  const [filterRule, setFilterRule] = useState("all")
  const [filterRep, setFilterRep] = useState("all")
  const [filterReason, setFilterReason] = useState("all")
  const [filterDate, setFilterDate] = useState("all")
  const [runQ, setRunQ] = useState("")

  const at = route.query.get("at")

  /** The run-history door, wherever the template put it, so a link and a shortcut reach the real one. */
  const showRuns = () => {
    openRuns(true)
    const button = Array.from(document.querySelectorAll<HTMLButtonElement>("button[aria-expanded]"))
      .find((el) => el.textContent?.startsWith("Run history"))
    button?.scrollIntoView({ block: "center" })
    button?.focus()
  }

  // A deep link to "this workflow's exceptions" reproduces the view: the door opens and the page
  // lands on the block the link names.
  useEffect(() => {
    if (at === "runs") { showRuns(); return }
    if (at) document.getElementById(at)?.scrollIntoView({ block: "start" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at])

  const runs = useMemo(() => runsOf(seed.workflowRuns, w?.id ?? ""), [seed.workflowRuns, w?.id])

  if (!w) {
    return (
      <div className="p-10">
        <EmptyState title="That workflow is not here" body="It may have been archived, or the link may be old." action={<Button size="sm" onClick={() => navigate("/ollopa/workflows")}>Back to Workflows</Button>} />
      </div>
    )
  }

  const enrolled = enrolledRuns(runs)
  const exceptions = notRoutedRuns(runs)
  const breached = breachedRows(w, runs)
  const breachedIds = breached.map((r) => r.run.personId)
  const away = seed.users.filter((u) => typeof u.availability === "object" && (w.routing?.pool ?? []).includes(u.name))
  const territory = seed.territories[0]
  const matchNow = seed.contacts.filter((c) => w.enrolment.every((f) => matches(c, f))).length
  const atCeiling = w.ceiling.spentToday >= w.ceiling.perDay

  const patch = (p: Partial<Workflow>) => patchRow(session.business, "workflows", w.id, p)

  /* ------------------------------------------------------------------- the two ways off this page */

  /** Where this page is and the row being left, for the crumb and for the return cue. */
  const from = (anchor?: string): Origin => ({ route: route.raw, title: `${w.name} · Workflows`, anchor })

  /** A person on one of these lists, read beside the workflow, walking the list as it is shown. */
  const readPerson = (personId: string, ids: string[], opener?: HTMLElement | null) => {
    const index = ids.indexOf(personId)
    openBeside({
      kind: "person", id: personId,
      list: { ids, index: index < 0 ? 0 : index },
      opener: opener ?? (document.activeElement as HTMLElement | null),
    })
  }

  /* -------------------------------------------------------------------------------- the header */

  const fields: RecordField[] = [
    { key: "trigger", label: "Trigger", value: `When ${w.trigger}`, wide: true },
    { key: "status", label: "Status", value: <Badge variant="secondary" className={w.status === "on" ? "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200" : ""}>{w.status === "on" ? "On" : "Off"}</Badge>, under: `${w.statusChangedBy}, ${ago(w.statusChangedOn)}` },
    { key: "owner", label: "Owner", value: w.owner, under: `Told when it errors: ${w.owner}` },
    { key: "ceiling", label: "Credit ceiling", value: <span className={cn("tabular-nums", atCeiling && "font-medium text-amber-700 dark:text-amber-400")}>{num(w.ceiling.spentToday)} of {num(w.ceiling.perDay)} today</span>, under: `${num(w.ceiling.perRun)} a run at most` },
    { key: "edited", label: "Last edited", value: `${w.editedBy}, ${day(w.editedOn)}` },
  ]

  /* ------------------------------------------------------------------------------ the sections */

  const sections: RecordSection[] = []

  if (w.sla) {
    const hours = windowHours(w.sla.windows.hot)
    sections.push({
      id: "sla", title: "The SLA",
      children: (
        <div className="space-y-2">
          <p className="text-sm">Hot: {w.sla.windows.hot} · Warm: {w.sla.windows.warm}</p>
          <p className="text-sm">
            <span className="font-medium tabular-nums">{num(w.sla.running)}</span> running against the clock now ·{" "}
            <span className={cn("font-medium tabular-nums", w.sla.breachedToday > 0 && "text-amber-700 dark:text-amber-400")}>{num(w.sla.breachedToday)}</span> breached today
          </p>
          <p className="text-sm text-muted-foreground">
            Past {w.sla.windows.hot}, reassign to the {w.sla.reassignTo} and tell the first.
          </p>
          {breached.length > 0 && (
            <ul className="text-sm">
              {breached.map(({ run, over }) => (
                <li key={run.id} data-item={run.personId} data-item-label={run.person} className="flex flex-wrap justify-between gap-2 border-t py-1.5">
                  <span className="min-w-0">
                    <button type="button" className="underline" onClick={(ev) => readPerson(run.personId, breachedIds, ev.currentTarget)}>{run.person}</button>
                    {personEdits[run.personId]?.note && <RowNote kind="person" id={run.personId} note={String(personEdits[run.personId].note)} at={personEdits[run.personId].at} />}
                  </span>
                  <span className="text-xs">
                    enrolled {clockOf(run.at)} · window {w.sla!.windows.hot} · <span className="font-medium text-amber-700 dark:text-amber-400">{over}</span> · {run.assignedTo ?? "nobody"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {/* A two-hour clock running at 23:00 is a breach nobody could have prevented, so the hours
              the clock runs in are read here and not in Settings (rule 5). */}
          <p className="pt-1 text-sm text-muted-foreground">
            Business hours {w.hours.from}–{w.hours.to}, {w.hours.days.join(", ")}, {b.timezone}. The clock {w.hours.clockPauses ? "pauses outside them" : "keeps running outside them"}; a {hours}-hour window that starts at 17:30 finishes {w.hours.clockPauses ? "the next morning" : "overnight"}.
          </p>
        </div>
      ),
    })
  }

  sections.push({
    id: "enrolment", title: "Trigger and enrolment",
    children: (
      <div className="space-y-2 text-sm">
        <p>When {w.trigger}.</p>
        <ul className="list-disc pl-4 text-muted-foreground">
          {w.enrolment.length === 0 ? <li>No filter: everybody the trigger fires for is enrolled.</li> : w.enrolment.map((f, i) => <li key={i}>{f.field} {f.op} {f.value}</li>)}
        </ul>
        <p className="tabular-nums">{num(matchNow)} people match the filter today.</p>
        <p className="text-muted-foreground">
          {w.limits.reEnrol ? "The same person can be enrolled again; the second enrolment starts at rule 1." : "The same person is enrolled once and never again."}{" "}
          The daily limit is {num(w.limits.perDay)}; past it the rest wait for tomorrow rather than being dropped.
        </p>
      </div>
    ),
  })

  sections.push({
    id: "rules", title: "Rules and actions", count: w.rules.length,
    children: (
      <div className="space-y-3">
        {/* A description list: condition then action, so the pairing survives without the layout. */}
        <dl className="space-y-2">
          {w.rules.map((r, i) => (
            <div key={r.id} id={r.id} className="border-t pt-2 first:border-t-0 first:pt-0">
              <dt className="text-sm font-medium">Rule {i + 1} · If {r.condition.toLowerCase()}</dt>
              <dd className="text-sm text-muted-foreground">then {r.action} — {r.config}</dd>
            </div>
          ))}
        </dl>

        {w.routing && (
          <p className="text-sm">
            {sentence(w.routing.kind === "round-robin" ? "round robin" : w.routing.kind)} across {w.routing.pool.length} reps
            {away.length > 0 && (
              <> · {away.length} away until {away.map((u) => day((u.availability as { awayUntil: string }).awayUntil)).join(" and ")} · {w.routing.skipAway ? "skipped" : "still in the rotation"}</>
            )}
            {away.length === 0 && " · nobody away"}
            <span className="block text-xs text-muted-foreground">{w.routing.pool.join(", ")}</span>
          </p>
        )}

        {territory && (
          <p className="text-sm text-muted-foreground">
            Named accounts route to their owner — {num(territory.accounts)} accounts, set by {territory.owner} in Settings › Team and access › Territories.
            {session.role !== "admin" && " Territories are the admin's area; the rule is stated here so you do not have to open it."}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => {
            patch({ routing: w.routing ? { ...w.routing, skipAway: !w.routing.skipAway } : null, editedBy: session.user, editedOn: TODAY })
            const text = `${session.user} changed the routing on ${w.name}: anyone away is now ${w.routing?.skipAway ? "kept in" : "skipped in"} the rotation.`
            setAnnouncement(text)
            toast(`Saved · routing. ${w.routing?.pool.length ?? 0} people were told.`)
          }}>
            {w.routing?.skipAway ? "Keep people who are away in the rotation" : "Skip people who are away"}
          </Button>
        </div>
        {announcement && <Announcement text={`${announcement} Told today; the line expires in seven days.`} href={href("/ollopa")} />}
      </div>
    ),
  })

  sections.push({
    id: "ceiling", title: "The credit ceiling",
    children: (
      <div className="space-y-2">
        <p className={cn("text-sm tabular-nums", atCeiling && "font-medium text-amber-700 dark:text-amber-400")}>
          {num(w.ceiling.perDay)} a day · {num(w.ceiling.spentToday)} used{atCeiling ? " · reached" : ""} · at most {num(w.ceiling.perRun)} a run
        </p>
        <p className="text-sm text-muted-foreground">
          At the ceiling, enrichment stops. People are still enrolled and still routed, marked “not enriched — daily ceiling reached”. No silent spend and no silent loss.
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <Label htmlFor="wf-ceiling" className="text-xs">Raise the ceiling to</Label>
            <Input id="wf-ceiling" type="number" min={w.ceiling.perDay} className="mt-1 w-28" value={newCeiling} onChange={(e) => setNewCeiling(e.target.value)} placeholder={String(w.ceiling.perDay)} />
          </div>
          <Button size="sm" disabled={!newCeiling || Number(newCeiling) <= w.ceiling.perDay} onClick={() => {
            patch({ ceiling: { ...w.ceiling, perDay: Number(newCeiling) }, editedBy: session.user, editedOn: TODAY })
            toast(`Ceiling raised to ${num(Number(newCeiling))} credits a day · ${num(w.ceiling.spentToday)} used today.`)
            setNewCeiling("")
          }}>Raise the ceiling</Button>
        </div>
      </div>
    ),
  })

  sections.push({
    id: "suppression", title: "People this workflow never touches", count: w.suppress.length,
    children: <ul className="list-disc pl-4 text-sm text-muted-foreground">{w.suppress.map((s) => <li key={s}>{s}</li>)}</ul>,
  })

  sections.push({
    id: "turn-on", title: "Test and turn on",
    children: (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">“Test on one record” runs the rules against a person and prints what it would do. It spends nothing, writes nothing and sends nothing.</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => { setTested(false); setTestOpen(true) }}>Test on one record</Button>
          <Button size="sm" onClick={() => {
            patch({ status: w.status === "on" ? "off" : "on", statusChangedBy: session.user, statusChangedOn: TODAY })
            toast(w.status === "on"
              ? `${w.name} stops enrolling. The ${num(w.sla?.running ?? 0)} people already running finish their steps.`
              : `${w.name} is on. ${num(matchNow)} people match the filter today; the daily limit is ${num(w.limits.perDay)}, so the rest wait.`)
          }}>{w.status === "on" ? "Turn off" : "Turn on"}</Button>
        </div>
        <p className="text-sm">
          {w.status === "on"
            ? <>Turning off stops enrolling. The {num(w.sla?.running ?? 0)} people already running finish their steps.</>
            : <>Turns on now. {num(matchNow)} people match the filter today; the daily limit is {num(w.limits.perDay)}, so the rest wait.</>}
        </p>
      </div>
    ),
  })

  /* --------------------------------------------------- D-wf-runs: one door, two named sections */

  const reasons = [...new Set(exceptions.map((r) => r.reason ?? ""))].filter(Boolean)
  const reps = [...new Set(enrolled.map((r) => r.assignedTo ?? "").filter(Boolean))]
  const runNeedle = runQ.trim().toLowerCase()
  const keep = (r: { ruleId: string | null; assignedTo: string | null; reason: string | null; at: string; person: string }) => {
    if (filterRule !== "all" && r.ruleId !== filterRule) return false
    if (filterRep !== "all" && r.assignedTo !== filterRep) return false
    if (filterReason !== "all" && r.reason !== filterReason) return false
    if (filterDate !== "all" && r.at.slice(0, 10) !== filterDate) return false
    if (runNeedle && !r.person.toLowerCase().includes(runNeedle)) return false
    return true
  }
  const shownEnrolled = enrolled.filter(keep).slice(0, 40)
  const shownExceptions = exceptions.filter(keep)
  const enrolledIds = shownEnrolled.map((r) => r.personId)
  const exceptionIds = shownExceptions.map((r) => r.personId)

  const doors: RecordDoor[] = [{
    id: RUNS_DOOR,
    label: "Run history and enrolment",
    count: runs.length,
    content: (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "Rule", value: filterRule, set: setFilterRule, options: w.rules.map((r, i) => ({ value: r.id, label: `Rule ${i + 1}` })) },
            { label: "Rep", value: filterRep, set: setFilterRep, options: reps.map((r) => ({ value: r, label: r })) },
            { label: "Reason", value: filterReason, set: setFilterReason, options: reasons.map((r) => ({ value: r, label: sentence(r) })) },
            { label: "Date", value: filterDate, set: setFilterDate, options: [...new Set(runs.map((r) => r.at.slice(0, 10)))].slice(0, 8).map((x) => ({ value: x, label: day(x) })) },
          ].map((f) => (
            <Select key={f.label} value={f.value} onValueChange={f.set}>
              <SelectTrigger className="h-7 w-32 text-xs" aria-label={f.label}><SelectValue placeholder={f.label} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{f.label}: all</SelectItem>
                {f.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          ))}
          {/* Over ten rows, so this list carries a search of its own as well as its four filters. */}
          {runs.length > 10 && (
            <Input aria-label="Find a person in the run history" placeholder="Find a person" value={runQ} onChange={(e) => setRunQ(e.target.value)} className="h-7 w-40 text-xs" />
          )}
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => toast(`${num(runs.length)} run rows exported as CSV.`)}>Export the run history</Button>
        </div>

        <section>
          <h4 className="pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Enrolled ({num(shownEnrolled.length)})</h4>
          <ul>
            {shownEnrolled.map((r) => (
              <li key={r.id} data-item={r.personId} data-item-label={r.person} className="flex flex-wrap justify-between gap-2 border-t py-1.5 text-xs">
                <span>
                  <button type="button" className="underline" onClick={(ev) => readPerson(r.personId, enrolledIds, ev.currentTarget)}>{r.person}</button>
                  {" · "}{day(r.at.slice(0, 10))} {clockOf(r.at)}
                  {personEdits[r.personId]?.note && <RowNote kind="person" id={r.personId} note={String(personEdits[r.personId].note)} at={personEdits[r.personId].at} />}
                  {r.ruleId && <> · <a className="underline" href={`#${r.ruleId}`}>rule {w.rules.findIndex((x) => x.id === r.ruleId) + 1}</a></>}
                </span>
                <span className={r.outcome === "errored" ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"}>
                  {r.outcome === "errored"
                    ? <>errored — {r.reason}</>
                    : <>created a task for {r.assignedTo} · <button type="button" className="underline" onClick={() => follow("/ollopa/tasks", from(r.personId))}>open the task</button> · {r.credits} credits</>}
                </span>
              </li>
            ))}
            {shownEnrolled.length === 0 && <li className="py-3 text-xs text-muted-foreground">Nothing matches these filters.</li>}
          </ul>
        </section>

        <section>
          <h4 className="pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Could not route ({num(shownExceptions.length)})</h4>
          <ul>
            {shownExceptions.map((r) => {
              const rule = ruleForReason(w, r.reason)
              return (
                <li key={r.id} data-item={r.personId} data-item-label={r.person} className="flex flex-wrap justify-between gap-2 border-t py-1.5 text-xs">
                  <span>
                    <button type="button" className="underline" onClick={(ev) => readPerson(r.personId, exceptionIds, ev.currentTarget)}>{r.person}</button>
                    {" · "}{day(r.at.slice(0, 10))} {clockOf(r.at)}
                    {personEdits[r.personId]?.note && <RowNote kind="person" id={r.personId} note={String(personEdits[r.personId].note)} at={personEdits[r.personId].at} />}
                  </span>
                  <span>
                    {sentence(r.reason ?? "no rule matched")} ·{" "}
                    {rule.ruleId ? <a className="underline" href={`#${rule.ruleId}`}>{rule.label}</a> : <span className="text-muted-foreground">{rule.label}</span>}
                  </span>
                </li>
              )
            })}
            {shownExceptions.length === 0 && <li className="py-3 text-xs text-muted-foreground">Nothing could not be routed.</li>}
          </ul>
          {shownExceptions.length > 0 && (
            <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => toast(`Retry ${num(shownExceptions.length)} · they are re-evaluated against the rules as they are now · about 0 credits`)}>
              Retry {num(shownExceptions.length)} · re-evaluated against the rules as they are now · about 0 credits
            </Button>
          )}
        </section>
      </div>
    ),
  }]

  /* -------------------------------------------------------------------------------- the render */

  const person = seed.contacts.find((c) => c.id === testPerson)

  return (
    <>
      <RecordPage
        back={{ label: "Workflows", href: href("/ollopa/workflows") }}
        title={{ value: w.name, onRename: (v) => { patch({ name: v, editedBy: session.user, editedOn: TODAY }); toast("Saved · Workflow name") } }}
        chips={<Badge variant="secondary">{w.status === "on" ? "On" : "Off"}</Badge>}
        ribbon={atCeiling ? { tone: "warning", text: `At the ceiling: ${num(w.ceiling.perDay)} a day, ${num(w.ceiling.spentToday)} used. Enrolment and routing continue; enrichment does not.` } : undefined}
        fields={fields}
        actions={{
          primary: [{
            label: w.status === "on" ? "Turn off" : "Turn on",
            onClick: () => {
              patch({ status: w.status === "on" ? "off" : "on", statusChangedBy: session.user, statusChangedOn: TODAY })
              toast(w.status === "on" ? `${w.name} stops enrolling.` : `${w.name} is on.`)
            },
            confirm: w.status === "on"
              ? `Stops enrolling. The ${num(w.sla?.running ?? 0)} people already running finish their steps.`
              : `Turns on now. ${num(matchNow)} people match the filter today; the daily limit is ${num(w.limits.perDay)}, so the rest wait.`,
          }],
          secondary: [{ label: "Test on one record", onClick: () => { setTested(false); setTestOpen(true) } }],
        }}
        main={{ kind: "sections", label: "Workflow", sections }}
        side={[
          {
            id: "what-it-costs", title: "What it costs", tone: atCeiling ? "attention" : undefined,
            children: (
              <ul className="space-y-1 text-sm">
                <li className="tabular-nums">{num(w.ceiling.spentToday)} of {num(w.ceiling.perDay)} credits used today</li>
                <li className="tabular-nums">{num(w.ceiling.perRun)} credits a run at most</li>
                <li className="text-xs text-muted-foreground">At the ceiling: enrichment stops, routing continues.</li>
              </ul>
            ),
          },
          {
            id: "exceptions", title: "Could not route", count: exceptions.length,
            tone: exceptions.length > 0 ? "attention" : undefined,
            children: exceptions.length === 0
              ? <p className="text-sm text-muted-foreground">Everything reached somebody.</p>
              : (
                <div className="space-y-2">
                  <p className="text-sm">{num(exceptions.length)} records reached nobody. The reason is on every row.</p>
                  <Button size="sm" variant="outline" onClick={showRuns}>Open the run history</Button>
                </div>
              ),
          },
          {
            id: "edits", title: "What changed", count: seed.workflowEdits.filter((e) => e.workflowId === w.id).length,
            children: (
              <ul className="space-y-1 text-xs">
                {seed.workflowEdits.filter((e) => e.workflowId === w.id).map((e) => (
                  <li key={e.id} className="flex justify-between gap-2"><span>{e.what}</span><span className="tabular-nums text-muted-foreground">{e.by.split(" ")[0]}, {day(e.at)}</span></li>
                ))}
              </ul>
            ),
          },
        ]}
        doors={doors}
        shortcuts={[
          { keys: "E", label: "Run history and enrolment", run: showRuns },
          { keys: "T", label: "Test on one record", run: () => { setTested(false); setTestOpen(true) } },
        ]}
      />

      {/* A test that really is a test: it prints what it would do and does none of it. */}
      <Panel id="workflow-test" title="Test on one record" open={testOpen} onOpenChange={setTestOpen}
        footer={<Button className="w-full" onClick={() => { setTested(true); toast("Tested. Nothing was written, nothing was sent, no credits were spent.") }}>Run the test</Button>}
      >
        <div className="space-y-3">
          <div>
            <Label htmlFor="test-person" className="text-xs">Person</Label>
            <Select value={testPerson} onValueChange={(v) => { setTestPerson(v); setTested(false) }}>
              <SelectTrigger id="test-person" className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{seed.contacts.slice(0, 20).map((c) => <SelectItem key={c.id} value={c.id}>{c.name} · {c.company}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">Spends nothing, writes nothing, sends nothing.</p>
          {tested && person && (
            <ol className="space-y-2 border-t pt-3 text-sm">
              <li>
                <span className="font-medium">Enrolment</span>
                <p className="text-xs text-muted-foreground">
                  {w.enrolment.every((f) => matches(person, f)) ? `${person.name} matches every filter and would be enrolled.` : `${person.name} does not match the filter and would not be enrolled.`}
                </p>
              </li>
              {w.rules.map((r, i) => (
                <li key={r.id}>
                  <span className="font-medium">Rule {i + 1}</span>
                  <p className="text-xs text-muted-foreground">
                    If {r.condition.toLowerCase()} → would {r.action} — {r.config}.
                    {i === 0 && w.routing && ` It would go to ${w.routing.pool[0]}${away.length ? `, skipping ${away.map((u) => u.name).join(" and ")}` : ""}.`}
                  </p>
                </li>
              ))}
              <li className="text-xs text-muted-foreground">Nothing above happened. No credits were spent.</li>
            </ol>
          )}
        </div>
      </Panel>
    </>
  )
}
