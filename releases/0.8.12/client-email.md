# Draft Client Email — v0.8.12

Status: Content approved on 2026-09-24; not sent
To: [Recipients]
Subject: OV25 configurator update: optional group upgrade prices

Hi [Client name],

Our upcoming configurator update adds optional upgrade prices beside standard-product option groups. Shoppers can see how much more a fabric group costs than the cheapest available group, with “From” shown where prices vary within a group.

The labels stay hidden unless you choose to enable them. Their wording and styling can be tailored to your store. Existing basket and checkout behaviour is unchanged.

Wizard and guided-overview layouts also gain sticky group headings. This update fixes missing group prices in list and tab headings, gaps above sticky headers, and excess space beneath mobile variants. We will check custom theme styling against the updated grouped layouts before rollout.

This feature requires the updated configurator UI and compatible OV25 pricing data. It applies to standard products, not bed configurators or Snap2 products.

For Shopify, we will first test the update on an unpublished theme. Where your installed integration provides separate staging/live runtime-version controls, select `0.8.12` for staging after it becomes available, validate the product and cart flows, then select that version for live only after approval. We have not verified those controls in the reviewed installation; if unavailable, the integration owner must prepare a version-pinned preview bundle/theme and promote it through the normal deployment process.

To roll back, disable the group-price styling and restore the previously validated runtime/theme version. Where a runtime selector is available, reselect the previous version; otherwise restore the previous deployed bundle/theme. WooCommerce rollout will be reviewed separately because its current integration is on an older package version.

Please confirm [preferred review date] and [whether you would like group upgrade prices enabled].

Thanks,
[Sender]
