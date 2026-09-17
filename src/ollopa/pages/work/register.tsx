// The Inbox and Tasks nodes, registered as the map types them (IA-MAP part 2.7 and 2.8).
//
// Two of these are pages and one is a route:
//   P-inbox   page          the master half; the thread is the other half of the same page
//   X-thread  detail pane   /ollopa/inbox/:id renders the same page with that thread open
//   P-tasks   page          queue body for SDR and AE, list body for CS and OPS
//
// The rest are panels, which are components a page opens and not destinations of their own, so they
// are exported rather than registered: `X-queue` is the Tasks body, and `X-calllog`, `X-linkedin`
// and `X-meeting` are opened from a row, from the queue body, and — by the contact, company and deal
// records — from theirs. `D-thread-agent` and `X-reply` live inside the thread, where sending the
// agent's draft is the approval.
import type { PageComponent } from "../../Product"
import { Inbox, ThreadRoute } from "./Inbox"
import { Tasks } from "./Tasks"

export const nodes: Record<string, PageComponent> = {
  "P-inbox": ({ session }) => <Inbox session={session} />,
  "X-thread": ({ session, id }) => <ThreadRoute session={session} id={id} />,
  "P-tasks": ({ session }) => <Tasks session={session} />,
}

/** X-queue — the Tasks body. Exported so nothing else has to rebuild the one-at-a-time console. */
export { Queue } from "./Queue"
/** X-calllog — a panel from a task row, the queue body, the contact record and the deal record. */
export { CallLogPanel, CallLogBody, STOPS_SEQUENCE } from "./CallLog"
/** X-linkedin — a panel from a LinkedIn task row and the queue body. */
export { LinkedInPanel, LinkedInBody, InviteCounter } from "./LinkedIn"
/** X-meeting — owned by the Inbox for the whole product; Tasks and the deal record render it. */
export { MeetingPanel } from "./MeetingPanel"
/** X-thread and X-reply, for a record page that wants the thread and its composer in place. */
export { Thread } from "./Thread"
export { Inbox, Tasks }
