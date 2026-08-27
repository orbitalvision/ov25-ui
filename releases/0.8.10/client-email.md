# Draft Client Email: OV25 UI 0.8.10

Status: **Approved internal draft — do not send until package and client staging are approved**

**To:** [Client / recipient names]

**Cc:** [Account / technical contacts]

**Subject:** Preview planned: OV25 configurator 0.8.10 selection update

Hi [Client name],

We are preparing OV25 configurator version `0.8.10`, introducing an optional Guided Overview for
product customization and more flexible variant-card layouts.

Guided Overview opens on a summary of the current selections. Shoppers can choose an option to edit,
move between options using clearly named controls, and return to the summary at any time. Pricing
remains visible on the checkout action while they configure. Existing configurators keep their
current selection layout unless Guided Overview is explicitly enabled.

Variant grids can now be configured from one to six cards per row, with card images growing or
shrinking to use the available space. Four cards remains the default and retains the existing
appearance. We have also improved hidden-price mobile layouts so variant content uses space that was
previously reserved for an unavailable checkout action.

No product-data or checkout-payload migration is required. The release adds optional configuration
and styling controls; existing display modes and callbacks remain supported.

## Rollout

After the coordinated packages are published, we will rebuild the relevant integration with exact
`0.8.10` dependencies and validate it on staging. Checks will cover Guided Overview navigation,
pricing and cart actions, one-to-six-card grids, hidden-price mobile drawers, Standard and Snap2
configurators, and retailer-specific text/CSS customization.

The tested integration version will be promoted only after staging approval. Rollback will use the
previous approved version containing the `0.8.9` runtime.

Regards,

[Sender name]

[Role / OV25 team]

[Support email / phone]
