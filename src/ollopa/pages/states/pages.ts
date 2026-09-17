// What each page is for, in one sentence, and what a seat that does not hold it can still do.
//
// Two states need this text and neither of them is the page itself: the no-access page, which must
// say what the area is for before it says who has it (spec 00 §3.2, "what the page is for, which
// seats use it, who to ask"), and the placeholder a page gets before its own builder lands. Keeping
// both sentences here means the two states say the same thing about a page, and the page's own
// builder never has to repeat it.
import type { Page } from "../../usage/model"

/**
 * One sentence per page, the first line of that page's spec §1 said plainly. Present tense, active
 * voice, no feature list: a person who has never seen the page should know whether they need it.
 */
export const PURPOSE: Partial<Record<Page, string>> = {
  people: "People holds every contact in the workspace, so you can find who to work next and put them into a sequence or a list.",
  companies: "Companies moves you from which accounts to which people at them: owners, open deals and who is already in a sequence.",
  lists: "Lists groups people and companies so something can be done to the group: enrol them, mail them, export them, hand them over.",
  sequences: "A sequence is a multi-step outreach plan: emails that send themselves, call and LinkedIn tasks, and waits between them.",
  templates: "Templates holds the email steps sequences and campaigns reuse, with the numbers each one earns.",
  inbox: "Inbox is where a reply becomes a next step: interested, a question, not now, out of office, or leave them alone.",
  tasks: "Tasks answers one question: what do I do next, and what is overdue.",
  deals: "The deals board is the pipeline by stage, with the next step, the close date and the forecast.",
  campaigns: "Campaigns sends email to many people at once, collects the people who put their hand up, and shows what came back.",
  accounts: "Accounts is the customer book: health, renewal date, seats and usage, expansion signals and open risks.",
  reports: "Reports is where a leader checks how the team is doing and a seller commits to a number.",
  agents: "Agents is where you see what the three agents did, decide what they may do next, and read what it cost.",
  workflows: "Workflows routes what arrives — a form submission, a score crossing its threshold, a new contact — to a person, a list or a sequence.",
  requests: "Requests is the queue of people asking the admin to change what others can see, each with the reason and the decision.",
  settings: "Settings holds the workspace and your own: mailbox, signature, plan, credit usage and who can do what.",
  enrichment: "Enrichment fills in what a record is missing, and says what each field costs before it spends.",
  developer: "The developer surfaces are the API keys, webhooks, MCP tokens and CLI devices this workspace uses.",
  connect: "Connect links Ollopa to your CRM, calendar and mailboxes, and shows what is failing to sync.",
}

/**
 * The one thing a seat that does not hold the area can still do, where the area's own spec names it
 * (spec 04 §3 States, spec 03 §3). `instead` is the page the sentence sends them to, so the line is
 * only shown to a seat that holds that page: a consolation that leads to a second no-access page is
 * worse than silence.
 */
export const STILL_CAN: Partial<Record<Page, { instead: Page; text: string }>> = {
  lists: { instead: "people", text: "You can still add people to a list or a sequence from People." },
  companies: { instead: "people", text: "People carries the same contacts, with their company on every row." },
  campaigns: { instead: "sequences", text: "Sequences sends to people one at a time from your own mailbox." },
  reports: { instead: "home", text: "The numbers for your own week are on Home." },
  accounts: { instead: "companies", text: "Companies carries the same accounts, with the owner and the open deals on each." },
  deals: { instead: "companies", text: "Companies shows the open deals at each account, and who owns them." },
}
