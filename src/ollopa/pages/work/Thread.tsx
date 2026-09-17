// X-thread — the open half of the Inbox, and X-reply, the composer inside it.
//
// The Inbox is master-detail: the list stays in view and the thread is the *open half of the page*,
// not a disclosure (IA-MAP 2.7). So the thread is level one and its own doors — earlier messages,
// contact details, the agent draft — are the one level below it. It is never drawn as a panel opened
// from inside another, and on the phone it becomes a page with a back arrow, its doors still one deep.
//
// The composer is here and nowhere else: there is no reply drawer anywhere in the product. An agent's
// reply draft is approved here, because the recipient and the whole text are on screen and Send is the
// approval — so it does not also queue on Agents (spec 06 §3; IA-MAP G2).
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { href } from "@/app/router"
import { Door, DoorGroup, ExpandAll } from "../../ui/Door"
import { ConsequenceLine } from "../../ui/ConsequenceLine"
import { seedFor } from "../../data/seed"
import type { Session } from "../../session"
import type { Disclosure } from "../../ui/useDisclosure"
import { day, waiting } from "./format"
import { contactIndex, dealFor, mailboxOf, savedReplies, type InboxReply } from "./data"

export interface ThreadProps {
  session: Session
  disclosure: Disclosure
  reply: InboxReply
  /** Who put the outcome on the reply: the seed's classifier, or "you" after a correction. */
  meantBy: string
  say: (message: string, undo?: () => void) => void
  onBook: () => void
  /** Phone width: the thread is a page and this returns to the same row. */
  onBack?: () => void
  /** Set when the row's Reply action asked for the composer. */
  focusComposer: number
}

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function Thread({ session, disclosure, reply, meantBy, say, onBook, onBack, focusComposer }: ThreadProps) {
  const seed = seedFor(session.business)
  const contact = contactIndex(session.business)(reply.contactId)
  const deal = dealFor(session.business, reply.dealId)
  const saved = savedReplies(session.business)
  const mailbox = mailboxOf(session)
  const sent = reply.messages.filter((m) => m.from === "us")
  const draft = reply.draft

  const [body, setBody] = useState("")
  const [subject, setSubject] = useState(`Re: ${reply.company} · keeping the pipeline honest`)
  const [fromDraft, setFromDraft] = useState(false)
  const [cc, setCc] = useState(false)
  const [signature, setSignature] = useState(true)
  const area = useRef<HTMLTextAreaElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)

  // Opening the thread moves focus to its heading; Reply on the row moves it to the composer.
  useEffect(() => { heading.current?.focus() }, [reply.id])
  useEffect(() => { if (focusComposer > 0) area.current?.focus() }, [focusComposer])
  useEffect(() => { setBody(""); setFromDraft(false); setSubject(`Re: ${reply.company} · keeping the pipeline honest`) }, [reply.id, reply.company])

  const savedRepliesAtLevelOne = disclosure.level("inbox.thread.saved-replies") === 1

  return (
    <section
      aria-label={`Thread with ${reply.contact}`}
      className="flex h-full min-h-0 flex-col"
    >
      <DoorGroup>
        <header className="shrink-0 border-b px-4 py-3">
          <div className="flex items-start gap-2">
            {onBack && (
              <Button size="icon-sm" variant="ghost" className="md:hidden" aria-label="Back to the list" onClick={onBack}>
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <div className="min-w-0 flex-1">
              <h2 ref={heading} tabIndex={-1} className="text-base font-semibold outline-none">{reply.contact}</h2>
              <p className="text-sm text-muted-foreground">{contact?.title ?? "—"} · {reply.company}</p>
              <p className="pt-0.5 text-xs text-muted-foreground">
                <span className="font-mono">{contact?.email}</span>
                {contact && <> · {contact.emailStatus}</>}
                {" · "}{reply.sequence} · step {reply.step.n} of {reply.step.of}
                {" · "}to {reply.box}
              </p>
              {deal && (
                <p className="pt-0.5 text-xs">
                  <a className="underline underline-offset-4" href={href(`/ollopa/deals/${deal.id}`)}>{deal.name}</a>
                  <span className="text-muted-foreground"> · {deal.stage}</span>
                </p>
              )}
              {reply.handedTo && reply.handedTo !== session.user && (
                <p className="pt-0.5 text-xs text-muted-foreground">Handed to {reply.handedTo}.</p>
              )}
              {reply.handedTo === session.user && (
                <p className="pt-0.5 text-xs text-muted-foreground">Handed over by {reply.boxOwner}.</p>
              )}
            </div>
            <ExpandAll className="shrink-0" />
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {/* -------------------------------------------------------------------- the reply itself */}
          <article className="rounded-lg border p-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pb-2">
              <span className="font-medium">{reply.contact}</span>
              <span className="text-xs text-muted-foreground">{waiting(reply.received)}</span>
              <span className="text-xs text-muted-foreground">Read as: {reply.outcome} · by {meantBy}</span>
            </div>
            <p className="whitespace-pre-line text-sm">{reply.body}</p>
            {reply.outcome === "Not now" && reply.followUpOn && (
              <p className="pt-2 text-xs text-muted-foreground">They named a date: {day(reply.followUpOn)}.</p>
            )}
            {reply.outcome === "Out of office" && reply.returnsOn && (
              <p className="pt-2 text-xs text-muted-foreground">Back on {day(reply.returnsOn)}. The sequence resumes then by itself.</p>
            )}
          </article>

          {/* -------------------------------------------------------------- the doors of the thread */}
          <div className="pt-3">
            <Door id="inbox.thread.earlier" label="Earlier messages" count={sent.length} defaultOpen={disclosure.level("inbox.thread.earlier-messages") === 1}>
              <ul className="space-y-3">
                {sent.map((m, i) => (
                  <li key={i}>
                    <div className="text-xs text-muted-foreground">{day(m.sent)} · {m.subject}</div>
                    <p className="whitespace-pre-line pt-0.5 text-sm">{m.body}</p>
                  </li>
                ))}
                {sent.length === 0 && <li className="text-sm text-muted-foreground">Nothing was sent before this reply.</li>}
              </ul>
            </Door>

            <Door id="inbox.thread.contact" label="Contact details" defaultOpen={disclosure.level("inbox.thread.contact-details") === 1}>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Title</dt><dd>{contact?.title ?? "—"}</dd>
                <dt className="text-muted-foreground">Email</dt><dd className="font-mono text-xs">{contact?.email} · {contact?.emailStatus}</dd>
                <dt className="text-muted-foreground">Phone</dt><dd>{contact?.phoneNumber ?? "Not revealed"}</dd>
                <dt className="text-muted-foreground">Open deal</dt><dd>{deal ? deal.name : "None"}</dd>
                <dt className="text-muted-foreground">Owner</dt><dd>{contact?.owner ?? reply.boxOwner}</dd>
                <dt className="text-muted-foreground">Opens and clicks</dt><dd>{contact?.opens ?? 0} opens · {contact?.replies ?? 0} replies</dd>
                {seed.workspace.crm && (<><dt className="text-muted-foreground">{seed.workspace.crm}</dt><dd>{contact?.crmSyncedAt ? `Synced ${day(contact.crmSyncedAt)}` : "Not synced"}</dd></>)}
              </dl>
              <p className="pt-2">
                <a className="text-sm underline underline-offset-4" href={href(`/ollopa/people/${reply.contactId}`)}>Open contact</a>
              </p>
            </Door>
          </div>

          {/* ------------------------------------------------------------------------ the composer */}
          <div className="pt-4" data-composer>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-xs text-muted-foreground">
                To
                <Input className="mt-1 h-8" readOnly value={contact?.email ?? reply.contact} aria-label="Recipient" />
              </label>
              <label className="text-xs text-muted-foreground">
                Subject
                <Input className="mt-1 h-8" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject" />
              </label>
            </div>
            {cc && (
              <div className="grid gap-2 pt-2 sm:grid-cols-2">
                <label className="text-xs text-muted-foreground">Cc<Input className="mt-1 h-8" aria-label="Cc" /></label>
                <label className="text-xs text-muted-foreground">Bcc<Input className="mt-1 h-8" aria-label="Bcc" /></label>
              </div>
            )}

            <div className="pt-2">
              <Textarea
                ref={area}
                aria-label={`Reply to ${reply.contact}`}
                rows={5}
                value={body}
                onChange={(e) => { setBody(e.target.value); setFromDraft(false) }}
                placeholder={`Write back to ${reply.contact.split(" ")[0]}`}
              />
              {fromDraft && <p className="pt-1 text-xs text-muted-foreground">Agent draft, not sent. Edit it or send it — sending is the approval.</p>}
            </div>

            {/* The drafting agent's reply sits beside the composer, never in a queue of its own. */}
            {draft && (
              <div className="pt-2">
                <Door id="inbox.thread.agent-draft" label={`Agent draft · ${words(draft.body)} words`} defaultOpen={disclosure.level("inbox.agent-draft") === 1}>
                  <p className="text-xs text-muted-foreground">Written by the {draft.by} · {draft.state}. Nothing is sent by the agent from this page.</p>
                  <p className="whitespace-pre-line pt-1 text-sm">{draft.body}</p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => {
                    setBody(draft.body)
                    setSubject(draft.subject)
                    setFromDraft(true)
                    area.current?.focus()
                  }}>
                    Load into the composer
                  </Button>
                </Door>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button size="sm" disabled={!body.trim()} onClick={() => {
                say(`Reply sent to ${reply.contact} from ${mailbox}.`)
                setBody("")
                setFromDraft(false)
              }}>
                Send
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" aria-label="Send options: schedule, signature, Cc and Bcc, attach">Send ▾</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onSelect={() => say(`Reply to ${reply.contact} scheduled for tomorrow 08:00.`)}>Schedule for later</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setSignature((v) => !v)}>{signature ? "Leave the signature out" : "Include the signature"}</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setCc((v) => !v)}>{cc ? "Hide Cc and Bcc" : "Cc and Bcc"}</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => say("Attaching a file is not built in this demo.")}><Paperclip className="size-3.5" aria-hidden="true" /> Attach a file</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {savedRepliesAtLevelOne ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button size="sm" variant="outline">Insert a saved reply</Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {saved.map((s) => (
                      <DropdownMenuItem key={s.name} onSelect={() => setBody(s.body.replace("{first name}", reply.contact.split(" ")[0]))}>{s.name}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button size="sm" variant="ghost" className="text-xs">Insert a saved reply</Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {saved.map((s) => (
                      <DropdownMenuItem key={s.name} onSelect={() => setBody(s.body.replace("{first name}", reply.contact.split(" ")[0]))}>{s.name}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button size="sm" variant="ghost" className="ml-auto text-xs" onClick={onBook}>Book meeting</Button>
            </div>
            <div className="pt-1.5">
              <ConsequenceLine sends={1} to={reply.contact} from={mailbox} changes={signature ? "Your signature is included" : "No signature"} />
            </div>
            {fromDraft && (
              <p className="pt-1 text-xs text-muted-foreground">
                <Badge variant="secondary" className="mr-1 px-1.5 py-0 text-[11px] font-normal">Agent draft</Badge>
                The recipient and the whole text are on screen. Send is the approval, and the ledger records it.
              </p>
            )}
          </div>
        </div>
      </DoorGroup>
    </section>
  )
}
