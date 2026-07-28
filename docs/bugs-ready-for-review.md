# Bugs ready for review

This file is the active manual review queue for the upcoming release. When a bug fix is ready, Codex should add a review packet here with the fixture as a clickable Markdown link, visual steps, changed files, implementation diff file, diff summary, verification run, residual risk, and approval instruction. Post-release exclusions are retained separately in [PARKED_BUGS.md](PARKED_BUGS.md).

For UI bugs, include before/after screenshots when practical. Generate them with Playwright against the relevant fixture, store them under `review-screenshots/`, and link the PNGs in that bug's review packet. If a UI bug is interaction-only or needs data/setup that cannot be reproduced locally, add a short note explaining why screenshots were not generated.

After manual approval, Codex should remove the item from this file and mark the source item fixed in [ov25_bugs_and_todo.md](ov25_bugs_and_todo.md), but should not stage either tracker file. Only implementation and test files for the approved bug should be staged.

Do not rebuild `ov25-ui` for manual review unless the user explicitly asks; the user handles local rebuilds.

Parked bugs must not be approved or staged from this queue. Move the entire packet back here from [PARKED_BUGS.md](PARKED_BUGS.md) and refresh its evidence before review resumes.

Before/after comparison server: the retained clean baseline worktree is detached at historical commit `bb56186`, not current `HEAD`. It is available at `/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/ov25-ui-clean-baseline-3009` and is intended to run on [localhost:3009](http://127.0.0.1:3009/). Use port `3009` only for historical pre-fix behavior and port `3008` for current local main. A current-HEAD baseline requires a newly refreshed worktree. Not every fixture added after `bb56186` exists on `3009`.

Coding work should be assigned to worker subagents by default. If a reviewed bug needs follow-up changes, send it back to the same worker when that agent is still available; otherwise assign a new worker with the same bug context. The main thread coordinates, reviews, verifies, updates this queue, and stages only after approval.

Queue audit 2026-07-28: no bugs are awaiting manual review. Bug 39 was manually reviewed, approved, and committed as `fad225f`; its documentation follow-up is `a9eb0f7`. Uncommitted OV25, Shopify, and WooCommerce integration work remains a separate release follow-up in [IMPORTANT_BUGS.md](IMPORTANT_BUGS.md).

## Review priority

None.

## Ready

_No bugs are currently awaiting review._
