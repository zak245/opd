# Data pass after wave 2

Twelve page builders each asked for seed fields they could not add, and stubbed them locally with a comment naming the field. This pass lands every field in `src/ollopa/data/seed.ts` (types and deterministic generators, `seedFor(business)` stays synchronous and stable per business), fixes the seed bugs the builders found, and then switches each named stub to read the seed. No UI changes: a page keeps its layout and copy; only its numbers become real.

Rules: read `BUILD-BRIEF.md` (conventions), `PRODUCT.md` (the four businesses and their seat rosters), `src/ollopa/data/businesses.ts`. Generators are seeded per business (`seedFor` pattern already in the file); never `Math.random`. Every count must agree with `businesses.ts` counts and with the settings inventory in `PRODUCT.md`. `npx tsc -b` and `npx vite build` pass at the end. Do not edit `Product.tsx`, `nav.ts`, `map.ts`, the shell, or any usage file.

## Seed bugs to fix

1. `credits.byUser[].used` must never exceed that user's `creditLimit` (Marcus Adeyemi at Meridian: 42,171 used against 5,000). Used is a fraction of the limit, most people under half, one or two near it.
2. Every Meridian change request carries the same `touches` ("Renewal type", "Proposal"). Vary `touches` per request from what the request is about.
3. `AgentEvent.batchKey` must cluster: 3 to 5 events per run key, one run per agent per day, not one random date per event.
4. Waiting approvals per seat: each declared seat in each business has 2 to 5 events with `status: "waiting"` and `ownerId` set to that seat's user. `ownerId` comes from the seat that owns the work: send and enrol items to the outbound seat (SDR; the admin at Fathom and Halyard), stage items to the deal's owner. Today it copies `contact.owner`, so sends land on marketing and customer success.
5. `AgentEvent.ifApproved.stage` is the stage after the deal's current one along `pipelines[0]`, never the stage it is already in. `ifApproved.mailbox` is the owner's mailbox. The draft's signature matches the sender. At least one `capped` event outside Fathom. `steps[].credits` vary (today every step log totals 12).
6. `Deal.lastActivity` spread: most open deals touched in the last 7 days, a tail over 40 days, so "No activity" marks a real minority (today 207 of Meridian's 214 open deals trip it).
7. `goals[]` sized to each rep's book: quota near their open plus closed value for the quarter, so attainment sits between 40% and 130%, not 446%. Add goals for the previous two quarters and the current one, so a report's period selector has a denominator.
8. Deal ownership spread across `users` who hold an AE seat, not concentrated on the seat user (Elena owns most of Meridian; the by-rep table needs about 12 rows). Same for `calls.loggedBy` and `coachingNotes`: every rep logs calls.
9. `Reply.mailbox` drawn from the seats that read replies (SDR and AE; the admin at Fathom and Halyard), so the SDR's inbox has 8 to 12 waiting, longest about 4 days. `Task.owner` on the seats that work tasks, weighted by task kind, never the marketer. `Task.creator` equals the owner for manual tasks.
10. Fathom `setupRemaining` includes two pending invites, so Home's set-up door reads "mailbox, invites (2)".

## Fields to add

- `Company.phone`.
- `Account.usage90: { week: string; activeSeats: number; events: number }[]` (13 weeks) and `Account.seats: { name: string; lastSignIn: string }[]`.
- `Audience.sizeDelta` (change since yesterday).
- `Sequence.series: { week: string; sent: number; delivered: number; opened: number; replied: number; bounced: number }[]` (12 weeks, summing to the sequence totals).
- `Campaign.qa.checks`: the eight named checks as `{ name, state: "pass" | "fail" | "not run" }`; `Campaign.links: { url: string; clicks: number }[]`; `Campaign.attributionDays`.
- `sendPolicy: { dailyCap: number; usedToday: number }` per business: Meridian 10,000 / 3,400; Ridgeline 4,000 / 900; Fathom and Halyard 0.
- `Contact.roleStartedOn`, `Contact.languages: string[]`, `Contact.signals: { kind: string; on: string; detail: string }[]` dated, `Contact.lastEnrichedFields: string[]`.
- The eleven `SavedView` rows of spec 02 §3 "Saved views" for `object: "person"`, per business and seat (the seed carries four generic ones).
- `savedReplies: { id: string; name: string; body: string }[]`, five per business (spec 06 §2).
- `Reply.classifiedBy: "reply agent" | string | null`.
- `Call.transcript: string | null` as a field (Meridian and Ridgeline have transcripts; Fathom and Halyard do not).
- `settings` object per business: `security { mfaEnforced, sso, ipRanges, passwordPolicy, sessionTimeout }`; `sending { catchAll, unsubscribeText, usersMayDisable, opens, clicks }`; `prospecting { gdprRegions, dncCountries, primaryEmail, duplicates, duplicateRate, inProgressLimit, dnc { synchronisedOn, nextDueOn, log[] }, removal { people, addedThisMonth, sequences, jobs, keys, agents, lists, crmLinks } }`; `pipeline { forecastDefinitions[] (the five forecast-category sentences), submissionWindow { day, time, opensOn }, renewalReminders, multiCurrency }`; `scoring { expansionRouting, firstValue }`; `agents { context, ownKeySet }`; `you { delivery, slack, push, muted, quietHours }`. Match the shapes the settings builder stubbed in `src/ollopa/pages/settings/derived.ts` and the reports builder's `SUBMISSION_WINDOW` and `CATEGORY_DEFINITION` in `src/ollopa/pages/reports/compute.ts`.

## Stubs to switch to the seed

Each is marked with a comment naming the field. Replace the local derivation with the seed read and delete the stub. Keep the function names the pages call.

- `src/ollopa/pages/agents/model.ts`: `queueOwner`, `stageForecast`, `mailboxFor`, `draftFor`.
- `src/ollopa/pages/companies/`: `Company.phone`, `Account.usage90`, `Account.seats`.
- `src/ollopa/pages/home/data.ts`: the run derived from `agent + when` (use `batchKey`).
- `src/ollopa/pages/marketing/CampaignsPage.tsx`: `SEND_POLICY`; the QA checks; restore the "Links clicked (n)" door the builder removed for want of data, and the attribution window on the campaign record.
- `src/ollopa/pages/people/`: `roleStartedOn`, `languages`, signals, `lastEnrichedFields`, the seeded views in `views.ts`.
- `src/ollopa/pages/reports/compute.ts`: `SUBMISSION_WINDOW`, `CATEGORY_DEFINITION`, `spread()`.
- `src/ollopa/pages/settings/derived.ts`: the settings object.
- `src/ollopa/pages/work/data.ts`: `replyMailboxes()`, `taskOwner()`, `savedReplies()`, `handoffRecord()`, `hasTranscripts()`.

## Deliver

`npx tsc -b` and `npx vite build` green. Then run these and read the numbers off the pages (`node scripts/shot.mjs "<route>" shots/data/<name>.png <business>:<role>`, against `npx vite preview --port 4130 --strictPort`, killed after): Home as meridian:sdr, Inbox as meridian:sdr, Agents as meridian:sdr, Reports as meridian:admin, Deals as meridian:ae, Settings as meridian:admin, Campaigns as ridgeline:marketer. Reply with: each bug and whether it is fixed with the before and after number, each field landed, each stub removed, anything you could not do and why. 300 words.
