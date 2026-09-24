// What a page asks before it decides where anything goes.
//
// A page never hard-codes its level-one set. It asks this, and the answer comes from the usage model:
// the share of people in this seat, at this business, who touch the item in a typical week. Decision-
// critical items are level one whatever the number (rule 7); an AE seat with direct reports reads the
// `ae_plus` number where one exists. Nothing from here is ever rendered — no percentages, no sources,
// no "level" anywhere in the product (PLAN.md, "Where numbers show").
import { createContext, useContext, useMemo } from "react"
import { itemsFor, levelOf, weeklyUse, type Page, type UsageItem } from "../usage"
import { useSession } from "../session"

export interface Disclosure {
  /** 1 for the page itself, 2 for behind a door. */
  level: (itemId: string) => 1 | 2
  /** Share of this seat touching the item in a typical week, for a page's own ordering. */
  weekly: (itemId: string) => number
  /** Every item this page declares, in the order the usage file lists them. */
  items: UsageItem[]
  /** Convenience for the common `level(id) === 1` test. */
  atLevelOne: (itemId: string) => boolean
  /** The items at level one, in descending weekly use: the order a column or a card list is built in. */
  levelOne: UsageItem[]
}

/**
 * One level deeper, inside the beside pane only.
 *
 * The pane has two widths and they are two levels of the same record: `beside` is the glance, the
 * record's own first level; `expanded` is the same pane widened over the page with the next level
 * of the record in it, so a person can read the whole thing without leaving (BUILD-CHAINS.md, the
 * pane). Rather than every registered pane body learning a second rule, the frame turns this on
 * around the body it draws and every `useDisclosure` inside it answers "level one" for everything.
 *
 * It is off everywhere else, so a record page, an index and a door are untouched by it.
 */
const Deeper = createContext(false)
export const DeeperProvider = Deeper.Provider

export function useDisclosure(page: Page): Disclosure {
  const deeper = useContext(Deeper)
  const session = useSession()
  const business = session?.business ?? "meridian"
  const role = session?.role ?? "ae"
  const hasReports = session?.hasReports ?? false

  return useMemo(() => {
    const items = itemsFor(page)
    const byId = new Map(items.map((i) => [i.id, i]))
    const level = (id: string): 1 | 2 => {
      const item = byId.get(id)
      // Widened, the pane is reading the next level, so everything the record declares is on it.
      if (deeper && item) return 1
      if (!item) {
        if (import.meta.env.DEV) console.warn(`[usage] "${id}" is not an item on page "${page}"`)
        return 2
      }
      return levelOf(item, business, role, hasReports)
    }
    const weekly = (id: string) => {
      const item = byId.get(id)
      return item ? weeklyUse(item, business, role, hasReports) : 0
    }
    return {
      level,
      weekly,
      items,
      atLevelOne: (id: string) => level(id) === 1,
      levelOne: items.filter((i) => level(i.id) === 1).sort((a, b) => weekly(b.id) - weekly(a.id)),
    }
  }, [page, business, role, hasReports, deeper])
}
