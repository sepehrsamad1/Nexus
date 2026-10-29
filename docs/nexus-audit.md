# Nexus Repository Audit — P00

**Date:** 2026-10-29  
**Repository:** sepehrsamad1/Nexus  
**Baseline:** main  
**Audit status:** COMPLETE (static repository audit; runtime commands not executed through GitHub connector)

## Executive summary

Nexus is an existing Next.js + TypeScript + Prisma + SQLite prototype with working foundations for games, reviews, Reddit-style comments/voting, store products, cart, checkout, orders, profiles, and admin/demo roles.

It is **not ready to advance directly into feature expansion**. The repository has several integrity issues that should be fixed first, especially authentication trust, checkout authority, order/key fulfillment, validation, and deterministic seed quality.

## Status by roadmap

| Area | Status | Finding |
|---|---|---|
| P00 Repository audit | DONE | Repository structure and core data flows reviewed. |
| P01 Foundation integrity | PARTIALLY DONE / BLOCKED | Demo auth is client-cookie-role based; role mutation is weakly validated; review/comment validation is weak. |
| P02 Commerce integrity | BROKEN / BLOCKED | Checkout trusts client items/total; fulfillment is sequential and not transactional; digital-key quantity is not fulfilled correctly. |
| P03 Media foundation | MISSING | No clear centralized media/asset foundation; game/product data relies heavily on remote image URLs. |
| P04 Game catalog expansion | PARTIALLY DONE | Only 4 games are seeded; target catalog is 30 curated games. |
| P05 Game detail experience | PARTIALLY DONE | Existing detail flow exists, but media/trailer/gallery quality needs expansion. |
| P06 Discovery/search/filter | PARTIALLY DONE | Games directory exists, but score selector is non-functional and navbar search has no behavior. |
| P07 Creator platform | MISSING / PARTIALLY DONE | Streamer/expert review roles exist, but follow/creator reach/reputation platform is not represented in the schema. |
| P08 Community platform | PARTIALLY DONE | Nested comments and votes exist; broader creator/community identity and following are missing. |
| P09 Scoring engine | PARTIALLY DONE | Role-based averages exist, but the scoring model is basic and requires clearer rules and validation. |
| P10 External/public-source integration | MISSING / OPTIONAL | No robust external-source integration foundation found in audited core files. |
| P11 Store catalog | PARTIALLY DONE | Product model/store exist, but catalog is very small and media/data quality is weak. |
| P12 Wishlist/cart UX | PARTIALLY DONE | Persistent cart exists; wishlist/fuller discovery UX needs implementation. |
| P13 Checkout/order UX | BROKEN | Server does not independently derive authoritative cart pricing/quantities from DB. |
| P14 Homepage/navigation | PARTIALLY DONE | Functional shell exists but contains development milestone copy and non-functional search. |
| P15 Profiles | PARTIALLY DONE | Profile/order functionality exists; creator identity/following is incomplete. |
| P16 Admin/demo controls | PARTIALLY DONE | Admin exists, but authorization depends on mock cookie and role input is unvalidated. |
| P17 Visual polish | NOT STARTED | Should follow functional integrity work. |
| P18 Full QA/release | NOT STARTED | Runtime QA still required. |

## Important findings

### 1. Authentication / authorization — HIGH PRIORITY
`src/lib/auth.ts` treats the `nexus_demo_role` cookie as the source of truth for the current role and defaults to USER. This is acceptable only as a controlled prototype demo mechanism; it must not be treated as production authentication.

Admin authorization in `src/actions/admin.ts` depends on that same role value and accepts an arbitrary string for the new role.

**Required direction:** keep demo mode if desired, but make role/session handling explicit, validated, and server-controlled enough for the prototype.

### 2. Checkout authority — HIGH PRIORITY
`src/app/api/checkout/route.ts` reads client-supplied `items` and `total` but does not calculate an authoritative total.

`src/actions/order.ts` also records `item.price` from client input.

A user can therefore manipulate price/quantity data before fulfillment.

**Required direction:** server should accept product/game IDs and quantities, load current DB prices/stock, validate cart lines, calculate the total, then create the order.

### 3. Digital key quantity — HIGH PRIORITY
For a digital key line, fulfillment pops one key but records the requested quantity. Quantity > 1 is therefore inconsistent with actual delivered inventory.

**Required direction:** either fulfill one key per requested quantity or enforce quantity = 1 for digital keys.

### 4. Order atomicity — HIGH PRIORITY
Inventory/key updates occur before the order is created and are described as “Transaction-like sequential processing.” They are not a Prisma transaction.

A later failure can leave inventory changed without a completed order.

**Required direction:** use a database transaction for inventory reservation/updates and order creation.

### 5. Review/comment validation — MEDIUM PRIORITY
Review submission validates only score range. It does not sufficiently validate game existence, text lengths, URL format, role eligibility, or payload shape.

Comment creation similarly lacks robust content validation and relationship validation.

**Required direction:** use Zod/server-side validation and verify referenced records.

### 6. Seed quality / reproducibility — MEDIUM PRIORITY
The seed deletes and recreates all data, which is useful for a demo reset, but review scores and vote counts use `Math.random()`. This makes seeded output non-deterministic.

The current seed contains only 4 games and 3 gear products, while the Nexus target is a much richer curated catalog.

It also contains obvious placeholder/demo content such as a Rickroll-style dummy YouTube URL and Unsplash stand-ins.

**Required direction:** replace with deterministic curated demo data and explicit asset policy.

### 7. Discovery UI
The games page displays a sort selector for Expert/Streamer/User, but the server query always orders by `expertScore`. The selector has no state/query handling.

Navbar search is an input with no search behavior.

### 8. Homepage demo residue
The homepage contains development-stage labels such as “Part 3 Active: Metacritic Engine Online” and “(Part 4)/(Part 5)”. These should be removed during product polish.

## Existing strengths

- Clear Next.js App Router structure.
- Prisma schema already models games, reviews, comments/replies, votes, products, orders, and order items.
- Nested comment self-relation supports Reddit-style threads.
- Role-at-creation is stored on reviews, which is useful for stable score attribution.
- Cart/store/order flow is already present and can be hardened rather than rebuilt.
- Existing game/review/store pages provide a usable visual foundation.

## Recommended execution

1. **P01 Foundation integrity**
2. **P02 Commerce integrity**
3. **P03 Media foundation**
4. **P04 Game catalog expansion**
5. Then parallelize P05/P06/P07/P11 where dependencies allow.
6. Continue into P08/P09/P12/P13/P14/P15/P16.
7. Finish P17 visual polish.
8. Finish P18 runtime QA/release.

## Runtime verification still required

The GitHub repository connector cannot truthfully claim that local commands were executed. Before marking P00 as fully verified, run locally:

- `npm install` / confirm lockfile state
- `npx prisma validate`
- `npx tsc --noEmit`
- `npm run build`
- `npm run db:seed` against a disposable local database
- start the app and manually verify major routes
- inspect browser console/network errors

## P00 conclusion

**P00 is complete as a repository/static audit. The next implementation task should be P01, not P04/P07/P17.**

No production deployment or real payment integration should be introduced. The project remains a university-scale prototype with simulated checkout.
