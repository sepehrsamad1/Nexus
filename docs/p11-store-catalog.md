# P11 — Curated Nexus Gear Catalog

P11 implements the exact 15-product gear list from the Nexus roadmap.

## Catalog

1. Wooting 80HE+
2. Logitech G Pro X Superlight 2
3. Razer Viper V4 Pro
4. Razer BlackShark V3 Pro
5. SteelSeries Arctis Nova Elite
6. Artisan Ninja FX Zero
7. ZOWIE XL2566K
8. LG UltraGear OLED 27GS95QE
9. Secretlab TITAN Evo
10. Elgato Wave:3
11. Elgato Facecam MK.2
12. WD_BLACK SN850X
13. AMD Radeon RX 9070 XT
14. NVIDIA GeForce RTX 5070 Ti
15. PlayStation DualSense Edge

No roadmap product was silently removed or substituted.

## Price and availability policy

Each product stores a prototype seed price, price provenance, and a price-checked timestamp. Prices described as current-market placeholders are deliberately marked as such because Nexus is a university prototype and does not have live retailer inventory.

Stock is simulated demo inventory, not a claim about live retailer stock.

## Ratings

Where a current public retailer/catalog rating and review count was available during the research pass, it is stored as a market reference. Where the retrieved sources did not provide a defensible rating/review count, Nexus stores zero and the UI explicitly says that market rating data was unavailable. Nexus does not fabricate user reviews or attribute ratings to real people.

## Images

The schema stores both image references and image-source references. The prototype uses a first-party Nexus SVG catalog-art endpoint for stable presentation, while retaining the manufacturer's product URL as the source reference. This avoids broken images and the old generic "Product Image" placeholder behavior without pretending Nexus owns manufacturer photography.

## Verification

The implementation should be checked with:

- npm.cmd test
- npm.cmd run typecheck
- npm.cmd run db:seed
- npm.cmd run build

After the database migration is applied, /store should show exactly 15 physical products and /store/[slug] should expose the full product detail journey.
