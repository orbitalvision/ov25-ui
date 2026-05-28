# Client Email Draft: OV25 0.7.2

Status: Draft, not approved
Do not send until release scope, testing, package availability, and recipient list are approved.

## Subject

OV25 0.7.2 is available for staging review

## Email

Hi <client name>,

We have prepared OV25 0.7.2 for staging review.

This release includes improvements to configurator text customization, mobile/Snap2 controls, product image carousel interaction, WooCommerce bed configurator support, and the foundations for a new dining configurator experience.

Key changes:

- Configurator text can now be customized through OV25 text override rules.
- Mobile and Snap2 UI behavior has been improved.
- Product carousel clicks are less likely to be mistaken for drags.
- Variant names now follow configured OV25 text colors instead of using a hardcoded black color.
- Product name and price areas have additional stable styling hooks.
- WooCommerce product pages can now be linked to bed configurators where enabled.
- A new dining configurator flow is available for supported products.

Recommended rollout:

- Test the new version on your staging theme/site first.
- Keep the live theme/site pinned to the current OV25 version until staging has been approved.
- After approval, update live to the same tested version.
- Use `latest` only if you are comfortable receiving automatic patch updates.

Compatibility notes:

- If your theme has custom CSS targeting OV25 configurator elements, please check product name, price, variant cards, carousel images, swatches, and Snap2 screens during staging review.
- If your site uses Shopify or WooCommerce custom styling, please test the storefront before updating live.
- If your WooCommerce site uses bed configurator products, please test product setup, storefront launch, option selection, add-to-basket, and checkout/order details.
- If your site uses dining configurator products, please test both layout and add-to-basket flow before going live.

Rollback:

If you see an issue, switch back to the previous known-good OV25 version and contact us with the product URL, browser/device, and a short description of what changed.

Thanks,

OV25
