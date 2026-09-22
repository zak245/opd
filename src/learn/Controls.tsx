// Controls: back, next, play, compare 0 ⇄ last, trace changes, slow motion. Every one is a real
// button or a real switch, so the keyboard reaches all of them without a special mode.
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export interface ControlProps {
  step: number
  count: number
  playing: boolean
  trace: boolean
  slow: boolean
  onGo: (n: number) => void
  onPlay: () => void
  onTrace: (on: boolean) => void
  onSlow: (on: boolean) => void
  compact?: boolean
}

export function Controls(p: ControlProps) {
  const last = p.count - 1
  return (
    <div className={cn(p.compact ? "flex items-center gap-1.5" : "space-y-2")}>
      <div className="flex flex-wrap items-center gap-1.5">
        <Button variant="outline" size="sm" disabled={p.step === 0} onClick={() => p.onGo(p.step - 1)}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
        <Button size="sm" disabled={p.step === last} onClick={() => p.onGo(p.step + 1)}>
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
        <Button variant="outline" size="sm" onClick={p.onPlay} aria-pressed={p.playing}>
          {p.playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
          {p.playing ? "Pause" : "Play"}
        </Button>
        {!p.compact && (
          <Button variant="outline" size="sm" onClick={() => p.onGo(p.step === 0 ? last : 0)}>
            Compare 0 ⇄ {last}
          </Button>
        )}
      </div>

      {!p.compact && (
        <>
          <p className="t-small text-muted-foreground">← → to step · space to play</p>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs">
              <Switch checked={p.trace} onCheckedChange={p.onTrace} aria-label="Trace changes" />
              Trace changes
            </label>
            <label className="flex items-center gap-2 text-xs">
              <Switch checked={p.slow} onCheckedChange={p.onSlow} aria-label="Slow motion" />
              Slow motion (2×)
            </label>
          </div>
          <div className="space-y-0.5 t-small text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-2 w-3.5 rounded-xs border border-dashed" style={{ borderColor: "var(--lesson-ghost)", background: "var(--lesson-ghost-soft)" }} />
              <span>where it was, and where it went</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span aria-hidden="true" className="inline-block h-2 w-3.5 rounded-xs" style={{ background: "var(--lesson-accent-soft)", boxShadow: "0 0 0 1.5px var(--lesson-accent)" }} />
              <span>where it is now</span>
            </div>
            <div>Only real moves are marked: a change of place, or a change of order.</div>
          </div>
        </>
      )}
    </div>
  )
}
