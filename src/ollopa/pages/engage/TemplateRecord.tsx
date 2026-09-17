// The template or snippet (`R-template`).
//
// Level one is the copy and who else receives an edit to it. "Used by 4 steps and 1 campaign" is a
// section and not a door, because a person about to change shared copy has to see who else it reaches
// before they change it (rule 5 and rule 7). The nested snippets are named and linked rather than
// flattened into the body, so what is not theirs to change here says so.
import { useMemo, useRef, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { href, navigate } from "@/app/router"
import { EmptyState } from "../../ui/EmptyState"
import { SectionHeader } from "../../ui/SectionHeader"
import { seedFor } from "../../data/seed"
import type { Session } from "../../session"
import { copyRows, usedByLine } from "./Templates"
import { engage } from "./store"
import { Pill, ago, day, n, toast } from "./shared"

const VARIABLES = ["{{first_name}}", "{{company}}", "{{title}}", "{{signal}}", "{{owner}}"]

export function TemplateRecord({ session, id }: { session: Session; id?: string }) {
  const seed = seedFor(session.business)
  const rows = useMemo(() => copyRows(session.business), [session.business])
  const row = rows.find((r) => r.id === id) ?? rows[0]

  const [subject, setSubject] = useState(row?.subject ?? "")
  const [body, setBody] = useState(row?.body ?? "")
  const [who, setWho] = useState(seed.contacts[0]?.id ?? "")
  const [live, setLive] = useState<string | null>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  if (!row) {
    return <div className="p-10"><EmptyState title="That template is gone" body="It may have been archived." action={<Button size="sm" onClick={() => navigate("/ollopa/templates")}>Back to Templates</Button>} /></div>
  }

  const say = (msg: string) => { setLive(msg); toast(msg) }
  const isOwner = row.owner === session.user || session.role === "admin"

  const person = seed.contacts.find((c) => c.id === who) ?? seed.contacts[0]
  const values: Record<string, string> = {
    "{{first_name}}": person?.name.split(" ")[0] ?? "",
    "{{company}}": person?.company ?? "",
    "{{title}}": person?.title ?? "",
    "{{signal}}": person?.signals[0]?.kind ?? "",
    "{{owner}}": person?.owner ?? "",
  }
  const render = (text: string) =>
    text
      .replace(/\{\{snippet:[a-z_]+\}\}/g, (m) => seed.snippets.find((s) => row.snippetIds.includes(s.id))?.body ?? m)
      .replace(/\{\{[a-z_]+\}\}/g, (m) => values[m] || m)
  const unfilled = [...new Set([...subject.matchAll(/\{\{[a-z_]+\}\}/g), ...body.matchAll(/\{\{[a-z_]+\}\}/g)].map((m) => m[0]))].filter((v) => !values[v])

  const insert = (token: string) => {
    const el = bodyRef.current
    const at = el?.selectionStart ?? body.length
    setBody(body.slice(0, at) + token + body.slice(at))
    el?.focus()
  }

  const save = () => {
    if (row.kind === "Template") engage.patchTemplate(session.business, row.id, { subject, body })
    say(`Saved · ${row.name}${row.usedBySteps.length ? ` · ${n(row.usedBySteps.length)} steps get this text` : ""}`)
  }

  const uses = [
    ...row.usedBySteps.map((s) => ({ key: s.id, label: `${s.sequenceName} · step ${s.order}`, to: `/ollopa/sequences/${s.sequenceId}` })),
    ...row.usedByCampaigns.map((c) => ({ key: c.id, label: `${c.name} · campaign`, to: `/ollopa/campaigns` })),
    ...row.usedByTemplates.map((t) => ({ key: t.id, label: `${t.name} · template`, to: `/ollopa/templates/${t.id}` })),
  ]

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b px-4 pt-4 sm:px-6">
        <a href={href("/ollopa/templates")} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline">
          <ArrowLeft className="size-3" aria-hidden="true" />Templates and snippets
        </a>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">{row.name}</h2>
          <Pill tone="muted">{row.kind}</Pill>
          <Pill tone="muted">{row.folder}</Pill>
        </div>
        <p className="pb-4 text-xs text-muted-foreground">
          {row.owner} · updated {row.updated ? day(row.updated) : "—"} · last used {row.lastUsed ? ago(row.lastUsed) : "never"}
        </p>
      </header>

      <div className="grid gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-4">
          {/* Level one: the copy itself. */}
          <div className="space-y-2">
            {isOwner ? (
              <>
                {row.kind === "Template" && (
                  <>
                    <Label htmlFor="tpl-subject" className="text-xs">Subject</Label>
                    <Input id="tpl-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                  </>
                )}
                <Label htmlFor="tpl-body" className="text-xs">Body</Label>
                <Textarea id="tpl-body" ref={bodyRef} rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
              </>
            ) : (
              /* Not yours to change: the copy is readable and the edit controls are absent, not greyed. */
              <div className="rounded-md border p-3">
                {row.kind === "Template" && <p className="text-sm font-medium">{subject || "No subject"}</p>}
                <p className="mt-1 whitespace-pre-wrap text-sm">{body}</p>
              </div>
            )}

            {row.snippetIds.length > 0 && (
              <div className="rounded-md border p-3">
                <p className="text-xs font-medium">Snippets this template nests</p>
                <ul className="mt-1 space-y-1 text-xs">
                  {row.snippetIds.map((sid) => {
                    const s = seed.snippets.find((x) => x.id === sid)
                    if (!s) return null
                    return (
                      <li key={sid}>
                        <a className="underline" href={href(`/ollopa/templates/${s.id}`)}>{s.name}</a>
                        <span className="text-muted-foreground"> · owned by {s.owner} · edit it on its own page</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {isOwner && (
              <div className="flex flex-wrap items-center gap-2" data-print-hide>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button size="sm" variant="outline">Insert variable</Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {VARIABLES.map((v) => <DropdownMenuItem key={v} onSelect={() => insert(v)}>{v}</DropdownMenuItem>)}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" onClick={save}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => { setSubject(row.subject); setBody(row.body) }}>Cancel</Button>
                {row.usedBySteps.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Saving changes the copy in {n(row.usedBySteps.length)} linked {row.usedBySteps.length === 1 ? "step" : "steps"}.
                  </span>
                )}
              </div>
            )}
            {!isOwner && <p className="text-xs text-muted-foreground">Owned by {row.owner}. You can read it and preview it; the owner and RevOps admins change it.</p>}
          </div>

          {/* A section, never a door: who else receives this edit. */}
          <section>
            <SectionHeader title={`Used by ${usedByLine(row)}`} />
            {uses.length === 0
              ? <p className="text-sm text-muted-foreground">Nothing uses this yet. Link it from a step or a campaign.</p>
              : (
                <ul className="divide-y border-t text-sm">
                  {uses.map((u) => (
                    <li key={u.key} className="py-2">
                      <a className="hover:underline" href={href(u.to)}>{u.label}</a>
                    </li>
                  ))}
                </ul>
              )}
          </section>
        </div>

        {/* Preview and the test send, beside the copy they read. */}
        <div className="space-y-3">
          <section className="rounded-lg border p-3">
            <SectionHeader title="Preview on a real contact" />
            <Select value={who} onValueChange={setWho}>
              <SelectTrigger className="w-full" aria-label="Preview for"><SelectValue /></SelectTrigger>
              <SelectContent>
                {seed.contacts.slice(0, 40).map((c) => <SelectItem key={c.id} value={c.id}>{c.name} · {c.company}</SelectItem>)}
              </SelectContent>
            </Select>
            {unfilled.length > 0 && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                {n(unfilled.length)} {unfilled.length === 1 ? "variable has" : "variables have"} no value for {person?.name}: {unfilled.join(", ")}
              </p>
            )}
            <div className="mt-2 rounded-md border p-2">
              {row.kind === "Template" && <p className="text-sm font-medium">{render(subject) || "No subject"}</p>}
              <p className="mt-1 whitespace-pre-wrap text-sm">{render(body)}</p>
            </div>
          </section>

          <section className="rounded-lg border p-3">
            <SectionHeader title="Send a test to me" />
            <p className="text-xs text-muted-foreground">
              It goes to {mailboxOf(session)} — your own address — and nobody else.
            </p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => say(`Test sent to ${mailboxOf(session)}`)}>
              Send a test to {mailboxOf(session)}
            </Button>
          </section>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{live}</p>
    </div>
  )
}

function mailboxOf(session: Session): string {
  const seed = seedFor(session.business)
  return seed.mailboxes.find((m) => m.owner === session.user)?.address
    ?? seed.users.find((u) => u.name === session.user)?.mailbox
    ?? "your own address"
}
