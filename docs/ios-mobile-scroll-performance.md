# iPhone scrolling investigation — 5 November 2026

Status: accepted by the user after a physical iPhone touch test; local code and
Shopify bundle prepared, not deployed. Blank options no longer appeared. A
smaller rotation pause remains; the user considers this acceptable for now.

## Physical-device acceptance

After applying the candidate temporarily to the open iPhone page, the user
performed the thumbnail-then-touch-scroll and fast-options-scroll tests without
refreshing. Their result: "only the rotation freeze happens, and its much less
noticeable. this solution is probably good enough".

The touch-triggered parent recording completed with 24 touchstart/touchend
events, 1,261 animation frames and a largest measured gap of 331 ms. This
confirms the test captured real interaction; it does not mean rendering is
stall-free. Do not describe both symptoms as completely eliminated.

The temporary candidate remained active in the phone tab at acceptance and is
removed by refreshing. The prepared plugin must be deployed for the change to
persist. No Shopify settings or theme files were saved during this test.

The gallery/iframe anchoring correction is already deployed separately. This
investigation concerns delayed variant painting and a paused thumbnail-triggered
3D rotation during scrolling, not the previously fixed gallery-position lag.

## Evidence

Tested the connected physical iPhone through Safari Web Inspector on the demo
store's Burnham product, using repeatable native smooth `scrollTo` sequences.
These reproduce long rendering stalls but are not equivalent to holding a finger
on the screen. No Shopify settings or theme files were saved.

The exported Safari recording is locally available as
`~/Downloads/ov25-demo-2.myshopify.com-recording.json`.
It contains approximately 4.7 seconds of style recalculation and 6.9 seconds of
layout (these event totals can overlap), but only 15 ms of recorded paint work.
Long JavaScript samples stop at geometry reads that force pending layout.

Clean sequential measurements, after reloading to remove old diagnostic hooks:

| Experiment | Result |
| --- | --- |
| Original smooth scroll through 0, 700, 2500, 4500, 0 | Frame gaps up to 635 ms; 1,047 ms total measured rectangle-read time |
| Scope changing gallery-bottom property to the nine headings only | Still stalled: frame gaps up to 849 ms |
| Hide controls, skip their rendering with content-visibility, or hide the real viewer | Long stalls remained |
| Remove merchant custom CSS only | Long stalls remained |
| Remove gallery container-query sizing | Long stalls remained |
| Directly change a heading's sticky top, original layout | Approximately 191–237 ms per update |
| Replace four enclosing flex columns with block flow | Approximately 36–40 ms per update |
| Auto height or flex:none while retaining flex columns | Approximately 173–203 ms; insufficient |
| Block flow during the full scroll sequence | Largest recorded frame gap 176 ms |
| Block flow plus scoped, stable native heading inset | Largest recorded frame gap 130 ms; shorter stalls remain |

Do not reuse the earlier claim that scoping alone reduced layout cost to zero:
an overlapping diagnostic hook invalidated that earlier comparison. The table
above uses probes that restore the native methods before the next run.

## Local candidate

- Mark Standard mobile page-scrolling inline lists with
  `data-ov25-mobile-page-flow`. Their four outer layout columns use normal block
  flow. Desktop, Snap2, modal, drawer and internally scrolling inline layouts
  keep their existing path.
- Publish the changing mobile heading offset only on the headings that consume
  it, with restoration when headings are replaced or the layout changes.
- When the gallery has a verified native sticky wrapper, calculate heading top
  from gallery height plus the wrapper's sticky inset. Its moving viewport bottom
  should not cause a new heading layout on every scroll frame. Gallery resizing
  and fallback-mode transitions still update the inset.

Tests cover block-flow activation/desktop restoration, ordinary mobile inline
scrolling, heading restoration, stable offsets during scroll, gallery resize and
leaving the native-wrapper path. Physical-device frame timing and visual checks
remain separate from passing headless regression tests.

## Renderer comparison and validation

With the gallery kept visible throughout a shorter 0, 200, 500, 1000, 0 scroll
sequence, a thumbnail click was followed by a 12-second iframe RAF recording:

- Candidate: 345 frames; gaps over 80 ms were 99, 134 and 91 ms.
- Original layout restored: 315 frames; gaps were 193, 267, 206, 460, 210 and
  110 ms. The corresponding parent trace also stalled.

The earlier comparison above inadvertently selected a material tile for the
baseline. It is not a valid comparison of thumbnail-triggered 3D rotation.
QuickTime's live iPhone screen exposed this; use the explicit
`data-ov25-gallery-tile="cutout"` controls for rotation tests.

Corrected sequential comparison, with the real model visible and opposite
cutout angles selected immediately before the same scroll sequence:

- Original: parent gaps 251, 239, 210 ms; iframe gaps 250, 240, 209 ms;
  659 ms total measured rectangle-read time.
- Candidate: parent gaps 82, 100, 90 ms; iframe gaps 99, 91, 102 ms;
  214 ms total measured rectangle-read time.

The matching parent/iframe pauses support a shared layout-related scheduling
bottleneck. They do not prove that all physical touch-drag symptoms have
disappeared. Shorter stalls remain, and remote smooth scrolling does not emulate
holding a finger down.

Suppressing only the controls host's changing header-offset variable in a
temporary experiment reduced measured rectangle-read time to 96 ms; parent
gap 93 ms and iframe gaps 94/99 ms remained. This is not implemented: its
effects on consumers of the shared sticky variables need review first.

A subsequent full 0, 700, 2500, 4500, 0 candidate scroll measured a 120 ms
maximum parent gap and 236 ms rectangle-read time. The live QuickTime phone
view showed the model and fabric options, but saving the recording failed
with "Cannot Record". There is no saved video proving absence of blank frames.
Temporary page overrides were removed afterwards and both instrumented native
methods were verified restored. No store changes were saved.

Final local production UI build succeeded; 42 controller unit tests and all 39
headless Chromium inline-sticky/Savor tests passed after the final changes.
The initial accepted candidate was built into the Shopify plugin as:
`shopify-c988c9719a376b2b3554323e` (`uiSource: local`, production).
Build log: `/private/tmp/ov25-mobile-flow-plugin-build.log`.
It was not deployed by the agent. Use `shopify app deploy` from `shopify-plugin` to
deploy the prepared bundle; the package deploy script would rebuild against
the installed published UI instead.

## Deferred follow-up

### Header-offset scoping follow-up

Implemented after acceptance of the first candidate: mobile page-scrolling
controls no longer receive the changing `--ov25-sticky-header-offset` on their
outer host. The controller publishes it, together with its dependent
`--ov25-sticky-top` expression, directly on the option/group headings. The
gallery and carousel retain their live offsets. Shared gallery/controls hosts
and controls without a mobile page-scrolling list retain the existing path.
Original inline values and priorities are restored when headings are removed,
desktop mode resumes, hosts change, or the controller is destroyed.

This change still needs a new physical-device performance comparison; passing
layout tests does not establish an additional reduction in the rotation pause.

Validation: 44 controller unit tests and 40 headless Chromium inline-sticky/Savor
tests pass. The new browser regression hides and restores a fixed header,
checking that the gallery and headings track its offset while the controls host
does not receive it. Tests also cover desktop/mobile transitions, replacement
hosts/headings, original inline priorities and shared hosts.

Production UI and Shopify bundle rebuilt successfully. The latest prepared
bundle is `shopify-d2a5e9934471ccb2a83dd6f2` (`uiSource: local`), superseding the
initial candidate above. Logs: `/private/tmp/ov25-header-scope-{unit,e2e,build,plugin-build}.log`.
No commit or deployment was performed.

### Other downloaded client themes

The nested options layout belongs to ov25-ui, not Savor. Theme behaviour,
options count, custom CSS and device performance can change its visible impact.
Local evidence checked on 5 November (not current live-store verification):

- Arighi Bianchi: `site v2/saved-arighi.json` explicitly selects Standard mobile
  `inline-sticky` and `list` controls. This is the affected code path.
- AD Furnishings: the 29 October delivered custom CSS targets the mobile
  inline-sticky gallery. This supports relevance, but is not a complete saved
  configuration or proof of the same lag.
- Chair Studio: `custom_liquid_1.liquid` explicitly locates an active mobile
  inline-sticky gallery; `cssString.css` styles its slot. Same qualification as AD.
- Orla Kiely: `cssString.css` supplies additional custom sticky positions via
  `--ov25-option-header-sticky-top`; its behaviour must be checked separately.
- Other theme exports do not establish the current shop-metafield configuration
  or deployed ov25-ui version. No claim that they exhibit, or are immune to, this
  performance problem.

The remaining rotation pause is deferred following the user's acceptance.
If revisited, keep the gallery visible to avoid confusing ordinary offscreen
iframe throttling with the reported freeze. Physical touch tests take precedence
over synthetic smooth-scroll timing.

Direct device interaction is currently unavailable: iPhone Mirroring displays
"Unable to Connect to iPhone" after the user resolved the initial "iCloud Isn't
Syncing" warning. Two retries still failed. The app asks for a nearby iPhone
with Bluetooth/Wi-Fi and the same iCloud account. Requested that connection be
restored so the agent could drive scrolling without asking the user to repeat
gestures. The user subsequently opted to perform the acceptance gestures
manually; this is no longer blocking the accepted candidate.
