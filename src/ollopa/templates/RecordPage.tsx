// The record template: the second shared template after TablePage, and the page half of the record
// pattern. The deal record is its first use; the contact, the company (an account when it is a
// customer), the brief and the detail views in Settings reuse it unchanged (specs/09 §6.8).
//
// The template decides the structure; the usage model decides what sits at level one. The rules it
// enforces, so every record inherits them:
//
//  1. A field at level 2 renders inside the "All fields" door. A field with `dependsOn` renders beside
//     its parent whatever its level, so nothing edited together is split across a door (rule 5).
//  2. A door with no content is not rendered, and a door that is open by default for this seat renders
//     open with its chevron, so it can still be closed (rule 4).
//  3. The destructive action is text with its consequence beside it, last in the row, never in a menu.
//  4. Every door is a button inside a heading with aria-expanded and aria-controls (the Door primitive).
//  5. Door state persists per user; Expand all, Collapse all and print behaviour are built in.
//  6. Row actions in cards show on hover and on focus and repeat in the row's "…" menu.
//  7. On a phone: header, the sticky action bar, side cards, main, then doors. Nothing changes level.
//  8. No usage number, source or teaching text renders anywhere.
//  9. The quick look is flat: the named fields in the order they appear here, with the same labels.
// 10. At most one tab, for a related table big enough to be its own page. Related lists are sections.
import { useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowLeft, ChevronRight, MoreHorizontal, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { back, routeKey, useTrail } from "../chain"
import { Door, DoorGroup, ExpandAll } from "../ui/Door"
import { FamilyIcon } from "../ui/Identity"
import { familyOf } from "../identity"
import { Panel } from "../ui/Panel"
import { SectionHeader } from "../ui/SectionHeader"
import type { QuickLookEditable, QuickLookField } from "./QuickLook"
import { Divider } from "../ui/Divider"


/**
 * The record's way back to its index. When the person got here from that index — a row on Sequences,
 * People, Deals — this is the same move as the crumb: `back` returns to the index as it was, with
 * the row lit and focused. Reached any other way (a deep link, ⌘K, a link from elsewhere) it is an
 * ordinary link to the index, which is what it has always been.
 */
function BackToIndex({ label, to, compact }: { label: string; to: string; compact?: boolean }) {
  const trail = useTrail()
  const at = trail.length - 1
  const returns = at >= 0 && routeKey(trail[at].route) === routeKey(to)
  const className = compact
    ? "t-small inline-flex items-center gap-1 text-muted-foreground hover:underline"
    : "t-body text-muted-foreground hover:underline"
  const body = <>{compact && <ArrowLeft className="size-3" aria-hidden="true" />}{label}</>
  return returns
    ? <button type="button" className={className} onClick={() => back(at)}>{body}</button>
    : <a href={to} className={className}>{body}</a>
}

/* ------------------------------------------------------------------------------------ the props */

export type FieldEditor = "text" | "number" | "money" | "date" | "select" | "user" | "stepper" | "readonly"

export interface RecordField {
  key: string
  label: string
  value: ReactNode
  /** Dependent values that belong to this field and never leave it: probability and forecast under stage. */
  under?: ReactNode
  group?: string
  /** Renders beside its parent whatever the usage says. */
  dependsOn?: string[]
  /** From the usage model. Level 2 fields render inside the All fields door. */
  level?: 1 | 2
  editor?: FieldEditor
  /** Click or Enter opens an editor in place; Enter saves, Escape cancels. */
  edit?: { value: string; options?: string[]; onSave: (value: string) => void }
  tone?: "warning" | "muted"
  /** The whole grid row, for a stepper or a warning strip. */
  wide?: boolean
  /** Two columns, for a pair that must stay on one line (the next step and its date). */
  span?: 2
}

export interface RecordAction {
  label: string
  onClick: () => void
  shortcut?: string
  /**
   * What it will do, in full, shown on the page before the click — never a tooltip and never after.
   * The button then asks once, with the sentence beside it.
   */
  confirm?: string
  variant?: "default" | "outline"
}

export interface RecordSection {
  id: string
  title: string
  count?: number
  action?: ReactNode
  children: ReactNode
  /** A brief's sections say who wrote them; a generated section is marked apart from a written one. */
  authored?: "written" | "generated"
  approved?: boolean
}

export interface RecordCard {
  id: string
  title: string
  count?: number
  /** Second line of the heading: "Contacts · 5 · 2 have replied" is one heading, not two. */
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  tone?: "attention"
}

export interface RecordDoor {
  id: string
  label: string
  count?: number
  container?: "inline" | "drawer"
  content: ReactNode
  openByDefault?: boolean
}

export interface RecordTimeline {
  kind: "timeline"
  label?: string
  composer?: ReactNode
  filters?: ReactNode
  pinned?: ReactNode
  items: ReactNode
  footer?: ReactNode
}

export interface RecordSections {
  kind: "sections"
  label?: string
  sections: RecordSection[]
}

export interface RecordBrief {
  about: string
  author: string
  assembledOn: string
  covers: { label: string; href: string }[]
  credits: number
  approved?: boolean
}

export interface RecordShortcut {
  keys: string
  label: string
  run: () => void
}

/** The id the header's subtitle link carries, so a trail can return to it and light it. */
export const SUBTITLE_ANCHOR = "record.subtitle"

export interface RecordPageProps {
  back: { label: string; href: string }
  /** The family this record belongs to: its icon and hue on the title (DESIGN.md §5). */
  family?: string
  title: { value: string; onRename?: (value: string) => void }
  /**
   * The object this record hangs off — a deal's company, an account's parent. `href` keeps it a real
   * link for a new tab and for copying; a record that would rather show that object beside itself
   * than leave the page passes `onOpen`, and the click goes there instead.
   */
  subtitle?: { label: string; href: string; onOpen?: (opener: HTMLElement) => void }
  chips?: ReactNode
  /** Object state only: closed, archived, a sync error, deactivated. A live region. */
  ribbon?: { tone: "info" | "warning" | "error" | "good"; text: string; action?: ReactNode }
  fields: RecordField[]
  /**
   * The header's controls, the old way: three named buckets this template draws itself.
   * A page that has moved to `ui/Actions` passes `headerActions` instead and this may be empty —
   * the two are the same row, drawn by whoever owns the kinds.
   */
  actions: {
    primary: RecordAction[]
    secondary: RecordAction[]
    destructive?: { label: string; consequence: string; onConfirm: () => void }
  }
  /**
   * The header's controls as one `<Actions surface="page">` (DESIGN.md §1): the page says what each
   * control is and the primitive decides how it is drawn, where it sits and whether it asks first.
   * When this is given it replaces the row above, on the desktop header and on the phone bar alike.
   */
  headerActions?: ReactNode
  main: RecordTimeline | RecordSections
  side: RecordCard[]
  doors: RecordDoor[]
  /** At most one, for a related table big enough to be a page of its own. */
  tab?: { label: string; count: number; content: ReactNode }
  /** The brief block: what this was assembled from, by whom, when and at what cost. */
  brief?: RecordBrief
  /** The drawer this record is the long version of. The table opens it; it is declared here so the
   *  drawer and the page can never drift apart. */
  quickLook?: { fields: QuickLookField[]; editable?: QuickLookEditable }
  shortcuts?: RecordShortcut[]
  noAccess?: { message: string; who: string[] }
}

/* ------------------------------------------------------------------------------------ the parts */

const RIBBON: Record<string, string> = {
  info: "bg-muted text-foreground",
  good: "[background-color:var(--success-tint)] [color:var(--success-ink)]",
  warning: "[background-color:var(--warning-tint)] [color:var(--warning-ink)]",
  error: "bg-destructive/10 text-destructive",
}

/** Click or Enter on the field opens the editor in place. Enter saves, Escape cancels. Never hover-only. */
function InlineValue({ field }: { field: RecordField }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(field.edit?.value ?? "")
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => { if (editing) input.current?.focus() }, [editing])

  if (!field.edit || field.editor === "readonly") return <>{field.value}</>

  if (editing) {
    const save = (v: string) => { field.edit!.onSave(v); setEditing(false) }
    if (field.edit.options) {
      return (
        <Select open defaultValue={field.edit.value} onValueChange={save} onOpenChange={(o) => { if (!o) setEditing(false) }}>
          <SelectTrigger className="h-8 w-full" aria-label={field.label}><SelectValue /></SelectTrigger>
          <SelectContent>{field.edit.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
      )
    }
    return (
      <Input
        ref={input}
        aria-label={field.label}
        className="h-8"
        type={field.editor === "date" ? "date" : field.editor === "number" || field.editor === "money" ? "number" : "text"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); save(draft) }
          if (e.key === "Escape") { e.preventDefault(); setDraft(field.edit!.value); setEditing(false) }
        }}
        onBlur={() => save(draft)}
      />
    )
  }

  return (
    <button
      type="button"
      className="group/field -mx-1 flex w-full items-center gap-1.5 rounded px-1 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      onClick={() => { setDraft(field.edit!.value); setEditing(true) }}
    >
      <span className="min-w-0">{field.value}</span>
      <Pencil aria-hidden="true" className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/field:opacity-100 group-focus-visible/field:opacity-100" />
      <span className="sr-only">Edit {field.label}</span>
    </button>
  )
}

function FieldCell({ field }: { field: RecordField }) {
  return (
    <div className={cn("min-w-0", field.wide && "col-span-full", field.span === 2 && "col-span-2")}>
      <div className="t-label text-muted-foreground">{field.label}</div>
      <div className={cn("t-body mt-0.5", field.tone === "warning" && "font-medium [color:var(--warning-ink)]", field.tone === "muted" && "text-muted-foreground")}>
        <InlineValue field={field} />
      </div>
      {field.under && <div className="t-small mt-1 text-muted-foreground">{field.under}</div>}
    </div>
  )
}

function SideCard({ card }: { card: RecordCard }) {
  return (
    <Card data-record-card className={cn("gap-3 py-4", card.tone === "attention" && "[border-color:var(--warning)]")}>
      <CardHeader className="gap-0 px-4">
        <CardTitle className="t-section inline-flex items-baseline gap-2">
          {card.title}
          {card.count !== undefined && <span className="t-label font-normal tabular-nums text-muted-foreground">{card.count}</span>}
        </CardTitle>
        {card.action && <CardAction>{card.action}</CardAction>}
      </CardHeader>
      <CardContent className="px-4">
        {card.subtitle && <p className="t-small -mt-1 pb-2 text-muted-foreground">{card.subtitle}</p>}
        {card.children}
      </CardContent>
    </Card>
  )
}

/** A row inside a card: its actions show on hover and on focus and repeat in the row's "…" menu. */
export function CardRow({ title, meta, actions, children }: {
  title: ReactNode
  meta?: ReactNode
  actions?: { label: string; onClick: () => void; destructive?: boolean }[]
  children?: ReactNode
}) {
  return (
    <div className="group relative flex items-start gap-2 py-2 first:[&>[data-slot=separator]]:hidden">
      <Divider className="absolute inset-x-0 top-0" />
      <div className="min-w-0 flex-1">
        <div className="t-body">{title}</div>
        {meta && <div className="t-small text-muted-foreground">{meta}</div>}
        {children}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex shrink-0 items-center gap-1">
          {actions.slice(0, 1).map((a) => (
            <Button key={a.label} size="sm" variant="ghost" className="t-small h-7 px-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100" onClick={a.onClick}>{a.label}</Button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="size-7" aria-label={`Actions for ${typeof title === "string" ? title : "this row"}`}><MoreHorizontal className="size-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((a) => (
                <DropdownMenuItem key={a.label} onSelect={a.onClick} className={a.destructive ? "text-destructive" : undefined}>{a.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

/** A section of a record is a container with its heading, and its doors open inside it. */
function Section({ section }: { section: RecordSection }) {
  return (
    <Card id={section.id} className="gap-3 py-4">
      <CardHeader className="gap-0 px-4">
        <CardTitle className="t-section inline-flex items-baseline gap-2">
          {section.title}
          {section.count !== undefined && <span className="t-label font-normal tabular-nums text-muted-foreground">{section.count}</span>}
        </CardTitle>
        {section.action && <CardAction>{section.action}</CardAction>}
      </CardHeader>
      <CardContent className="px-4">
      {section.authored && (
        <p className="t-small pb-2 text-muted-foreground">
          {section.authored === "generated" ? "Written by an agent" : "Written by a person"}
          {section.approved === false && " · Not yet approved"}
        </p>
      )}
      {section.children}
      </CardContent>
    </Card>
  )
}

/* A door whose content is wider than the record column opens as a drawer. It still prints expanded. */
function DrawerDoor({ door }: { door: RecordDoor }) {
  const [open, setOpen] = useState(false)
  return (
    <section data-door className="first:[&>[data-slot=separator]]:hidden">
          <Divider />
      <h3 className="m-0">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`drawer-${door.id}`}
          onClick={() => setOpen(true)}
          className="t-label flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ChevronRight data-door-chevron aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0">{door.label}</span>
          {door.count !== undefined && <span className="tabular-nums text-muted-foreground">({door.count})</span>}
        </button>
      </h3>
      <Panel id={`drawer-${door.id}`} title={door.label} open={open} onOpenChange={setOpen}>{door.content}</Panel>
      {/* Print expands every door, and a drawer has nothing on the page to expand: this is its copy. */}
      <div className="t-body hidden px-2 pb-3 print:block">{door.content}</div>
    </section>
  )
}

/* ------------------------------------------------------------------------------------- the page */

export function RecordPage(p: RecordPageProps) {
  const [confirming, setConfirming] = useState<string | null>(null)
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(p.title.value)
  useEffect(() => setName(p.title.value), [p.title.value])

  // Shortcuts: single keys for the resident, never while typing, and every one listed in the palette.
  useEffect(() => {
    if (!p.shortcuts?.length) return
    document.dispatchEvent(new CustomEvent("ollopa:shortcuts", { detail: p.shortcuts.map((s) => ({ keys: s.keys, label: s.label })) }))
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return
      const pressed = (e.shiftKey ? "Shift+" : "") + (e.key.length === 1 ? e.key.toUpperCase() : e.key)
      const hit = p.shortcuts!.find((s) => s.keys.toUpperCase() === pressed.toUpperCase())
      if (hit) { e.preventDefault(); hit.run() }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.dispatchEvent(new CustomEvent("ollopa:shortcuts", { detail: [] }))
    }
  }, [p.shortcuts])

  if (p.noAccess) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <BackToIndex label={p.back.label} to={p.back.href} />
        <h2 className="t-section mt-6">{p.noAccess.message}</h2>
        <p className="t-body mt-2 text-muted-foreground">Who works here: {p.noAccess.who.join(", ")}.</p>
      </div>
    )
  }

  const shown = p.fields.filter((f) => f.level !== 2 || (f.dependsOn?.length ?? 0) > 0)
  const behind = p.fields.filter((f) => f.level === 2 && !(f.dependsOn?.length ?? 0))

  // Rule 1: level-two fields live in the All fields door, merged with whatever else the page put there.
  const ownAllFields = p.doors.find((d) => d.id === "all-fields")
  const doors: RecordDoor[] = [
    ...p.doors.filter((d) => d.id !== "all-fields"),
    ...(behind.length || ownAllFields
      ? [{
          id: "all-fields",
          label: ownAllFields?.label ?? "All fields",
          count: (ownAllFields?.count ?? 0) + behind.length || undefined,
          container: ownAllFields?.container ?? "inline",
          openByDefault: ownAllFields?.openByDefault,
          content: (
            <>
              <dl className="grid grid-cols-[10rem_1fr] gap-x-4 gap-y-1.5">
                {behind.map((f) => (
                  <div key={f.key} className="contents">
                    <dt className="t-label text-muted-foreground">{f.label}</dt>
                    <dd className="t-body min-w-0"><InlineValue field={f} /></dd>
                  </div>
                ))}
              </dl>
              {ownAllFields?.content}
            </>
          ),
        } as RecordDoor]
      : []),
  ].filter((d) => d.content !== null && d.content !== undefined && d.content !== false)

  const mainLabel = p.main.label ?? (p.main.kind === "timeline" ? "Activity" : "Overview")

  const mainBody = (
    <>
      {p.main.kind === "timeline" ? (
        <>
          {p.main.composer}
          {p.main.filters && <div className="flex flex-wrap items-center gap-1.5 py-3">{p.main.filters}</div>}
          {p.main.pinned}
          {p.main.items}
          {p.main.footer}
        </>
      ) : (
        <div className="space-y-4">{p.main.sections.map((s) => <Section key={s.id} section={s} />)}</div>
      )}
    </>
  )

  return (
    <DoorGroup>
      <div className="flex min-h-full flex-col">
        {/* ------------------------------------------------------------------ header */}
        <header className="px-5 pt-4 lg:px-6">
          <BackToIndex label={p.back.label} to={p.back.href} compact />

          <div className="mt-2 flex flex-wrap items-start gap-x-3 gap-y-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {renaming && p.title.onRename ? (
                  <Input
                    autoFocus
                    aria-label="Deal name"
                    className="t-title h-9 w-72"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { p.title.onRename!(name); setRenaming(false) }
                      if (e.key === "Escape") { setName(p.title.value); setRenaming(false) }
                    }}
                    onBlur={() => { p.title.onRename!(name); setRenaming(false) }}
                  />
                ) : (
                  <h2 className="t-title inline-flex min-w-0 items-center gap-2 truncate" style={{ color: familyOf(p.family).ink }}>
                    <FamilyIcon of={p.family} size="header" />
                    {p.title.onRename ? (
                      <button type="button" className="group/title inline-flex items-center gap-1.5 rounded hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" onClick={() => setRenaming(true)}>
                        {p.title.value}
                        <Pencil aria-hidden="true" className="size-3.5 text-muted-foreground opacity-0 group-hover/title:opacity-100 group-focus-visible/title:opacity-100" />
                        <span className="sr-only">Rename</span>
                      </button>
                    ) : p.title.value}
                  </h2>
                )}
                {p.chips}
              </div>
              {p.subtitle && (
                <a
                  href={p.subtitle.href}
                  data-item={SUBTITLE_ANCHOR}
                  data-item-label={p.subtitle.label}
                  className="t-body text-muted-foreground hover:underline"
                  onClick={p.subtitle.onOpen ? (e) => { e.preventDefault(); p.subtitle!.onOpen!(e.currentTarget) } : undefined}
                >
                  {p.subtitle.label}
                </a>
              )}
            </div>

            <div className="ml-auto hidden flex-wrap items-center gap-2 lg:flex" data-print-hide>
              {p.headerActions ?? <Actions actions={p.actions} confirming={confirming} setConfirming={setConfirming} />}
            </div>
          </div>

          {p.ribbon && (
            <div role="status" aria-live="polite" className={cn("mt-3 flex flex-wrap items-center gap-3 rounded-md px-3 py-2 t-body", RIBBON[p.ribbon.tone])}>
              <span>{p.ribbon.text}</span>
              {p.ribbon.action && <span className="ml-auto">{p.ribbon.action}</span>}
            </div>
          )}

          {p.brief && (
            <dl className="mt-3 grid gap-x-6 gap-y-1 rounded-md border px-3 py-2 t-small sm:grid-cols-2">
              <div className="sm:col-span-2"><dt className="inline text-muted-foreground">About </dt><dd className="inline font-medium">{p.brief.about}</dd></div>
              <div><dt className="inline text-muted-foreground">Assembled by </dt><dd className="inline">{p.brief.author}</dd></div>
              <div><dt className="inline text-muted-foreground">On </dt><dd className="inline">{p.brief.assembledOn}</dd></div>
              <div><dt className="inline text-muted-foreground">Covers </dt><dd className="inline">{p.brief.covers.map((c, i) => <span key={c.href}>{i > 0 && ", "}<a className="underline" href={c.href}>{c.label}</a></span>)}</dd></div>
              <div><dt className="inline text-muted-foreground">Cost of the run </dt><dd className="inline tabular-nums">{p.brief.credits} credits</dd></div>
              {p.brief.approved === false && <div className="sm:col-span-2 font-medium [color:var(--warning-ink)]">Not yet approved</div>}
            </dl>
          )}

          {/* The record's own fields are its first container: they are a group, and a group on the
              canvas is contained (DESIGN.md §5). */}
          <Card className="mt-3 mb-4 py-4">
            <CardContent className="px-4">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 xl:grid-cols-4">
                {shown.map((f) => <FieldCell key={f.key} field={f} />)}
              </dl>
            </CardContent>
          </Card>
        </header>
        <Divider />

        {/* --------------------------------------------- phone: the actions sit under the header.
            A fixed bar, drawn by the library: a Separator for its top edge and the record's acts
            inside it. Nothing here paints a border or a background of its own beyond the surface
            the bar sits on. */}
        <div className="fixed inset-x-0 bottom-16 z-30 order-last bg-background md:bottom-0 lg:hidden" data-print-hide>
          <Divider />
          <div className="flex flex-wrap items-center gap-2 px-5 py-2">
            {p.headerActions ?? <Actions actions={p.actions} confirming={confirming} setConfirming={setConfirming} compact />}
          </div>
        </div>

        {/* ------------------------------------------------------- body: main, side cards, doors */}
        <div className="flex flex-1 flex-col gap-6 px-5 pt-5 pb-56 lg:grid lg:pb-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:px-6">
          <div className="order-2 min-w-0 lg:order-none lg:col-start-1 lg:row-span-2">
            {p.tab ? (
              <Tabs defaultValue="main">
                <TabsList>
                  <TabsTrigger value="main">{mainLabel}</TabsTrigger>
                  <TabsTrigger value="related">{p.tab.label} ({p.tab.count})</TabsTrigger>
                </TabsList>
                <TabsContent value="main" className="pt-3">{mainBody}</TabsContent>
                <TabsContent value="related" className="pt-3">{p.tab.content}</TabsContent>
              </Tabs>
            ) : mainBody}
          </div>

          <div className="order-1 space-y-3 lg:order-none lg:col-start-2 lg:row-start-1">
            {p.side.map((c) => <SideCard key={c.id} card={c} />)}
          </div>

          <div className="order-3 lg:order-none lg:col-start-2 lg:row-start-2">
            {doors.length > 0 && (
              // The doors are a section of the record like any other, so they are a Card: the
              // "expand all" control is the card's own action, the doors are its content. This cell
              // is a sibling of the side cards, not a child of one, so nothing nests.
              <Card className="gap-0 py-2">
                <CardHeader className="items-center px-2 [.border-b]:pb-2">
                  <CardTitle className="sr-only">More about this record</CardTitle>
                  <CardAction className="self-center"><ExpandAll /></CardAction>
                </CardHeader>
                <CardContent className="px-2">
                  {doors.map((d) => (
                    d.container === "drawer"
                      ? <DrawerDoor key={d.id} door={d} />
                      : <Door key={d.id} id={d.id} label={d.label} count={d.count} defaultOpen={d.openByDefault}>{d.content}</Door>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DoorGroup>
  )
}

function Actions({ actions, confirming, setConfirming, compact }: {
  actions: RecordPageProps["actions"]
  confirming: string | null
  setConfirming: (v: string | null) => void
  compact?: boolean
}) {
  const ask = (a: RecordAction, variant: "default" | "outline") =>
    confirming === a.label ? (
      <span key={a.label} className="flex flex-wrap items-center gap-2 rounded-md border px-2 py-1">
        <span className="t-small max-w-[28rem] text-muted-foreground">{a.confirm}</span>
        <Button size="sm" onClick={() => { a.onClick(); setConfirming(null) }}>{a.label}</Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>Cancel</Button>
      </span>
    ) : (
      <Button key={a.label} size="sm" variant={a.variant ?? variant} onClick={() => (a.confirm ? setConfirming(a.label) : a.onClick())}>
        {a.label}
      </Button>
    )

  return (
    <>
      {actions.primary.map((a) => ask(a, "default"))}
      {actions.secondary.map((a) => ask(a, "outline"))}
      {/* Rule 7: the destructive action is here with its consequence in words, not in a "…" menu. */}
      {actions.destructive && (
        confirming === "__destructive" ? (
          <span className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/40 px-2 py-1">
            <span className="t-small [color:var(--danger-ink)]">{actions.destructive.consequence}</span>
            <Button size="sm" variant="destructive" onClick={() => { actions.destructive!.onConfirm(); setConfirming(null) }}>{actions.destructive.label}</Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(null)}>Keep it</Button>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirming("__destructive")}>
              {actions.destructive.label}
            </Button>
            <span className={cn("t-small text-muted-foreground", compact ? "order-first w-full" : "max-w-[22rem]")}>{actions.destructive.consequence}</span>
          </span>
        )
      )}
    </>
  )
}
