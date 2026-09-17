// The first-run state: what a page says when the workspace holds nothing for it yet.
//
// One shape for every page, so a workspace on its first morning reads the same kind of sentence
// wherever it lands: what this page holds, what makes the first one, and one control that does it.
// No tour, no checklist, no "coming soon" — the empty state is the teaching, and it is the work
// itself (RULES.md rule 8; the median in-product tip is opened once per thousand impressions).
//
// The copy is each page's own spec, not invented here: People §3 States, Companies §3 States,
// Lists §3 States, Sequences §3 States, Campaigns §3 States, Tasks §3 States, Deals §3 States,
// Workflows §3 States, Requests §3 States.
import { Button } from "@/components/ui/button"
import { href } from "@/app/router"
import { EmptyState } from "../../ui"
import { seedFor } from "../../data/seed"
import type { Page } from "../../usage/model"
import type { Session } from "../../session"

export interface FirstRun {
  title: string
  body: string
  /** One action, and one only. A page whose first row is made somewhere else says where. */
  action?: { label: string; route: string }
}

/** How many rows the workspace holds for a page. Zero is what makes a first-run state. */
export function rowsFor(page: Page, session: Session): number | null {
  const seed = seedFor(session.business)
  switch (page) {
    case "people": return seed.contacts.length
    case "companies": return seed.companies.length
    case "lists": return seed.lists.length
    case "sequences": return seed.sequences.length
    case "templates": return seed.templates.length
    case "inbox": return seed.replies.length
    case "tasks": return seed.tasks.length
    case "deals": return seed.deals.length
    case "accounts": return seed.accounts.length
    case "campaigns": return seed.campaigns.length
    case "workflows": return seed.workflows.length
    case "requests": return seed.requests.length
    case "agents": return seed.agents.length
    default: return null   // a page whose content is settings or numbers is never "empty"
  }
}

/** The first-run state for a page, or null when the workspace already holds something for it. */
export function firstRunFor(page: Page, session: Session): FirstRun | null {
  const rows = rowsFor(page, session)
  if (rows === null || rows > 0) return null

  switch (page) {
    case "people":
      return { title: "No people yet", body: "People holds every contact in the workspace. Bring in a CSV and the first ones are here.", action: { label: "Import a CSV", route: "/ollopa/import" } }
    case "companies":
      return { title: "No companies yet", body: "A company arrives with the first contact who works there, or from a CSV of your own.", action: { label: "Import a CSV", route: "/ollopa/import" } }
    case "lists":
      return { title: "No lists yet", body: "A list is made where the people are: pick rows on People or Companies and add them to one.", action: { label: "Open People", route: "/ollopa/people" } }
    case "sequences":
      return { title: "No sequences yet", body: "A sequence is a multi-step outreach plan. The outreach agent can propose the first one from who you already have.", action: { label: "Open Agents", route: "/ollopa/agents" } }
    case "templates":
      return { title: "No templates yet", body: "A template is an email step saved to be used again. Save one from a sequence step and it lands here.", action: { label: "Open Sequences", route: "/ollopa/sequences" } }
    case "inbox":
      return { title: "No replies yet", body: "Every email a sequence sends can come back with an answer. The first one lands here, sorted by what it means.", action: { label: "Open Sequences", route: "/ollopa/sequences" } }
    case "tasks":
      return { title: "Nothing due", body: "Tasks arrive from sequences you own and from deals and accounts assigned to you.", action: { label: "Open Sequences", route: "/ollopa/sequences" } }
    case "deals":
      return { title: "No deals yet", body: "A deal starts from the company it belongs to, and then works its way across the board by stage.", action: { label: "Open Companies", route: "/ollopa/companies" } }
    case "accounts":
      return { title: "No accounts yet", body: "An account arrives when a deal reaches Closed won and hands over to customer success.", action: { label: "Open Deals", route: "/ollopa/deals" } }
    case "campaigns":
      return { title: "No campaigns yet", body: "A campaign sends one email to an audience built from your lists. Start with the list the audience comes from.", action: { label: "Open Lists", route: "/ollopa/lists" } }
    case "workflows":
      return { title: "No workflows yet", body: "A workflow routes what arrives — a form submission, a score crossing its threshold, a new contact — to a person, a list or a sequence.", action: { label: "Open Settings", route: "/ollopa/settings" } }
    // A request is raised where the problem was met, never here, so this state has nothing to press
    // (spec 20 §3 States). The sentence says where they come from instead.
    case "requests":
      return { title: "No requests", body: "When somebody meets a locked feature, an area their seat does not hold, or a field that is not there, their ask arrives here with what they were trying to do." }
    case "agents":
      return { title: "No agents on", body: "Research, outreach and scoring run while nobody is looking. Turning one on is a workspace decision, in Settings.", action: { label: "Open Settings", route: "/ollopa/settings" } }
    default:
      return null
  }
}

/** The first-run state, or nothing at all. Any page may render this above its own content. */
export function FirstRunState({ page, session }: { page: Page; session: Session }) {
  const state = firstRunFor(page, session)
  if (!state) return null
  return (
    <EmptyState
      title={state.title}
      body={state.body}
      action={
        state.action && (
          <Button variant="outline" size="sm" asChild>
            <a href={href(state.action.route)}>{state.action.label}</a>
          </Button>
        )
      }
    />
  )
}
