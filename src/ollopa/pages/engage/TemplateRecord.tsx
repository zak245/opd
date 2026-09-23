// The template or snippet (`R-template`).
//
// Level one is the copy and who else receives an edit to it. "Used by 4 steps and 1 campaign" is a
// section and not a door, because a person about to change shared copy has to see who else it reaches
// before they change it (rule 5 and rule 7). The nested snippets are named and linked rather than
// flattened into the body, so what is not theirs to change here says so.
import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { href, navigate } from "@/app/router"
import { Actions, type Action } from "../../ui/Actions"
import { EmptyState } from "../../ui/EmptyState"
import { seedFor } from "../../data/seed"
import type { Session } from "../../session"
import { copyRows, usedByLine } from "./Templates"
import { engage } from "./store"
import { RecordPage } from "../../templates/RecordPage"
import { Chip } from "../../ui/Identity"
import { BesideLink, FollowLink, ago, day, h1Of, n, toast } from "./shared"

/** A related list stops needing a jump to find something once it has a search in it (rule 4). */
const SEARCH_OVER = 10

const VARIABLES = ["{{first_name}}", "{{company}}", "{{title}}", "{{signal}}", "{{owner}}"]

export function TemplateRecord({ session, id }: { session: Session; id?: string }) {
  const seed = seedFor(session.business)
  const rows = useMemo(() => copyRows(session.business), [session.business])
  const row = rows.find((r) => r.id === id) ?? rows[0]

  const [subject, setSubject] = useState(row?.subject ?? "")
  const [body, setBody] = useState(row?.body ?? "")
  const [who, setWho] = useState(seed.contacts[0]?.id ?? "")
  const [live, setLive] = useState<string | null>(null)
  // What else this copy reaches stays inside the template, with a search once it is a long list.
  const [usesQ, setUsesQ] = useState("")
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

  const uses: { key: string; label: string; kind: "sequence" | "template" | "campaign"; id: string; to: string }[] = [
    ...row.usedBySteps.map((s) => ({ key: s.id, label: `${s.sequenceName} · step ${s.order}`, kind: "sequence" as const, id: s.sequenceId, to: `/ollopa/sequences/${s.sequenceId}` })),
    ...row.usedByCampaigns.map((c) => ({ key: c.id, label: `${c.name} · campaign`, kind: "campaign" as const, id: c.id, to: "/ollopa/campaigns" })),
    ...row.usedByTemplates.map((t) => ({ key: t.id, label: `${t.name} · template`, kind: "template" as const, id: t.id, to: `/ollopa/templates/${t.id}` })),
  ]
  const usesNeedle = usesQ.trim().toLowerCase()
  const shownUses = usesNeedle ? uses.filter((u) => u.label.toLowerCase().includes(usesNeedle)) : uses

  /** The copy itself: the one thing this record exists to read and change. */
  const copy = (
    <div className="space-y-2">
      {isOwner ? (
        <>
          {row.kind === "Template" && (
            <>
              <Label htmlFor="tpl-subject" className="t-label">Subject</Label>
              <Input id="tpl-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </>
          )}
          <Label htmlFor="tpl-body" className="t-label">Body</Label>
          <Textarea id="tpl-body" ref={bodyRef} rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
        </>
      ) : (
        /* Not yours to change: the copy is readable and the edit controls are absent, not greyed. */
        <div>
          {row.kind === "Template" && <p className="t-body font-medium">{subject || "No subject"}</p>}
          <p className="mt-1 whitespace-pre-wrap text-sm">{body}</p>
        </div>
      )}

      {row.snippetIds.length > 0 && (
        <div>
          <p className="t-label">Snippets this template nests</p>
          <ul className="mt-1 space-y-1 text-xs">
            {row.snippetIds.map((sid) => {
              const sn = seed.snippets.find((x) => x.id === sid)
              if (!sn) return null
              return (
                <li key={sid}>
                  <BesideLink className="underline" kind="template" id={sn.id}>{sn.name}</BesideLink>
                  <span className="text-muted-foreground"> · {sn.owner}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {isOwner && (
        <div data-print-hide>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button size="sm" variant="outline">Insert variable</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {VARIABLES.map((v) => <DropdownMenuItem key={v} onSelect={() => insert(v)}>{v}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      {!isOwner && <p className="t-small text-muted-foreground">Owned by {row.owner}; only the owner and RevOps admins change it.</p>}
    </div>
  )

  /** Who else receives an edit to this copy: a section, never a door (rule 5 and rule 7). */
  const usedBy = (
    uses.length === 0
      ? <p className="t-body text-muted-foreground">Nothing uses this yet.</p>
      : shownUses.length === 0
        ? <p className="t-body text-muted-foreground">Nothing that uses this matches "{usesQ}".</p>
        : (
          <ul className="divide-y text-sm">
            {shownUses.map((u) => (
              <li key={u.key} className="py-2">
                {/* A look beside, so the copy being edited stays on screen. A campaign has no pane
                    of its own, so that one is a page move that keeps the trail. */}
                {u.kind === "campaign"
                  ? <FollowLink className="hover:underline" to={u.to} route={`/ollopa/templates/${row.id}`} title={h1Of("templates", row.name)} anchor={u.key}>{u.label}</FollowLink>
                  : <BesideLink className="hover:underline" kind={u.kind} id={u.id}>{u.label}</BesideLink>}
              </li>
            ))}
          </ul>
        )
  )

  return (
    <>
    <RecordPage
      family="templates"
      back={{ label: "Templates and snippets", href: href("/ollopa/templates") }}
      title={{ value: row.name }}
      chips={<>
        <Chip family="templates" icon={false}>{row.kind}</Chip>
        <Chip family="neutral" icon={false}>{row.folder}</Chip>
      </>}
      fields={[
        { key: "owner", label: "Owner", value: row.owner },
        { key: "updated", label: "Updated", value: row.updated ? day(row.updated) : "—" },
        { key: "lastUsed", label: "Last used", value: row.lastUsed ? ago(row.lastUsed) : "never" },
        { key: "usedBy", label: "Used by", value: usedByLine(row) },
      ]}
      actions={{ primary: [], secondary: [] }}
      headerActions={isOwner ? (
        <Actions
          surface="page"
          items={[
            // The count is on Save itself, because "Save" alone would mislead about how far the
            // edit reaches — reason three of DESIGN.md §3, and a label, not a sentence.
            { kind: "primary", label: row.usedBySteps.length ? `Save · ${n(row.usedBySteps.length)} linked ${row.usedBySteps.length === 1 ? "step" : "steps"}` : "Save", onClick: save },
            { kind: "secondary", label: "Cancel", onClick: () => { setSubject(row.subject); setBody(row.body) } },
            {
              kind: "destructive",
              label: "Archive",
              onClick: () => say(`${row.name} archived`),
              irreversible: {
                title: `Archive ${row.name}?`,
                consequence: row.usedBySteps.length
                  ? `${n(row.usedBySteps.length)} linked ${row.usedBySteps.length === 1 ? "step keeps" : "steps keep"} the text they have today. Nothing changes for anyone in a sequence.`
                  : "Nothing uses this today.",
                confirmLabel: "Archive the template",
              },
            },
          ] as Action[]}
        />
      ) : undefined}
      main={{
        kind: "sections",
        sections: [
          { id: "tpl-copy", title: row.kind === "Template" ? "The email" : "The snippet", children: copy },
          {
            id: "tpl-used-by",
            title: `Used by ${usedByLine(row)}`,
            action: uses.length > SEARCH_OVER
              ? <Input
                  data-page-search aria-label="Find something that uses this" placeholder="Find one of these"
                  className="h-8 w-48" value={usesQ} onChange={(e) => setUsesQ(e.target.value)}
                />
              : undefined,
            children: usedBy,
          },
        ],
      }}
      side={[
        {
          id: "tpl-preview",
          title: "Preview on a real contact",
          children: (
            <>
              <Select value={who} onValueChange={setWho}>
                <SelectTrigger className="w-full" aria-label="Preview for"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {seed.contacts.slice(0, 40).map((c) => <SelectItem key={c.id} value={c.id}>{c.name} · {c.company}</SelectItem>)}
                </SelectContent>
              </Select>
              {unfilled.length > 0 && (
                <p className="t-small mt-2" style={{ color: "var(--warning-ink)" }}>
                  {n(unfilled.length)} {unfilled.length === 1 ? "variable has" : "variables have"} no value for {person?.name}: {unfilled.join(", ")}
                </p>
              )}
              <div className="mt-2">
                {row.kind === "Template" && <p className="t-body font-medium">{render(subject) || "No subject"}</p>}
                <p className="mt-1 whitespace-pre-wrap text-sm">{render(body)}</p>
              </div>
            </>
          ),
        },
        {
          id: "tpl-test",
          title: "Send a test to me",
          children: (
            <Actions
              surface="card"
              items={[{
                kind: "secondary",
                label: "Send a test",
                onClick: () => say(`Test sent to ${mailboxOf(session)}`),
                cost: "1 email",
                consequence: `To ${mailboxOf(session)}, nobody else`,
              }]}
            />
          ),
        },
      ]}
      doors={[]}
    />
    <p className="sr-only" role="status" aria-live="polite">{live}</p>
    </>
  )
}

function mailboxOf(session: Session): string {
  const seed = seedFor(session.business)
  return seed.mailboxes.find((m) => m.owner === session.user)?.address
    ?? seed.users.find((u) => u.name === session.user)?.mailbox
    ?? "your own address"
}
