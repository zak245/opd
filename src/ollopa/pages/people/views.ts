// Saved views: a named set of filters, columns and sort, owned by a person and shareable (spec 02 §3).
//
// The views themselves live in the seed as `savedViews`, per business and seat, because a view is a
// workspace's own row and not something a page invents. This file joins them to the page: a seed row
// carries its filters as `field` (the page's filter id) and one `value` each, and this turns that
// back into the page's active-filter shape. A view lives in the workspace it was made in — at
// Halyard, one client workspace.
import type { Role } from "../../usage/model"
import type { Seed } from "../../data/seed"
import { daysSince, type PersonRow } from "./person"
import type { Active } from "./filters"

export interface PeopleView {
  id: string
  name: string
  filters: Active
  /** Columns this view adds to the seat's default set, at the end, in this order. */
  extraColumns: string[]
  sort?: { key: string; dir: "asc" | "desc" }
  owner: string
  sharedWith: "everyone" | "me"
  defaultFor: Role[]
  /**
   * The data-quality pass: two or more of email, phone, title, company and the last enrichment date
   * missing or older than twelve months. It ships with the product because the work is the same
   * everywhere, and its rows feed the enrichment panel and the import wizard directly.
   */
  shipped?: boolean
  /** Alerts: "email me when it gains people". */
  alert?: "off" | "daily" | "weekly"
}

/** The shipped view's rule, which is a predicate rather than a filter value. */
export function needsEnrichment(p: PersonRow): boolean {
  const missing = [
    p.emailStatus !== "Verified",
    !p.phone || !p.phoneRevealed,
    !p.title,
    !p.company,
    !p.enrichedOn || daysSince(p.enrichedOn) > 365,
  ].filter(Boolean).length
  return missing >= 2
}

export function viewsFor(seed: Seed): PeopleView[] {
  return seed.savedViews
    .filter((v) => v.object === "person")
    .map((v) => {
      const filters: Active = {}
      for (const f of v.filters) (filters[f.field] ??= []).push(f.value)
      const [key, dir] = v.sort.split(" ")
      return {
        id: v.id,
        name: v.name,
        filters,
        extraColumns: v.columns,
        sort: key ? { key, dir: dir === "asc" ? "asc" : "desc" } : undefined,
        owner: v.owner,
        sharedWith: v.sharedWith,
        defaultFor: v.defaultFor,
        shipped: v.shipped || undefined,
        alert: v.alert,
      }
    })
}
