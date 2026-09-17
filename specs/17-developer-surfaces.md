# Developer surfaces: the API, webhooks, MCP and the CLI

*The seventeenth spec. One settings area, four panels, and four surfaces with no screen Ollopa controls. Usage items: `src/ollopa/usage/developer.ts` (the surfaces) and the "API, webhooks, MCP and CLI" area of `src/ollopa/usage/settings.ts` (the rows on the Settings page). Nodes: IA-MAP 2.16, plus `S-developer` in 2.14. IA-MAP 6.5 asked for this file by name: the approval batch, the consequence line and the credit cap "written as text before any screen for them is designed".*

## 1. Purpose

Four surfaces where a person meets Ollopa and Ollopa draws nothing: **the API** (`U-api`), **webhooks** (`U-hooks`), **MCP** (`U-mcp`) and **the CLI** (`U-cli`). One settings area configures all four — `S-developer`, "API, webhooks, MCP and CLI" — through four panels: `X-key`, `X-hook`, `X-mcpscope`, `X-cliauth`. And one node belongs to none of the four and to all of them: `X-approve-remote`, the approval card that has to arrive in a chat client or a terminal.

Who lives here: the **RevOps admin**, for the workspace rows. The MCP scope and the CLI device authorisations are personal, so **every seat** reaches those two from "You" in Settings, the way every seat reaches their own mailbox.

How often: Meridian's admin creates a key once and reads its spend most weeks, because a nightly enrichment job runs on it. Fathom's founder holds both the OPS and SDR seats and works the workspace from an AI client **every day**, on Starter, where read scope is included and the two write tiers are locked and priced. Halyard's ops lead runs a weekly bulk update across ten client workspaces from the terminal — the CLI came inside the boundary for her. Ridgeline's admin keeps one webhook subscription alive and reads its delivery log when something upstream goes quiet.

The one thing nobody on these surfaces may lose sight of: **what this call will change, what it will cost, and what happens when it reaches a limit.** There is no strip and no pill out here. A rule-7 promise that is only kept on a screen is not kept, so on these four surfaces it becomes a response header, an exit code, a printed cost table and a card the model may not summarise away.

Three rules the rest of the product already owns are re-expressed here and are **not re-decided**: the second-approval threshold and the approval batch (spec 13 and PLAN.md, 14 Sep 2026), the credit balance and burn (spec 14's strip and `X-credits`), and the three kinds of "cannot see it" (the declared-sidebar pattern).

## 2. Data

Sources are `src/ollopa/data/seed.ts`, `businesses.ts` and the `settings` object spec 14 §2.2 adds. The seed's fixed "today" is 13 September 2026.

| Field | Where shown | Source | To add to seed |
|---|---|---|---|
| Key name, created, created by, last used, scope, expiry, state | Key list, `X-key` | none | `apiKeys[]` per business: `{ id, name, createdOn, createdBy, lastUsedAt, scopes[], expiresOn, revokedOn? }`. Meridian 2 ("Warehouse sync", "Nightly enrichment"), Ridgeline 1, Halyard 1 per client workspace, Fathom 0 (Starter) |
| Spend per key this cycle | Key row, `X-key`, `X-credits` surface breakdown | `businesses.credits` (exists) | `apiKeys[].creditsThisCycle`, summing to the API share of `credits.burnPerWeek` |
| Per-workspace rate limits | The line above the key list | none | a constant: 200 a minute, 6,000 an hour, 50,000 a day, the same for every plan |
| Published cost per endpoint | The cost table | none | `endpointCosts[]`: `{ endpoint, typical, maximum }` — search 0, list and update 0, person enrichment 1–9, "+8 if a mobile is returned", email waterfall 1–4 typical / 20+ maximum, phone waterfall 8–25 typical / 45+ maximum |
| 80% alert, on or off, and who owns the key | Alert row | none | `apiKeys[].alertAt: 0.8`, `alertOwner` |
| Webhook subscription: URL, events, secret set on, state, failing since, attempts | Subscription list, `X-hook` | `integrations[].webhook` from spec 15 §2 | `webhooks[]`: `{ id, url, events[], secretSetOn, state: "delivering" | "failing" | "paused", failingSince?, lastDeliveryAt }`. Ridgeline 2, Meridian 1, Halyard 0, Fathom 0 |
| Delivery log rows | `X-hook`, grouped by cause | none | `webhookDeliveries[]`: `{ webhookId, at, event, recordId, attemptNumber, status, cause }` — 40 at Ridgeline including one group of 18 "handler returned 500" |
| MCP scope: tier, per-action decision, client, authorised on | `X-mcpscope`, "You" | none | `mcpTokens[]`: `{ userId, tier: "read" | "write_safe" | "write_destructive", actions: Record<string, "allow" | "approve" | "block">, client, authorisedOn, lastUsedAt }`. Fathom 3 (all read; one asking for safe writes), Meridian 6, Halyard 2, Ridgeline 1 |
| The ceiling that applies | `X-mcpscope` | `settings.team.users[].creditLimit` (spec 14) and `businesses.credits.monthlyCap` | nothing; the panel picks whichever exists |
| Model-training position | `X-mcpscope`, connection document | none | one workspace field, `settings.ai.modelTraining: "off"` for all four |
| CLI device authorisation: device, workspace, last used | `X-cliauth`, "You" | none | `cliDevices[]`: `{ userId, label, workspace, authorisedOn, lastUsedAt }`. Halyard 2, Fathom 1, Meridian 1, Ridgeline 0 |
| Exit codes | The CLI block | none | a constant list of seven |
| The pending approval | `X-approve-remote`, and the same row in `P-agents` | `seed.agentEvents` with the spec 13 §2 additions | `AgentEvent.surface: "app" | "automation" | "api" | "mcp" | "cli" | "agent"`, and `AgentEvent.actorUser` so a remote run reads "Priya Natarajan · Claude (MCP)". Two seeded remote items: one MCP enrolment at Fathom, one CLI bulk update of 4,000 records at Halyard |

`AgentEvent.surface` is added here and read by spec 13 (the ledger's Surface column) and spec 14 (`X-credits`' third breakdown). One field, three readers, defined once.

## 3. Features

### 3.1 The settings area

`S-developer`, "API, webhooks, MCP and CLI", sits between Integrations and Plan, billing and usage. It is the thirteenth settings area and the fourth level-one part of this spec; spec 14 owns the page it sits on and this spec owns what is in it.

Level one in the area, in this order:

1. **Limits are per workspace, not per key.** "200 a minute · 6,000 an hour · 50,000 a day. Every plan." One line, above the key list, because a developer who does not know the limit is shared mints three keys and buys nothing.
2. **The cost table.** Endpoint, typical, maximum. Six rows and one sentence: "Reads and writes cost nothing. Enrichment costs, and the maximum is not the average." The phone-waterfall row reads "8–25, up to 45+".
3. **Alert the key's owner at 80% of the allocation.** On by default. A digest line and a bell row under the existing "credits low" kind; no new notification kind.
4. **The key list.** Name, scope, last used, spend this cycle, state. "Create a key". Each row opens `X-key`.
5. **Webhook subscriptions.** URL, events, state ("Delivering", "Failing since 11 Sep, 14:02", "Paused by you"). Each row opens `X-hook`.
6. **The delivery contract**, six lines, under the subscription list: at-least-once, signed, attempt-numbered, retried for 24 hours, never silently disabled, and the reconciliation endpoint, named and copyable.
7. **MCP connection and scope.** The three tiers with the chosen one marked; read on every plan, the two write tiers carrying the lock and the plan name where they are not included. "Your connections" opens `X-mcpscope`.
8. **CLI device authorisations**, with the published exit codes beneath them.

On Starter the API, webhook and CLI rows are where they always are, with a lock, "Growth", and one total for the period. MCP read is not locked at any tier (IA-MAP 6.4f).

### 3.2 `X-key` — one API key

Flat panel, no doors. Name; scope (which objects the key may read and write, and one line saying whether the scope reaches records on the removal list); created by and on; last used; expiry; **spend this cycle** with a link, "The jobs this key ran", which opens the enrichment job record filtered to that key (spec 18 owns `R-job`). Actions: Rotate ("The old secret stops working at once; nothing else changes") and Revoke ("Every call using this key fails from now on. 2 jobs run on it").

The per-workspace limit line and the cost table are **not** inside this panel. They inform a decision made before the key exists, so they sit in the area above it (rule 5).

### 3.3 `X-hook` — one webhook subscription

Flat panel. URL; the events it carries; the signing secret with "Rotate"; the state in words; and the **delivery log grouped by cause**, largest group first, each group a count, a one-line cause and "Replay these 18". A group expands in place to its rows. This is the same treatment `X-errors` gives CRM sync errors: one pattern, two places, so nobody has to learn a second one.

Two sentences sit on the panel and are never behind anything:

- "Approvals are not webhook events. A webhook fires on what happened, never on what needs deciding." A surface with no reply path cannot carry a decision, and an auto-approver has zero review capacity, which is rule 7's corollary at its worst.
- "Delivery is neither guaranteed nor ordered. Reconcile nightly from `GET /v1/changes?since=<cursor>`." The endpoint is printed and copyable.

A subscription that fails is **never silently disabled**. It keeps its place, says how long it has been failing and why, appears in the daily digest with its failure count and cause, and is not one of the three interrupting bell kinds: a webhook failing for an hour is not a safety state.

### 3.4 `X-mcpscope` — the three scopes

Flat panel, reachable from `S-developer` (the workspace view, admin) and from "You" (your own connections, every seat).

- **The tier.** Read · Safe writes · Destructive writes, as three rows with what each contains in words ("Read: search, open, list. Safe writes: create a draft, create a task, create a record. Destructive writes: update, delete, enrol, send, enrich"). Read is on every plan. The two write tiers carry the lock, the plan name and one total for the period **on the tier**, before any work exists, and the endpoint restates it at connection. There is no gate at the moment a write fails.
- **Each action inside the chosen tier**: allowed, approval-required, or blocked. Three states, one row each, nothing hover-only.
- **The ceiling that applies**, in the panel and in the connection document: "Your limit: none · Workspace cap 10,000 a month, 4.1k left." Whichever of the two exists is printed; if only the workspace cap exists, the panel says so rather than leaving the client to discover it.
- **Model training**: "This workspace requires model training to be off in your client." Stated at connection, not in a policy page: rule 7 names how data is used explicitly.
- **Your connections**: client, authorised on, last used, Revoke.

### 3.5 `X-cliauth` — device authorisations

Flat panel. One row per device: label, workspace, authorised on, last used, Revoke. Sign-in is a browser round trip, or a device flow where there is no browser. Underneath, the **published exit codes**: `0` ok · `1` error · `2` usage · `3` permission · `4` rate limited · `5` over the credit cap · `6` awaiting approval. On `6` the CLI prints a resume token.

### 3.6 `X-approve-remote` — the approval card with no screen

One node, three parents (`U-api`, `U-mcp`, `U-cli`), one shape:

```
Approval needed · 3 actions · 2 emails, 1 enrolment · 12 credits
  1. Send to Amara Okonkwo from marcus@meridian.io — 0 credits
  2. Send to Tomás Ruiz from marcus@meridian.io — 0 credits
  3. Add Lena Fischer to "Q4 enterprise outbound"; step 1 sends Mon 09:00; enriches first — 12 credits
Requested by Priya Natarajan · Claude (MCP) · 09:14
Over 1,000 recipients or 500 credits? No.
Approve all · Approve one · Decline all          Also waiting in Ollopa › Agents
```

Five rules govern it, and four of the five are spec 13's rules re-expressed rather than new:

1. **The boundary is the end of the client's turn.** Every approval-required action taken in one turn arrives as **one card** with the total. Never one card per tool call: a card per call is the step-by-step queue rule 7's corollary measures, where a problematic action was seen 88.5% of the time and stopped 23.9% (Chen et al., arXiv 2604.04918, n=48). In a terminal the boundary is the end of the command.
2. **Each item keeps its own consequence line and its own cost.** The total is the header, not the content.
3. **The card is not summarisable and not collapsible.** It is returned as content the client must render, not as a string the model may paraphrase.
4. **The same item is in the app's queue and is decided once**, in either place. The ledger records which surface decided it.
5. **A bulk write is one item**, owned by whoever ran the command, carrying the count, the total consequence and the total credits, with the records reachable from the count. Four thousand queue items is rule 7's corollary written as a screen.

### 3.7 What each surface promises, in words

**The API.** Two headers on every credit-consuming response: `X-RateLimit-Remaining` and **`X-Credits-Remaining`**. A rate limit is not a budget; a nightly job that stops when it runs out of requests still burns credits until it does. At the credit cap, a refusal naming the cap, the reset time and the approver — never a partial result. Over the second-approval threshold, the call returns the pending-approval object with its consequence line, its cost and its approver's name, and the same item appears in the app's queue. The three "cannot see it" shapes: an object the key's owner does not own returns its readable fields and an `owner` line; an area the key's seat does not hold returns a refusal naming the seats that hold it and the admin to ask; **profile omission does not exist for a key**, and the document says so in one line rather than leaving it to inference.

**Webhooks.** Outbound only. The six-line contract above. Reconciliation is expected, not optional, and its endpoint is named. No approval events.

**MCP.** Per-user, authorised as the person, carrying their permissions, their credit limit and the workspace's compliance restrictions. Every credit-consuming tool result states remaining credits; at the cap it refuses rather than writing part of the batch, because a partial result is what a model summarises as success. The server's **tool list is exactly the seat's areas**, with no profile filtering, and the connection document says so. The other two "cannot see it" shapes are the API's, word for word.

**The CLI.** Narrow on purpose: authenticate, search, export, bulk update with `--resume`, allocation check, analytics. Every command takes `--workspace` and echoes the workspace name in every confirmation; a **destructive** bulk write asks for the workspace name to be typed back, exactly as Delete workspace does in Settings. Before any bulk write it prints what will change, how many records and how many credits, and checks the allocation first rather than failing halfway. A locked capability prints the plan name and the monthly total, not a 403. The three shapes: an unowned record exports its readable fields with an `owner` column; an area the seat does not hold exits `3` naming the seats and the admin; profile omission does not apply, and `--help` says so.

### 3.8 Actions and outcomes

| Action | Where | Outcome |
|---|---|---|
| Create a key | Area | `X-key` opens on the new key with the secret shown once and a line saying so |
| Rotate, Revoke | `X-key` | Confirmation restating what stops; the row keeps its place and reads "Revoked 15 Sep by Daniel Okafor" |
| Open the jobs a key ran | `X-key` | Navigates to the enrichment job list filtered to that key (spec 18) |
| Turn the 80% alert off | Area | One line under it: "Nobody is told before the allocation runs out" |
| Create a subscription | The connect wizard (spec 15) | Ends here, in `X-hook`, not on the integration page |
| Replay a failure group | `X-hook` | "Replaying 18…", then the group leaves or reports a new cause |
| Copy the reconciliation endpoint | Area, `X-hook` | Copied; nothing else changes |
| Choose an MCP tier | `X-mcpscope` | Saved; the connection document changes; a locked tier opens the upgrade panel instead |
| Set one action to approval-required | `X-mcpscope` | Saved; matching calls now return the approval card instead of acting |
| Revoke a device or a connection | `X-cliauth`, `X-mcpscope` | That client stops working at the next call; runs already approved finish |
| Approve or decline on the card | Any surface | The item leaves both the card and the app queue; the ledger records the surface and the person |
| Resume a bulk run | The CLI | Continues from the token; nothing is re-applied |

No bulk actions in the area itself: there are never enough keys or subscriptions for one.

### 3.9 Filters, search, sorting, columns

The key list and the subscription list sort by last used, newest first, and have no search: a workspace has single-digit numbers of both. The delivery log inside `X-hook` is grouped by cause first and by time within a group, with a date filter and an event filter; grouping is not a sort the reader chooses, because the reason is the thing being looked for.

### 3.10 States

| State | What shows |
|---|---|
| No keys | "No API keys. A key lets a script read and write this workspace. Limits are per workspace: 200 a minute, 6,000 an hour, 50,000 a day." Then "Create a key" |
| Locked by plan (Starter) | Keys, webhooks and the CLI rows sit where they always sit, with a lock, "Growth" and one total for the period. MCP read is not locked. Never greyed, never moved |
| No subscriptions | "No webhooks. Ollopa will POST to your endpoint when something happens. Delivery is at-least-once and out of order." Then "Connect a webhook", which opens the wizard |
| A subscription failing | The row reads "Failing since 11 Sep, 14:02 · 18 deliveries · handler returned 500", with the group and "Replay these 18" one click away. It is never disabled by us |
| At the credit cap | The area's top line reads what the strip reads: balance, burn, run-out. Every surface refuses with the cap, the reset and the approver |
| Awaiting approval | The card, on the surface; the same item in `P-agents`; exit code `6` and a resume token in the terminal |
| Loading | The lists render their headings and skeleton rows; the limit line and the cost table are constants and render at once |
| Error | Row-level: "Couldn't read this key's spend; showing the value from 09:12. Retry." The rest of the area works |
| No access (any non-admin seat) | The area shows **only** the personal rows — your MCP connections and your CLI devices — followed by one sentence: "API keys, webhooks and workspace CLI authorisations are managed by Daniel Okafor, RevOps admin." No greyed rows |

### 3.11 Keyboard, accessibility, phone

Every control is a native button, input or link. The area's rows are the same shape as every other settings row, so `/` search finds them by label and synonym ("API", "token", "key", "hook", "callback", "MCP", "CLI", "terminal"). Deep-link anchors exist per row (`/ollopa/settings#dev.mcp`). The delivery-log groups are `button`s in headings with `aria-expanded`. State words — Delivering, Failing, Paused, Revoked — are text, never colour alone. The cost table is a real table with a caption and row headers. Code — the reconciliation endpoint, the exit codes, an example header — is in `<code>` with a copy button that has a visible label, and is selectable by keyboard.

At phone width the key list and subscription list become cards, the cost table scrolls inside its own container with a sticky first column, and the delivery-log group still expands in place. The approval card is not a screen we draw at any width; the client renders it.

### 3.12 By role and by business

| | RevOps admin | Every other seat |
|---|---|---|
| Sees | The whole area | Your MCP connections and your CLI devices, plus the sentence naming the admin |
| Can | Create, rotate and revoke keys; set scopes; manage subscriptions; set the workspace MCP tier | Choose your own per-action settings inside the tier the workspace allows; revoke your own devices |

| Business | What changes |
|---|---|
| **Fathom Labs** (Starter) | The founder holds OPS and SDR and works from an AI client daily. MCP read is included and carries the page; safe and destructive writes sit in place with a lock, "Growth" and "$316 a month for 4 seats". API, webhooks and the CLI are locked and in the tail — they are on the page and almost never touched, which is what a small company on a small plan looks like. The ceiling line matters most here, because no Fathom seat has a personal credit limit, so the client inherits the workspace cap |
| **Meridian Software** (Scale) | Baseline. Two keys, one nightly enrichment job, one webhook. The admin's week is the key's spend and the job it ran. MCP scope is a governance row: 42 people, six connections, and the admin reads who holds which tier |
| **Halyard Agency** (Growth) | The CLI is the page. Ten client workspaces, one loop, weekly: `--workspace` on every command, the typed-back name on a destructive write, the pre-flight three facts, the exit codes and `--resume`. The panel's footer names the accelerator that the app cannot give: "Credits are per workspace. `ollopa credits --all-workspaces` reports across all ten." |
| **Ridgeline** (Growth) | Two webhook subscriptions and nothing else. The subscription's own state, the grouped delivery log and the reconciliation endpoint are the head; three of the five areas are in this workspace's tail, honestly |

## 4. Usage items

Share of active users in a role touching the item in a typical week (USAGE-MODEL.md). Baseline is Meridian. **DC** = decision-critical, level one whatever the number. Only the admin and SDR columns exist: the AE, marketer and CS seats have no number for any item here, so none of it is on their page. The same table is `src/ollopa/usage/developer.ts`.

| Item | Area | Admin | SDR | Overrides (Fa, Ha, Ri) | DC |
|---|---|---|---|---|---|
| API keys with scope, last used and spend | API keys and limits | 25 | – | Fa 3; Ha 20; Ri 12 | |
| Create a key | API keys and limits | 3 | – | Fa 1; Ha 8; Ri 2 | |
| What a key may reach, and whether it reaches restricted records | API keys and limits | 8 | – | Fa 1; Ha 10; Ri 4 | |
| Spend per key against the workspace balance | API keys and limits | 30 | – | Fa 2; Ha 35; Ri 15 | ★ |
| Rotate or revoke a key | API keys and limits | 3 | – | Fa 1; Ha 6; Ri 2 | |
| Limits are per workspace, not per key | API keys and limits | 20 | – | Fa 4; Ha 18; Ri 8 | ★ |
| Published cost per endpoint, typical and maximum | API keys and limits | 6 | – | Fa 22; Ha 20; Ri 4 | ★ |
| Alert the key's owner at 80% | API keys and limits | 4 | – | Fa 20; Ha 14; Ri 3 | ★ |
| The jobs this key ran | API keys and limits | 20 | – | Fa 2; Ha 15; Ri 6 | |
| Credits remaining beside requests remaining | The API | 22 | – | Fa 25; Ha 18; Ri 8 | ★ |
| At the cap: a refusal, never a partial result | The API | 5 | – | Fa 12; Ha 8; Ri 2 | ★ |
| The pending-approval object | The API | 6 | – | Fa 6; Ha 12; Ri 2 | ★ |
| Unowned object: readable fields and an owner line | The API | 2 | – | Fa 1; Ha 6; Ri 1 | |
| Area the seat does not hold: a refusal naming the seats | The API | 2 | – | Fa 1; Ha 4; Ri 1 | |
| Profile omission does not exist for a key | The API | 1 | – | Fa 1; Ha 2; Ri 1 | |
| Cursor paging and the reconciliation cursor | The API | 8 | – | Fa 2; Ha 4; Ri 10 | |
| The error shapes a caller must handle | The API | 6 | – | Fa 2; Ha 3; Ri 4 | |
| Subscriptions: URL, events, state | Webhooks | 6 | – | Fa 1; Ha 3; Ri 25 | |
| This subscription's state | Webhooks | 20 | – | Fa 1; Ha 4; Ri 35 | ★ |
| The delivery contract, six lines | Webhooks | 5 | – | Fa 1; Ha 2; Ri 18 | ★ |
| Which events, and that approvals are not among them | Webhooks | 3 | – | Fa 1; Ha 2; Ri 12 | |
| Delivery log grouped by cause | Webhooks | 6 | – | Fa 1; Ha 3; Ri 30 | |
| Replay one group | Webhooks | 3 | – | Fa 1; Ha 2; Ri 15 | |
| The reconciliation endpoint, copyable | Webhooks | 6 | – | Fa 1; Ha 2; Ri 20 | ★ |
| Signing secret and rotation | Webhooks | 1 | – | Fa 1; Ha 1; Ri 4 | |
| A failing subscription in the digest | Webhooks | 4 | – | Fa 1; Ha 2; Ri 20 | |
| Three scopes: read, safe writes, destructive writes | MCP | 20 | 2 | Fa 30/30; Ha 6/4; Ri 4 | ★ |
| Each action: allowed, approval-required, blocked | MCP | 6 | 2 | Fa 25/25; Ha 4/3; Ri 3 | |
| The ceiling that applies | MCP | 5 | 3 | Fa 35/35; Ha 5/4; Ri 3 | ★ |
| Model-training position at connection | MCP | 2 | 1 | Fa 10/10; Ha 2/2; Ri 2 | ★ |
| One approval card at the end of the turn | MCP | 6 | 3 | Fa 40/40; Ha 4/4; Ri 2 | ★ |
| Remaining credits on every tool result | MCP | 4 | 3 | Fa 35/35; Ha 4/4; Ri 2 | ★ |
| The tool list is exactly the seat's areas | MCP | 2 | 1 | Fa 8/8; Ha 2/2; Ri 1 | |
| Your MCP connections | MCP | 4 | 2 | Fa 15/15; Ha 4/3; Ri 2 | |
| The lock on the two write tiers | MCP | 2 | 1 | Fa 20/20; Ha 1/1; Ri 1 | ★ |
| CLI device authorisations | The CLI | 3 | – | Fa 6/4; Ha 20/12; Ri 2 | |
| Every command takes a workspace, echoed in confirmations | The CLI | 6 | – | Fa 4/3; Ha 45/20; Ri 2 | ★ |
| A destructive bulk write asks for the name typed back | The CLI | 2 | – | Fa 2/1; Ha 30/10; Ri 1 | ★ |
| Pre-flight: what changes, how many, how many credits | The CLI | 3 | – | Fa 3/2; Ha 40/15; Ri 2 | ★ |
| Published exit codes | The CLI | 2 | – | Fa 2/1; Ha 25/8; Ri 1 | ★ |
| Resume from the token | The CLI | 2 | – | Fa 1; Ha 30/10; Ri 1 | |
| Export a table this seat can already read | The CLI | 4 | – | Fa 3/2; Ha 35/12; Ri 2 | |
| Unowned record exports with an owner column | The CLI | 2 | – | Fa 1; Ha 12/5; Ri 1 | |
| An area the seat does not hold exits 3 | The CLI | 1 | – | Fa 1; Ha 8/4; Ri 1 | |
| A locked capability prints the plan and the total | The CLI | 2 | – | Fa 8/6; Ha 4/2; Ri 1 | |
| The card: actor, consequence, cost, second approval | The approval card | 6 | 2 | Fa 30/30; Ha 15/10; Ri 2 | ★ |
| Decided once, in either place | The approval card | 3 | 2 | Fa 20/20; Ha 10/6; Ri 2 | ★ |
| A bulk write is one item | The approval card | 3 | – | Fa 4/3; Ha 20/8; Ri 1 | ★ |
| The run in the ledger, surface marked, human first | The approval card | 4 | 2 | Fa 25/20; Ha 15/6; Ri 3 | |

Nineteen of the forty-nine are decision-critical. That is a high share and it is the point of the file: on a surface with no screen, almost everything that would have been shown by being on the page has to be promised in words instead.

**Shape check**, computed from `developer.ts` with `shape()`. The denominator is every item that exists for that role at that business; an item whose number is 0 is removed there. The same rule is used in specs 12, 13, 14, 15, 16, 18 and 19.

| Pair | Items on their page | Head | Body | Tail | Verdict |
|---|---|---|---|---|---|
| Meridian admin | 49 | 7 (14%) | 15 (31%) | 27 (55%) | Fits, one point under on the head. One key, one job, one webhook: the admin's week here is the spend and what caused it |
| Halyard admin | 49 | 11 (22%) | 17 (35%) | 21 (43%) | Fits. The resident seat. Two points under on the tail, because the CLI block is almost entirely in this person's head |
| Fathom admin | 49 | 12 (24%) | 7 (14%) | 30 (61%) | Head fits; body well under and tail one point over. Starter locks the API, webhooks and the CLI, so two of the five areas are on the page and entirely in the tail — the same shape spec 14 records for Fathom, and for the same reason |
| Fathom SDR | 20 | 9 (45%) | 4 (20%) | 7 (35%) | Far over on the head, and honest: only the personal MCP and CLI rows exist for an SDR seat, so the denominator is 20 and the founder uses nearly all of it daily |
| Ridgeline admin | 49 | 5 (10%) | 9 (18%) | 35 (71%) | Head and body under, tail over. Ridgeline uses one of the four surfaces; three of the five areas are in its tail. Stated rather than smoothed |
| Meridian SDR | 12 | 0 | 0 | 12 (100%) | No head and no body. A Meridian SDR has a personal MCP row and never opens it. Honest, not a gap: the eight critical items that apply still render |

## 5. Before: the common version

Apollo has no page called "developer surfaces". What this spec covers is spread across a documentation site, one card inside a marketplace list, and two places that are not in the product at all. Every problem carries its source; anything I could not confirm is marked **unverified**.

### 5.1 Where the work lives in Apollo

1. **API keys.** Settings (its own shell) → Integrations → a marketplace-style list with category chips → the **Apollo API** card → *API keys* → *Create new key* (name, description, endpoint scopes, *Set as master key*), plus *OAuth registration* for partners (`07-apollo-settings-map.md` §Integrations, citing [Use Apollo API](https://knowledge.apollo.io/hc/en-us/articles/4416173158541)). Four levels from the app before a key exists.
2. **Webhooks.** "Only documented in the developer docs and via Zapier/Workflows; a 'Settings → Integrations → Webhooks' page is cited by third parties only — **unverified**" (`07-apollo-settings-map.md` §Integrations). The retry policy Ollopa's contract answers is not Apollo's: Apollo's own webhook row in the comparison table reads "n/a (poll fallback), 30 days pollable" (`19-revops-and-developer-notes.md` §10).
3. **Rate limits.** Published at docs.apollo.io/docs/rate-limits, not in the product. The sentence that matters most is there and only there: "Every limit is: **Per team, not per API key or per user**" (§9). Also there: "Apollo uses **fixed time windows**… windows are not aligned to the clock", and the headers `x-rate-limit-minute|hourly|24-hour`, `x-*-usage`, `x-*-requests-left`, `retry-after` (§9).
4. **Credit cost per call.** Also documentation only (docs.apollo.io/docs/api-pricing, updated 21 Aug 2026): "Endpoints that create, update, list, or manage records consume **0 credits**"; people enrichment "**1-9 credits** per person… **+8 credits if mobile phone is returned**"; and the line the whole cost table in §3.1 exists to answer: "**Email waterfall enrichment typically uses 1–4 credits, but some vendor configurations or successful higher-cost matches may result in 20+ credits. Phone waterfall enrichment typically uses 8–25 credits, but some configurations may result in 45+ credits.**" (§9)
5. **MCP.** `https://mcp.apollo.io/mcp`, Streamable HTTP, OAuth 2.0 or a master API key — "scoped keys fail with `403 API_INACCESSIBLE`". Prerequisites, verbatim: an active account, feature access, "**Available credits for enrichment and other credit-consuming actions**", and "**model training turned off in your AI account or client settings**". 40+ actions; some consume credits (§11).
6. **A CLI.** `19-revops-and-developer-notes.md` §12 inventories the GTM CLIs that exist — Salesforce's `sf`, HubSpot's `hs`, Clay's `clay` — and Apollo is not among them. Absence in a survey is not proof of absence, so: **unverified**.

### 5.2 Step 0, in one paragraph

A key is minted four levels down inside a marketplace card, with an endpoint-scope picker and a "master key" checkbox and no statement of what a call costs or what the limits are. The limits and the prices are in a documentation site the script author reads once and the person paying never sees. The response carries how many requests are left and nothing about credits. Webhooks are somebody's blog post. MCP is a URL with four prerequisites in a list, one of which is a data-use position. There is no card at the end of a turn, because there is no approval model outside the app: the assistant "asks you to confirm" inside the chat (spec 13 §5). And the spend all of this produces is read, if at all, in Settings › Credits and activity › Credit usage › AI runs, behind a permission.

### 5.3 Documented problems

| Problem | Where it shows | Source |
|---|---|---|
| The one fact that changes the design is in the docs and not the product | "Per team, not per API key or per user" | 19§9 (docs.apollo.io/docs/rate-limits) |
| A published cost with a 45× tail, read by the developer and never by the buyer | "Phone waterfall… 8–25… may result in 45+ credits" | 19§9 (docs.apollo.io/docs/api-pricing) |
| The response tells a script about requests, not about money | `x-rate-limit-*`, `x-*-requests-left`, `retry-after`; no credit header documented | 19§9 |
| Windows that cannot be reasoned about from outside | "fixed time windows… not aligned to the clock" | 19§9 |
| A scope model that fails in a way the caller cannot read | MCP: "scoped keys fail with `403 API_INACCESSIBLE`" | 19§11 |
| A data-use requirement delivered as a prerequisite bullet | "model training turned off in your AI account or client settings" | 19§11 |
| Webhooks with no published product surface | third-party page only, **unverified** | 07§Integrations |
| The industry's webhook failure mode, which any contract must answer | Outreach: "does not retry webhook deliveries upon receiving any of the Status Codes including `500`", 5-second timeout — "a 500 from your handler = permanent data loss". Salesloft: "retried **three additional times, spaced 15 seconds apart**" — a 45-second window that "will not survive a deploy or cold start". Calendly: auto-disabled, "must recreate" | 19§10 |
| Spend attribution behind a permission, three levels down | Settings › Credits and activity › Credit usage › AI runs | 07§1.0, 07§6 |

### 5.4 What the industry gets right, and Ollopa keeps

- **Close's three-tier scope header.** `Close-Scope`: `mcp.read`, `mcp.write_safe`, `mcp.write_destructive` — "the cleanest published safety design in GTM MCP" (19§11). Ollopa's three tiers are these three.
- **Clay's device flow.** `clay login --device`, "OAuth 2.0 device authorization flow for headless environments", and a CLI that "signals rate limiting via **exit code 4** with `retryAfter|limit|remaining|reset` in `details`" (19§12, §15.5). Ollopa's exit codes are that idea finished.
- **HubSpot's attempt number.** A payload that includes `attemptNumber` "precisely so you can detect replays" (19§10). Ollopa's contract says at-least-once and numbers the attempt for the same reason.
- **Zapier's honest per-call metering.** "Each successful call uses two tasks from your Zapier plan, and **failed calls do not count**" (19§11).
- **Salesforce's allocation check.** `sf org list limits` as a first-class command (19§12). Ollopa's CLI checks the allocation before a run rather than failing halfway.

## 6. After: the disclosed version

### 6.1 Level one and level two

| Where | Level one | Level two |
|---|---|---|
| `S-developer` (admin) | The per-workspace limits; the cost table; the 80% alert; the key list with spend; the subscription list with state; the delivery contract and the reconciliation endpoint; the three MCP tiers with the lock on two of them; the CLI device list and the exit codes | `X-key`, `X-hook`, `X-mcpscope`, `X-cliauth` — four panels, each flat |
| `S-developer` (any other seat) | Your MCP connections; your CLI devices; the sentence naming the admin | `X-mcpscope`, `X-cliauth` for your own |
| The API | The two headers; the refusal at the cap; the pending-approval object; the three "cannot see it" shapes | Nothing. A response has no second level |
| Webhooks | The contract, the subscription state, the reconciliation endpoint | The delivery log's cause groups, expanded in place inside `X-hook` |
| MCP | The tier, the ceiling, the training position, the turn-boundary card, credits on every result | The per-action rows inside `X-mcpscope` |
| The CLI | The workspace echo, the pre-flight facts, the exit codes | `--help`, which is the terminal's one door and names the three shapes |

Nothing here reaches a third level. The deepest path in the area is Settings → panel; the deepest path on a surface is a response and, inside `X-hook`, a cause group that expands in place.

### 6.2 Every door

| Label as shown | Container | Why |
|---|---|---|
| "API keys · 2 · 1,240 credits this cycle" (the row) | Panel (`X-key`) | One object's whole life, kept out of a list that is scanned |
| "Webhooks · 2 · 1 failing since 11 Sep" (the row) | Panel (`X-hook`) | Same |
| "MCP connection and scope · read · 6 connections" | Panel (`X-mcpscope`) | Same, and the personal half opens from "You" |
| "CLI device authorisations · 2" | Panel (`X-cliauth`) | Same |
| "Handler returned 500 · 18" | Expand in place inside `X-hook` | The rows are read against the cause above them (rule 5) |
| "Show the other 3 endpoints" | Expand in place under the cost table | Six rows are read; the long tail is not |
| `ollopa --help` | The terminal | The only door out here, and it names what is missing and who to ask |

The limit line, the cost table, the 80% alert, the contract and the reconciliation endpoint are **not doors**. Each of them informs a decision made before the panel is opened, so putting them inside one would be rule 5 broken in the most expensive place in the product.

### 6.3 Persistence

Panel state does not persist — a panel is a task. The delivery log's open cause group, the "Show the other 3 endpoints" state, and the area's own door state persist per user per workspace, like every other settings door. The CLI persists nothing but its device token, in the place the operating system keeps such things, and `--workspace` has no remembered default: at an agency, a remembered workspace is the bug.

### 6.4 Accelerators

`/` finds every row by label and synonym; the palette lists them prefixed "Settings ›"; deep links open the area with the right row highlighted. Copy buttons on the reconciliation endpoint, the exit-code list and each example header. And the accelerator the app cannot give, named in the panel where the scaffolding runs out: `ollopa credits --all-workspaces`, for the ops lead whose tenth visit would otherwise be her tenth visit. Naming a faster route where the slow one ends is rule 8; it is a statement of fact, not a hint.

### 6.5 Decision-critical

Nineteen items, listed in §4. The rule 7 test, run on a surface with no screen: without clicking anything, can a caller find the price, the limit, the destructive action's consequence and any pending approval? Yes — the price is a published table and a response header, the limit is a line above the key list and a header, the destructive action prints its three facts and asks for the workspace name, and the pending approval is a card that cannot be summarised away, in the same turn that caused it.

### 6.6 Removed rather than hidden

A master key that ignores scopes. Per-key rate limits (there are none; saying so is the feature). An approval webhook. A "developer portal" separate from Settings. Chat-time confirmations that vanish when the transcript scrolls. A 403 with no plan name. A partial write at the credit cap. Silent disabling of a failing subscription. And the idea that a documentation site can carry a fee: the cost table is in the product because the person who pays does not read the docs.

### 6.7 The nine-point score

| # | Question | Score | Line |
|---|---|---|---|
| 1 | Decision-critical visible without interaction | 2 | Limits, costs, the credit header, the cap refusal, the pre-flight facts, the typed-back name, the approval card: all before the act, on every surface |
| 2 | Every visible item backed by a sourced number | 2 | Forty-nine items in `developer.ts`; six pairs shape-checked in §4 with one stated denominator |
| 3 | No path exceeds two levels on any screen size | 2 | Area → panel; response → nothing; `X-hook` → a cause group in place. Same on a phone |
| 4 | Doors labelled by content, chevron and text | 2 | Every door carries its count or its state; no "Advanced", no "Developer settings ▸" |
| 5 | Doors adjacent, keyboard and touch | 2 | Each panel opens from its own row; groups expand under their cause; copy buttons have visible labels |
| 6 | No dependent information split across a door | 2 | The limit and the key; the cost and the endpoint; the contract and the subscription; the ceiling and the scope; the exit codes and the authorisations |
| 7 | State persists; expand-all and print | 2 | Area doors and log groups persist per user; print expands the contract, the cost table and every open group |
| 8 | User action or object state, never inferred history | 2 | A subscription's state drives its row; nothing reorders by what the admin did last week; the surface breakdown is data, not adaptation |
| 9 | Instrumented; promote, keep or delete review | 1 | Panel opens and log-group opens are counted per role and business, and the 80%-alert opt-out rate is counted beside them. Review scheduled with Settings each March and September; one point withheld until it has run |

**17 of 18.**

## 7. Lesson steps

Not a lesson. The four rules that mattered most:

- **Rule 7, moved off the screen.** Price, limit, consequence and pending approval have to exist where there is no page: a header, an exit code, a printed table, a card. If a promise only holds on a screen, it is not a promise the product keeps.
- **Rule 7's corollary, at the hardest boundary.** One card per tool call would technically disclose everything and would produce the 76% pass-through the evidence measures. The turn is the boundary, and one card carries the whole turn.
- **Rule 5, applied to documentation.** The rate limit belongs above the key list, not in a docs site; the cost belongs beside the endpoint; the contract belongs beside the subscription. A fact that decides a design has to sit where the design is made.
- **The declared-sidebar pattern's third shape.** "A page the profile left out" has no meaning for a key, a token or a terminal — and saying so in one line is the work. An integrator who is given no answer invents one.

## 8. Review

| Check | Gap found | Closed by |
|---|---|---|
| All roles covered | Only OPS was named, while the map gives `X-mcpscope` and `X-cliauth` to every seat | The area splits: workspace rows are OPS, the two personal rows are every seat, reached from "You"; the no-access state shows the personal half rather than nothing |
| All four businesses covered | The first draft described Meridian's nightly job and nothing else | §3.12 and the overrides: Fathom's daily MCP on Starter, Halyard's weekly CLI loop, Ridgeline's single subscription |
| Every field has a source | Keys, subscriptions, deliveries, tokens, devices and the surface marker were in no seed | §2 lists them with types, and `AgentEvent.surface` is defined here for specs 13 and 14 to read |
| Every action has an outcome | Rotate, revoke and replay had none | §3.8, each with what stops and what continues |
| Empty, error, no-access | "No keys" was an empty state with no facts in it | The empty state carries the limits, because that is what the reader came to learn |
| Keyboard | The cost table and the code blocks were unreachable | A real table with row headers; `<code>` with labelled, focusable copy buttons |
| Phone width | The cost table overflowed | Scrolls in its own container with a sticky first column; nothing gains a level |
| Decision-critical visible | The credit cap was described only in the app | Two response headers, a refusal that names the cap and the approver, a pre-flight credit count, and `5` as a published exit code |
| Two levels maximum | The key panel was going to hold the limits and the cost table | Both moved up into the area: they inform the decision to create a key at all |
| Doors labelled by content | "Developer settings" was the working title of the area | "API, webhooks, MCP and CLI", which is what is in it |
| Dependent fields together | Scope and ceiling sat in different places | Both in `X-mcpscope`, with the ceiling printed whichever of the two limits applies |
| State persists | Panels were going to remember their open state | They do not: a panel is a task. Doors and log groups do |
| Accelerators present | None, and the agency had ten workspaces | Exit codes, `--resume`, `--workspace`, and `ollopa credits --all-workspaces` named where the app runs out |
| Usage shape checked | Fathom and Ridgeline sit outside the band | Named in §4 with the reason: a locked plan puts whole areas in the tail, and a workspace that uses one surface has three areas it never opens |
| Nothing hover-only | The per-action MCP states were chips with tooltips | Three words in a row, in text |
| Role gaps explain themselves | A non-admin saw nothing | The personal rows plus one sentence naming the admin; and on the surfaces themselves, all three shapes written out in the same three forms |
| No usage numbers or teaching text | The cost table read like documentation | It is product data: the endpoint, the typical cost and the maximum, with no advice attached |
