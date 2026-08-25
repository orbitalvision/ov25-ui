# Bugs ready for review

This file is the live lifecycle board for every bug and feature in the upcoming release, from
intake through user review. The complete operating procedure is the
[pre-release engineering runbook](pre-release-engineering-runbook.md). Post-release exclusions are
retained separately in [PARKED_BUGS.md](PARKED_BUGS.md).

When a fix becomes ready for the user, its packet must include the fixture as a clickable Markdown
link, visual steps, changed files, implementation diff file, diff summary, verification run,
residual risk, and approval instruction.

For UI bugs, include before/after screenshots when practical. Generate them with Playwright against
the relevant fixture, store them under `review-screenshots/`, and link the PNGs in that bug's review
packet. If a UI bug is interaction-only or needs data/setup that cannot be reproduced locally, add
a short note explaining why screenshots were not generated.

After manual approval, remove the item from this file and mark the source item fixed in
[ov25_bugs_and_todo.md](ov25_bugs_and_todo.md), but do not stage either tracker file. Only approved
implementation and test files may be staged, and only when the user requests staging.

Do not rebuild `ov25-ui` for manual review unless the user explicitly asks; the user handles local
rebuilds.

Parked bugs must not be approved or staged from this queue. Move the entire packet back here from
[PARKED_BUGS.md](PARKED_BUGS.md) and refresh its evidence before review resumes.

Before/after comparison server: the retained clean baseline worktree is detached at historical
commit `bb56186`, not current `HEAD`. It is available at
`/Users/orbital/Documents/CODE/ORBITAL VISION/ov25-ui/.worktrees/ov25-ui-clean-baseline-3009` and is
intended to run on [localhost:3009](http://127.0.0.1:3009/). Use port `3009` only for historical
pre-fix behavior and port `3008` for current local main. A current-HEAD baseline requires a newly
refreshed worktree. Not every fixture added after `bb56186` exists on `3009`.

All implementation work must be assigned to worker subagents. If review finds follow-up changes,
send them back to the same worker when that agent is still available; otherwise assign a new worker
with the same bug context. The main thread coordinates, reviews, verifies, and updates this queue.

Questions or actions requiring the user belong only in [IMPORTANT_NOTES.md](IMPORTANT_NOTES.md).
The orchestrator must notify the user whenever a new active entry is added there.

## Inbox

No untriaged 0.8.8 items. Approved Bugs 59 and 61 and Feature 60 are archived in
[bugs-resolved.md](bugs-resolved.md).

## Investigating

No items.

## Ready For Implementation

No items.

## In Progress

No items.

## Reviewing

No items.

## Changes Requested

No items.

## Ready For User Review

No items.

## Blocked — User Action Required

No items. If this changes, the blocking question will be added to
[IMPORTANT_NOTES.md](IMPORTANT_NOTES.md) and the user will be notified immediately.
