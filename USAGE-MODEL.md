# The usage model

*Every page in Ollopa decides what to show first from one model: for every item on every page, how many users in a role touch it in a typical week, per business. This file explains the method. The data is in `src/ollopa/usage/`. Nothing here appears in the product; it drives the product and is shown in lessons.*

## What a number means

`weekly = 40` for item X, role SDR, business Meridian means: in a typical week, about 40% of Meridian's SDRs touch X at least once. It is a share of active users in that role, not a count of clicks.

## The rule the number feeds

An item is **level one** for a signed-in business and role when either:

- its weekly use for that role at that business is **20% or more**, or
- it is **decision-critical** (price, renewal, credit burn, approval limits, safety state, cancel, delete), regardless of use.

Everything else is level two: behind one door, named by its content.

## The shape the numbers must fit

We have no product analytics. The numbers are opinionated and illustrative, and they must fit the published shape:

- Nielsen (2006, 2026): roughly 80% of tasks land on level one, and level one holds the few items that serve most tasks.
- Pendo (2024): in the average product, 6% of features generate 80% of clicks; about 94% of features are rarely or never touched.
- McGrenere and Moore (2000): Word users touched about 27% of functions on average, with a range from 3% to 45% per person, and only 3.3% of functions were used regularly by more than three quarters of users.

So for any page seen by one role at one business, the items should distribute about like this:

| Band | Weekly use | Share of items | What it becomes |
|---|---|---|---|
| Head | 20% and above | about 15 to 25% | Level one |
| Body | 5% to 20% | about 25 to 35% | Level two, near the top of its door |
| Tail | under 5% | about 45 to 60% | Level two, or a candidate for removal |

A page whose head is much bigger than a quarter of its items is probably lying about what people do. A page with no tail is probably missing the settings a real product accumulates.

## Per business

The same item has different numbers at different businesses. That is the point of a horizontal product. Each business has a profile, and items carry overrides where the profile changes them:

- **Fathom Labs** (12 people, seed). Everyone is an admin. Founders do outbound. Settings that an admin at a big company touches monthly are weekly here. Credit burn is watched daily.
- **Meridian Software** (300 people). Roles are separated. The baseline numbers describe Meridian.
- **Halyard Agency** (25 people, ten client workspaces). Workspace-level settings are touched every day because the team switches between ten workspaces. What is rare elsewhere is routine here.
- **Ridgeline** (80 people, product-led). Almost no outbound. Sequences and lists are low; account health, signals and lifecycle campaigns are high.

## How a number is chosen

Ask, for the role: "Is this part of their daily job (60 and above), a weekly routine (20 to 60), something they touch monthly or during setup (5 to 20), or something they touch a few times a year or never (under 5)?" Then check the page against the shape table. Then write a note when the reasoning is not obvious.

## Where the numbers show

In lessons, next to each item, with this file as the source. In case files, in the numbers table. Never in the product.
