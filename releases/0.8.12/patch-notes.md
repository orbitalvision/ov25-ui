# Release Draft: ov25-ui@0.8.12

Status: Approved
Approved by release owner on 2026-09-24 for source `ba02776042e7`.
Review refreshed after the committed layout fixes and passing full release test run.
Bump: patch (requested release version)
Base: `ov25-ui@0.8.11` (`51ec3914ee49`)
Head: `ba02776042e7`

## Customer-Facing Changes

### Features

- Stores can optionally show the cost of upgrading between standard-product option groups. For example, a Luxury fabric group can show “Luxury - +£50.00” compared with the cheapest available group. Groups with varying prices show “From +£…”.

### Improvements

- Group upgrade labels support store-specific wording and styling across desktop and mobile option layouts.

### Bug Fixes

- Wizard options now display sticky group headings on desktop and mobile, keeping group names visible as shoppers scroll. Enabled upgrade prices sit beside their group names; headings remain even when prices are hidden.
- Fixed enabled group upgrade prices missing from list and tab group headings, including the mobile drawer. Filtered single-group views also retain their named upgrade label.
- Fixed gaps above sticky headings where scrolling variant cards could show through, including mobile layouts.
- Removed excess blank space below variants in sheets and modals while preserving clearance for the mobile drawer checkout button.

## Visible Behavior Changes

- Group prices remain hidden by default. Stores must explicitly enable them through custom styling.
- The cheapest groups show no upgrade label. Missing or unknown upgrade prices also show no label.
- The feature supports standard products; Snap2 and bed pricing are excluded. Hiding pricing also suppresses these labels.

## Known Issues And Manual Testing Notes

- Group pricing requires compatible OV25 configurator data. Production availability and group-price accuracy still need manual verification.
- Verify enabled labels in representative desktop/mobile layouts and storefront themes before enabling them for customers.
- The complete automated release test run passed after the final fixes, including React 18 and Playwright, on 24 September 2026. Production rollout and store-specific visual checks remain separate.

## Developer / Integrator Notes

- Enable through `branding.cssString` with `.ov25-group-price { --ov25-group-price-display: inline; }`.
- Customise wording using `groupPriceTotal`, `groupPriceFromTotal`, `groupPriceInline`, and `groupPriceNamed`. Amounts are upgrades above the cheapest available group, not full product totals.
- Shopify and WooCommerce already forward custom styling and string replacements. Adoption requires the updated UI runtime and compatible producer; no cart/checkout payload changes are introduced here.
- Wizard and guided-overview now show grouped cards and sticky headings by default. Check custom styles that depend on the previous flat grid or direct-child structure before rollout.
- WooCommerce's committed dependencies remain at `0.8.1`, so its wider version upgrade requires separate review.
- See [developer summary](developer-summary.md) for payload details, verification, documentation gaps, and rollout checks.
