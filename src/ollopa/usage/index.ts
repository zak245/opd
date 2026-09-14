import type { Business, Page, Role, UsageItem } from "./model"
import { settingsItems } from "./settings"
import { homeItems } from "./home"
import { shellItems } from "./shell"
import { peopleItems } from "./people"
import { companiesItems } from "./companies"
import { listsItems } from "./lists"
import { sequencesItems } from "./sequences"
import { inboxItems } from "./inbox"
import { tasksItems } from "./tasks"
import { dealsItems } from "./deals"
import { dealItems } from "./deal"
import { campaignsItems } from "./campaigns"
import { accountsItems } from "./accounts"
import { reportsItems } from "./reports"
import { agentsItems } from "./agents"
import { connectItems } from "./connect"

export * from "./model"

/** Every item on every page. One model; every page reads from it. */
export const allItems: UsageItem[] = [
  ...shellItems,
  ...homeItems,
  ...peopleItems,
  ...companiesItems,
  ...listsItems,
  ...sequencesItems,
  ...inboxItems,
  ...tasksItems,
  ...dealsItems,
  ...dealItems,
  ...campaignsItems,
  ...accountsItems,
  ...reportsItems,
  ...agentsItems,
  ...settingsItems,
  ...connectItems,
]

export function itemsFor(page: Page): UsageItem[] {
  return allItems.filter((it) => it.page === page)
}

export function itemById(id: string): UsageItem | undefined {
  return allItems.find((it) => it.id === id)
}

/** Duplicate ids across pages would make lessons cite the wrong item; checked once at load in development. */
if (import.meta.env.DEV) {
  const seen = new Set<string>()
  for (const it of allItems) {
    if (seen.has(it.id)) console.warn(`[usage] duplicate item id: ${it.id}`)
    seen.add(it.id)
  }
}

export type Session = { business: Business; role: Role }
