# Draft Client Email: OV25 UI 0.8.8

Status: **Approved internal draft — do not send until package and client staging are approved**

**To:** [Client / recipient names]

**Cc:** [Account / technical contacts]

**Subject:** Preview planned: OV25 configurator 0.8.8 storefront update

Hi [Client name],

We are preparing OV25 configurator version `0.8.8`, focused on storefront pricing clarity and
product-selection presentation.

While a configurator is loading, its product page will now show a loading placeholder instead of a
temporary `£0.00` price. Buy now and Add to basket remain unavailable until the current product's
real price and SKU are ready, preventing an incomplete order from being started during loading.

Range product cards can now use product cutout images, with sensible fallbacks when a cutout is not
available. They also support retailer-configured names that span multiple lines. Selection Details
side panels have been adjusted so their image, title, and description stay together at the top,
including on short landscape screens.

No product-data migration is required. Existing price, SKU, cart, and checkout payload formats are
unchanged.

## Rollout

After the coordinated packages are published, we will rebuild the Shopify extension with the exact
`0.8.8` runtime and validate it on a staging or duplicate theme. Checks will cover initial loading,
product switching, pricing and checkout readiness, standard/range/Snap2/bed products, Size-card
images and names, and responsive Selection Details layouts.

The tested Shopify app version will be promoted only after staging approval. Rollback will use the
previous approved app version containing the `0.8.7` runtime.

Regards,

[Sender name]

[Role / OV25 team]

[Support email / phone]
