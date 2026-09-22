// X-linkedin — the LinkedIn step: the message, copy, open the profile, mark complete.
//
// Opened from a LinkedIn task row and rendered as the queue's body. Flat.
//
// Two things are never hidden here. ollopA cannot see LinkedIn, so marking complete is a claim the
// person makes and the line above the button says so. And the weekly invite cap is LinkedIn's, not
// ollopA's: a cap that is invisible until it is hit is a limit hidden from the person who will be
// punished by it (rule 7), so the count is on screen before the send, not after.
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Actions } from "../../ui/Actions"
import { Panel } from "../../ui/Panel"
import type { Task } from "../../data/seed"
import { Chip } from "../../ui/Identity"
import type { Session } from "../../session"
import { contactIndex, invitesThisWeek } from "./data"

export interface LinkedInProps {
  session: Session
  task: Task
  say: (message: string, undo?: () => void) => void
  onComplete?: () => void
  /** Snooze what is left of the week's invites, offered within ten of the cap. */
  onSnoozeRest?: () => void
}

/** The counter, shown in the panel and in the queue header. */
export function InviteCounter({ session, onSnoozeRest }: { session: Session; onSnoozeRest?: () => void }) {
  const { sent, cap } = invitesThisWeek(session)
  const near = sent >= cap - 10
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      <span className="tabular-nums">Invites this week: {sent} of about {cap}</span>
      <span className="text-muted-foreground">the cap is LinkedIn's, not ollopA's</span>
      {near && onSnoozeRest && (
        <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={onSnoozeRest}>Snooze the rest to Monday</Button>
      )}
    </div>
  )
}

export function LinkedInBody({ session, task, say, onComplete, onSnoozeRest }: LinkedInProps) {
  const contact = contactIndex(session.business)(task.contactId)
  const [message, setMessage] = useState(task.message ?? "")
  const [edited, setEdited] = useState(task.messageEdited)
  const [copied, setCopied] = useState(false)

  return (
    <div className="space-y-4">
      <InviteCounter session={session} onSnoozeRest={onSnoozeRest} />

      <div className="rounded-md border p-3">
        <div className="font-medium">{task.contact}</div>
        <div className="text-sm text-muted-foreground">{contact?.title} · {task.company}</div>
        <div className="pt-1 text-sm">
          {task.linkedinKind === "Message" ? "Send a message" : "Send a connection request"}
          {task.step && <span className="text-muted-foreground"> · step {task.step.n} of {task.step.of} of “{task.sequence}”</span>}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground" htmlFor="li-message">
          The message{" "}
          {/* Edited for this send is a state; coming from the step is where the words are from,
              which is a category and takes the neutral chip. */}
          {edited
            ? <Chip status="edited">personalised for this send</Chip>
            : <Chip icon={false}>from the sequence step</Chip>}
        </label>
        <Textarea
          id="li-message" rows={5} className="mt-1" value={message}
          onChange={(e) => { setMessage(e.target.value); setEdited(true) }}
        />
        <p className="pt-1 text-xs text-muted-foreground">
          Editing here changes this send only. The step's copy is left alone.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => {
          navigator.clipboard?.writeText(message).catch(() => { /* clipboard blocked: the text is on screen */ })
          setCopied(true)
          say("Message copied.")
        }}>
          {copied ? "Copied" : "Copy message"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => {
          window.open(contact?.linkedin ?? "https://www.linkedin.com", "_blank", "noopener")
        }}>
          Open the profile
        </Button>
      </div>

      <div className="border-t pt-3">
        <p className="text-xs text-muted-foreground">
          ollopA cannot see LinkedIn. Marking complete records that you sent it and advances the sequence.
        </p>
        {/* An outline, not a filled control: in the queue the page is the one task and Done in the
            footer is the act it exists for, so this is a second way to the same place and never the
            surface's one primary (DESIGN.md §1). */}
        <div className="mt-2">
          <Actions
            surface="card"
            items={[{
              kind: "secondary",
              label: "Mark complete",
              onClick: () => {
                say(`${task.contact}: LinkedIn step marked complete. “${task.sequence ?? "The sequence"}” moves to the next step.`)
                onComplete?.()
              },
            }]}
          />
        </div>
      </div>
    </div>
  )
}

export function LinkedInPanel(p: LinkedInProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { open, onOpenChange, ...rest } = p
  return (
    <Panel id="x-linkedin" title={`LinkedIn step · ${p.task.contact}`} open={open} onOpenChange={onOpenChange}>
      <LinkedInBody {...rest} />
    </Panel>
  )
}
