// The pieces both wizards share, and the small controls this folder repeats.
//
// The wizard chrome carries the rules so neither wizard has to remember them: progress in text, a step
// list that is a nav with a heading, done steps as links, a constant line under the heading saying what
// has not happened yet, descriptive buttons in the footer, and "Save and exit" on every step
// (specs/15 §3.1 "Progress and buttons", specs/18 §3.1).
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronRight, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Actions } from "../../ui/Actions"
import { Chip } from "../../ui/Identity"
import { Container } from "../../ui/Section"
import { useDoorState } from "../../ui/Door"
import { toast } from "../../templates/TablePage"

/* ------------------------------------------------------------------------------ numbers and text */

export const n = (x: number) => x.toLocaleString("en-US")

/** "about 21,300" — a first-sync count is an estimate and says so in the number, not in a footnote. */
export const about = (x: number) => {
  const step = x >= 10_000 ? 100 : x >= 1_000 ? 50 : x >= 100 ? 10 : 1
  return `about ${n(Math.max(step, Math.round(x / step) * step))}`
}

export function pct(x: number): string {
  return `${Math.round(x * 100)}%`
}

/** "about 7 in 10" — a hit rate is read as a fraction as well as a percentage (spec 18 §3.7). */
export function inTen(rate: number): string {
  return `about ${Math.max(1, Math.round(rate * 10))} in 10`
}

/* ---------------------------------------------------------------------------------- the controls */

export function Radio({ name, checked, onChange, label, hint, disabled }: {
  name: string; checked: boolean; onChange: () => void; label: ReactNode; hint?: ReactNode; disabled?: boolean
}) {
  return (
    <label className={cn(
      "bg-card t-body flex min-h-10 items-start gap-2 rounded-lg border p-3",
      checked && "border-foreground",
      disabled && "opacity-60",
    )}>
      <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onChange} className="mt-0.5" />
      <span className="min-w-0">
        <span className="block">{label}</span>
        {hint && <span className="t-small mt-0.5 block text-muted-foreground">{hint}</span>}
      </span>
    </label>
  )
}

export function Check({ checked, onChange, label, hint }: { checked: boolean; onChange: () => void; label: ReactNode; hint?: ReactNode }) {
  return (
    <label className="t-body flex min-h-10 items-start gap-2">
      <input type="checkbox" checked={checked} onChange={onChange} className="mt-1" />
      <span className="min-w-0">
        <span className="block">{label}</span>
        {hint && <span className="t-small mt-0.5 block text-muted-foreground">{hint}</span>}
      </span>
    </label>
  )
}

export function Picker({ label, value, options, onChange, hint }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; hint?: ReactNode
}) {
  return (
    <label className="t-body block">
      <span className="t-small text-muted-foreground">{label}</span>
      <select
        className="mt-1 h-10 w-full rounded-md border bg-card px-2 t-body"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {hint && <span className="t-small mt-1 block text-muted-foreground">{hint}</span>}
    </label>
  )
}

/** A line that says what a choice will do. Beside the choice, never under a door (rule 7). */
export function Consequence({ children, tone = "warning" }: { children: ReactNode; tone?: "warning" | "plain" }) {
  return (
    <p className={cn("t-small", tone === "warning" && "font-medium", tone === "plain" && "text-muted-foreground")}
      style={tone === "warning" ? { color: "var(--warning-ink)" } : undefined}>
      {children}
    </p>
  )
}

/** Code with a copy button that has a visible label and is reachable by keyboard (spec 17 §3.11). */
export function Code({ text, label = "Copy", block }: { text: string; label?: string; block?: boolean }) {
  return (
    <span className={cn("flex min-w-0 flex-wrap items-center gap-2", block && "w-full")}>
      <code className={cn("min-w-0 rounded bg-muted px-1.5 py-1 font-mono t-small break-all", block && "block w-full whitespace-pre-wrap p-3")}>{text}</code>
      <Button
        size="sm"
        variant="outline"
        className="h-7 shrink-0 px-2 t-small"
        onClick={() => { void navigator.clipboard?.writeText(text); toast(`Copied · ${text.slice(0, 40)}${text.length > 40 ? "…" : ""}`) }}
      >
        <Copy className="mr-1 size-3" aria-hidden="true" />{label}
      </Button>
    </span>
  )
}

/* ------------------------------------------------------------------------------- the step list */

export interface StepState {
  /** 1-based. */
  n: number
  name: string
  /** What the step decided, in words, once it is done: "Salesforce (production)". */
  summary?: string
  done: boolean
  /** A step that cannot be opened yet says why (step 2 must precede 3 to 5). */
  blocked?: string
}

/**
 * A step's state as the chip that carries it and the words that follow. The words are the ones the
 * wizard already used; the chip only gives them their status colour (DESIGN.md §5).
 */
function stateOf(s: StepState, current: number): { status: string; word: string; rest?: string } {
  if (s.n === current) return { status: "in progress", word: "You are here" }
  if (s.done) return { status: "done", word: "Done", rest: s.summary ?? s.name }
  if (s.blocked) return { status: "pending", word: "Blocked", rest: s.blocked }
  return { status: "none", word: "Not started" }
}

/** `tagged` marks the one copy the lesson view measures: the phone copy is the same list again. */
function StepRows({ steps, current, go, tagged }: { steps: StepState[]; current: number; go: (n: number) => void; tagged?: boolean }) {
  return (
    <ol data-container={tagged ? "connect.steps" : undefined} data-container-label={tagged ? "the step list" : undefined} className="grid gap-1">
      {steps.map((s) => {
        const state = stateOf(s, current)
        const words = (
          <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
            <Chip status={state.status}>{state.word}</Chip>
            {state.rest && <span className="t-small min-w-0 text-muted-foreground">{state.rest}</span>}
          </span>
        )
        const openable = s.n !== current && (s.done || !s.blocked)
        return (
          <li key={s.n} className="px-2 py-1.5">
            {openable ? (
              <button type="button" data-item={tagged ? `connect.steps.${s.n}` : undefined} data-item-label={`Step ${s.n}: ${s.name}`} className="block text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" onClick={() => go(s.n)}>
                <span className="t-label hover:underline">Step {s.n}: {s.name}</span>
                {words}
              </button>
            ) : (
              <span className="block" data-item={tagged ? `connect.steps.${s.n}` : undefined} data-item-label={`Step ${s.n}: ${s.name}`}>
                <span className={cn("t-label", s.n === current && "text-foreground")} aria-current={s.n === current ? "step" : undefined}>Step {s.n}: {s.name}</span>
                {words}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export interface WizardProps {
  steps: StepState[]
  current: number
  go: (n: number) => void
  /** The one line under the heading, where the step spends or cannot be undone. Otherwise nothing. */
  constantLine?: string
  /** Saved as it is made, so this only leaves the page; it never decides anything. */
  onSaveAndExit: () => void
  /** The descriptive primary button, the descriptive back link, and anything else the step needs. */
  footer: ReactNode
  children: ReactNode
}

export function Wizard({ steps, current, go, constantLine, onSaveAndExit, footer, children }: WizardProps) {
  const step = steps.find((s) => s.n === current) ?? steps[0]
  const heading = useRef<HTMLHeadingElement>(null)
  const [stepsOpen, setStepsOpen] = useState(false)

  // Focus moves to the step's heading on every step change, so a screen reader hears the progress first.
  useEffect(() => { heading.current?.focus() }, [current])

  // Cmd/Ctrl+S is Save and exit, and the button prints it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") { e.preventDefault(); onSaveAndExit() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onSaveAndExit])

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-[16rem_1fr] lg:px-6">
      {/* The step list: a nav with a heading, states in text, done steps as links. */}
      <nav aria-labelledby="wiz-steps" className="lg:sticky lg:top-4 lg:self-start">
        <h2 id="wiz-steps" className="t-small px-2 font-medium uppercase tracking-wide text-muted-foreground">
          Steps · {steps.filter((s) => s.done).length} of {steps.length} done
        </h2>
        <div className="mt-2 hidden lg:block"><StepRows steps={steps} current={current} go={go} tagged /></div>
        <div className="mt-2 lg:hidden">
          {/* The phone's way into the step list is the library's own control: a ghost Button with
              the step count as a Badge, nothing drawn by hand (DESIGN.md §4). */}
          <Button
            variant="ghost"
            className="t-label h-auto w-full justify-start gap-2 whitespace-normal px-3 py-2 text-left"
            aria-expanded={stepsOpen}
            aria-controls="wiz-steps-phone"
            onClick={() => setStepsOpen((v) => !v)}
          >
            <ChevronRight aria-hidden="true" className={cn("size-4 shrink-0 text-muted-foreground transition-transform", stepsOpen && "rotate-90")} />
            <Badge variant="secondary">{current} of {steps.length}</Badge>
            <span className="min-w-0">{step.name} · {stepsOpen ? "Hide steps" : "Show steps"}</span>
          </Button>
          <div id="wiz-steps-phone" hidden={!stepsOpen} className="mt-2">
            <StepRows steps={steps} current={current} go={go} />
          </div>
        </div>
      </nav>

      {/* One container per step: the step's name in its header, its questions in the body, the way
          on in its footer. The step list beside it stays on the canvas, because it is navigation
          rather than content (DESIGN.md §5, containment). */}
      <Container
        className="min-w-0"
        component="form"
        heading={
          <span ref={heading} tabIndex={-1} className="focus-visible:outline-none">
            Step {current} of {steps.length}: {step.name}
          </span>
        }
        footer={
          <div data-container="connect.footer" data-container-label="the footer" className="flex w-full flex-wrap items-center gap-3">
            {footer}
            <Actions className="ml-auto" surface="page" items={[{
              kind: "secondary", label: "Save and exit", onClick: onSaveAndExit, keys: "⌘S",
              dataItem: "wiz.save-exit", dataItemLabel: "Save and exit",
            }]} />
          </div>
        }
      >
        {constantLine && <p className="t-body -mt-1 mb-4 text-muted-foreground">{constantLine}</p>}
        <div className="grid gap-6 pb-2 [&>*]:min-w-0">{children}</div>
      </Container>
    </div>
  )
}

/**
 * Expand all, for a page that lays its own doors out rather than using the record template. `ids` must
 * be the same length on every render, because one door state is one hook. The shortcut is printed on
 * the button, because a shortcut nobody can see is a shortcut nobody has (spec 15 §3.5).
 */
export function ExpandDoors({ ids }: { ids: string[] }) {
  const states = ids.map((id) => useDoorState(id)) // eslint-disable-line react-hooks/rules-of-hooks
  const allOpen = states.every(([open]) => open)
  const toggle = useCallback(() => { states.forEach(([, set]) => set(!allOpen)) }, [allOpen, states])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "e") { e.preventDefault(); toggle() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toggle])
  return (
    <Button variant="ghost" size="sm" className="h-7 px-2 t-small" data-print-hide onClick={toggle}>
      {allOpen ? "Collapse all" : "Expand all"} <span className="ml-1.5 text-muted-foreground">⌘⇧E</span>
    </Button>
  )
}

/** The one confirmation shape this folder uses: it asks once and says what is lost. */
export function Confirm({ open, title, body, confirmLabel, onConfirm, onCancel }: {
  open: boolean; title: string; body: ReactNode; confirmLabel: string; onConfirm: () => void; onCancel: () => void
}) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    box.current?.querySelector<HTMLElement>("button")?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); onCancel() } }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onCancel])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div ref={box} role="dialog" aria-modal="true" aria-label={title} className="bg-popover shadow-overlay w-full max-w-md rounded-lg border p-5 shadow-lg">
        <h3 className="t-label">{title}</h3>
        <div className="t-body mt-2 text-muted-foreground">{body}</div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={onConfirm}>{confirmLabel}</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}
