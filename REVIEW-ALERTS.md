# Review: the two bands above every page

23 September 2026. The owner's verdict: *"the warning strip is ugly as fuck and not sure i understand it as a pattern you need to review that."* This reviews the red **Alert** and the **Status row** under it, from the pictures first and the code second, and proposes one pattern to replace both.

Code read: `src/ollopa/shell/AppShell.tsx` (lines 291–307, 434–516), `src/ollopa/shell/banner.ts`, `src/ollopa/ui/HealthStrip.tsx`, `src/ollopa/pages/home/Health.tsx`, the three `declareAlerts` call sites, `src/components/ui/alert.tsx`. Pictures read: `shots/see/`, measurements from `shots/see/manifest.json`.

---

## 1. What each one is for

**The Alert** is meant to be the one place the product says *something is waiting on you*, holding the workspace's interrupting notifications and whatever the open page adds through `declareAlerts`.

**The Status row** is meant to be the one place the product says *here is how the workspace is running*, holding four to six health badges and one workspace announcement.

That is the intent. **The finding is that you cannot tell them apart from the screen.** I could only write those two sentences after reading `banner.ts` and `Health.tsx`, and the owner is right not to be able to. Three reasons, all visible in `shots/see/home-1440-light.png`:

- They say the same things about the same subjects. The red band says "Bounce rate 4.3% on Q4 enterprise outbound". The grey badge 30 px below says "Sending healthy · bounce 1.9%". Same subject, two bands, two numbers, opposite conclusions, one screen. (They come from different sources: the band from `seed.ts` notification `n-bg1`, the badge from `health.bounceGuard === "ok"` in `Health.tsx:81`. Nothing reconciles them.)
- They offer the same controls. The red band's items end in "Open" and "Dismiss". The announcement badge ends in "Open" and "×". If the acts are the same, the bands are not different things.
- The split is not about urgency. "An agent paused outreach in 6 places" is a badge; "Research agent stopped at its daily cap" is a red alert line. The first is a person's problem, the second resolves itself at midnight.

The split that actually exists in the code is *who published it* — the shell's notification list and `declareAlerts` go in the Alert, `HealthStrip` goes in the row. That is a plumbing distinction. It is not visible and it is not meaningful to a reader.

---

## 2. Do they pass their own rules?

LAYOUTS §2: an **Alert** holds *"only what needs a decision"*; the **Status row** is *"the health badges and the announcement, one line"*.

### The Alert, item by item

| What appears | Where seen | Acts offered | Needs a decision? |
|---|---|---|---|
| "Bounce rate 4.3% on Q4 enterprise outbound" | every page — `home-1440-light.png`, `people-1440-light.png`, `inbox-1440-light.png`, `deals-board-400-light.png`, `settings-1440-light.png` | Open, Dismiss | **No.** The guard already acted; it warns at 4% and pauses at 6%, and nothing is paused. Neither act decides anything: one navigates, one hides. |
| "Proposes enrolling 2220 people in 'Expansion: new seats'" | `settings-1440-light.png`, `agents-1440-light.png` | Open, Dismiss | **Yes** — but the band cannot take it. Approve/Decline live on Agents; the band offers neither. |
| "Research agent stopped at its daily cap of 20,000 credits at 14:10. Work that spends credits waits for the cap to reset at 00:00." | `agents-1440-light.png` | Open | **No.** It resolves itself at 00:00. `AgentsPage.tsx:87` even marks it `danger: false`, and it is drawn red anyway. |
| "Outreach paused to 5 companies: bounce rate 5.1%, over the 4% warning and under the 6% pause threshold." | `agents-1440-light.png` | Open, Resume, Keep paused | **Yes.** The one true alert in the product: something is stopped, and the choice is on the line. |
| "1 record reached nobody." | `workflow-1440-light.png` | Open the run history | **No.** A pointer to a history page. |
| "N sequence contacts are stuck waiting at a step." (`Tasks.tsx:157`) | Tasks | Show them | **No.** It applies a filter to the list below it. |
| "Your session ends in 5 minutes." | timed | Stay signed in | **Yes.** |

**Three of seven kinds need a decision; one of those three cannot be decided from the band.** The band fails its own rule most of the time it is on screen, and it fails it on every page for the one item that is always there.

Three more defects the table does not capture:

- **Severity is contagious.** `AppShell.tsx:443` sets `variant={said.some(a => a.danger) ? "destructive" : "default"}`. One danger item paints every line red, and all of them sit under one fixed heading, "Needs you now". On `agents-1440-light.png` a cap that clears itself is drawn in the same red as sending being stopped.
- **The heading never says anything.** "Needs you now" is hard-coded. Polaris: titles should describe the issue. It is also the exact heading of the bell panel's first group (`notifications.ts:137`), which holds the same rows — the same items, twice, on the same screen.
- **The acts are hand-drawn.** `AppShell.tsx:459–467` renders bare `<button className="underline">`, bypassing `Actions`. DESIGN.md §1 says the kind decides the drawing, never the builder; a link is "a destination, not a state change". "Dismiss" removes something and is drawn identically to "Open". On Agents at 1440 there are eight identical underlined words and no way to rank them.

### The Status row, item by item

| Badge | Needs a decision? | Changes what I do next? | Verdict |
|---|---|---|---|
| "An agent paused outreach in 6 places" | Yes — something is stopped | Yes | **Wrong band.** This is the only status item that belongs in an Alert. It also disagrees with the Agents alert, which says 5 companies. |
| "Credits on track" | No | No | **Does not belong on screen.** |
| "Sending healthy · bounce 1.9%" | No | No | **Does not belong on screen.** |
| "Deals now carry a Renewal type. It is required at Negotiation from Monday. …" + Open + × | No, but must be read once | Yes, once | Belongs, but not as chrome on every page. |

**Plainly: "Credits on track" and "Sending healthy" should not be on screen.** They are all-clears. Nobody acts on them. No design system has a pattern for a standing "all is well" band (section 4). Worse, both are already said elsewhere on the same screens:

- "Credits on track" sits 12 px below the shell header's credits pill, which reads **"1.84M credits · 410k/wk"** — the same fact with the numbers in it (`home-1440-light.png`). It is also a row in Settings › Plan.
- "Sending healthy · bounce 1.9%" is on Campaigns already, in a useful shape: the summary strip reads **"Bounce guard · 1.9% this week · warns at 4% · pauses at 6%"** (`campaigns-1440-light.png`). Settings carries it in more detail: **"Bounce guard · On · 1.9% of 14,200 in 7 days · warns at 4%, pauses at 6% · nothing paused"** (`settings-1440-light.png`).

So there is no homeless number here. Every all-clear already lives on the page that owns it. The status row is a third copy, with the informative half removed.

That removal is itself a defect. `AppShell.tsx:487` cuts a badge at the first " · " when the text passes 44 characters, so *"Credits on track · 1.84M left, 410k a week, cap reached 14 October"* renders as **"Credits on track"** — it throws away the only part that carries information and keeps the reassurance. The rest survives only in a `title=` attribute: **hover-only**, which RULES.md rule 4 forbids outright ("Never hover-only. No touch, no keyboard, and it fails WCAG 1.4.13").

### Against RULES.md

- **Rule 7, decision-critical information is never behind a door.** On a phone the band shows one item and puts the rest behind **"3 more · Show"** (`agents-400-light.png`). Three things the product says need you now are one click away, on the device where they are hardest to find.
- **Rule 4, the door is labelled by what is behind it.** Rule 4's own test asks whether the label says "More". "3 more · Show" is a count, not a label.
- **Rule 6, nothing changes place on its own.** The bands are 69 px, 96 px or 149 px tall depending on the page and on how many items are unresolved, so the page's title lands somewhere different on every page and moves when an item is dismissed.
- **Rule 1, hide the rare, never the necessary — inverted.** The rarely-relevant bounce notice is the most prominent thing on People, Inbox and the Deals board; the page's own name is below it.

---

## 3. What it costs

`chrome` in `manifest.json` is the top of `#ollopa-main` — everything above the page. The shell header alone is **56 px** at every width (measured on Campaigns, Accounts, Workflows, Audience and Form, which have no bands). Viewports are 1440×900 and 400×860.

| Scene | chrome 1440 | bands cost | chrome 400 | bands cost | what is in the bands |
|---|---|---|---|---|---|
| campaigns (baseline, no bands) | 56 | — | 56 | — | nothing |
| workflow | 125 | **+69** | 125 | **+69** | 1 alert line |
| people | 125 | **+69** | 148 | **+92** | 1 alert line |
| inbox | 125 | **+69** | 148 | **+92** | 1 alert line |
| deals-board | 125 | **+69** | 148 | **+92** | 1 alert line |
| settings | 152 | **+96** | 185 | **+129** | 2 alert lines |
| home | 155 | **+99** | 178 | **+122** | 1 alert line + 4 badges |
| agents | 205 | **+149** | 174 | **+118** | 4 alert lines (1 + "3 more") |

How far down the page's own title and first row are pushed:

- **No bands (Campaigns, 1440):** the title "Campaigns" sits at y ≈ 88; the toolbar card starts at y ≈ 211.
- **Home, 1440:** "Good morning, Marcus" at y ≈ 187, the Today card at y ≈ 237 — **99 px down**, 17% of the window gone before the page names itself.
- **Agents, 1440:** "Agents" at y ≈ 236, the first card at y ≈ 267 — **149 px down, 23% of a 900 px window**, for four lines of which one needs a decision.
- **Home, 400:** "Good morning, Marcus" at y ≈ 209, the Today card at y ≈ 258 — **122 px down**. With the 52 px bottom bar, **27% of the phone is shell** and the first task row is below the fold.
- **Home, 400, sideways:** the manifest records `sideways: 2` — two of the four badges are off-screen to the right with no visible scroll affordance. On a phone the status row shows "An agent paused outreach in 6 places" and "Credits on track" and hides the announcement (`home-400-light.png`).

The cheapest band in the product costs 69 px on every page to repeat one sentence about email bounce that the page it is sitting on has nothing to do with.

---

## 4. How the design systems handle this

Read from the published guidance, September 2026.

### Material

Material 3 **has no banner component at all**. Its component index lists snackbar, dialogs, tooltips and side sheets, and no banner (`m3.material.io/sitemap.xml`). The rule survives only in Material 2 / MDC:

> "Banners should be displayed at the top of the screen, below a top app bar. They're persistent and nonmodal, allowing the user to either ignore them or interact with them at any time."
> **"Only one banner should be shown at a time."**
> "It requires a user action to be dismissed."
> A banner "may have one or two low-emphasis text buttons."
> — *material-components-web, `packages/mdc-banner` README*

> "displays an important, succinct message, and provides actions for users to address (or dismiss the banner)… A user action is required for it to be dismissed."
> — *Material's own API doc, `api.flutter.dev/flutter/material/MaterialBanner-class.html`*

### Polaris (Shopify)

> "Banners should: **Be used thoughtfully and sparingly for only the most important information.**"
> "**Not be used to call attention to what a merchant needs to do in the UI instead of making the action clear in the UI itself.**"
> "**Not be the primary entry point to information or actions merchants need on a regular basis.**"
> "Be dismissible unless they contain critical information or an important step merchants need to take."
> "Banners relevant to an entire page should be placed at the top of that page, below the page header. They should occupy the full width of the content area."
> "Focus on a single theme, piece of information, or required action to avoid overwhelming merchants."
> "Be limited to a few important calls to action with no more than one primary action."
> — *Polaris, Banner, Best practices / Placement / Content guidelines*

### Carbon (IBM)

> "Banners take over the top of an interface to show general notifications for the product or system, not a specific task."
> "Banners should be placed at the top of the content area they relate to. Do not cover other content with a banner notification. Place system-wide messages directly below the main header or navigation bar. Banners are not sticky and should scroll with the other content on the page. **Only show one banner at a time.**"
> "More design iteration and user testing is needed before Carbon solidifies our guidance for banners and creates a banner component."
> Actionable notifications: "**Only one action per notification. Limit action labels to two words or less.**"
> Callouts — the only always-present, non-dismissible band — "are persistent, and always present on the screen… **they do not include success or error statuses**" and "**Avoid overloading a single page with multiple callouts.**"
> "Users should be able to manage or limit noncritical notifications." (WCAG 2.1 SC 2.2.3)
> — *Carbon, Notification pattern*

### Fluent 2 (Microsoft)

> "A page-level message bar communicates information about the state of the whole app or the specific page it is on. It appears below the command bar in the main content area."
> "**There can be more than one message bar at the top of a page or content container.** When stacking message bars, order them by type, from most critical to least, as follows: 1. Error 2. Warning 3. Success 4. Informational."
> "When multiple message bars are present, they can optionally be grouped within an accordion to save space."
> "Message bars are always dismissible with a Close button (X)… **if someone dismisses a warning or error message without taking a necessary action, the message bar will reappear in their next session and continue to reappear until action is taken to resolve the problem.**"
> "Too many interruptions can disrupt someone's flow. **Highlight only critical messages so you don't overload a flow with too many assertive message bars.**"
> "In success messages, don't congratulate people for ordinary task completion. Avoid the words 'success' or 'successfully.'"
> — *Fluent 2, React MessageBar, Usage*

### Atlassian

> "Use banners sparingly at the top of the screen to display **critical messaging about the loss of data, functionality, or important site-wide information that affects the user's ability to use the app**."
> "**Banners should appear one at a time, are not dismissible, and only disappear when no longer required.**"
> "The banner currently uses the alert role… This makes the banner very noisy for people who use assistive technology, so **only use banners if the message is very important**."
> "The banner will truncate if the content spans beyond the width of the screen. To avoid truncation, keep banner content concise. **There is no way to expand and read the full copy.**"
> "Use banners sparingly, particularly warning and error banners, as they are persistent and disrupt the user's workflow."
> — *Atlassian Design System, Banner, Usage*

Atlassian routes everything else away from the top of the screen:

> "Section messages are persistent, but can disappear when the person takes action or resolves the situation."
> "For messages with information affecting the whole site, use a banner… For smaller contextual messages about a specific part of the UI, use an inline message."
> — *Atlassian, Section message, Usage*

### Where they agree

All five: **one band, directly under the app header, full width of the content, only for what is genuinely important, with at most one or two low-emphasis actions, and text short enough not to truncate.** Four of five say a band goes when the *thing* is resolved, not when the person hides it.

### Where they disagree

1. **How many at once.** Material, Carbon and Atlassian all say one. Fluent is the outlier and explicitly allows a stack ordered error → warning → success → informational, optionally collapsed into an accordion. Three to one for one; and ollopA's current design is a bad copy of the Fluent outlier, with the accordion label reduced to a count.
2. **Dismissible.** Atlassian says **not** dismissible. Polaris says dismissible unless critical. Fluent says always dismissible **but it comes back next session until the problem is fixed**. Carbon says it persists until dismissed and "may also persist across multiple sessions". **Nobody has a dismiss that hides an unresolved problem and forgets it** — which is exactly what ollopA does (`setDismissed` is React state in `AppShell`, lost on reload).
3. **"Everything is fine".** No system has a pattern for a standing all-clear. Fluent has a Success message bar but ranks it last and says not to congratulate people for ordinary completion. Carbon's Success status is for "Confirm a task was completed as expected" — an event, not a state — and its only always-on band, the callout, is explicitly barred from carrying success. Atlassian and Material have no success banner at all. **"Credits on track" and "Sending healthy" have no precedent anywhere.**
4. **Scope.** Atlassian reserves the top band for site-wide loss of data or functionality and sends everything else to where it applies; Carbon says the same ("placed at the top of the content area they relate to"). ollopA does the opposite — a workspace-level bounce rate follows the person onto People, Inbox and the Deals board.

---

## 5. The proposal: one band, or none

Written in the shape of the rules already in LAYOUTS.md.

**What may interrupt.** A line earns the band only if all three are true: something is stopped, spending or at risk until it is answered; the answer is a choice the person makes, not a page they visit; and it is about the workspace, not about the content of the page it sits over. A pointer to a page is not an alert. A filter is not an alert. A cap that clears itself at midnight is not an alert.

**How many at once.** One. One band, one item, at most two lines of text. When a second thing qualifies, the band says the more urgent one in full and ends with a labelled door to where the rest are decided — "2 more waiting · Agents" — not a count. When more than three qualify, the band stops listing entirely and names the place: "4 things need you · Review them on Agents". The bell keeps the full list; it already does.

**Where it sits.** Directly under the shell header, above the page header, full width of the content column, scrolling with the page, never sticky, never covering content. (Carbon and Polaris, agreed.)

**What it looks like, in shadcn as shipped.** `Alert`, exactly as the library draws it: one icon, one `AlertTitle`, one `AlertDescription`. Nothing invented.
- `AlertTitle` carries the thing itself — "Outreach is paused to 5 companies" — never a fixed heading. `AlertTitle` is `line-clamp-1` by design; one item per Alert is the shape the component was built for.
- `AlertDescription` carries at most one sentence of consequence, under DESIGN.md §3's three reasons and no fourth.
- At most two acts, drawn through `Actions`, so the kinds hold: the act that decides is secondary, a destination is a link, a removal is destructive and last after a gap.
- `variant="destructive"` comes from that one item. With one item there is no sibling to inherit severity from.
- It goes when the thing is resolved or the act is taken. **"Dismiss" is removed.** Nothing hides an unresolved problem.

**What happens to the rest.** The status row is deleted. Every item goes to the page that owns it, and every one of those places already exists:
- "Sending healthy · bounce N%" → the Campaigns and Sequences summary strips (already say it, with the thresholds) and the Settings › Email sending row (already says it, with the volume).
- "Credits on track" → the shell's credits pill (already says it, with the numbers) and the Settings › Plan row.
- "An agent paused outreach in N places" → it is a decision: it takes the band, on Agents. Elsewhere it is a count on Home's Agents tile.
- Sync errors, mailboxes near the daily limit, invitations not accepted → Settings rows and a Health section inside Home's own body, where they can carry their numbers.
- The announcement → a `Badge` beside the Home page title, opening the note in a popover; read once and gone. It never appears on another page.

**What a page may contribute.** `declareAlerts` keeps its name and takes **at most one item**, and the shell ignores the rest. A page item must carry an act that decides. An item whose only act is "Open" or "Show them" is not an alert and belongs in the page's own first section, next to what it is about (RULES.md rule 5, reveal next to the cause).

**Everything is fine.** Never said. **An all-clear is the absence of the band.** The number behind it stays where it is owned — a summary strip, a settings row, the credits pill — so anyone who wants to check can, without everyone paying chrome for the reassurance. No design system shows a standing all-clear, and Fluent says in words not to congratulate people for ordinary states.

**The three widths.** 1440 and 1024: the band is the full width of the content column, one or two lines, acts on the line. 400: title and line stack, acts on their own line below; long text wraps to a second line rather than truncating. **Nothing is hidden behind a count at any width** — decision-critical information is never behind a door (rule 7). If a second item qualifies at 400, the band names the place, and that place is a real door with a real label.

**The budget.** A page with nothing to decide has 56 px of chrome. A page with the band has at most 110 px at 1440 and 120 px at 400. `manifest.json`'s `chrome` is the check, and `npm run see` already measures it.

### Exact wording for LAYOUTS.md §2

Replace the two bullets `**Status row**` and `**Alert**` with:

> - **Alert**: one band under the shell header and above the page header, full width, for **one** thing that must be decided here and now. It earns the band only if something is stopped, spending or at risk until it is answered, and the answer can be given on the line. A pointer to a page is not an alert; a filter is not an alert; a limit that clears itself is not an alert. The title is the thing itself, never a fixed heading. At most two acts, drawn through `Actions`. When a second thing qualifies, the band says the more urgent in full and ends with a door labelled by where the rest are decided ("2 more waiting · Agents"), never by a count. It scrolls with the page, and it goes when the thing is resolved — nothing hides an unresolved problem.
> - **Status row**: there is none. A number about the workspace lives on the page that owns it — a summary strip, a settings row, the credits pill — never as chrome above every page. **"Everything is fine" is never said: an all-clear is the absence of the band.**
> - **Announcement**: a workspace change is a `Badge` beside the Home page title, read once and then gone. It never appears on another page.

And in §5, add to the 400 line: *the Alert stacks its title, line and acts and wraps rather than truncating; nothing in it goes behind a count at any width.*

### Files that would change

| File | Change |
|---|---|
| `LAYOUTS.md` | §2: the three bullets above. §5: the 400 sentence. |
| `src/ollopa/shell/AppShell.tsx` | The alert block (434–475): one item, real `AlertTitle` from the item's words, acts through `Actions`, variant from that item alone, the "N more · Show" door replaced by a labelled door. Delete the status-row block (477–516) and the `newsRead` state. |
| `src/ollopa/shell/banner.ts` | Delete `BannerItem`, `BannerNews`, `setBanner`, `clearBanner`, `useBanner`. Keep `AlertItem` and `declareAlerts`, capped at one item and requiring `acts`. |
| `src/ollopa/ui/HealthStrip.tsx` | Deleted. |
| `src/ollopa/ui/index.ts`, `src/ollopa/ui/README.md` | Drop the `HealthStrip` export and its entry. |
| `src/ollopa/pages/home/Health.tsx` | `healthLines` becomes the rows of a Health `Section` inside Home's body, with the numbers restored. **Delete the two all-clear branches** — the `bounceGuard === "ok"` line and the untight `Credits on track` line. |
| `src/ollopa/pages/home/HomePage.tsx` | Remove `<HealthStrip>`; render the Health section as a tile; the announcement becomes a `Badge` on the page header. |
| `src/ollopa/pages/engage/Sequences.tsx` | The paused-sequence lines become the rows' own status and a count on the toolbar, not shell chrome. |
| `src/ollopa/pages/marketing/WorkflowRecord.tsx` | "N records reached nobody" moves onto the run-history section heading. |
| `src/ollopa/pages/work/Tasks.tsx` | "N contacts stuck" becomes a count on the Tasks toolbar's Overdue filter. |
| `src/ollopa/pages/agents/AgentsPage.tsx` | Keeps the one real band (the outreach pause). The cap notice moves into "Since you last looked", which already reports credits. |
| `src/ollopa/data/seed.ts` | `interrupting: true` only where something is stopped. Reconcile the bounce numbers: `n-bg1` says 4.3% while `health.bounceRate` says 1.9% on the same screen. |
| `src/ollopa/layouts/README.md` | Rewrite the `declareAlerts` section; **delete the "How the Alert collapses" table** and its 200 px budget. |
| `scripts/see.mjs` / `shots/see/` | Re-shoot. `chrome` becomes the check: 56 with nothing to decide, ≤ 110 with a band. |
