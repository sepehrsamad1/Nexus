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


## Machine-readable implementation checklist

```yaml
audit:
  id: P00
  status: complete_static
  branch: audit/foundation-fixes
  baseline_commit: 2bbd7f21253925b1ab8686194a870944bdfaf2a
  runtime_verified: false

checks:
  repository_structure: done
  package_scripts: done
  prisma_schema: done
  seed_data: done
  authentication_session: done
  authorization_admin: done
  commerce_checkout: done
  order_fulfillment: done
  reviews: done
  community_comments_votes: done
  game_discovery_filtering: done
  navigation_search: done
  store_catalog: done
  profiles_orders: done
  homepage_demo_residue: done
  git_history: done

findings:
  - id: P01-AUTH-001
    priority: critical
    area: authentication
    status: open
    issue: demo_role_cookie_is_authoritative
    dependency: none

  - id: P01-AUTH-002
    priority: high
    area: authorization
    status: open
    issue: admin_role_mutation_accepts_arbitrary_string
    dependency: P01-AUTH-001

  - id: P01-VAL-001
    priority: high
    area: validation
    status: open
    issue: review_and_comment_payload_validation_is_weak
    dependency: P01-AUTH-001

  - id: P02-COMMERCE-001
    priority: critical
    area: checkout
    status: open
    issue: client_controls_prices_quantities_and_total
    dependency: P01

  - id: P02-COMMERCE-002
    priority: critical
    area: fulfillment
    status: open
    issue: digital_key_quantity_can_exceed_delivered_keys
    dependency: P02-COMMERCE-001

  - id: P02-COMMERCE-003
    priority: critical
    area: fulfillment
    status: open
    issue: inventory_and_order_creation_are_not_transactional
    dependency: P02-COMMERCE-001

  - id: P03-MEDIA-001
    priority: high
    area: media
    status: open
    issue: no_central_media_asset_policy
    dependency: P01

  - id: P04-CATALOG-001
    priority: high
    area: catalog
    status: open
    issue: only_four_seeded_games_vs_target_of_thirty
    dependency: P03

  - id: P04-DATA-001
    priority: high
    area: seed
    status: open
    issue: random_scores_and_votes_make_seed_non_deterministic
    dependency: P01

  - id: P05-MEDIA-002
    priority: medium
    area: game_detail
    status: open
    issue: game_detail_needs_richer_media_gallery_and_trailer_support
    dependency: P04-CATALOG-001

  - id: P06-DISCOVERY-001
    priority: high
    area: discovery
    status: open
    issue: expert_streamer_user_sort_selector_is_nonfunctional
    dependency: P04-CATALOG-001

  - id: P06-DISCOVERY-002
    priority: high
    area: navigation
    status: open
    issue: navbar_search_input_has_no_search_behavior
    dependency: P06-DISCOVERY-001

  - id: P07-CREATOR-001
    priority: high
    area: creators
    status: open
    issue: no_follow_graph_or_creator_reputation_model
    dependency: P04-CATALOG-001

  - id: P09-SCORE-001
    priority: medium
    area: scoring
    status: open
    issue: scoring_engine_is_basic_and_rules_need_explicit_definition
    dependency: P07-CREATOR-001

  - id: P11-STORE-001
    priority: medium
    area: store
    status: open
    issue: catalog_is_small_and_product_media_contains_placeholders
    dependency: P03

  - id: P12-CART-001
    priority: medium
    area: cart
    status: open
    issue: wishlist_is_missing_and_cart_discovery_ux_is_incomplete
    dependency: P11-STORE-001

  - id: P14-HOME-001
    priority: medium
    area: homepage
    status: open
    issue: development_milestone_copy_is_visible_to_end_users
    dependency: P05,P07,P08,P11

  - id: P18-QA-001
    priority: blocking_for_release
    area: qa
    status: open
    issue: runtime_build_seed_and_browser_checks_have_not_been_verified_by_connector
    dependency: all_previous_tasks

dependency_map:
  P00: []
  P01: [P00]
  P02: [P01]
  P03: [P01]
  P04: [P03]
  P05: [P04]
  P06: [P04]
  P07: [P04]
  P08: [P07]
  P09: [P04, P07, P08]
  P10: [P03, P08]
  P11: [P02, P03]
  P12: [P11]
  P13: [P02, P12]
  P14: [P05, P07, P08, P11]
  P15: [P07, P12]
  P16: [P01, P07, P08, P11]
  P17: [P05, P06, P07, P08, P09, P10, P11, P12, P13, P14, P15, P16]
  P18: [P01, P02, P03, P04, P05, P06, P07, P08, P09, P10, P11, P12, P13, P14, P15, P16, P17]

recommended_next:
  - P01
  - P02
  - P03
  - P04
  - parallel_after_P04: [P05, P06, P07, P11]
```


## P01 completion record

```yaml
task: P01
status: implementation_complete
branch: audit/foundation-fixes
completed:
  - demo_auth_boundary_explicit
  - demo_role_values_schema_validated
  - demo_cookie_hardened
  - admin_role_input_validated
  - review_input_validated
  - review_game_existence_checked
  - comment_input_validated
  - comment_target_and_parent_integrity_checked
  - vote_input_validated
  - safe_server_errors_added
  - targeted_validation_tests_added
  - typecheck_and_test_scripts_added
verification:
  typecheck: not_run_connector_has_no_runtime_workspace
  lint: not_run_connector_has_no_runtime_workspace
  tests: not_run_connector_has_no_runtime_workspace
remaining:
  - run_typecheck_lint_tests_in_local_or_ci_environment
  - P02
```
