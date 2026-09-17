// What the Settings page reads that is not a collection of its own.
//
// Users, teams, territories, permission profiles, mailboxes, domains, pipelines, fields, personas,
// signals, score models, agents, integrations, API keys, webhooks, MCP tokens, CLI devices, invoices,
// credits, requests and the workspace row are objects in their own right and are read straight from
// `seedFor(business)`. The handful of settings that belong to no collection live on the seed as
// `settings`, and this file is the one join between the page and that row.
import type { Business } from "../../usage/model"
import { seedFor, type DncLogRow, type WorkspaceSettings } from "../../data/seed"

export type { DncLogRow }
/** The name the page has always used for the settings row. */
export type DerivedSettings = WorkspaceSettings

export function settingsFor(business: Business): DerivedSettings {
  return seedFor(business).settings
}

/** The upgrade requests waiting on the admin: the Requests queue owns them, the strip reads them. */
export function upgradeRequestsFor(business: Business) {
  return seedFor(business).requests.filter((r) => r.kind === "upgrade" && r.state !== "declined" && r.state !== "verified")
}
