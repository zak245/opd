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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRoute } from "@/app/router"
import { href } from "@/app/router"
import { useEdit } from "../../edits"
import { Actions } from "../../ui/Actions"
import { Chip, FamilyIcon } from "../../ui/Identity"
import { arrivalHandledHere, showReturn, takeArrival } from "../../chain"
import { Door, DoorGroup, ExpandAll } from "../../ui/Door"
import { seedFor } from "../../data/seed"
import type { Session } from "../../session"
import type { Disclosure } from "../../ui/useDisclosure"
import { day, waiting } from "./format"
import { contactIndex, dealFor, mailboxOf, savedReplies, type InboxReply } from "./data"
import { sendReply, undoSend } from "./acts"

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
  /**
   * The contact and the deal behind this reply, opened beside the page by the Inbox itself — the
   * same call the row's menu makes, so both routes to one pane carry the same list and walk the
   * same replies. The thread never opens a pane of its own.
   */
  onOpenContact: (opener?: HTMLElement | null) => void
  onOpenDeal: (opener?: HTMLElement | null) => void
}

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function Thread({ session, disclosure, reply, meantBy, say, onBook, onBack, focusComposer, onOpenContact, onOpenDeal }: ThreadProps) {
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
  /** What was typed when Send was pressed, so undo can put it back. */
  const pulled = useRef("")
  const heading = useRef<HTMLHeadingElement>(null)

  // Opening the thread moves focus to its heading; Reply on the row moves it to the composer.
  //
  // Arriving here by following a link from somewhere else is different: the thread *is* the thing
  // that was followed, so it is lit for the same three seconds every other followed page's title is
  // and it takes focus itself. The shell's fallback would put focus on the page's h1 ("Inbox"),
  // which is not what the person asked for; this says the page answered, so the shell leaves it be.
  // The page's effects run before the shell's, which is what makes saying it here enough.
  const route = useRoute()
  useEffect(() => {
    const el = heading.current
    if (!el) return
    // Only when the link named *this* thread. Following to the Inbox itself lands on the page's
    // own title, the way every other page does.
    const named = route.raw.split("?")[0].replace(/\/+$/, "").endsWith(`/${reply.id}`)
    // And only when this copy of the thread is the one on screen: at phone width the list and the
    // thread are two pages, and focus must never be moved into something nobody can see.
    if (named && el.offsetParent !== null && takeArrival(route.raw)) {
      arrivalHandledHere()
      showReturn(el)
      return
    }
    el.focus()
  }, [reply.id, route.raw])
  useEffect(() => { if (focusComposer > 0) area.current?.focus() }, [focusComposer])
  useEffect(() => { setBody(""); setFromDraft(false); setSubject(`Re: ${reply.company} · keeping the pipeline honest`) }, [reply.id, reply.company])

  const savedRepliesAtLevelOne = disclosure.level("inbox.thread.saved-replies") === 1

  /**
   * Sending acts at once and leaves ten seconds to pull it back, so it asks nothing first
   * (DESIGN.md §2). What happened shows here, where it was caused, and on the reply's row in the
   * list behind — one record in the shared store, so the two cannot say different things. Undo
   * within the window puts the words back in the composer as well as stopping the send.
   */
  const sendState = useEdit("reply", reply.id)
  const send = () => {
    pulled.current = body
    sendReply(reply.id, `to ${reply.contact} from ${mailbox}`)
    setBody("")
    setFromDraft(false)
  }
  const pullBack = () => {
    if (!undoSend(reply.id)) return
    say(`Nothing was sent to ${reply.contact}. Your words are back in the composer.`)
  }

  // Pulled back from here or from the row — it is one record either way — the words come back to
  // the composer they were written in, because a draft nobody sent is still a draft.
  useEffect(() => {
    if (sendState || !pulled.current) return
    setBody(pulled.current)
    pulled.current = ""
  }, [sendState])

  return (
    <section
      aria-label={`Thread with ${reply.contact}`}
      className="flex h-full min-h-0 flex-col"
    >
      <DoorGroup>
        <header className="shrink-0 border-b px-4 py-3">
          <div className="flex items-start gap-2">
            {/* A destination, so a real link: it copies, it opens in a new tab, and the click
                keeps the list where it is rather than reloading it (DESIGN.md §1). */}
            {onBack && (
              <a
                href={href("/ollopa/inbox")}
                aria-label="Back to the list"
                className="-ml-1 inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground md:hidden"
                onClick={(e) => { if (!e.metaKey && !e.ctrlKey && e.button === 0) { e.preventDefault(); onBack?.() } }}
              >
                <ArrowLeft className="size-4" />
              </a>
            )}
            <div className="min-w-0 flex-1">
              <h2 ref={heading} tabIndex={-1} className="t-section flex items-center gap-2 outline-none">
                {/* The reply is a Work object, and the thread says so before it is read. */}
                <FamilyIcon of="reply" size="header" label="Reply" />
                {reply.contact}
              </h2>
              <p className="t-body text-muted-foreground">{contact?.title ?? "—"} · {reply.company}</p>
              <p className="t-small pt-0.5 text-muted-foreground">
                <span className="font-mono">{contact?.email}</span>
                {contact && <> · {contact.emailStatus}</>}
                {" · "}{reply.sequence} · step {reply.step.n} of {reply.step.of}
                {" · "}to {reply.box}
              </p>
              {deal && (
                <p className="t-small pt-0.5">
                  {/* The deal behind this reply. Read while the contact is already open beside the
                      thread it is the next step of the same look, so the pane swaps and keeps one
                      "‹ back" to them; with nothing open it is simply the deal. Either way the
                      thread, its scroll and the half-typed reply are untouched. */}
                  <button
                    type="button"
                    className="underline underline-offset-4"
                    onClick={(e) => onOpenDeal(e.currentTarget)}
                  >
                    {deal.name}
                  </button>
                  <span className="text-muted-foreground"> · {deal.stage}</span>
                </p>
              )}
              {reply.handedTo && reply.handedTo !== session.user && (
                <p className="t-small pt-0.5 text-muted-foreground">Handed to {reply.handedTo}.</p>
              )}
              {reply.handedTo === session.user && (
                <p className="t-small pt-0.5 text-muted-foreground">Handed over by {reply.boxOwner}.</p>
              )}
            </div>
            <ExpandAll className="shrink-0" />
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {/* -------------------------------------------------------------------- the reply itself */}
          <article className="surface-raised rounded-lg border p-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pb-2">
              <span className="t-body font-medium">{reply.contact}</span>
              <span className="t-small tabular-nums text-muted-foreground">{waiting(reply.received)}</span>
              <span className="t-small flex items-center gap-1.5 text-muted-foreground">
                Read as <Chip status={reply.outcome}>{reply.outcome}</Chip> by {meantBy}
              </span>
            </div>
            <p className="t-body whitespace-pre-line">{reply.body}</p>
            {reply.outcome === "Not now" && reply.followUpOn && (
              <p className="pt-2 t-small text-muted-foreground">They named a date: {day(reply.followUpOn)}.</p>
            )}
            {reply.outcome === "Out of office" && reply.returnsOn && (
              <p className="pt-2 t-small text-muted-foreground">Back on {day(reply.returnsOn)}. The sequence resumes then by itself.</p>
            )}
          </article>

          {/* -------------------------------------------------------------- the doors of the thread */}
          <div>
            <Door id="inbox.thread.earlier" label="Earlier messages" count={sent.length} defaultOpen={disclosure.level("inbox.thread.earlier-messages") === 1}>
              <ul className="space-y-3">
                {sent.map((m, i) => (
                  <li key={i}>
                    <div className="t-small text-muted-foreground">{day(m.sent)} · {m.subject}</div>
                    <p className="whitespace-pre-line pt-0.5 t-body">{m.body}</p>
                  </li>
                ))}
                {sent.length === 0 && <li className="t-body text-muted-foreground">Nothing was sent before this reply.</li>}
              </ul>
            </Door>

            <Door id="inbox.thread.contact" label="Contact details" defaultOpen={disclosure.level("inbox.thread.contact-details") === 1}>
              <dl className="t-body grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                <dt className="text-muted-foreground">Title</dt><dd>{contact?.title ?? "—"}</dd>
                <dt className="text-muted-foreground">Email</dt><dd className="font-mono t-small">{contact?.email} · {contact?.emailStatus}</dd>
                <dt className="text-muted-foreground">Phone</dt><dd>{contact?.phoneNumber ?? "Not revealed"}</dd>
                <dt className="text-muted-foreground">Open deal</dt><dd>{deal ? deal.name : "None"}</dd>
                <dt className="text-muted-foreground">Owner</dt><dd>{contact?.owner ?? reply.boxOwner}</dd>
                <dt className="text-muted-foreground">Opens and clicks</dt><dd>{contact?.opens ?? 0} opens · {contact?.replies ?? 0} replies</dd>
                {seed.workspace.crm && (<><dt className="text-muted-foreground">{seed.workspace.crm}</dt><dd>{contact?.crmSyncedAt ? `Synced ${day(contact.crmSyncedAt)}` : "Not synced"}</dd></>)}
              </dl>
              <p className="pt-2">
                <button
                  type="button"
                  className="text-sm underline underline-offset-4"
                  onClick={(e) => onOpenContact(e.currentTarget)}
                >
                  Open {reply.contact} beside this
                </button>
              </p>
            </Door>
          </div>

          {/* ------------------------------------------------------------------------ the composer */}
          <div className="surface-raised rounded-lg border p-3" data-composer>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="t-label text-muted-foreground">
                To
                <Input className="mt-1 h-8" readOnly value={contact?.email ?? reply.contact} aria-label="Recipient" />
              </label>
              <label className="t-label text-muted-foreground">
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
            </div>

            {/* The drafting agent's reply sits beside the composer, never in a queue of its own. */}
            {draft && (
              <div className="pt-2">
                <Door id="inbox.thread.agent-draft" label={`Agent draft · ${words(draft.body)} words`} defaultOpen={disclosure.level("inbox.agent-draft") === 1}>
                  <p className="t-small text-muted-foreground">Written by the {draft.by} · {draft.state}</p>
                  <p className="whitespace-pre-line pt-1 t-body">{draft.body}</p>
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
              {/* Sending is the one act this half of the page exists for, and it cannot be taken
                  back, so it is the filled control and the only one carrying a line: what it
                  spends. Everything else here is free and reversible and says nothing. */}
              <Actions
                surface="card"
                items={[{
                  kind: "primary",
                  label: "Send",
                  onClick: send,
                  cost: "1 email",
                  consequence: `to ${reply.contact} from ${mailbox}`,
                  disabledBecause: body.trim() ? undefined : "Write something first",
                }]}
              />
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

              <span className="ml-auto">
                <Actions surface="card" items={[{ kind: "secondary", label: "Book a meeting", onClick: onBook }]} />
              </span>
            </div>

            {/* What the send is doing, where it was caused. For ten seconds it can be pulled back;
                after that it reads Sent and there is nothing to undo. */}
            {sendState?.sending === true && (
              <p role="status" aria-live="polite" className="mt-2 flex flex-wrap items-center gap-2 rounded-md bg-muted px-2.5 py-1.5">
                <Chip status="Sending">Sending</Chip>
                <span className="t-small min-w-0 flex-1 text-muted-foreground">to {reply.contact} from {mailbox}</span>
                <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={pullBack}>Undo</Button>
              </p>
            )}
            {sendState?.sent === true && (
              <p role="status" className="mt-2 flex flex-wrap items-center gap-2 rounded-md bg-muted px-2.5 py-1.5">
                <Chip status="Sent">Sent</Chip>
                <span className="t-small text-muted-foreground">to {reply.contact} from {mailbox}</span>
              </p>
            )}
          </div>
        </div>
      </DoorGroup>
    </section>
  )
}
