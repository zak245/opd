import type { Business, Page, Role, UsageItem } from "./model"
import { settingsItems } from "./settings"

export * from "./model"

/** Every item on every page. Pages are added here as they are built. */
export const allItems: UsageItem[] = [...settingsItems]

export function itemsFor(page: Page): UsageItem[] {
  return allItems.filter((it) => it.page === page)
}

export function itemById(id: string): UsageItem | undefined {
  return allItems.find((it) => it.id === id)
}

export type Session = { business: Business; role: Role }
