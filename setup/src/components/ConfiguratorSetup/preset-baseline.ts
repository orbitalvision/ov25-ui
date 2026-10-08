// Frozen 29 September 2026 settings. Do not inherit future defaults.
import type { PreviewLayoutType, TypeSettings } from "./types";

export const PRESET_BASELINE: Record<PreviewLayoutType, TypeSettings> = {
  "standard": {
    "selectors": {
      "gallery": {
        "enabled": true,
        "selector": ".configurator-container",
        "replace": true
      },
      "price": {
        "enabled": true,
        "selector": "#price",
        "replace": true
      },
      "name": {
        "enabled": true,
        "selector": "#name",
        "replace": true
      },
      "variants": {
        "enabled": true,
        "selector": "#ov25-controls",
        "replace": false
      },
      "swatches": {
        "enabled": true,
        "selector": "#ov25-swatches",
        "replace": false
      },
      "configureButton": {
        "enabled": false,
        "selector": "[data-ov25-configure-button]",
        "replace": false
      },
      "initialiseMenu": {
        "enabled": false,
        "selector": "#ov25-initialise-menu",
        "replace": true
      }
    },
    "carousel": {
      "desktop": "stacked",
      "mobile": "carousel",
      "maxImagesDesktop": 4,
      "maxImagesMobile": 6,
      "autoCutouts": false
    },
    "configurator": {
      "displayModeDesktop": "sheet",
      "displayModeMobile": "drawer",
      "triggerStyleDesktop": "single-button",
      "triggerStyleMobile": "single-button",
      "variantDisplayDesktop": "tree",
      "variantDisplayMobile": "list",
      "selectionDetailsDisplayModeDesktop": "tooltip",
      "selectionDetailsDisplayModeMobile": "fullscreen",
      "snap2VariantPositionDesktop": "right",
      "snap2VariantPositionMobile": "right",
      "snap2ModulePositionDesktop": "right",
      "snap2ModulePositionMobile": "right",
      "useSimpleVariantsSelector": true,
      "variantHideOptionsCsv": ""
    },
    "flags": {
      "hidePricing": false,
      "disableAddToCart": false,
      "disableBuyNow": false,
      "hideAr": false,
      "hideGestureHint": false,
      "deferThreeD": false,
      "showOptional": false,
      "forceMobile": false,
      "autoOpen": false
    },
    "branding": {
      "logoURL": "",
      "mobileLogoURL": "",
      "cssString": "",
      "hideLogo": false
    },
    "style": {},
    "elementStyles": {},
    "stringReplacements": {}
  },
  "snap2": {
    "selectors": {
      "gallery": {
        "enabled": false,
        "selector": ".configurator-container",
        "replace": true
      },
      "price": {
        "enabled": true,
        "selector": "#price",
        "replace": true
      },
      "name": {
        "enabled": true,
        "selector": "#name",
        "replace": true
      },
      "variants": {
        "enabled": true,
        "selector": "#ov25-controls",
        "replace": false
      },
      "swatches": {
        "enabled": true,
        "selector": "#ov25-swatches",
        "replace": false
      },
      "configureButton": {
        "enabled": true,
        "selector": "[data-ov25-configure-button]",
        "replace": false
      },
      "initialiseMenu": {
        "enabled": false,
        "selector": "#ov25-initialise-menu",
        "replace": true
      }
    },
    "carousel": {
      "desktop": "stacked",
      "mobile": "carousel",
      "maxImagesDesktop": 4,
      "maxImagesMobile": 6,
      "autoCutouts": false
    },
    "configurator": {
      "displayModeDesktop": "modal",
      "displayModeMobile": "modal",
      "triggerStyleDesktop": "single-button",
      "triggerStyleMobile": "single-button",
      "variantDisplayDesktop": "tree",
      "variantDisplayMobile": "list",
      "selectionDetailsDisplayModeDesktop": "tooltip",
      "selectionDetailsDisplayModeMobile": "fullscreen",
      "snap2VariantPositionDesktop": "right",
      "snap2VariantPositionMobile": "right",
      "snap2ModulePositionDesktop": "right",
      "snap2ModulePositionMobile": "right",
      "useSimpleVariantsSelector": true,
      "variantHideOptionsCsv": ""
    },
    "flags": {
      "hidePricing": false,
      "disableAddToCart": false,
      "disableBuyNow": false,
      "hideAr": false,
      "hideGestureHint": false,
      "deferThreeD": false,
      "showOptional": false,
      "forceMobile": false,
      "autoOpen": false
    },
    "branding": {
      "logoURL": "",
      "mobileLogoURL": "",
      "cssString": "",
      "hideLogo": false
    },
    "style": {},
    "elementStyles": {},
    "stringReplacements": {}
  },
  "bedConfigurator": {
    "selectors": {
      "gallery": {
        "enabled": true,
        "selector": ".configurator-container",
        "replace": true
      },
      "price": {
        "enabled": true,
        "selector": "#price",
        "replace": true
      },
      "name": {
        "enabled": true,
        "selector": "#name",
        "replace": true
      },
      "variants": {
        "enabled": true,
        "selector": "#ov25-controls",
        "replace": false
      },
      "swatches": {
        "enabled": true,
        "selector": "#ov25-swatches",
        "replace": false
      },
      "configureButton": {
        "enabled": true,
        "selector": "#ov25-fullscreen-button",
        "replace": false
      },
      "initialiseMenu": {
        "enabled": false,
        "selector": "#ov25-initialise-menu",
        "replace": true
      }
    },
    "carousel": {
      "desktop": "stacked",
      "mobile": "carousel",
      "maxImagesDesktop": 4,
      "maxImagesMobile": 6,
      "autoCutouts": false
    },
    "configurator": {
      "displayModeDesktop": "sheet",
      "displayModeMobile": "drawer",
      "triggerStyleDesktop": "single-button",
      "triggerStyleMobile": "single-button",
      "variantDisplayDesktop": "tree",
      "variantDisplayMobile": "list",
      "selectionDetailsDisplayModeDesktop": "tooltip",
      "selectionDetailsDisplayModeMobile": "fullscreen",
      "snap2VariantPositionDesktop": "right",
      "snap2VariantPositionMobile": "right",
      "snap2ModulePositionDesktop": "right",
      "snap2ModulePositionMobile": "right",
      "useSimpleVariantsSelector": true,
      "variantHideOptionsCsv": ""
    },
    "flags": {
      "hidePricing": false,
      "disableAddToCart": false,
      "disableBuyNow": false,
      "hideAr": false,
      "hideGestureHint": false,
      "deferThreeD": false,
      "showOptional": false,
      "forceMobile": false,
      "autoOpen": false
    },
    "branding": {
      "logoURL": "",
      "mobileLogoURL": "",
      "cssString": "ov25-selection-thumbnail: bg-white;",
      "hideLogo": false
    },
    "style": {},
    "elementStyles": {},
    "stringReplacements": {},
    "bed": {
      "allowNoneHeadboard": true,
      "allowNoneBase": true,
      "allowNoneMattress": true,
      "filterMatchingSizeHeadboard": false,
      "filterMatchingSizeBase": false,
      "filterMatchingSizeMattress": false
    }
  }
};
