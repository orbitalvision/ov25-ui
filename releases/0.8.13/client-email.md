# Client Email: 0.8.13

Status: Draft only — not sent
To: [Client name / recipients]
Subject: OV25 configurator 0.8.13 — gallery and mobile scrolling improvements

Hi [Client name],

We have prepared an OV25 configurator update with two improvements:

- Galleries using automatic cutouts hide the separate 3D/360 thumbnail when cutouts are displayed, keeping the thumbnail list focused on the available images.
- Sticky galleries position correctly on affected storefront layouts, improving mobile scrolling behavior.

Existing configuration and cart data remain compatible. The automatic checks have passed, and the affected storefront mobile sticky behavior has been manually verified. If your theme customizes the 360 thumbnail or styles thumbnails by their position, we will check those rules during rollout.

Planned rollout: [Date and time]. Your store's rollout status: [Pending / staging verified / live — confirm before sending].

For Shopify, first test the app version containing 0.8.13 on the agreed staging store or duplicate/unpublished theme. Record the exact tested Shopify app version as [staging app version]. Promote that same tested version for live use as [live app version] after the agreed checks. The npm package version and Shopify app version are separate identifiers; do not assume creating an app version updates only a duplicate theme.

If rollback is needed, restore the recorded previous Shopify app version [previous app version], or reinstall the previous verified WooCommerce plugin package [previous plugin version/package], then confirm product configuration and cart behavior. For a direct integration, restore the previous dependency and built application artifact.

We will confirm when your store's update is complete.

Thanks,
[Sender name]
