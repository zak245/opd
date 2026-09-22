// The token sheet at `#/design`: every colour that means something, with its name, in one place.
//
// It is a reference for the people building the product, not a page of the product — which is why
// it lives in `src/site` and not in `src/ollopa`. Nothing here invents a value: every swatch reads
// the same CSS variable the product reads, so the sheet cannot drift from what ships.
// `node scripts/contrast.mjs` is the other half of this page: it proves every pair below.
import { useEffect, useState, type ReactNode } from "react"
import { applyTheme, setTheme, theme as currentTheme, type Theme } from "@/ollopa/session"
import { FAMILIES, STATUSES, type Family, type Status } from "@/ollopa/identity"
import { FamilyIcon } from "@/ollopa/ui/Identity"

function Swatch({ name, value, ink, note }: { name: string; value: string; ink?: string; note?: string }) {
  return (
    <div className="min-w-0">
      <div
        className="flex h-14 items-end rounded-md border p-2"
        style={{ backgroundColor: value, color: ink ?? "var(--foreground)" }}
      >
        {note && <span className="t-small font-medium">{note}</span>}
      </div>
      <div className="t-small mt-1 truncate font-mono text-muted-foreground">{name}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="t-section">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export function Tokens() {
  const [, redraw] = useState(0)
  useEffect(() => { applyTheme() }, [])
  const families = Object.keys(FAMILIES) as Family[]
  const statuses = Object.keys(STATUSES) as Status[]
  const t = currentTheme()
  return (
    <main className="surface-page min-h-screen px-6 py-8 text-foreground">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="t-title">The tokens</h1>
          <div className="t-small flex items-center gap-2">
            {(["light", "dark", "system"] as Theme[]).map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => { setTheme(x); redraw((n) => n + 1) }}
                className="rounded-md border px-2 py-1"
                style={x === t ? { backgroundColor: "var(--brand-tint)", color: "var(--brand-ink)" } : undefined}
              >
                {x}
              </button>
            ))}
          </div>
        </div>
        <p className="t-body mt-2 max-w-2xl text-muted-foreground">
          Colour has five jobs here and nothing else may use colour: structure, the accent, six object
          families, five statuses, and nothing. Both themes come from one set of names.
        </p>

        <Section title="Structure — warm neutrals, most of every screen">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Swatch name="--surface-page" value="var(--surface-page)" note="page" />
            <Swatch name="--surface-raised" value="var(--surface-raised)" note="raised" />
            <Swatch name="--surface-overlay" value="var(--surface-overlay)" note="overlay" />
            <Swatch name="--muted" value="var(--muted)" note="muted" />
            <Swatch name="--foreground" value="var(--foreground)" ink="var(--surface-page)" note="body text" />
            <Swatch name="--muted-foreground" value="var(--muted-foreground)" ink="var(--surface-page)" note="muted text" />
            <Swatch name="--border" value="var(--border)" note="divider" />
            <Swatch name="--input" value="var(--input)" ink="var(--surface-page)" note="control edge" />
          </div>
        </Section>

        <Section title="The accent — act here, and you are here">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Swatch name="--brand" value="var(--brand)" ink="var(--primary-foreground)" note="primary fill" />
            <Swatch name="--brand-tint" value="var(--brand-tint)" ink="var(--brand-ink)" note="active item" />
            <Swatch name="--brand-ink" value="var(--brand-ink)" ink="var(--surface-page)" note="links" />
            <Swatch name="--ring" value="var(--ring)" ink="var(--surface-page)" note="focus ring" />
          </div>
        </Section>

        <Section title="Six object families — always with their icon, never a large fill">
          <div className="grid gap-3 sm:grid-cols-2">
            {families.map((f) => {
              const look = FAMILIES[f]
              return (
                <div key={f} className="surface-raised flex items-center gap-3 rounded-md border p-3">
                  <div aria-hidden="true" className="h-10 w-[3px] rounded-full" style={{ backgroundColor: look.fill }} />
                  <FamilyIcon of={f} size="header" />
                  <div className="min-w-0 flex-1">
                    <div className="t-label">{look.name}</div>
                    <div className="t-small font-mono text-muted-foreground">--family-{f}</div>
                  </div>
                  <span
                    className="t-small inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium"
                    style={{ backgroundColor: look.tint, color: look.ink }}
                  >
                    <FamilyIcon of={f} tone="current" className="size-3" />
                    {look.name}
                  </span>
                </div>
              )
            })}
          </div>
        </Section>

        <Section title="Five statuses — only ever state, and always with a word">
          <div className="grid gap-3 sm:grid-cols-2">
            {statuses.map((s) => (
              <div key={s} className="surface-raised flex items-center gap-3 rounded-md border p-3">
                <div aria-hidden="true" className="size-3 shrink-0 rounded-full" style={{ backgroundColor: `var(--${s})` }} />
                <div className="min-w-0 flex-1">
                  <div className="t-label capitalize">{s}</div>
                  <div className="t-small font-mono text-muted-foreground">--{s}-tint · --{s}-ink</div>
                </div>
                <span
                  className="t-small rounded-md px-1.5 py-0.5 font-medium capitalize"
                  style={{ backgroundColor: STATUSES[s].tint, color: STATUSES[s].ink }}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Five type sizes and no others">
          <div className="surface-raised space-y-2 rounded-md border p-4">
            <p className="t-title">Title · 24 · 600</p>
            <p className="t-section">Section and record title · 18 · 600</p>
            <p className="t-body">Body · 14 · 400 · 1,234,567 tabular</p>
            <p className="t-label">Label · 13 · 500</p>
            <p className="t-small">Small · 12 · 400</p>
          </div>
        </Section>
      </div>
    </main>
  )
}
