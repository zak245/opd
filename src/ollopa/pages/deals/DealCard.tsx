// One card on the board: what the deal is worth, when it closes, and what has to happen next.
//
// Those three are never behind anything. The warnings are text chips carrying the observed number
// against the threshold set in Settings, because "Stale" on its own tells an AE nothing she can act
// on. What else the card shows — the owner, the forecast category, the touch pair — is asked of the
// usage model by the board and arrives here as flags; this file decides nothing about levels.
import { useEffect, useRef, useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { href } from "@/app/router"
import { TODAY, type Deal, type DealStage, type DealWarning, type ForecastCategory } from "../../data/seed"
import { day, daysBetween } from "../deal/format"
import { FORECAST_CATEGORIES_UI, WON_STAGE, moneyShort } from "./pipeline"

/** "No activity · 19d of 14", "Overdue · 3d", "No senior sponsor". The number and its threshold travel together. */
export function chipText(w: DealWarning): string {
  if (w.kind === "Overdue") return `Overdue · ${daysBetween(w.observed)}d`
  if (w.kind === "No senior sponsor") return w.kind
  const days = /^(\d+) days$/.exec(w.observed)
  if (days) return `${w.kind} · ${days[1]}d of ${w.threshold.replace(" days", "")}`
  return `${w.kind} · ${w.observed} of ${w.threshold}`
}

export interface CardFlags {
  owner: boolean
  forecast: boolean
  touch: boolean
  sync: boolean
  daysInStage: boolean
  compact: boolean
}

export interface DealCardProps {
  deal: Deal
  warnings: DealWarning[]
  flags: CardFlags
  currency: string
  /** The owner or an admin may change it; anyone else reads it and comments (RULES.md, three gaps). */
  canEdit: boolean
  owners: string[]
  stages: DealStage[]
  selected: boolean
  /** Picked up with Space and waiting for a column, in the ARIA drag pattern. */
  carrying: boolean
  /** What the board said when a move was refused, printed on the card that refused it. */
  refusal: string | null
  editingNextStep: boolean
  onEditingNextStep: (open: boolean) => void
  onSelect: (on: boolean) => void
  onGlance: () => void
  onOpen: () => void
  onMove: (stage: DealStage) => void
  onPatch: (patch: Partial<Deal>, said: string) => void
  onCloseWon: () => void
  onMarkLost: () => void
  onReopen: () => void
  onLog: () => void
  onOpenCompany: () => void
  onUseProposal: () => void
  onDismissProposal: () => void
  onFocus: () => void
}

/** Click to edit, Enter saves, Escape cancels. Never hover-only: it is a button until it is a field. */
function InlineValue({ label, value, type, canEdit, onSave, className }: {
  label: string; value: string; type: "number" | "date"; canEdit: boolean
  onSave: (v: string) => void; className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  useEffect(() => { setDraft(value) }, [value])
  if (!canEdit) return <span className={className}>{label}</span>
  if (!editing) {
    return (
      <button type="button" className={cn("rounded px-1 -mx-1 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", className)}
        onClick={(e) => { e.stopPropagation(); setEditing(true) }}>
        {label}
      </button>
    )
  }
  return (
    <Input
      autoFocus
      type={type}
      aria-label={type === "number" ? "Amount" : "Close date"}
      value={draft}
      className="h-7 w-32 px-1 py-0 text-xs"
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === "Enter") { setEditing(false); onSave(draft) }
        if (e.key === "Escape") { setEditing(false); setDraft(value) }
      }}
      onBlur={() => { setEditing(false); setDraft(value) }}
    />
  )
}

/** One control with two fields. A next step with no date is not a next step, so neither saves alone. */
function NextStepEditor({ deal, onSave, onCancel }: { deal: Deal; onSave: (text: string, due: string) => void; onCancel: () => void }) {
  const [text, setText] = useState(deal.nextStep ?? "")
  const [due, setDue] = useState(deal.nextStepDue ?? TODAY)
  const ok = text.trim().length > 0 && due.length === 10
  return (
    <div className="grid gap-1.5 rounded-md border bg-muted/30 p-2" onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Escape") onCancel(); if (e.key === "Enter" && ok) onSave(text.trim(), due) }}>
      <Input autoFocus aria-label="Next step" value={text} placeholder="What has to happen next" className="h-7 px-1.5 py-0 text-xs"
        onChange={(e) => setText(e.target.value)} />
      <div className="flex items-center gap-1.5">
        <Input aria-label="Next step date" type="date" value={due} className="h-7 w-36 px-1 py-0 text-xs" onChange={(e) => setDue(e.target.value)} />
        <Button size="sm" className="h-7 px-2 text-xs" disabled={!ok} onClick={() => onSave(text.trim(), due)}>Save</Button>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={onCancel}>Cancel</Button>
      </div>
      <p className="text-[11px] text-muted-foreground">The step and its date are saved together.</p>
    </div>
  )
}

export function DealCard(p: DealCardProps) {
  const { deal, flags } = p
  const menuButton = useRef<HTMLButtonElement>(null)
  const closed = deal.stage === WON_STAGE
  const initials = deal.owner.split(" ").map((w) => w[0]).join("").slice(0, 2)

  return (
    <li
      data-card-id={deal.id}
      tabIndex={0}
      draggable={p.canEdit && !closed}
      aria-grabbed={p.carrying || undefined}
      aria-label={`${deal.name}, ${moneyShort(deal.amount, deal.currency || p.currency)}, ${deal.stage}`}
      onFocus={p.onFocus}
      onDragStart={(e) => { e.dataTransfer.setData("text/plain", deal.id); e.dataTransfer.effectAllowed = "move" }}
      onClick={() => p.onGlance()}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return
        if (e.key === "Enter") { e.preventDefault(); p.onOpen() }
        // Space is the page's: it is the same key for picking up and for dropping, and only the page
        // knows whether something is already in the air (the ARIA drag pattern).
        if (e.key.toLowerCase() === "m") { e.preventDefault(); menuButton.current?.click() }
        if (e.key.toLowerCase() === "e") { e.preventDefault(); if (p.canEdit) p.onEditingNextStep(true) }
      }}
      className={cn(
        "group cursor-pointer rounded-lg border bg-background text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        flags.compact ? "space-y-1 p-2" : "space-y-1.5 p-2.5",
        p.carrying && "ring-2 ring-ring",
        p.selected && "border-foreground",
      )}
    >
      <div className="flex items-start gap-2">
        <span onClick={(e) => e.stopPropagation()} className="pt-0.5">
          <Checkbox checked={p.selected} aria-label={`Select ${deal.name}`} onCheckedChange={(v) => p.onSelect(Boolean(v))} />
        </span>
        <div className="min-w-0 flex-1">
          <a
            href={href(`/ollopa/deals/${deal.id}`)}
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); p.onOpen() }}
            className="font-medium hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {deal.name}
          </a>
          {/* The company opens its own record, which is where the rest of the account lives. */}
          <button type="button" className="block max-w-full truncate text-left text-xs text-muted-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={(e) => { e.stopPropagation(); p.onOpenCompany() }}>
            {deal.company}
          </button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              ref={menuButton}
              size="icon"
              variant="ghost"
              className="size-6 shrink-0 opacity-60 group-hover:opacity-100 group-focus-within:opacity-100"
              aria-label={`Actions for ${deal.name}: open, next step, log, owner, forecast, move, close won, mark lost`}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          {/* Flat: a list of actions and two radio groups. No sub-menu, because a menu inside a menu is the third level. */}
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem onSelect={p.onOpen}>Open the deal record</DropdownMenuItem>
            {p.canEdit && <DropdownMenuItem onSelect={() => p.onEditingNextStep(true)}>Edit next step <span className="ml-auto text-xs text-muted-foreground">E</span></DropdownMenuItem>}
            <DropdownMenuItem onSelect={p.onLog}>Log a call or note</DropdownMenuItem>
            {p.canEdit && !closed && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Move to</DropdownMenuLabel>
                {p.stages.filter((s) => s !== deal.stage).map((s) => (
                  <DropdownMenuItem key={s} onSelect={() => (s === WON_STAGE ? p.onCloseWon() : p.onMove(s))}>{s}</DropdownMenuItem>
                ))}
              </>
            )}
            {p.canEdit && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Forecast category</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={deal.forecast} onValueChange={(v) => p.onPatch({ forecast: v as ForecastCategory }, `Forecast category · ${deal.name} → ${v}`)}>
                  {FORECAST_CATEGORIES_UI.map((f) => <DropdownMenuRadioItem key={f} value={f}>{f}</DropdownMenuRadioItem>)}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Owner</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={deal.owner} onValueChange={(v) => p.onPatch({ owner: v }, `${deal.name} now belongs to ${v}`)}>
                  {p.owners.map((o) => <DropdownMenuRadioItem key={o} value={o}>{o}</DropdownMenuRadioItem>)}
                </DropdownMenuRadioGroup>
              </>
            )}
            {p.canEdit && (
              <>
                <DropdownMenuSeparator />
                {closed
                  ? <DropdownMenuItem onSelect={p.onReopen}>Reopen this deal</DropdownMenuItem>
                  : <>
                      <DropdownMenuItem onSelect={p.onCloseWon}>Close won…</DropdownMenuItem>
                      <DropdownMenuItem onSelect={p.onMarkLost}>Mark lost and archive…</DropdownMenuItem>
                    </>}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* What it is worth and when it closes: never edited apart, never hidden. */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs">
        <span className="font-medium tabular-nums text-foreground">
          <InlineValue
            label={moneyShort(deal.amount, deal.currency || p.currency)}
            value={String(deal.amount)}
            type="number"
            canEdit={p.canEdit}
            onSave={(v) => p.onPatch({ amount: Number(v) || deal.amount }, `Amount · ${deal.name} → ${moneyShort(Number(v) || deal.amount, deal.currency || p.currency)}`)}
          />
          {deal.currency !== p.currency && <span className="ml-1 font-normal text-muted-foreground">{deal.currency}</span>}
        </span>
        <span className={cn("tabular-nums", deal.closeDate < TODAY && !closed ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>
          <InlineValue
            label={`Closes ${day(deal.closeDate)}`}
            value={deal.closeDate}
            type="date"
            canEdit={p.canEdit}
            onSave={(v) => p.onPatch({ closeDate: v }, `Close date · ${deal.name} → ${day(v)}`)}
          />
        </span>
      </div>

      {/* The next step and its date on one line. A step without a date is a wish. */}
      {p.editingNextStep ? (
        <NextStepEditor
          deal={deal}
          onCancel={() => p.onEditingNextStep(false)}
          onSave={(text, due) => { p.onEditingNextStep(false); p.onPatch({ nextStep: text, nextStepDue: due }, `Next step · ${deal.name} · ${text} · ${day(due)}`) }}
        />
      ) : (
        <div className={cn("text-xs", deal.nextStep ? "text-foreground" : "text-amber-700 dark:text-amber-400")}>
          <span>{deal.nextStep ? `${deal.nextStep} · ${day(deal.nextStepDue)}` : "No next step"}</span>
          {p.canEdit && (
            <button type="button" className="ml-1 rounded px-1 text-muted-foreground underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              onClick={(e) => { e.stopPropagation(); p.onEditingNextStep(true) }}>
              {deal.nextStep ? "Edit" : "Set one"}
            </button>
          )}
        </div>
      )}

      {/* Text, never colour alone, and each chip prints what it observed against the threshold. */}
      {p.warnings.length > 0 && (
        <ul className="flex flex-wrap gap-1">
          {p.warnings.map((w) => (
            <li key={w.kind} className="rounded-full border border-amber-300 bg-amber-50 px-1.5 py-px text-[11px] text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
              {chipText(w)}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
        {flags.forecast && <Badge variant="secondary" className="px-1.5 py-0 font-normal">{deal.forecast}</Badge>}
        {flags.touch && (
          <span>
            Last touch {daysBetween(deal.lastActivity)}d · last reply{" "}
            {deal.lastProspectActivityAt ? `${daysBetween(deal.lastProspectActivityAt)}d` : "never"}
          </span>
        )}
        {flags.daysInStage && <span>{daysBetween(deal.stageEnteredAt)}d in {deal.stage}</span>}
        {flags.owner && <span className="ml-auto rounded-full bg-muted px-1.5 py-px font-medium text-foreground" title={deal.owner}>{initials}</span>}
      </div>

      {flags.sync && deal.syncState === "error" && (
        <p className="text-[11px] text-destructive">Not syncing to the CRM · {deal.crmError ?? "the last push failed"}</p>
      )}

      {p.refusal && <p role="status" className="text-[11px] text-amber-700 dark:text-amber-400">{p.refusal}</p>}

      {/* Brought back into view by the archived filter, carrying the reason it was lost. */}
      {deal.archivedAt && (
        <p className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          Archived {day(deal.archivedAt)} · lost on {deal.lostReason ?? "no reason given"}
          {p.canEdit && (
            <button type="button" className="underline underline-offset-2" onClick={(e) => { e.stopPropagation(); p.onReopen() }}>Reopen</button>
          )}
        </p>
      )}

      {/* A proposal waits here for the next time the AE looks at the deal. Nothing interrupts. */}
      {deal.agentProposal && (
        <div className="rounded-md border border-dashed p-2 text-xs" onClick={(e) => e.stopPropagation()}>
          <div className="text-[11px] font-medium text-muted-foreground">Proposed by the research agent</div>
          <p className="pt-0.5">{deal.agentProposal}</p>
          <p className="pt-1 text-[11px] text-muted-foreground">
            Sets the next step on this deal, due in seven days. Nothing is sent and the ledger records it either way.
          </p>
          <div className="flex gap-1.5 pt-1.5">
            <Button size="sm" className="h-7 flex-1 px-2 text-xs" disabled={!p.canEdit} onClick={p.onUseProposal}>Use this next step</Button>
            <Button size="sm" variant="outline" className="h-7 flex-1 px-2 text-xs" onClick={p.onDismissProposal}>Dismiss</Button>
          </div>
        </div>
      )}
    </li>
  )
}
