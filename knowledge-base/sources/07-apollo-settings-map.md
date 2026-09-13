# Apollo.io — Settings Area Map (UX research, public sources)

*Compiled 13 Sep 2026 from Apollo's Knowledge Base (knowledge.apollo.io, fetched via its Zendesk API on 13 Sep 2026, ~100 articles), the 2025 and 2026 release notes, first-party KB screenshots, Trustpilot, Capterra, G2 (via Apollo's own G2 summaries and third-party aggregators), and vendor/blog reviews. Reddit and LinkedIn could not be fetched directly (blocked); Reddit quotes are only included where a secondary source reproduced them, and are marked as such. Anything not confirmed by a first-party source is marked **unverified**.*

**Method note.** Apollo's KB articles were current as of 5–13 Sep 2026 (each article carries an "updated" date). The screenshots embedded in those articles are the best public evidence of the live UI, but the KB itself is inconsistent: different articles show at least three generations of the settings sidebar (see §5 and §6). Where paths conflict, I give the newest wording first and the older wording in brackets.

---

## 1. THE SETTINGS TREE

### 1.0 How you get in (navigation depth conventions)

There are three entry points (all confirmed by KB screenshots in [Admin Settings Overview](https://knowledge.apollo.io/hc/en-us/articles/31518179257613-Admin-Settings-Overview) and [Configure Your Profile Settings](https://knowledge.apollo.io/hc/en-us/articles/34010120281613-Configure-Your-Profile-Settings-in-Apollo)):

1. **Admin Settings button (bottom-left of the main app nav, admins only)** → opens a flyout with: *Team & Workspace setup* (progress bar, e.g., "86% Completed"), *Users and teams*, *System activity*, *Security*, *Plan overview*, *Integrations*, and a divider then *All settings*. Depth: 1 click to flyout, 2 clicks to land on a page.
2. **Gear icon at the bottom of the collapsed icon rail** (newer UI; visible in the plan screenshot) → Settings home. Depth 1.
3. **Avatar menu, top-right** → *Your profile*, *Activity & notifications*, *Developer Tools*, *Theme* (Light/Dark/System), *Language* (Beta: English, Spanish, Portuguese, French, Italian), *View credit usage*, *Onboarding hub* (with % complete), *Log out*. Depth 1–2.

In the counts below, **D1** = one click from the Settings home sidebar; **D2** = inside an expandable sidebar group or a tab on a D1 page; **D3** = a tab/drawer inside a D2 page; **D4+** = a row-level drawer or modal below that.

### 1.1 Getting Started / Get started (D1)
Source: [Admin Settings Overview](https://knowledge.apollo.io/hc/en-us/articles/31518179257613-Admin-Settings-Overview), screenshot i3.
- Page title "Configure your workspace to boost team performance"; four progress rings: *Set up a team*, *Build pipeline*, *Enrich data*, *Win deals* (each "x/y complete").
- Accordion sections, each a checklist with "Learn more" links:
  - **Set your team up for success**: Connect your CRM and manage your integrations; Invite new teammates and assign permissions; Create dashboards and reports; Set permissions and default settings (greyed out for non-admins with the banner "Hey, it looks like you don't have the admin permissions to complete the tasks below.").
  - **Help your team build pipeline** (9 tasks): prospecting settings (GDPR, job-change alerts, primary email type, duplicate handling), personas, core messaging strategy, signals/scores/website visitors/buying intent, Dialer.
  - **Enrich your data to keep it fresh** (2 tasks): enrichment sync settings, job change alerts.
  - **Coach your team to win more deals** (8 tasks): Apollo Recorder, recording consent, scheduler, custom contact/account fields, deal stages and fields.
- Also surfaces as "Onboarding hub – 24% Completed" in the avatar menu, and as a "Setup / Recommendations" tab on Home ("Next steps for you"; "Remove set up tab" once done) — [Home Overview](https://knowledge.apollo.io/hc/en-us/articles/14845941738637-Home-Overview), [Welcome to Apollo](https://knowledge.apollo.io/hc/en-us/articles/4409127280781-Welcome-to-Apollo).

### 1.2 Personal settings group

#### Profile (D1; tabs D2)
Source: [Configure Your Profile Settings](https://knowledge.apollo.io/hc/en-us/articles/34010120281613-Configure-Your-Profile-Settings-in-Apollo). Tabs: **General · Multi-factor authentication · Custom fields · Email settings · Conversations**.
- **General**: First name, Last name (used as the sender display name for *all* Apollo-sent mail — Apollo ignores the Gmail/Outlook display name and "doesn't support a separate display name for each connected mailbox"), Title, Login email (Edit / "Change email"), Password (Edit), Permission profile (read-only for non-admins), Teams, Territories, Credit limits (admin-set). Yellow **Save** button top-right.
- **Multi-factor authentication**: Authenticator App (Setup), SMS authentication (Setup).
- **Custom fields**: edit your custom *user* fields; admins get a "Manage fields" link to Users settings.
- **Email settings**: *Manage Mailboxes* link; checkboxes *Include one-click unsubscribe headers*, *Enable open tracking*, *Enable click tracking*; toggle *Append a sequences opt-out message after my signature* + free-text opt-out message (use `<% %>` to mark the link text) — [Configure Your Email Unsubscribe Link](https://knowledge.apollo.io/hc/en-us/articles/4409140379661-Configure-Your-Email-Unsubscribe-Link). Unsubscribe links are paid-plan only.
- **Conversations**: *Enable private conversations* toggle; *Revoke access to all shared recording links*.
- Theme and Language are **not** here — they live in the avatar menu.

#### Mailboxes & domains [older label: "Mailboxes"] (D1 → redirects into Email setup and health)
Per-user view of the same page described in §1.3 "Email setup and health". Non-admins "see only your linked mailboxes" ([Manage Mailboxes and Domains](https://knowledge.apollo.io/hc/en-us/articles/39530186410125-Manage-Mailboxes-and-Domains-on-Apollo)).

#### Phone numbers (D1)
Source: [Set Up the Dialer](https://knowledge.apollo.io/hc/en-us/articles/26604629080845-Set-Up-the-Dialer-to-Make-Calls-on-Apollo), [Get an Apollo Phone Number](https://knowledge.apollo.io/hc/en-us/articles/26604621629069-Get-an-Apollo-Phone-Number).
- Personal dialer preferences: outgoing call mode (**Bridge** — US only, enter personal phone / **VoIP**), incoming call mode (Bridge / VoIP), *Record All Voice Calls* checkbox, LinkedIn-during-calls option, *Save Changes*.
- Select a number → *Add business profile* (caller reputation/registration). Noise removal toggle lives in the in-call mute menu, not in settings (2026 release notes).

#### Notifications (D1)
Source: [Configure Notifications](https://knowledge.apollo.io/hc/en-us/articles/34009920880781-Configure-Notifications-on-Apollo). Checkboxes for email notifications (system activity; tasks/mentions/assignments; Data Health Center enrichment alerts) and Slack notifications (if Slack is connected). The KB explicitly warns: "Notifications for email opens and clicks are not managed in this section" — those live in the Chrome extension desktop notifications or in Workflows.

#### Chrome extension (D1; sub-tabs D2)
Source: [Configure Chrome Extension Settings](https://knowledge.apollo.io/hc/en-us/articles/34009571689997-Configure-Chrome-Extension-Settings-in-Apollo). Two places to configure: inside the extension (Settings → *Default list*, *Extension Visibility* [Gmail, Google Calendar, CRM, everywhere], *Data Sources* [waterfall], **Advanced** [how CRM is updated when enriching]) and in the web app (email tracking, templates, send-later, reminders, *Log outgoing emails to Salesforce by default*, *Log to most recent Salesforce Opportunity*). Credit balance and a *Purchase more credits* button also appear in the extension settings.

#### Conversations (personal) (D1)
Duplicate of the Profile › Conversations tab (private conversations, revoke shared links).

### 1.3 Workspace settings group (admin)

#### Workspace overview (D1) — appears in the newest sidebar generation only (screenshot in Deliverability article). Contents **unverified**.

#### Email setup and health [labels seen in KB screenshots: "Deliverability suite", "Mailboxes & domains", "Mailboxes"] (D1; sub-pages D2; drawers D3–D4)
Source: [Manage Mailboxes and Domains](https://knowledge.apollo.io/hc/en-us/articles/39530186410125-Manage-Mailboxes-and-Domains-on-Apollo), [Configure Your Mailbox](https://knowledge.apollo.io/hc/en-us/articles/44268354251021-Configure-Your-Mailbox-on-Apollo), [Configure Email Sending Limits](https://knowledge.apollo.io/hc/en-us/articles/4409233349005-Configure-Email-Sending-Limits), [Email Warmup](https://knowledge.apollo.io/hc/en-us/articles/26772718460045-Use-Email-Warmup-to-Improve-Deliverability), [Link Your Mailbox](https://knowledge.apollo.io/hc/en-us/articles/4409127806093-Link-Your-Mailbox-to-Apollo), [Generate a Domain and Mailbox](https://knowledge.apollo.io/hc/en-us/articles/33476090833549-Generate-a-Domain-and-Mailbox-to-Reach-Prospects).
- Sidebar sub-pages (newest screenshot): **Overview · Domains · Marketing domains · Mailboxes · Bounce logs · Sending policies**. Page header tabs: Overview / Domains / Mailboxes, plus a yellow **Add ▾** button (link mailbox / buy domain / buy mailbox).
- **Overview**: "Mailbox performance" with an *All mailboxes* dropdown and *Manage mailboxes* button; widgets: Emails sent successfully (delivered/bounced, % vs last month), Open rate (opened/clicked), Reply activity (total/positive), Email deliverability and activity chart (7d/30d/3m), Top performing sequences, Recommendations (View recommendation; dismiss ⊗, mark complete, Bookmark; sort by active/saved/completed/dismissed).
- **Domains**: Authenticated sending domains (SPF/DKIM/DMARC counts), Average bounce rate, Domains table (status, type, bounce rate, linked mailboxes, redirect URLs, next bill date for Apollo-purchased domains); *Show filters*; click a domain → deliverability stats, billing, redirect URLs, DNS records (D3). *Buy domain* flow lives here.
- **Mailboxes**: KPIs (Mailboxes completed and ready, Mailboxes warmed up); table columns Type, Setup, Warmup, Daily limit, Deliverability (score), Blocklist, Inbox placement, Last sync, Forwarding email (purchased mailboxes only), "Sent vs Limit" (KB tip: "If you can't see the number of emails sent vs your limit, zoom out on your browser or try scrolling horizontally in the table"). *Show filters* (type, domain, user, warmup status, sending limit). *Link mailbox* (Gmail/Outlook/Other, IMAP/SMTP providers). Row actions "…": Refresh aliases, Unlink mailbox (choose a forwarding mailbox for scheduled emails).
  - Click a mailbox → drawer with tabs (D3): **Overview** (deliverability score, tracking subdomain, sending limits [emails/day, emails/hour, delay between emails in seconds — Apollo recommends 50–100/day, 10–20/hour, 60–300s], unsubscribe link, email signature [rich text/HTML, *Pull signature from Gmail*], enable/disable warmup), **Deliverability** (stats, blocklist checks), **Inbox placement** (run test), **Forwarding email**.
  - *Start warm up* toggle → sign in with Google or app password → warmup mode Progressive / Flat / Randomized, end date, min/max emails per day (max 50), reply rate (max 45%).
  - Mailbox limits per plan: Basic 1/user; Professional unlimited Google/M365 + 5 IMAP; Organization unlimited + 15 IMAP.
- **Bounce logs** (new, 2026): per mailbox/recipient/sequence/domain remediation view (paid teams).
- **Sending policies** (admin): *Bounce guard* toggle (default on; warning 4%, auto-pause 6%, adjustable down to 3%/4%; minimum volume 200 emails over 7 days) and *Block emails to catch-all domains* toggle + domain allowlist. When bounce guard is on, a *Health* tab appears on every sequence.

#### Users and teams (D1 group; sub-pages D2)
Sub-pages: **Users · Teams · Permission profiles · Security** (+ *Sharing and defaults* and *User fields* referenced by path in some articles).
- **Users** ([Add, Manage, and Deactivate Users](https://knowledge.apollo.io/hc/en-us/articles/4409130537101-Add-Manage-and-Deactivate-Users)): *New User* (choose permission profile, enter emails, Send Invites; *Pull users from Salesforce*); per-user Permission profile dropdown, Credits (per-user credit limit, bulk *Edit credit limit*), Territories (*Assign territory*), deactivate/reactivate. Billing & seat managers (free seat, up to 5 on Org/Custom) and Call assistants are invited from here.
- **Teams** ([Organize Users Into Teams](https://knowledge.apollo.io/hc/en-us/articles/5482714681869-Organize-Users-Into-Teams)): *New Team*, name, members. Organization plan only.
- **Permission profiles** ([Create and Assign Permission Profiles](https://knowledge.apollo.io/hc/en-us/articles/4409154208269-Create-and-Assign-Permission-Profiles)): list grouped "Paid seats" (Admin, Non-admin, custom e.g. "Account Executive", "Sales Leaders") and "Free seats" (Billing and Seat Manager, Call Assistant); *+ New Profile*; *View as* (preview Apollo as a profile; banner "Stop viewing as"). Profile editor (D3) has tabs Settings / Users and six permission groups, each an accordion with toggles and dropdowns: **App settings & preferences** (User management & billing; Appearance & interface; Sharing and defaults; Integrations), **Prospecting** (Prospecting, Context, Persona, Scoring models, Signals, Buying intent, Territories, Bulk actions), **Data & enrichment** (Waterfall enrichment; Data enrichment; Contacts and accounts → Contacts / Accounts / General / Lists), **Engage** (Sequences → Templates and snippets; Emails incl. *Email visibility*, *Can send emails from*, *User can adjust their own email sending limits*, *User can edit their email signature*, *User can disable opt-out message*, *User can access domain and email purchase flow*; Calls incl. *Join call mode* Listen-only/Coach/Join; AI Content Center), **Win & close** (Conversations, Deals, Meetings incl. *Calendar Events visibility*), **Tools & automations** (Tasks, Workflows incl. *Workflows super admin access* and playbooks, Analytics, Standalone form enrichment, Website visitors). Custom profiles are Organization/Custom plan only; Admin's user-management, billing, appearance and interface permissions "can't be disabled".
- **Security** ([Configure Advanced Security Protocols](https://knowledge.apollo.io/hc/en-us/articles/20439872853645-Configure-Advanced-Security-Protocols-on-Apollo)) — tabs (D3): **Multi-factor authentication** (check SMS / Authentication app; choose enforcement timing; *Enforce MFA*), **IP whitelisting** (toggle; single IP / range / CIDR; warning "24 users in your team might lose access"; *Copy missing IPs*), **Password policy** (complexity, length 10–100, expiration 10–365 days, reuse 1–50), **Login controls** (session timeout 1–30 days; failed-login cap 3–10 per 24h), **Single sign on** (Google, Microsoft, Entra ID, Okta; SAML SP- and IdP-initiated; SCIM for Okta/Entra; "Save & Enforce SSO"; no custom SAML claim mapping). Plan-gated (SSO/SCIM on Organization).
- **Sharing and defaults / Team sharing & defaults** ([Manage Search Sharing and Defaults](https://knowledge.apollo.io/hc/en-us/articles/40430351927437-Manage-Search-Sharing-and-Defaults)): People searches / Company searches tabs; per saved view: Visibility (Restricted/Everyone), Shared With, Is Default. Professional plan and up.
- **User fields** ([Create Custom User Fields](https://knowledge.apollo.io/hc/en-us/articles/4412499090189-Create-Custom-User-Fields)): path "Settings > Users > User fields"; *Create field*; types: single-line, multi-line, number, date, date/time, checkbox, picklist, multi-select picklist, Lookup-User. Field type is immutable after creation.
- **License settings** (from Plan overview): domain and seat management preferences, invite link, default permission profile for new users, request a domain change ([Customize and Manage Your Plan](https://knowledge.apollo.io/hc/en-us/articles/4677130104333-Customize-and-Manage-Your-Apollo-Plan)).

#### Plan and billing [older: "Billing and credits"; flyout label "Plan overview"] (D1 group; D2 sub-pages)
Source: [Customize and Manage Your Apollo Plan](https://knowledge.apollo.io/hc/en-us/articles/4677130104333-Customize-and-Manage-Your-Apollo-Plan), [Manage Your Billing Information](https://knowledge.apollo.io/hc/en-us/articles/14140209188621-Manage-Your-Billing-Information-in-Apollo), [Pricing Calculator](https://knowledge.apollo.io/hc/en-us/articles/48632642150285-Use-the-Apollo-Pricing-Calculator).
- **Plan overview**: what's included; usage of Apollo credits, dialer minutes, conversation minutes, AI research, AI words; buttons **Manage Subscription**, **Billing**, **License Settings**; scroll to **Cancel Plan** (reason picker; "Keep current plan"; self-serve cancel "isn't available for every team").
- **Manage Subscription** (full-page checkout, D2): "Step 1 Add seats and select your plan" with seat stepper ("How many seats do you need?"), plan cards Free $0 / Basic $49 / Professional $79 (per seat, annual) / Organization ("Talk to sales"), *Show plan comparison*, add-on credit slider, sticky Summary bar (Seats, price, Billed annually, Due today, *See price breakdown*, "Add-ons are priced per team", *Talk to sales*, *Current Plan*/*Upgrade*). Error "Due Today too low" near renewal. Downgrades apply immediately; add-on credits auto-renew and don't roll over.
- **Billing**: Payment information (*Update Credit Card*; card can't be removed unless Free/pending-cancel), Billing information (*Update billing information*: company, address, **Tax ID** self-serve since 2026), Send invoices (email), Additional invoice information (memo/PO), invoice history.

#### Credits and activity [older: "System activity"; also the flyout item "System activity"] (D1 group; D2 sub-pages)
Sub-pages (screenshot): **Credit usage · Data requests · AI word usage · System activity log**.
- **Credit usage** ([Review Credit Usage](https://knowledge.apollo.io/hc/en-us/articles/9527776320781-Review-Credit-Usage-in-Apollo)), redesigned Jun 2026: tabs (D3) **Overview** (filters Date / Team member / Features; views by Feature → Action, by Surfaces [Web App, Automation, Extension, MCP, Uncategorized], by Team members), **Usage details** (chart breakdown daily/weekly/monthly; *Show refunds*; table Date, Feature, Action, Description, Credits, Data requested, Surface, User), **About credits**, **AI runs**. Requires the permission "Can access the credit usage page…".
- **Data requests**: job-change request history, waterfall reports ("Settings > System activity > Data requests > Job change"; "Settings > Data Requests > Waterfall").
- **AI word usage** and **System activity log** (audit; e.g., deleted deal stages are logged here per [Set Up Deals](https://knowledge.apollo.io/hc/en-us/articles/40691781463437-Set-Up-Deals)). Detail **unverified** beyond mentions.

#### Integrations (D1; per-integration pages D2; tabs D3; sub-tabs D4)
Source: [Integrate Salesforce](https://knowledge.apollo.io/hc/en-us/articles/4414356051725-Integrate-Salesforce-with-Apollo), [Salesforce Pull](https://knowledge.apollo.io/hc/en-us/articles/4414496822797-Configure-Salesforce-Pull-Settings) / [Push](https://knowledge.apollo.io/hc/en-us/articles/4414469523981-Configure-Salesforce-Push-Settings), [Integrate HubSpot](https://knowledge.apollo.io/hc/en-us/articles/4416619021837-Integrate-HubSpot-with-Apollo), [HubSpot Sync Settings](https://knowledge.apollo.io/hc/en-us/articles/4416606988941-Configure-HubSpot-Sync-Settings), [Slack](https://knowledge.apollo.io/hc/en-us/articles/22464817775117-Integrate-Slack-with-Apollo), [Zapier](https://knowledge.apollo.io/hc/en-us/articles/4415362778509-Integrate-Zapier-with-Apollo), [Use Apollo API](https://knowledge.apollo.io/hc/en-us/articles/4416173158541-Use-Apollo-API), [Connect Your Own LLM Key](https://knowledge.apollo.io/hc/en-us/articles/41236799633549-Connect-Your-Own-LLM-Key-to-Apollo).
- Marketplace-style list with category chips (CRM: Salesforce [*Connect* / *Connect to Sandbox*], HubSpot, Pipedrive, Zoho "NEW"; also Microsoft Dynamics, Outreach, Salesloft, Marketo, SendGrid, Mailgun, Vidyard, Slack, Zapier, Snowflake, Apollo API, and AI models OpenAI / Perplexity / Anthropic for bring-your-own-LLM-key).
- **Salesforce** page tabs: *Contacts, Leads, Accounts, Deals, Activities* → each with **Sync** (pull: selective sync conditions, *Pull all*, *Hide my contacts and leads pulled from Salesforce*, *Infer missing data*; push: *Push contact*, push all vs by stage, leads vs contacts, Source field, *Push unverified emails*, deletion sync, merge sync) and **Field mapping** / stage mapping; **Authentication** (team sync user); **Error logs**; Custom objects (Org plan, Aug 2026). 6-hour configuration window before auto-sync starts.
- **HubSpot** page: choose *HubSpot CRM* (bi-directional) or *HubSpot Data Enrichment* (enrich-only); tabs Contacts / Accounts / Deals / Activities → Sync (push conditions by stage, email status, custom field; Source; deletion/merge sync; *Sync history*; deals pipeline checkboxes, *Hide my deals*), Field mapping, Error logs.
- **Slack**: single "Apollo" app (workflow notifications + AI Assistant unified in 2026); *Allow*.
- **API**: *API keys* → *Create new key* (name, description, endpoint scopes, *Set as master key*), *OAuth registration* (partners). Webhooks: only documented in the developer docs and via Zapier/Workflows; a "Settings → Integrations → Webhooks" page is cited by third parties only — **unverified**.
- **LLM keys**: select provider, name, paste API key; usage then bills to your provider (plan-gated).
- Data-warehouse: Snowflake share ("enter your Snowflake account ID in Apollo's settings").

#### Ideal customer profile (D1 group; D2 sub-pages)
Sub-pages by path: **Personas** ([Create and Use a Persona](https://knowledge.apollo.io/hc/en-us/articles/4409500253837-Create-and-Use-a-Persona); *Add persona*, *Generate personas with AI*), **Scoring** ([Create a Custom Score](https://knowledge.apollo.io/hc/en-us/articles/4877935868045-Create-a-Custom-Score); *Create new score* → Agentic score via AI assistant or Manual), **Signals** ([Create and Use a Signal](https://knowledge.apollo.io/hc/en-us/articles/13152837789837-Create-and-Use-a-Signal); *Create signal* → People/Companies, name, description, signal group, filters, talking tips), **Buying intent** (topics), **Website visitors** ([Track Website Visitors](https://knowledge.apollo.io/hc/en-us/articles/20544185285389-Track-Website-Visitors-to-Prioritize-Prospects); *Add website*, Company vs Company & person tracking, **Advanced Intent Settings** [page-URL → intent level], tracking script; 3 domains free, 100 with Inbound add-on).

#### AI context center [older label: "AI content center"] (D1)
Source: [Configure the AI Context Center](https://knowledge.apollo.io/hc/en-us/articles/30893173191309-Configure-the-AI-Context-Center-to-Optimize-Apollo-AI). Enter website URL → auto-generated company overview; or manual fields: Company name, Offering, Value proposition, Call-to-action, Company overview, Additional context, Primary competitors, Product differentiators; *Add a product or service*; per-block *Save* then *Save changes*; regenerate ⟳; **Edit permissions** (everyone / admins only / specific users). Since Jun 2026 the AI Assistant can fill/approve it conversationally. There is no separate "AI SDR" settings page; AI configuration = context center + AI projects + per-feature permissions + LLM key + credit limits on workflows. "AI Assistant" is a top-bar button, not a settings item.

#### Rules of engagement [older: "Outbound"] (D1 group; D2 sub-pages)
- **Prospecting config** [older: "Prospecting configuration"] ([Configure Prospect Settings](https://knowledge.apollo.io/hc/en-us/articles/31483712794125-Configure-Prospect-Settings-in-Apollo); path given as "Admin Settings > All Settings > Rules of Engagement > Prospecting Config" = 3–4 clicks). A two-column card page: **GDPR Compliance** (3 toggles: forbid prospecting / email sending / tracking for EU residents), **Mobile Numbers** (default-request toggle; costs credits), **Exclude Account Stages** (multi-select + Save), **Job Change Alerts** (3 toggles), **Primary Email Address** (Business / Personal / Any + Save), **Duplicate Account Handling** (auto-map vs prompt), **DNC list screening** (toggle; US, UK, DE, FR, CA, AU, NZ), **Email Syncing** (sync unverified emails to CRM or not), **Global In-Progress Limit Settings** (contacts in progress per account).
- **Territories** ([Create Territories](https://knowledge.apollo.io/hc/en-us/articles/4412665806989-Create-Territories-to-Control-Prospecting-Access)): *New territory* → name, assign to users/teams/everyone, *Add filters for people and companies*, Save filters, Save; "…" Edit/Duplicate/Delete. Organization plan. Round-robin/lead routing is handled in Meetings (inbound routers) and Workflows, not here.

#### Team email & sequences [older: "Sales engagement"] (D1 group)
- **Sequences** sub-page with tabs (D3): **Sequence rulesets · Sequence alerts · Priority settings · Schedules · Best times** (screenshot in [Configure a Sequence Sending Schedule](https://knowledge.apollo.io/hc/en-us/articles/4409477927309-Configure-a-Sequence-Sending-Schedule)).
  - Schedules: list (name, Default tag, days, time zone), *+ New Schedule* → name, time zone (26 options), *Use the contact's local time zone*, day/time blocks.
  - Sequence rulesets ([Manage Sequence Rulesets](https://knowledge.apollo.io/hc/en-us/articles/4409396858509-Manage-Sequence-Rulesets)): *+ New Sequence Ruleset* → Triggers (same-account reply behavior: do nothing / mark not sent / delay; create call task after N opens; mark finished on click; unresponsive after N days) and Other Settings (exclude stages — default Replied, Interested, Do Not Contact, Bad Data; etc.).
  - Priority settings (order of queued sequence emails; permission "Can edit email priority settings"); Sequence alerts; Best times — content **unverified**.
- **Tracking subdomains** ([Set Up a Custom Tracking Subdomain](https://knowledge.apollo.io/hc/en-us/articles/4415240542733-Set-Up-a-Custom-Tracking-Subdomain)): *Create Subdomain* → name → Automatic or Manual DNS.
- Unsubscribe/opt-out text is per-user (Profile › Email settings), but admins can force it via the permission "User can disable opt-out message".

#### Team dialer (D1; tabs D2)
Source: [Set Up the Dialer](https://knowledge.apollo.io/hc/en-us/articles/26604629080845-Set-Up-the-Dialer-to-Make-Calls-on-Apollo), [Purposes and Dispositions](https://knowledge.apollo.io/hc/en-us/articles/5494331315853-Use-Purposes-and-Dispositions-to-Understand-Call-Outcomes). Tabs: **Team numbers** (buy numbers, caller ID, business profile), **Recording** (location-based recording rules: *New rule* → country/state/area code; inbound/outbound: Both parties / Agent only / Prospect only / None; *Play an announcement*; default no-record list of 16 US states, CA, UK, IE, EU, CH, AU), **Purposes**, **Dispositions**. Parallel/power dialing and international dialing are add-ons/plan features.

#### Team conversations / Conversations (D1 group; tabs D2–D3)
Source: [Set Up Conversations](https://knowledge.apollo.io/hc/en-us/articles/8274034041997-Set-Up-Conversations). First-run wizard (Enable auto-record → which meetings [all / internal / external] → exclude domains → auto-add new users / let users self-enable / admin-only). Settings tabs: **Recording** (types to record, excluded domains, recorder bot name), **Trackers** (keyword sets; *Add tracker* Prebuilt/New; *Track when mentioned by* internal/external/all), **Recording consent** (Consent page, Recording announcement, Email notification with editable message, chat message), scorecards, Zoom/Google Meet/Teams connections, Gong import. Since Jul 2026 an audit history of recording-setting changes is shown in the settings ("who made each change and when").

#### Team meetings (D1 in older sidebar) — most meeting settings are *not* in Settings: personal link, default location (Zoom/Teams/custom), branding logo, default availability are under **Meetings > Availability & tools**; intake forms, inbound routers, round-robin under **Meetings > Create / Admin console** ([Set Up Meetings](https://knowledge.apollo.io/hc/en-us/articles/8792552682125-Set-Up-Meetings), [Inbound Routers](https://knowledge.apollo.io/hc/en-us/articles/17919970244109-Create-Inbound-Routers-for-Your-Meetings)). Calendar connection: one calendar per user, Google or Outlook only; connecting a mailbox connects the calendar. A redesigned meetings editor shipped Feb 2026.

#### Data management → Objects, fields, stages (D1 group; D2–D3)
Source: [Create Custom Contact Fields](https://knowledge.apollo.io/hc/en-us/articles/4412498825869-Create-Custom-Contact-Fields), [Custom Deal Fields](https://knowledge.apollo.io/hc/en-us/articles/41033810169357-Create-Custom-Deal-Fields), [Set Up Deals](https://knowledge.apollo.io/hc/en-us/articles/40691781463437-Set-Up-Deals), [Stages Overview](https://knowledge.apollo.io/hc/en-us/articles/4410623601165-Contact-and-Account-Stages-Overview), [Custom Objects](https://knowledge.apollo.io/hc/en-us/articles/47890965056013-Create-and-Sync-Custom-Objects-from-Salesforce).
- **Contact fields & stages** / **Account fields & stages**: tabs *Fields* (Create Field: 9 types; max chars; global vs custom picklists; global vs private field; optional CRM mapping + read-only flag; grouping/reordering) and *Stages* (defaults: Cold, Approaching, Replied, Interested, Not Interested, Unresponsive, Do Not Contact, Bad Data, Changed Job; account: Cold, Current Client, Active Opportunity…) with per-stage **Triggers**.
- **Deal fields & stages**: tabs *Pipelines* (Create Pipeline; Create stage: name, deal type, probability, forecast category; drag to reorder; locked when Salesforce/HubSpot deals sync is on), *Fields*, *Currency* (default currency; *Enable multiple currencies*; daily FX at 09:00 GMT). The deal *form* is customized from Deals > Create deal > Customize deal form, not in Settings.
- **Custom objects** (Salesforce, Org plan): create, pick fields, sync status.
- **Waterfall enrichment** (Jun 2026 "dedicated Data Management page"): provider order for email and phone waterfalls, validators; all users can view, only admins edit ([Use Waterfall Enrichment](https://knowledge.apollo.io/hc/en-us/articles/34071121664781-Use-Waterfall-Enrichment)). Also reachable from the People table column header ("Configure Waterfall settings").
- Enrichment scheduling itself lives in **Data enrichment > Data health center** (main nav), not Settings.

#### Removal requests (D1; admin) — rolling 30-day list of saved contacts who asked Apollo to delete them; Export CSV ([Understand Removal Requests](https://knowledge.apollo.io/hc/en-us/articles/19331318468621-Understand-Removal-Requests-and-Stay-Compliant-on-Apollo)). Added Apr 2026.

#### Metrics (flyout item; only visible to teams with custom metrics) — goals and custom metrics reports; otherwise absent from the menu.

#### Workflows / Plays — no settings page. Workflows are built in the main nav (**Workflows**, "New" badge); sharing, credit limits per run/lifetime, and "Workflows super admin access" are set on the workflow itself or in permission profiles ([Create a Workflow](https://knowledge.apollo.io/hc/en-us/articles/4413804036109-Create-a-Workflow)). The old "Plays" term now appears as "expert-built Plays" on Home.

#### Delete account — no self-serve control. KB: to delete a workspace an admin must contact Support/privacy@apollo.io; users can be *deactivated* (Users page); subscriptions cancelled from Plan overview. Third-party guides claim a "Cancel subscription" button under "Settings > Manage Plan" ([Bardeen](https://www.bardeen.ai/answers/how-to-delete-apollo-io-account)) — label **unverified**. Consolidating duplicate workspaces is done via invites ([Consolidate Workspaces](https://knowledge.apollo.io/hc/en-us/articles/45180274641549-Consolidate-Multiple-Apollo-Workspaces-into-One)).

#### Data retention — no configurable retention setting found. Compliance controls are GDPR toggles, DNC screening, removal requests, redaction of sensitive information in recordings ([Uphold Data Privacy with Redaction](https://knowledge.apollo.io/hc/en-us/articles/22375326076173-Uphold-Data-Privacy-with-the-Redaction-of-Sensitive-Information-in-Apollo)), and the Living Contributor Network data-sharing opt-out (workspace-level; noted as non-transferable in the consolidation article). Terms: free accounts inactive 6+ months may be deleted.

#### LinkedIn — no settings page. LinkedIn tasks are automated by the Chrome extension on linkedin.com; the only related settings are extension visibility and the dialer's "open LinkedIn during calls" option.

### 1.4 Where "Advanced"/"More" nesting shows up
- Chrome extension › **Advanced** (CRM update behavior).
- Website visitors › **Advanced Intent Settings**.
- Salesforce/HubSpot push › "Advanced sync" block (deletion sync, merge sync).
- Permission profile editor: every group is an accordion; "click on a feature to expand it to view and apply more granular feature permissions".
- Mailbox row → drawer → 4 tabs → per-field edits (deepest common path: Settings › Email setup and health › Mailboxes › Show filters › mailbox › Overview › signature = 6 interactions).
- "Settings > Open Advanced Setup" is referenced once in the KB (Salesforce) — exact page **unverified**.

---

## 2. WHO USES WHAT

| Section | Primary role(s) | Frequency | Evidence / guess |
|---|---|---|---|
| Getting Started / Onboarding hub | Admin (RevOps, sales manager, founder) | Once at setup, revisited for weeks (progress % shown in avatar menu) | KB describes admin checklist; Home shows "Next steps for you" for every user |
| Profile › General / MFA / Custom fields | Everyone | Once, then rarely | KB |
| Profile › Email settings (tracking, opt-out) | SDR/AE | Once; toggled per campaign if they follow Apollo's "time-bound tests" advice | KB warns tracking should be turned on/off strategically |
| Mailboxes / Email setup and health (own mailbox, signature, limits, warmup) | SDR, AE; admins for the team view | Weekly (deliverability score, warm-up, "Sent vs Limit"); daily for high-volume outbound teams (guess) | KB "check your mailbox deliverability score regularly" |
| Sending policies / Bounce logs / Domains | RevOps/admin, deliverability owner | Weekly; more during incidents | 2026 release notes position these as admin controls |
| Phone numbers (personal dialer) | SDR, AE | Once; rarely after | KB |
| Team dialer (recording rules, dispositions) | Admin/RevOps, sales manager, legal | Once; rarely | KB permission "add, edit, delete recording rules" |
| Notifications | Everyone | Once (guess) | KB |
| Chrome extension settings | SDR, marketer using Gmail | Once, occasional | KB |
| Users and teams › Users / Teams | Admin, RevOps, IT | Weekly in growing teams; on every hire/exit | KB |
| Permission profiles | Admin/RevOps (Org plan) | At setup; quarterly reviews (guess) | KB |
| Security (SSO, MFA, IP, password) | IT/security admin | Once; on audits | KB explicitly names "IT manager" as a non-admin needing this |
| Plan and billing | Admin, finance, "Billing and seat manager" seat | Monthly (invoices, seats); at renewal | KB; free seat type exists specifically for this |
| Credits and activity › Credit usage | Admin/RevOps; individual reps check their own | Weekly or whenever "credits burned unexpectedly"; reviewers say daily anxiety (§3) | KB redesign Jun 2026 aimed at "investigate unexpected usage" |
| Integrations › CRM | RevOps/admin, Salesforce/HubSpot admin | Intensive at setup (6-hour window!), then on field changes; error logs weekly | KB |
| Integrations › API keys, Zapier, LLM keys | RevOps, ops engineer, marketer | Once | KB |
| Ideal customer profile (personas, scores, signals, intent, visitors) | Marketing ops, RevOps, sales leader | At setup; monthly refinement (guess) | KB; scores plan-gated |
| AI context center | Marketing/product marketing + admin | Once; refreshed on positioning changes; now editable via AI Assistant | KB |
| Rules of engagement › Prospecting config | Admin/RevOps, compliance | Once; rarely | KB "Admins Only" |
| Territories | RevOps / sales leader | At planning cycles (quarterly) (guess) | KB |
| Team email & sequences (schedules, rulesets, priority, tracking subdomains) | RevOps, SDR manager | At setup; monthly | KB |
| Objects, fields, stages / Waterfall | RevOps/admin | Setup; on CRM changes; waterfall order when credit spend spikes | KB |
| Conversations settings (recording, consent, trackers) | Sales manager, enablement, legal | Setup; trackers monthly (guess) | KB |
| Removal requests | Admin/privacy | Every ~30 days (KB recommends) | KB |
| Meetings availability | AE, SDR | Once; weekly tweaks (guess) | KB |

---

## 3. COMPLEXITY COMPLAINTS (verbatim)

**Navigation / clutter / too many clicks**
- "Data is fine.. but UX is very bad.. heavy loading pages to many windows with slow loading, too many clicks to reach data many navigation buttons seems to be not in the logical place" — Hassnaa, Trustpilot, 4 Sep 2026. https://www.trustpilot.com/review/apollo.io
- "the UI and UX is cluttered and frustrating" — Damien Voss, Trustpilot, 19 Aug 2026. https://www.trustpilot.com/review/apollo.io?page=3
- "Overly complicated. If you are running a respectable business, rather than a spam business, its quicker…" — "Not a customer any more", Trustpilot, 26 Aug 2026. https://www.trustpilot.com/review/apollo.io?page=2
- "The UI can feel slightly cluttered, and initial setup takes some time to get right." — Sanket D., Media Buyer Manager, Capterra, 10 Apr 2026. https://www.capterra.com/p/158696/Apollo/reviews/
- "The interface can feel a bit overwhelming at first, and I accidentally spent a bunch of time individually selecting people only to click on the wrong 'add to list' icon that just added the entire company to my list." — ryan P., Owner, Capterra, 31 Oct 2025. https://www.capterra.com/p/158696/Apollo/reviews/
- "ui and experience is overwhelming" — Zaro D., Owner, Construction, Capterra, 15 Jul 2026. https://www.capterra.com/p/158696/Apollo/reviews/
- "The user interface is a bit clunky and not super intuitive at times." — Capterra reviewer (via Capterra summary). https://www.capterra.com/p/158696/Apollo/reviews/
- "Name of the features is a bit confusing to me." — Capterra reviewer. https://www.capterra.com/p/158696/Apollo/reviews/
- "There are a lot of features, so it can be a little confusing to muddle through the differences between plan levels. Additionally, there are certain situations when I'm trying to complete a specific action and get confused by the user interface." — Maddy O., Founder, Capterra, 22 Nov 2024. https://www.capterra.com/p/158696/Apollo/reviews/
- "navigating between campaigns, contacts, and analytics feels like one click too many each time" — G2 reviewer, quoted by SyncGTM's review round-up. https://syncgtm.com/blog/apollo-io-review (secondary; original G2 review not fetchable)
- "I would say that it takes a very technical person to put together your sequencing, workflows, and searching contacts properly" — G2 reviewer quoted by Warmly. https://www.warmly.ai/p/blog/apollo-review (secondary)
- "The grid for making calls and completing tasks is a bit messy. There's a lot of information there" — G2 reviewer quoted by Warmly. https://www.warmly.ai/p/blog/apollo-review (secondary)
- "there is a slight learning curve to understand the dependencies" — Shane S., CEO, Capterra, 12 Jun 2025.
- Apollo's own 2025 release note concedes the pre-suite state: "Instead of hunting across settings and diagnostics, you now have a single command center… no more jumping between multiple settings pages." — [Release Notes 2025, ApolloNEXT](https://knowledge.apollo.io/hc/en-us/articles/34072157047309-Release-Notes-2025)
- Apollo's KB also documents a table-overflow problem: "If you can't see the number of emails sent vs your limit, zoom out on your browser or try scrolling horizontally in the table." — [Configure Email Sending Limits](https://knowledge.apollo.io/hc/en-us/articles/4409233349005-Configure-Email-Sending-Limits)

**Credits / billing confusion**
- "The credit system can be confusing—it's not always clear how credits are calculated, and the usage statistics occasionally seem inconsistent." — G2 reviewer quoted by Warmly and by G2's pros/cons page. https://www.g2.com/products/apollo-io/reviews?qs=pros-and-cons (secondary)
- "I feel that Apollo charges credits when it is not necessary. It's called nickel and diming." — Randy, Trustpilot, 4 Sep 2026.
- "Charges you credits for any action you take inside which makes no sense because you've already paid" — Damien, Trustpilot, 30 Aug 2026.
- "Apollo AI assistant ran operations quoting me a certain amount of credits, and then racked up a separate bill" — Paige Robillard, Trustpilot, 18 Aug 2026. https://www.trustpilot.com/review/apollo.io?page=3
- "It is difficult to decipher the units provided by the literature and unclear what 40,000 means." — Robert, Trustpilot, 4 Sep 2026.
- "Unclear pricing, forced waterfall verification, slow email access, and excessive credit consumption." — Rafay A., Research Staff, Capterra, 8 Jan 2026.
- "credit-based system can be a bit tricky to manage at first" — Jordan V., Sales Specialist, Capterra, 15 May 2026.
- "frustrating to see them change credits usage" — Verified Reviewer, Founder's Office, Capterra, 17 Jul 2025.
- "watch the credit system closely or you'll get surprised at the end of the month" — Reddit user quoted by Cleverly's review. https://www.cleverly.co/blog/apollo-io-review (secondary; thread URL not recoverable)
- "getting a phone number is 5 times more expensive than an email" — u/Solvesy-Not-Salesy, r/sales, May 2026, as quoted by a search-engine summary of Salesmotion/SalesHandy pricing posts — **unverified** (could not locate the thread).
- "Permanently locked out of my account and no way of getting back in with the value of credits" — J.S, Trustpilot, 3 Sep 2026.
- "accidentally paid for another month" — Codeb, Trustpilot, 31 Aug 2026 (resolved with refund).
- Warmly's summary of G2 themes: "reviewers find the credit-based pricing system confusing and sometimes frustrating, as it can be difficult to predict exactly how many credits they will burn through during a high-volume sprint." https://www.warmly.ai/p/blog/apollo-review

**Permissions / plan-gating**
- No verbatim user quote about *permission profiles* being confusing was found. What is documented is friction by design: "Custom permission profiles are available on organization and custom plans" (KB); the Getting Started checklist greys out tasks with "Hey, it looks like you don't have the admin permissions to complete the tasks below."; the KB FAQ "Why can't I access all admin settings?" answers "If a setting is greyed out and you can't select it, your Apollo admin hasn't provided you access." Third-party summaries call this "recurring friction… feature gating, with SSO and SCIM locked to the Organization plan… and custom permission profiles also gated there" (Stitchflow/LinkedHelper summaries, secondary).
- "having to unlock bits and pieces of information is a little annoying" — Capterra reviewer (via search summary). https://www.capterra.com/p/158696/Apollo/reviews?page=3

**Onboarding / learning curve**
- "It has a bit of a learning curve at the start, especially with advanced filters." — Sanket D., Capterra, Apr 2026.
- "With so many features built into one platform, there can be a bit of a learning curve at the beginning." — Shasta W., Director of Sales Support, Capterra, Mar 2026.
- "Multiple G2 reviewers report that onboarding new reps takes longer than expected" — SyncGTM summary.

---

## 4. PRAISE (verbatim)

- "It's easy to navigate across different sections, and the built-in AI makes the experience even smoother." — Nurudeen O., Business Outreach Analyst, Capterra, Apr 2026. https://www.capterra.com/p/158696/Apollo/reviews/?page=2
- "The user interface is simple and intuitive." / "Setting up the client on your machine is quick and painless." — Alessandro M., Consultant, Capterra, Sep 2025.
- "It doesn't take long to get setup and is very secure." — Verified Reviewer, Account Executive, Capterra, Feb 2026.
- "I like the overall interface of Apollo. It is easy to search for people using filters such as job role…" — Sankalp U., Digital Marketing Executive (G2, quoted by Apollo). https://apollo.io/magazine/g2-winter-2026
- "What I like best about Apollo.io is how it brings everything into one place, prospecting, enrichment, and outreach." — Tatiana B., Legal Consultant (G2, quoted by Apollo). https://www.apollo.io/magazine/g2-fall-2025
- "The interface is the strongest single thing Apollo does… Saved searches sync across sessions. Bulk export is one click on paid plans." — Salesforge 4-week hands-on review. https://www.salesforge.ai/blog/apollo-io-review
- G2 aggregate scores (from G2 compare pages as surfaced in search; page itself blocked): Ease of Admin **9.0** (n≈2,570), Ease of Setup **8.9**; Apollo says it ranked "No. 1 across 20 Mid-Market reports, including Implementation Indexes" (Winter 2026) and #1 in four Implementation Index categories (Fall 2025). https://www.g2.com/compare/apollo-io-vs-lusha (score **unverified** directly), https://apollo.io/magazine/g2-winter-2026
- Support experience counterpoint: "accidentally paid for another month and they refunded me no questions asked" — Codeb, Trustpilot, Aug 2026.
- Design details the KB itself gets right (researcher's read, not a user quote): a **Search settings** box at the top of the sidebar; **View as** permission preview; the IP-whitelist page warns "24 users in your team might lose access" before you lock yourself out; Bounce guard defaults are safe and shown inline; the Manage Subscription checkout has a sticky "Due today" summary.

---

## 5. RECENT CHANGES (2024–2026)

Sources: [Release Notes 2025](https://knowledge.apollo.io/hc/en-us/articles/34072157047309-Release-Notes-2025), [Release Notes 2026](https://knowledge.apollo.io/hc/en-us/articles/43226752968077-Release-Notes-2026), and KB screenshots.

**Settings/navigation structure**
- **Oct 2024** — "Admin Settings Overview" KB article created (31 Oct 2024): introduces the bottom-left *Admin Settings* flyout with *Team & Workspace setup* progress and *All settings*.
- **Jan/Feb 2025** — "Settings: If you're an Apollo admin, it's now easier to visualize and configure high-priority settings… Access the Getting Started checklist." Same month: Apollo **Theme** (light/dark/system) added to the avatar menu.
- **2025** — sidebar generation A (screenshots): *Getting Started*; **Personal settings** (Profile, Mailboxes, Phone numbers, Notifications, Chrome extension, Conversations); **Workspace settings** (Users and teams › Users/Teams/Permission profiles/Security; Billing and credits; Integrations; Ideal customer profile; **AI content center**; Rules of engagement; Team email & sequences; Team dialer; Team conversations; Team meetings; System activity).
- **Sep 2025 (ApolloNEXT)** — **Deliverability suite** launched as "a single command center… no more jumping between multiple settings pages"; domain/mailbox purchase inside Apollo; sequences builder redesign. Sidebar generation B renames *Mailboxes* → *Mailboxes & domains* and adds *Deliverability suite* under Workspace.
- **2026** — sidebar generation C (screenshots dated 2026): *Get started*; Personal: Profile, **Mailboxes & domains**, Phone numbers, Notifications, Chrome extension, Conversations; Workspace: **Workspace overview**, **Email setup and health** (Overview, Domains, Marketing domains, Mailboxes, Bounce logs, Sending policies), Users and teams, **Plan and billing**, **Credits and activity** (Credit usage, Data requests, AI word usage, System activity log), Integrations, Ideal customer profile, **AI context center** (renamed from "content"), Rules of engagement, Team email & sequences, Team dialer, Team conversations… Top bar gains a "Search or ask a question in Apollo ⌘K" box, a credits pill (e.g., "1.8M credits"), an **AI Assistant** button and a bell.
- **Feb 2026** — redesigned meetings editor; Conversations gets persistent filters.
- **Apr 2026** — **Removal requests** page in Settings; Language menu adds Italian.
- **Jun 2026** — **Credit usage redesign** ("which users, features, and actions are driving consumption"; Surfaces view incl. MCP); **Waterfall Enrichment Settings** moved to "a dedicated Data Management page"; GDPR-settings guidance for France/Italy tracking rules.
- **Jul 2026** — **Billing and Admin Controls**: *Send Now permission controls* (admins decide if users can bypass daily limits), *Email capacity utilization dashboard* (Email Analytics), *self-serve Tax IDs* in Billing; Conversations *recording settings audit log*; *bounce logs* view in the deliverability suite.
- **Aug 2026** — Salesforce **Custom Objects** (Settings › Objects, fields, stages › Custom objects); bounce guard auto-pause thresholds configurable.

**AI / agent settings**
- **Mar 2025** — AI context center article created; Outbound Copilot.
- **Oct 2025** — AI Assistant beta ("end-to-end GTM AI Assistant"), AI Projects (alpha).
- **Jan–Mar 2026** — AI Assistant GA; free on Basic/Pro/Org "as an introductory offer", 5 chats on Free; Slack app unified; AI Research free trial (25 jobs) inside the Assistant.
- **Jun 2026** — Assistant can "review, edit, approve, and generate content for the AI context center"; Assistant Memory; MCP agents get task management, custom-field read/write, sender-mailbox guardrails; Apollo connectors for Claude, Codex, Replit, Superhuman Go, Cursor, Perplexity, ChatGPT.
- **Jul 2026** — *Connect Your Own LLM Key* (OpenAI/Perplexity/Anthropic) in Settings › Integrations.
- Apollo does not ship a standalone "AI SDR agent" settings page; third-party comparisons classify it as "AI-assisted" rather than autonomous (11x, SalesHandy).

**Plan / credit settings**
- **2025** — credit limits per user (Users page) and per workflow (per-run / lifetime); waterfall enrichment GA with admin-chosen provider order; selective CRM sync gated to plans bought after 24 Jul 2024.
- **2026** — pricing calculator KB page (Sep 2026); self-serve add-on credit slider, reduce/remove add-ons before renewal; "Due Today too low" guard near renewal; call assistant (free seat) rollout; billing-and-seat-manager free seat (up to 5).

---

## 6. WHAT THE SETTINGS HOME LOOKS LIKE TODAY (Sep 2026)

Described from first-party KB screenshots (Deliverability article i1, Credit usage i24, Profile i12, Admin Settings Overview i1/i3, Permission profiles i51, Security i1). Two slightly different sidebars are still shown in currently-published articles; the description below follows the newest (Credit usage / Deliverability screenshots), with older labels in brackets.

**Getting there.** In the main app the left nav is grouped *Home · Prospect & enrich (People, Companies, Lists, Data enrichment) · Engage (Sequences, Emails, Calls) · Win deals (Meetings, Conversations, Deals) · Tools & automations (Tasks, Workflows, Analytics)*, with a yellow **Add teammates** button and, for admins, **Admin Settings ▸** pinned at the bottom-left. Hovering/clicking it opens a flyout: *Team & Workspace setup* with a progress bar ("86% Completed"), then *Users and teams · System activity · Security · Plan overview · Integrations*, a divider, and *All settings*. In the newer collapsed icon rail the same entry is a gear icon at the bottom. Non-admins reach Settings via the avatar menu (*Your profile*).

**Layout.** Settings replaces the main nav with its own **left sidebar (~300 px)** and a full-width content pane; there is no top-level "settings dashboard" — the default landing page is **Get started** [Getting Started] (the onboarding checklist) or the last page visited. URL pattern `app.apollo.io/#/settings/<page>` (e.g., `/settings/credits`).

**Sidebar, top to bottom:**
1. **← Settings** (back link to the app).
2. **🔍 Search settings** — a real search box for settings pages (present in every screenshot since 2025).
3. **🚀 Get started** [Getting Started].
4. **Personal settings** (grey group label, non-collapsible): *Profile · Mailboxes & domains [Mailboxes] · Phone numbers · Notifications · Chrome extension · Conversations*.
5. **Workspace settings** (grey group label): *Workspace overview* (new) · **Email setup and health ▾** [Deliverability suite ▾] → *Overview, Domains, Marketing domains, Mailboxes, Bounce logs, Sending policies* · **Users and teams ▾** → *Users, Teams, Permission profiles, Security* · **Plan and billing ▾** [Billing and credits ▾] · **Credits and activity ▾** [System activity ▾] → *Credit usage, Data requests, AI word usage, System activity log* · *Integrations* · **Ideal customer profile ▾** (Personas, Scoring, Signals, Buying intent, Website visitors) · *AI context center* [AI content center] · **Rules of engagement ▾** (Prospecting config, Territories) · **Team email & sequences ▾** (Sequences, Tracking subdomains) · *Team dialer* · **Team conversations ▾** · *Team meetings* · (Objects, fields, stages / Data management and Removal requests appear further down; exact position **unverified**).
6. Sticky footer button **Add Teammates** [Invite team member].

Expandable groups use a chevron; the active sub-item is highlighted with a dark pill (newest) or light-blue pill (older). Sub-pages often add a **second navigation level as horizontal tabs** across the top of the content pane (Profile: General / MFA / Custom fields / Email settings / Conversations; Security: MFA / IP whitelisting / Password policy / Login controls / Single sign on; Sequences: Sequence rulesets / Sequence alerts / Priority settings / Schedules / Best times; Email setup and health: Overview / Domains / Mailboxes), and some add a **third** (mailbox drawer: Overview / Deliverability / Inbox placement / Forwarding email; permission profile: Settings / Users). Primary actions are bright-yellow buttons top-right (*Save*, *+ New Profile*, *+ New Schedule*, *Add ▾*, *Save Changes ▾*). Content pages are card-based; the Prospecting config page is a two-column grid of cards each with its own *Save* button, while Profile uses a single global *Save*.

**Global chrome above Settings (newest UI):** a top bar with "Search or ask a question in Apollo ⌘K", a credits balance pill ("1.8M credits"), a black **AI Assistant** button, a notifications bell and the avatar menu (Your profile, Activity & notifications, Developer Tools, Theme, Language Beta, View credit usage, Onboarding hub %, Log out).

**Observed inconsistencies (useful for a UX audit):** the same page is called "Mailboxes", "Mailboxes & domains", "Deliverability suite" and "Email setup and health" across live articles; "AI content center" vs "AI context center"; "Billing and credits" vs "Plan and billing" + "Credits and activity"; "System activity" is both a flyout item and a sub-item of Credits and activity; "Sharing and defaults" is documented both as *Users and teams › Sharing and defaults* and as a top-level *Team sharing & defaults*; Meetings settings live outside Settings entirely; the personal *Conversations* item duplicates a Profile tab.

---

## Source list
Apollo KB (all fetched 13 Sep 2026): Admin Settings Overview https://knowledge.apollo.io/hc/en-us/articles/31518179257613 · Profile Settings https://knowledge.apollo.io/hc/en-us/articles/34010120281613 · Prospect Settings https://knowledge.apollo.io/hc/en-us/articles/31483712794125 · Security Protocols https://knowledge.apollo.io/hc/en-us/articles/20439872853645 · SSO https://knowledge.apollo.io/hc/en-us/articles/12667892496141 · Plan https://knowledge.apollo.io/hc/en-us/articles/4677130104333 · Billing https://knowledge.apollo.io/hc/en-us/articles/14140209188621 · Credit usage https://knowledge.apollo.io/hc/en-us/articles/9527776320781 · Data requests https://knowledge.apollo.io/hc/en-us/articles/4738396786701 · Permission profiles https://knowledge.apollo.io/hc/en-us/articles/4409154208269 · Users https://knowledge.apollo.io/hc/en-us/articles/4409130537101 · Teams https://knowledge.apollo.io/hc/en-us/articles/5482714681869 · Territories https://knowledge.apollo.io/hc/en-us/articles/4412665806989 · Billing & seat managers https://knowledge.apollo.io/hc/en-us/articles/21231183878797 · Call assistants https://knowledge.apollo.io/hc/en-us/articles/33728462295309 · User fields https://knowledge.apollo.io/hc/en-us/articles/4412499090189 · Sharing & defaults https://knowledge.apollo.io/hc/en-us/articles/40430351927437 · Mailboxes & domains https://knowledge.apollo.io/hc/en-us/articles/39530186410125 · Configure mailbox https://knowledge.apollo.io/hc/en-us/articles/44268354251021 · Sending limits https://knowledge.apollo.io/hc/en-us/articles/4409233349005 · Signature https://knowledge.apollo.io/hc/en-us/articles/4409140295949 · Unsubscribe https://knowledge.apollo.io/hc/en-us/articles/4409140379661 · Warmup https://knowledge.apollo.io/hc/en-us/articles/26772718460045 · Tracking subdomain https://knowledge.apollo.io/hc/en-us/articles/4415240542733 · Email tracking https://knowledge.apollo.io/hc/en-us/articles/34263074322701 · Link mailbox https://knowledge.apollo.io/hc/en-us/articles/4409127806093 · Unlink https://knowledge.apollo.io/hc/en-us/articles/19883438029069 · Buy domain/mailbox https://knowledge.apollo.io/hc/en-us/articles/33476090833549 · Sequence schedules https://knowledge.apollo.io/hc/en-us/articles/4409477927309 · Rulesets https://knowledge.apollo.io/hc/en-us/articles/4409396858509 · Deals setup https://knowledge.apollo.io/hc/en-us/articles/40691781463437 · Deal fields https://knowledge.apollo.io/hc/en-us/articles/41033810169357 · Contact fields https://knowledge.apollo.io/hc/en-us/articles/4412498825869 · Stages https://knowledge.apollo.io/hc/en-us/articles/4410623601165 · Custom objects https://knowledge.apollo.io/hc/en-us/articles/47890965056013 · Waterfall https://knowledge.apollo.io/hc/en-us/articles/34071121664781 · Dialer setup https://knowledge.apollo.io/hc/en-us/articles/26604629080845 · Purposes/dispositions https://knowledge.apollo.io/hc/en-us/articles/5494331315853 · DNC https://knowledge.apollo.io/hc/en-us/articles/19207906524557 · Meetings https://knowledge.apollo.io/hc/en-us/articles/8792552682125 · Inbound routers https://knowledge.apollo.io/hc/en-us/articles/17919970244109 · Conversations https://knowledge.apollo.io/hc/en-us/articles/8274034041997 · AI context center https://knowledge.apollo.io/hc/en-us/articles/30893173191309 · AI Assistant https://knowledge.apollo.io/hc/en-us/articles/39359204112397 · LLM key https://knowledge.apollo.io/hc/en-us/articles/41236799633549 · GDPR https://knowledge.apollo.io/hc/en-us/articles/4409141087757 · Removal requests https://knowledge.apollo.io/hc/en-us/articles/19331318468621 · Notifications https://knowledge.apollo.io/hc/en-us/articles/34009920880781 · Chrome extension https://knowledge.apollo.io/hc/en-us/articles/34009571689997 · Salesforce https://knowledge.apollo.io/hc/en-us/articles/4414356051725 / pull 4414496822797 / push 4414469523981 · HubSpot https://knowledge.apollo.io/hc/en-us/articles/4416619021837 / sync 4416606988941 · Slack https://knowledge.apollo.io/hc/en-us/articles/22464817775117 · Zapier https://knowledge.apollo.io/hc/en-us/articles/4415362778509 · API https://knowledge.apollo.io/hc/en-us/articles/4416173158541 · Signals https://knowledge.apollo.io/hc/en-us/articles/13152837789837 · Scores https://knowledge.apollo.io/hc/en-us/articles/4877935868045 · Website visitors https://knowledge.apollo.io/hc/en-us/articles/20544185285389 · Workflows https://knowledge.apollo.io/hc/en-us/articles/4413804036109 · Home https://knowledge.apollo.io/hc/en-us/articles/14845941738637 · Welcome https://knowledge.apollo.io/hc/en-us/articles/4409127280781 · Consolidate workspaces https://knowledge.apollo.io/hc/en-us/articles/45180274641549 · Partner seat https://knowledge.apollo.io/hc/en-us/articles/44815591985421 · Release Notes 2025 https://knowledge.apollo.io/hc/en-us/articles/34072157047309 · Release Notes 2026 https://knowledge.apollo.io/hc/en-us/articles/43226752968077.
Reviews and third parties: Trustpilot pages 1–3 https://www.trustpilot.com/review/apollo.io · Capterra pages 1–3 https://www.capterra.com/p/158696/Apollo/reviews/ · G2 pros/cons https://www.g2.com/products/apollo-io/reviews?qs=pros-and-cons (blocked; via summaries) · Apollo G2 posts https://www.apollo.io/magazine/g2-fall-2025 and https://apollo.io/magazine/g2-winter-2026 · Warmly https://www.warmly.ai/p/blog/apollo-review · SyncGTM https://syncgtm.com/blog/apollo-io-review · Salesforge https://www.salesforge.ai/blog/apollo-io-review · Cleverly https://www.cleverly.co/blog/apollo-io-review · SmartReach https://smartreach.io/blog/apollo-io-review/ · The Startup Flow https://www.thestartupflow.com/2026/06/how-to-set-up-apollo-io-for-first-time.html and /2026/07/how-to-set-user-permissions-in-apollo-io.html · Bardeen https://www.bardeen.ai/answers/how-to-delete-apollo-io-account · Stitchflow https://www.stitchflow.com/user-management/apollo/manual · YouTube "How to Use Apollo.io (2025)" https://www.youtube.com/watch?v=C0ulRoVDG9E (transcript not retrievable).
