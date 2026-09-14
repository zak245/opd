# Sign-in, app shell, ⌘K palette and notifications

The four cross-cutting surfaces of Ollopa. They are not pages; they wrap every page, so this spec follows the page structure with "page" read as "surface". Usage items: `src/ollopa/usage/shell.ts`. What exists: `pages/SignIn.tsx`, `shell/AppShell.tsx`, `nav.ts`, `session.ts`, `Product.tsx`.

## 1. Purpose

**Sign-in** picks the business and the seat. Everything after it follows from that choice through the usage model. Everyone uses it: at Meridian about once a month (sessions last 30 days), at Halyard several times a day because the agency works in ten client workspaces and has no switcher yet. Never lose sight of which workspace you are about to act in.

**The app shell** is the sidebar, top bar, account menu, no-access page, phone layout and keyboard map. Every role, all day. The one thing it must never lose is the credits pill. Credits are the price of every enrich, agent run and send, and reviewers of the product we parody say the bill "surprises them at the end of the month". Balance and this week's burn stay on screen on every page at every width.

**The ⌘K palette** is the accelerator: any page, setting, contact, company, deal, sequence, list or campaign by name, plus a short list of actions. SDRs and admins use it most. It makes people faster on paths that already exist in plain sight; it is never the only path to anything.

**Notifications** are the bell and what fills it. SDRs and AEs live in it (replies, meetings, agent approvals); admins get the exceptions (bounce guard, sync errors, credits). The rule is Nielsen's for long-running agents: interrupt only for decision-critical events, digest the rest, keep the ledger one click away.

The agency workspace switcher for Halyard is a later case. Until it exists Halyard signs out and back in, and every Halyard number below reflects that.

## 2. Data

### Sign-in

| Field | Source |
|---|---|
| Workspace name, size, tagline, how they work | `businesses.ts`: `name`, `size`, `tagline`, `how` |
| Seats: person, title, initials, role | `businesses.ts`: `roles[]` |
| Last workspace signed in to (preselected) | localStorage `ollopa.lastBusiness` (add) |

The four businesses and their seats as shown on the page:

| Workspace | Seats (person · title) |
|---|---|
| Fathom Labs, 12 people | Priya Natarajan · Founder (admin); Theo Lindqvist · SDR |
| Meridian Software, 300 people | Marcus Adeyemi · SDR; Elena Vasquez · Account executive; Jonas Weber · Demand generation manager; Aisha Rahman · Customer success manager; Daniel Okafor · RevOps admin |
| Halyard Agency, 25 people | Sofia Marchetti · Outbound specialist (SDR); Ravi Sethi · Agency ops lead (admin) |
| Ridgeline, 80 people | Hana Kobayashi · Inbound SDR; Liam O'Connell · Expansion AE; Camille Dubois · Lifecycle marketer; Noah Bergström · Customer success lead; Grace Mwangi · Revenue operations (admin) |

### Shell

| Field | Source |
|---|---|
| Sidebar items, order, groups, roles | `nav.ts`: `NAV`, `GROUP_ORDER` |
| Page title | `nav.ts` label; record pages add the record name |
| Credits balance, weekly burn, monthly cap | `businesses.ts`: `credits` |
| Runway in weeks (derived) | `balance / burnPerWeek`: Fathom 1.8, Meridian 4.5, Halyard 2.4, Ridgeline 5.5 |
| Plan name, renewal date | `businesses.ts`: `plan` |
| Signed-in person, title, initials, role label | seat matching `session.role`; `ROLE_LABEL` |
| Who can help on the no-access page | the business's `admin` seat |
| Your own credit limit this month | add `creditLimit?: number` to seats (Meridian and Ridgeline only) |
| Sidebar collapsed, theme | localStorage `ollopa.sidebar`, `ollopa.theme` (add) |

### Palette

| Result | Fields shown | Source |
|---|---|---|
| Page | label, path, shortcut | `nav.ts`, filtered by role |
| Setting | label, "Settings › {area} › {label}" | `usage/settings.ts`; add `synonyms?: string[]` ("DKIM" → Sending domains) |
| Contact | name, title, company | `seed.contacts` |
| Company | name, domain, stage | `seed.companies` |
| Deal | name, stage, amount, owner | `seed.deals` |
| Sequence | name, status, active | `seed.sequences` |
| List | name, type, records | move the inline array in `pages/tables.tsx` to `seed.lists` (add) |
| Campaign | name, status | add `seed.campaigns` (Meridian 12, Ridgeline 8, none elsewhere) |
| Recent | last 8 opened via the palette or a record page | localStorage `ollopa.recent.{business}.{role}` (add) |

### Notifications

Add `seed.notifications` to `seed.ts`, deterministic per business, about 40 rows over seven days: `{ id, kind, when, title, detail, target, unread, groupKey, interrupting }`.

| Kind | Built from | Group key |
|---|---|---|
| reply | `seed.replies` with outcome Interested or Question | sequence |
| meeting | one in three Interested replies | day |
| approval | `seed.agentEvents` where `needsApproval` | agent |
| bounce-guard | `seed.agentEvents` kind `paused` (5.1% warning) plus one auto-pause at 6.2% for outbound businesses | sequence or mailbox |
| sync-error | add `seed.syncErrors` (Meridian 3, Halyard 6, Ridgeline 1, Fathom 0) | integration |
| credits-low | `businesses.ts` when runway is under two weeks (Fathom) or a seat passes 80% of its limit | none |

## 3. Features

### 3.1 Sign-in

Shown: the Ollopa mark, "Sign in", one line of help, four workspace cards (name, size · tagline, one sentence on how they work), the chosen workspace's seats as chips (person · title), and the button "Sign in as {person}". While no seat is chosen the button is disabled and the text "Pick a seat to continue." sits beside it.

Actions: pick a workspace (resets the seat), pick a seat, sign in. Signing in stores `{ business, role }` and lands on Home. The last workspace is preselected next time. "Forgot password" is a link under the button; in the demo it says "Password reset is not part of this demo."

States: the default is the empty state. A failed sign-in (not reachable in the demo) shows its message under the button, never in a toast. No no-access state: every seat is valid.

Keyboard: Tab order is cards, chips, button. Cards and chips are `button`s with `aria-pressed`; arrow keys move within each group; Enter with a seat chosen submits.

Phone: cards stack in one column, chips wrap, the button is sticky at the bottom.

By business: only the card text and the chip count differ (two at Fathom and Halyard, five at Meridian and Ridgeline).

### 3.2 The app shell

**Sidebar (desktop, 224 px).** Logo and product name (link to Home), the role's pages in a fixed order, the business name at the foot. Order never changes by role, business or history; a role's absent pages are removed, not greyed (rule 4). No label above Home; "Prospect", "Engage", "Win" as small group labels; a divider before Reports, Agents, Settings.

| Role | Sidebar, in order |
|---|---|
| SDR | Home · People, Companies, Lists · Sequences, Inbox, Tasks · Agents, Settings |
| Account executive | Home · People, Companies · Sequences, Inbox, Tasks · Deals, Accounts · Reports, Agents, Settings |
| Marketer | Home · People, Lists · Campaigns · Reports, Agents, Settings |
| Customer success | Home · Companies · Tasks · Deals, Accounts · Reports, Settings |
| RevOps admin | Home · People, Companies, Lists · Sequences · Deals, Campaigns, Accounts · Reports, Agents, Settings |

Settings is in every sidebar because every role has personal items there (mailbox, signature, credit usage). The current page carries `aria-current="page"`. A chevron button at the foot labelled "Collapse" turns the sidebar into an icon rail; collapsed, each icon keeps its label as a tooltip on hover and focus, and the state persists per user. A collapsed rail is layout, not a disclosure level: every page stays one click.

**Top bar (56 px).** Left: the page title (`h1`, the sidebar label; record pages read "{record} · {page}"). Right: the search button ("Search or jump to…" with a `⌘K` badge), the credits pill, the bell, the account menu.

**Credits pill.** Text "{balance} credits · {burn}/wk": "1.84M credits · 410k/wk" at Meridian, "4.1k credits · 2.3k/wk" at Fathom. It links to Settings › Plan, billing and usage › Credit balance and burn rate. Tone is neutral above two weeks of runway, warning between one and two (Fathom today), error under one; the tone is also written in the tooltip so colour is never the only signal. Tooltip on hover and focus: "Balance and this week's burn. Cap {cap} per month, resets {date}. About {n} weeks at this rate." At Meridian and Ridgeline a seat with its own limit gets a second line: "Your limit: {left} of {limit} left this month." Both numbers live in the pill itself; the tooltip only adds detail. The pill never collapses to an icon.

**Bell.** Icon button named "Notifications, {n} unread" with a count badge up to "9+". Opens the panel (3.4). Shortcut `g n`.

**Account menu.** Avatar initials plus chevron, named "Account menu". Contents: header (person, "{title} ({role}) · {business}"); "Your profile" (Settings, your user); "Credit usage"; divider; "Theme" (light, dark, system as a radio row); "Keyboard shortcuts" (opens the shortcut sheet); "Help and docs"; "Contact support"; "What changed this month"; divider; "Switch account"; "Sign out". "Switch account" signs out and returns to sign-in with the current workspace preselected; "Sign out" preselects nothing. Items that do not apply are removed, never disabled. Nothing inside opens a second menu.

**Page titles.** `document.title` is "{page} · {business} · Ollopa"; record pages "{record} · {page} · {business} · Ollopa". The `h1` always equals the sidebar label.

**No-access page.** Reached only by URL (a bookmark or shared link); the sidebar never lists a page the role cannot open. Content: `h2` "{Page} is not part of your role"; one paragraph: "It is used by: {roles that have it}. If you need it, ask {admin person} ({admin title}) to change your permissions."; buttons "Back to Home" and "Copy a request for {admin first name}" (copies one line naming the page). Sidebar and top bar stay in place. The admin named is Priya Natarajan at Fathom, Daniel Okafor at Meridian, Ravi Sethi at Halyard, Grace Mwangi at Ridgeline. If the signed-in person is the admin, the paragraph ends "You can add it to your role in Settings › Team and access › Permission profiles."

**Toasts.** One `role="status"` region, bottom centre, for outcomes ("Amara Okonkwo added to a sequence."), auto-dismissed after 2.2 s. Interrupting notifications use a `role="alert"` region, top centre, that stays until dismissed: "Bounce guard paused Q4 enterprise outbound at 6.2%. [Open sequence] [Dismiss]". Interrupting kinds: bounce guard tripped, sync error, credits low (3.4).

**Session expiry.** Meridian and Ridgeline enforce a session timeout. Five minutes before expiry a `role="alert"` bar under the top bar reads "Your session ends in 5 minutes. [Stay signed in]". Fathom and Halyard never show it.

**Phone width (under 768 px).** The sidebar becomes a bottom bar with five slots: the role's four most used pages and "All pages" (grid icon plus text), which opens a bottom sheet listing the role's remaining pages in sidebar order. The four are fixed per role, never by history (rule 6):

| Role | Bottom bar |
|---|---|
| SDR | Home, People, Inbox, Tasks |
| Account executive | Home, Deals, Inbox, Tasks |
| Marketer | Home, Campaigns, Lists, Reports |
| Customer success | Home, Accounts, Tasks, Companies |
| RevOps admin | Home, Settings, Agents, Reports |

Any page is at most two taps. The top bar keeps the title, a search icon (opens the palette full screen), the pill shortened to "4.1k · 2.3k/wk" (both numbers stay), the bell and the avatar. The panel and the account menu open as bottom sheets with a visible close button. Interrupting toasts sit under the top bar.

**Keyboard.** Focus order: skip link ("Skip to content", visible on focus) → logo → sidebar items → collapse → search → credits pill → bell → account menu → main. `⌘K`/`Ctrl+K` opens the palette anywhere; `Esc` closes any panel and returns focus to its trigger. `g` then a letter jumps: `g h` Home, `g p` People, `g c` Companies, `g l` Lists, `g s` Sequences, `g i` Inbox, `g t` Tasks, `g d` Deals, `g m` Campaigns, `g a` Accounts, `g r` Reports, `g g` Agents, `g ,` Settings, `g n` Notifications. `?` opens the shortcut sheet (also in the account menu). Sequences are ignored while focus is in an input. Every shortcut is printed beside its item in the palette and in the sheet; none is the only way to do anything.

**Accessibility.** Landmarks `nav` "Main", `header`, `main`. Panels are `dialog`s with focus trapped and returned. Tooltips show on focus and dismiss on `Esc` (WCAG 1.4.13). The pill's tone is paired with text.

### 3.3 The ⌘K palette

**Open.** The search button, `⌘K`/`Ctrl+K`, or the phone search icon. A `dialog` holding a combobox (`role="combobox"`, listbox results, `aria-activedescendant`), 640 px on desktop, full screen on phone. Placeholder "Search or jump to…". Counts are announced ("12 results in 4 groups").

**Nothing typed.** "Recent" (up to 8 pages, records and settings opened through the palette or as a record page), then "Pages" (the role's sidebar in sidebar order, each with its `g` shortcut on the right), then "Actions". Recent is the one adaptive element in the product; it adds a section and nothing else moves (rule 6).

**Typed.** Groups in fixed order: Pages · Settings · People · Companies · Deals · Sequences · Lists · Campaigns · Actions; up to five rows each, then "Show all {n} in {page}", which opens the page with its search prefilled. Every row shows its path in muted text: "Settings › Email sending › Bounce guard", "People › Amara Okonkwo · VP Sales, Northwind Analytics", "Deals › Northwind Analytics · Platform · Proposal · $48,000". Settings match on label, area and synonyms ("SPF", "DKIM" → Sending domains; "auto-pause" → Bounce guard; "runway" → Credit balance and burn rate). Empty groups are omitted.

**Role gaps.** Pages and settings outside the role are not results. Typing their name returns one unselectable explanation row: "Campaigns is used by Marketers and RevOps admins. Ask Daniel Okafor (RevOps admin)." Hidden with explanation, never silently.

**Actions.** Global: "New list", "New sequence" (SDR, admin), "New deal" (AE, admin), "New task", "Agent items waiting for approval" (Agents filtered to pending), "Open notifications", "Change theme", "Switch account", "Sign out". Record-scoped, shown when a contact or list row is highlighted or the palette was opened from a record page: "Add {name} to sequence…", "Add {name} to list…". The ellipsis means one more choice: the input becomes "Add Amara Okonkwo to sequence · type to filter", the list shows the business's sequences, and `Backspace` on an empty input goes back. That is one staged step inside the same dialog, not a second door, and the same action is a row action on People and Lists.

**Shortcut hints (rule 8).** Every page row and every action with a shortcut prints it, every time, so a daily user stops needing the palette for the pages they visit most.

**Keyboard.** `↑ ↓` move, `Enter` opens, `⌘Enter` opens a record in a new tab, `Tab` jumps to the next group, `Esc` closes and returns focus.

**What the palette must not hide.** The sidebar stays full and visible at every width. Every setting found here has its place on the Settings page; every record is in its table with search and filters; every action is also a button or row action on a page. Table search is the table's own box, not the palette. The palette lists nothing that has no plain path.

**By business.** Fathom: no Campaigns or Lists groups. Halyard: "Switch account" is the second most used action; the later switcher replaces it with "Switch workspace…". Ridgeline: Sequences results are two rows; Companies and Deals dominate.

### 3.4 Notifications

| Kind | Who | Class | Grouped by | Row text | Opens |
|---|---|---|---|---|---|
| Reply (Interested, Question) | contact or sequence owner (SDR, AE) | digestible | sequence, per day | "4 replies to Q4 enterprise outbound · 2 interested" | Inbox filtered to the sequence |
| Meeting booked | contact owner (SDR, AE); account owner (CS) | digestible | day | "Meeting booked: Amara Okonkwo, Northwind Analytics, Thu 10:00" | People with the contact searched (contact page is a later case) |
| Agent needs approval | the person the agent worked for; admin gets one row a day for the workspace | digestible | agent, per day | "Outreach agent: 3 drafts waiting for your approval" | Agents filtered to pending |
| Bounce guard tripped | admin and owners of the affected sequence or mailbox | interrupting | sequence or mailbox | "Bounce guard paused Q4 enterprise outbound at 6.2%" or "…warned at 4.3%" | Settings › Email sending › Bounce guard, sequence named |
| Sync error | admin (Fathom: both seats) | interrupting | integration, per day | "HubSpot sync: 3 contacts failed to push" | Settings › Integrations › Sync error log |
| Credits low | admin; a seat past 80% of its own limit | interrupting | none | "Credits: 4.1k left, 2.3k/wk. Runs out in about 12 days, before the reset on 2 Oct." | Settings › Plan › Credit balance and burn rate |

Interrupting means a `role="alert"` toast that stays until dismissed, a browser push if allowed, an email at once, and the row pinned under "Needs you now". Digestible means the badge and the panel, plus the daily email digest at 08:00 workspace time if it is on. The split is by kind and fixed: a person can mute a digestible kind, never an interrupting one, because those are safety state (rule 7). Replies are never interrupting even though SDRs want them most: they are frequent, they wait, and Inbox is one click away. This is Nielsen's disclose-by-exception: interrupt for decision-critical events, digest milestones, keep the ledger one click away.

**The panel.** A right drawer (360 px; a full sheet on phone) titled "Notifications", with "Mark all read" and an "Unread only" toggle chip in the header. Sections in order: "Needs you now", "Today", "Yesterday", "This week". Each row: kind icon, text, when, an unread dot. Rows are links; opening one marks it read and closes the panel. Grouped rows never expand inside the panel; they open the page filtered to their members, so the panel never grows a third level. Hover and focus show "Snooze until tomorrow" and "Mark read" as buttons, and a "…" menu holds the same two so nothing is hover-only. Footer: "Show older than seven days" (30-day retention) and "Notification delivery", which opens Settings at your user's row: daily email digest (on by default), Slack direct message (row absent unless Slack is connected), browser push for interrupting kinds, mute per digestible kind, quiet hours. That link is navigation to a page, not a second door.

**States.** Empty: "Nothing new. Replies land in Inbox, approvals on Agents." with both linked. Loading: three placeholder rows. Error: "Notifications could not load. [Try again]" in the panel. Every role has a bell, so no-access does not apply.

**By business.** Fathom: every kind goes to both seats; credits low is the most frequent row and its toast is on screen at sign-in (runway 1.8 weeks). Meridian: routed by owner; the admin sees sync errors and bounce guard, the SDR replies and approvals, CS meetings for its accounts only. Halyard: bounce guard and sync errors ten times over, rows prefixed with the client workspace until the switcher case adds a filter. Ridgeline: a quiet bell; meetings and approvals, almost no replies, one sync error a week.

## 4. Usage items

All 78 items are in `src/ollopa/usage/shell.ts` (`page: "home"`, `area: "shell"`). Numbers are baseline Meridian as SDR · AE · Marketer · CS · Admin; "—" means the role does not have the item; overrides follow. ★ marks decision-critical.

**Sign-in and top bar**

| Item | SDR · AE · Mkt · CS · Admin | Overrides |
|---|---|---|
| Choose workspace; choose seat; sign in (three items) | 30 each | Halyard 90; Fathom 20 |
| Forgot password | 2 each | |
| Search or jump to (⌘K) | 60 · 50 · 35 · 30 · 55 | Halyard 80 / 75 |
| Credits pill ★ | 30 · 15 · 20 · 5 · 55 | Fathom 40 / 60 |
| Bell | 85 · 80 · 40 · 50 · 70 | Ridgeline 50 / 55 |
| Account menu | 15 each | Halyard 80 |
| Your profile | 6 each | |
| Credit usage | 8 · 3 · 5 · 2 · 15 | |
| Switch account | 4 each | Halyard 80 |
| Sign out | 4 each | Halyard 20 |
| Theme; password and MFA; other devices | 2; 1; 0.5 | |
| Keyboard shortcuts; help; support; what changed | 2; 4; 2; 5 | Fathom help 8 |

**Sidebar**

| Page | SDR · AE · Mkt · CS · Admin | Overrides |
|---|---|---|
| Home | 95 each | |
| People | 95 · 60 · 30 · — · 25 | Ridgeline 60 / 40 / 20 |
| Companies | 50 · 55 · — · 70 · 20 | Ridgeline 40 / 70 / 90 |
| Lists | 45 · — · 60 · — · 15 | Ridgeline 20 / 45 |
| Sequences | 90 · 35 · — · — · 25 | Ridgeline 25 / 10 / 5; Halyard 95 / 60 |
| Inbox | 95 · 80 · — · — · — | Ridgeline 50 / 40 |
| Tasks | 90 · 75 · — · 60 · — | |
| Deals | — · 95 · — · 40 · 30 | Fathom admin 60 |
| Campaigns | — · — · 95 · — · 15 | Ridgeline admin 20 |
| Accounts | — · 30 · — · 95 · 15 | Ridgeline 70 / 95 / 30 |
| Reports | — · 25 · 60 · 35 · 55 | |
| Agents | 60 · 25 · 20 · — · 45 | Fathom 75 / 80 |
| Settings | 20 · 10 · 12 · 8 · 90 | Fathom 45 / 90; Halyard 40 / 95 |

**Shell states, keyboard, phone**

| Item | SDR · AE · Mkt · CS · Admin | Overrides |
|---|---|---|
| No-access page | 3 · 3 · 4 · 4 · 0 | |
| Interrupting toast ★ | 15 · 5 · 3 · 2 · 35 | Fathom 40 / 50; Halyard 30 / 55; Ridgeline 3 / 15 |
| `g` then a letter | 15 · 10 · 4 · 4 · 12 | |
| `?` shortcut list; skip link | 3; 1 | |
| Collapse sidebar; session expiry notice | 4; 3 | Fathom expiry 1 |
| Phone bottom bar | 15 · 30 · 10 · 20 · 10 | |
| All pages sheet | 5 · 10 · 4 · 8 · 4 | |

**Palette**

| Item | SDR · AE · Mkt · CS · Admin | Overrides |
|---|---|---|
| Recent | 35 · 30 · 20 · 20 · 30 | |
| Jump to a page | 25 · 20 · 15 · 15 · 30 | |
| Jump to a setting | 15 · 5 · 8 · 3 · 45 | Halyard 30 / 70; Fathom 25 / 40 |
| Find a contact | 45 · 35 · 10 · 20 · 15 | Ridgeline 30 / 30 |
| Find a company | 25 · 30 · 8 · 45 · 12 | Ridgeline AE 45, CS 60 |
| Find a deal | 5 · 55 · — · 20 · 15 | Ridgeline AE 60 |
| Find a sequence | 30 · 10 · — · — · 12 | Ridgeline 6 / 2 / 2; Halyard 55 / 40 |
| Find a list | 12 · — · 25 · — · 6 | Ridgeline SDR 6 |
| Find a campaign | — · — · 45 · — · 8 | |
| Find a report | — · 6 · 15 · 8 · 15 | |
| Show all on the page | 15 · 10 · 5 · 10 · 8 | |
| Add to sequence… | 30 · 10 · — · — · — | Ridgeline 5 / 2; Halyard 45 |
| Add to list… | 15 · 4 · 15 · — · — | |
| New list | 8 · — · 10 · — · 2 | |
| New sequence | 6 · — · — · — · 3 | Halyard 15 / 10 |
| New deal | — · 6 · — · — · 2 | Fathom admin 8 |
| New task | 8 · 6 · — · 5 · — | |
| Agent items waiting for approval | 10 · 4 · 3 · — · 10 | Fathom 20 / 25 |
| Switch account; open notifications; theme; sign out | 2; 2; 1; 1 | Halyard switch 60, sign out 8 |

**Notifications**

| Item | SDR · AE · Mkt · CS · Admin | Overrides |
|---|---|---|
| Replies, grouped by sequence | 85 · 70 · — · — · — | Ridgeline 30 / 20; Halyard 90 |
| Meeting booked | 35 · 40 · — · 12 · — | Ridgeline 20 / 30 / 25 |
| Agent items waiting for approval | 45 · 20 · 15 · — · 40 | Fathom 60 / 70; Ridgeline 20 / 30 |
| Bounce guard tripped ★ | 15 · — · — · — · 20 | Halyard 35 / 55; Ridgeline 2 / 3; Fathom 20 / 20 |
| CRM sync error | — · — · — · — · 35 | Fathom 5 (both seats); Halyard 30; Ridgeline 20 |
| Credits low ★ | 8 · 3 · 5 · 1 · 25 | Fathom 50 / 60; Halyard 15 / 40 |
| Mark all read | 30 · 25 · 15 · 15 · 25 | |
| Unread only | 12 · 10 · 5 · 5 · 8 | |
| Snooze | 6 · 6 · 2 · 3 · 4 | |
| Show older | 4 each | |
| Delivery: digest; Slack; push; mute; quiet hours | 3; 2; 2; 2 (admin 1); 1 | Fathom Slack 0 |

**Shape check** (`shape()` from `usage/model.ts`, items the role has). The sidebar rows are the product's navigation, not a disclosure decision, so the check is given without them, with the full figure in brackets.

| Pair | Items | Head | Body | Tail |
|---|---|---|---|---|
| Meridian · SDR | 61 (70) | 26% (36%) | 34% (30%) | 39% (34%) |
| Meridian · admin | 60 (71) | 25% (32%) | 27% (27%) | 48% (41%) |
| Meridian · marketer | 55 (62) | 16% (24%) | 31% (29%) | 53% (47%) |
| Ridgeline · CS | 52 (59) | 21% (29%) | 21% (20%) | 58% (51%) |
| Halyard · SDR | 61 (70) | 38% (46%) | 31% (27%) | 31% (27%) |

Meridian and Ridgeline fit the published shape. Halyard's SDR is over the head band because sign-in (three items) and "Switch account" are daily there. That is the missing workspace switcher showing up as usage; the later case removes it.

## 5. Before: the common version

Modelled on Apollo's global chrome as documented in `knowledge-base/sources/07-apollo-settings-map.md` §5 and §6 (KB screenshots, Sep 2026) and Apollo's KB article "Configure Notifications on Apollo".

**Sign-in.** An email and password form with Google and Microsoft options. The workspace is implicit; a person in several workspaces sees no chooser (unverified; the KB documents consolidating workspaces by invitation, not switching).

**Shell.** Left nav grouped Home · Prospect & enrich (People, Companies, Lists, Data enrichment) · Engage (Sequences, Emails, Calls) · Win deals (Meetings, Conversations, Deals) · Tools & automations (Tasks, Workflows, Analytics), a yellow "Add teammates" button, and for admins an "Admin Settings ▸" flyout bottom-left (Team & Workspace setup with a progress bar, Users and teams, System activity, Security, Plan overview, Integrations, then All settings). Top bar: "Search or ask a question in Apollo ⌘K", a credits pill ("1.8M credits"), a black **AI Assistant** button, a bell, and the avatar menu (Your profile, Activity & notifications, Developer Tools, Theme, Language Beta, View credit usage, Onboarding hub with a percentage, Log out). The nav is the same for every role; what a role cannot use is greyed.

**Notifications.** Settings › Notifications: checkboxes for email (system activity; tasks, mentions and assignments; Data Health Center enrichment alerts) and Slack. The in-app feed is avatar › Activity & notifications › Notifications: "Click a notification to view more details and take any necessary action." The KB warns "Notifications for email opens and clicks are not managed in this section"; those live in the Chrome extension or in Workflows. The mobile app was retired on 28 August 2026 and "no longer sends push notifications"; mobile is the browser only.

**Documented problems.**

| Problem | Source |
|---|---|
| The pill shows balance only; burn and runway are not on screen, so the bill surprises people | Pill "1.8M credits" in KB screenshots (§6). "Watch the credit system closely or you'll get surprised at the end of the month" (Reddit via Cleverly, secondary). "Unclear what 40,000 means" (Robert, Trustpilot, 4 Sep 2026). "Quoting me a certain amount of credits, and then racked up a separate bill" (Paige Robillard, Trustpilot, 18 Aug 2026). |
| Role gaps are greyed controls with a generic line that names nobody | KB FAQ: "If a setting is greyed out and you can't select it, your Apollo admin hasn't provided you access." Getting Started banner: "it looks like you don't have the admin permissions". "Having to unlock bits and pieces of information is a little annoying" (Capterra, via summary). |
| One nav for every role; an SDR sees Meetings, Conversations, Workflows, Analytics, Data enrichment | §6 nav list. "Too many clicks to reach data, many navigation buttons seem to be not in the logical place" (Hassnaa, Trustpilot, 4 Sep 2026). "One click too many each time" (G2 via SyncGTM, secondary). |
| Two search boxes with different scopes: the top-bar box and "Search settings" inside Settings | §6. What the ⌘K box returns beyond its label is unverified. |
| Notifications split across Settings › Notifications, avatar › Activity & notifications, and the Chrome extension for opens and clicks | KB 34009920880781. |
| No mark-read, grouping or interrupt-versus-digest rule documented; the feed is a list to click through | Same article; anything beyond "click a notification" is unverified. |
| Admin settings are a flyout inside the nav, then a 300 px settings sidebar of expandable groups plus tabs plus drawers | §1.0, §1.4: "Settings › Email setup and health › Mailboxes › Show filters › mailbox › Overview › signature = 6 interactions." |
| A table that overflows is left to the user | KB: "zoom out on your browser or try scrolling horizontally in the table." |
| Phone: no app, no push, the desktop layout in a browser | KB mobile article, Aug 2026. |
| Keyboard shortcuts: only a third-party cheat sheet found | Unverified. |

## 6. After: the disclosed version

**Layout.** Sidebar left, fixed per role; top bar with title, search, credits, bell, account; content. On phone: top bar, content, bottom bar. Three door channels sit side by side: the palette (button → results), the bell (button → panel), the account menu (one deep). No door opens inside a door: grouped notifications navigate instead of expanding, the palette's "…" actions are a staged step in the same dialog, delivery settings are a page.

**Level one and level two by role.**

| Role | Level one | Level two |
|---|---|---|
| SDR | Home, People, Companies, Lists, Sequences, Inbox, Tasks, Agents, Settings; title, search, credits, bell with count, avatar | Palette results and actions; panel (replies, meetings, approvals, bounce guard on their sequence); account menu |
| AE | Home, People, Companies, Sequences, Inbox, Tasks, Deals, Accounts, Reports, Agents, Settings; same chrome | Palette (deals first in use); panel (replies, meetings, approvals) |
| Marketer | Home, People, Lists, Campaigns, Reports, Agents, Settings; same chrome | Palette (campaigns, lists, Company context); panel (approvals; credits if past own limit) |
| CS | Home, Companies, Tasks, Deals, Accounts, Reports, Settings; same chrome | Palette (companies, deals); panel (meetings for their accounts) |
| Admin | Home, People, Companies, Lists, Sequences, Deals, Campaigns, Accounts, Reports, Agents, Settings; same chrome; interrupting toasts | Palette (45 settings with paths); panel (bounce guard, sync errors, credits low, daily approvals digest) |

**Across the businesses.** Fathom: two seats, pill in warning tone, the credits-low toast pinned at sign-in, no Campaigns or Lists groups. Meridian: the baseline; notifications routed by owner; the no-access page names Daniel Okafor. Halyard: sign-in and "Switch account" daily and high in Recent; notification rows prefixed with the client workspace; the switcher is the later case. Ridgeline: Companies and Accounts carry the load; a quiet bell; two sequences.

**Doors.**

| Door | Label | Container | Persists |
|---|---|---|---|
| Search button | "Search or jump to… ⌘K" | dialog | Recent, per user |
| Bell | "Notifications, n unread" | right drawer; sheet on phone | unread, snoozes, "Unread only" |
| Account menu | avatar, chevron, "Account menu" | menu | theme |
| Collapse sidebar | chevron + "Collapse" | in place | per user |
| All pages (phone) | grid icon + "All pages" | bottom sheet | none |
| `?` | "Keyboard shortcuts" | side sheet | none |
| Pill tooltip | the pill text | tooltip on hover and focus | none |

**Accelerators.** `⌘K`; `g` + letter for every page, printed beside each page row in the palette and in the shortcut sheet; `g n`; `?`; `⌘Enter`; the collapsed rail.

**Decision-critical without a click.** Balance and weekly burn in the pill on every page at every width, with runway and tone written in the tooltip. Bounce guard, sync errors and credits low as alerts that stay, and as "Needs you now". Sign out and switch account are two clicks, no longer than any setting.

**Removed rather than hidden.** The AI Assistant button (agents live on Agents and in approvals; no chat box in the chrome). The onboarding percentage and "Add teammates" (Settings › Users has invite). Language in the account menu (a workspace setting). "Developer Tools" (API keys are a setting). The second, settings-only search box. Greyed nav items. Pages outside the boundary (Meetings, Calls, Conversations, Workflows) do not exist and are not hinted at.

**Nine-point score.**

1. Decision-critical visible without interaction: pill on every page; safety alerts pinned. **2**
2. Every visible item backed by a number with a source: `shell.ts`, USAGE-MODEL.md, the Pendo and McGrenere shape. **2**
3. No path over two levels at any width: bell → page; palette → page; bar → All pages → page. **2**
4. Doors labelled by content with chevron and text: "All pages", "Collapse", "Notifications, n unread"; the avatar has a chevron and an accessible name but its visible label is initials, not words. **1**
5. Doors next to what they reveal, keyboard and touch: panels open at their trigger; row actions have a menu twin; tooltips on focus. **2**
6. No dependent information split: balance and burn in one pill; a row carries its own target. **2**
7. State persists; expand-all and print where relevant: Recent, unread, snooze, theme, collapse persist; "Show older" in the panel; print does not apply to chrome. **2**
8. Disclosure by user action or object state: Recent only adds; the bar is fixed per role; interrupting is by kind. **2**
9. Instrumented with a scheduled review: every door has a usage item; the review is in section 7. **2**

**17 of 18.**

## 7. Lesson steps

These surfaces are not a lesson. The rules that mattered most:

- **Rule 7.** Balance and burn on every page; the safety kinds interrupt and cannot be muted. Evidence: the credit complaints in the Apollo memo §3; Nielsen 2026 on interrupting only for decision-critical events.
- **Rule 4.** A role's missing pages are removed, and their URL lands on a page that names the role that has it and the person who can grant it; the palette does the same in one row. Evidence: Apollo's greyed controls; NN/g on hidden navigation and disabled controls.
- **Rule 8.** The palette prints the shortcut on every page row so daily users leave it; the sidebar stays whole so nobody must use it. Evidence: Superhuman's palette; Cockburn et al. 2014.
- **Rule 6.** Recent adds; nothing reorders; the bottom bar is fixed per role. Evidence: Findlater and McGrenere 2004; Jensen Harris on Office 2000.
- **Review cadence.** Every March and September: promote any level-two item over 20% in any role-business pair, keep the rest, delete anything under 3% everywhere. First candidates to watch: "Collapse sidebar", "Sign out other devices", palette "Change theme".

## 8. Review

| Check | Result |
|---|---|
| All roles covered | Five roles in every table; sidebar, bottom bar and palette scope per role. |
| All four businesses covered | Seats, credits, routing and palette groups per business. Gap: Fathom's SDR seat is not an admin although "everyone is admin" there; closed with Fathom overrides that lift Settings and credits for the SDR. |
| Every field has a source | Section 2; additions named: `lastBusiness`, `creditLimit`, `synonyms`, `seed.lists`, `seed.campaigns`, `seed.notifications`, `seed.syncErrors`, `recent`, `sidebar`, `theme`. |
| Every action has an outcome | Sign in lands on Home; palette rows navigate or act; notification rows open a filtered page and mark read. Gap: "Forgot password" had no outcome; closed with a stated message. |
| Empty, error, no-access | Sign-in error under the button; palette role-gap row; panel empty, loading and error; the no-access page. |
| Keyboard | Focus order, `g` map, `?`, `Esc` returns focus, combobox semantics. |
| Phone width | Bottom bar per role, "All pages" sheet, full-screen palette, sheets, pill keeps both numbers. |
| Decision-critical visible | Pill on every page; alerts pinned. |
| Two levels maximum | Checked per channel. Gap in the first draft: expanding a group inside the panel was a third level; closed by making group rows links. |
| Doors labelled by content | "All pages", "Collapse", "Notifications, n unread", "Keyboard shortcuts". No "More", "Other", "Advanced". |
| Dependent fields together | Balance and burn in one pill; runway and reset in one tooltip; a row's target on the row. |
| State persists | Recent, unread, snooze, "Unread only", theme, collapse, last workspace. |
| Accelerators present | `⌘K`, `g` + letter, `g n`, `?`, `⌘Enter`, printed in place. |
| Usage shape checked | Five pairs; Halyard's deviation explained. |
| Nothing hover-only | Panel row actions have a menu twin; tooltips on focus; collapsed labels on focus. |
| Role gaps explain themselves | No-access page and palette row name the roles and the admin. |
| No usage numbers or teaching text in the product | The pill shows balance and burn, not percentages; the shortcut sheet lists keys, not rules. |
