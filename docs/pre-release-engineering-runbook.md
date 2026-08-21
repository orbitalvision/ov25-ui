# OV25 Pre-Release Engineering Runbook

Status: **APPROVED — 2026-08-21**

This document defines the bug-fixing, feature-implementation, review, and bookkeeping cycle that
happens before the [release runbook](release-runbook.md) begins. It is reusable for future
`ov25-ui` releases; the first cycle governed by it will be `0.8.8`.

The release runbook remains authoritative for version bumps, release artifacts, full release tests,
commits, tags, pushes, package publication, and downstream deployment. This runbook must never be
used as permission to perform those release actions.

## 1. Objective

For each upcoming release, the main Codex thread acts as the **orchestrator and bookkeeper**. It
must:

1. Record every in-scope bug and feature as soon as it is identified.
2. Keep work moving while any safe, actionable item remains.
3. Delegate every actual code fix or feature implementation to a worker subagent.
4. Review every worker's completed code and return findings to a worker for correction.
5. Independently verify the final diff in proportion to its risk.
6. Prepare complete manual-review packets for the user.
7. Put every decision, missing input, approval request, or external blocker that needs the user in
   [IMPORTANT_NOTES.md](IMPORTANT_NOTES.md), then notify the user that the file needs attention.
8. Stop only at a genuine user/external gate or when no actionable pre-release work remains.

For `0.8.8`, the first tracked item is Bug 59, the three-repository initial-price/`£0.00` flash
fix.

## 2. Authority And Safety Boundaries

### User / release owner

The user:

- defines product behaviour when more than one materially different outcome is plausible;
- approves use of `gpt-5.6-sol` for a worker;
- performs or explicitly approves manual visual/product checks;
- approves a bug or feature for staging;
- owns commits, pushes, tags, publishes, releases, and deployments unless separately delegated;
- decides when parked or previously deferred work returns to scope.

### Main Codex thread / orchestrator

The main thread owns:

- live repository-state inspection and preservation of unrelated changes;
- the active queue and all other bookkeeping documents;
- bug/feature IDs, scope, acceptance criteria, dependencies, and worker assignments;
- cross-repository contract and deployment-order coordination;
- review of every returned diff;
- final verification and evidence quality;
- user notifications and escalation notes;
- deciding whether work is actionable, blocked, parked, ready for review, or complete.

The main thread does **not** implement bug-fix or feature code itself. Even a small follow-up found
during review goes back to a worker. Documentation and bookkeeping edits remain the main thread's
responsibility so multiple agents do not race on tracker files.

### Worker subagents

Workers may investigate, implement, test, or independently review the bounded assignment they were
given. They must:

- preserve all unrelated user and agent changes;
- edit only their assigned repository and file scope;
- avoid staging, committing, pushing, publishing, deploying, version-bumping, or editing release
  artifacts;
- run focused verification and report the exact commands/results;
- disclose uncertainty, missing coverage, files they chose not to touch, and residual risk;
- avoid editing the shared bookkeeping Markdown unless explicitly assigned documentation work.

## 3. Sources Of Truth

| File | Purpose |
| --- | --- |
| [bugs-ready-for-review.md](bugs-ready-for-review.md) | Live lifecycle board for **all active bugs and features**, from intake through user review. Despite its historical filename, it is not limited to already-finished fixes. |
| [IMPORTANT_NOTES.md](IMPORTANT_NOTES.md) | Only authoritative inbox for questions or actions requiring the user during the active cycle. |
| [bugs-resolved.md](bugs-resolved.md) | Approved/resolved review-packet archive. |
| [PARKED_BUGS.md](PARKED_BUGS.md) | Explicitly deferred work outside the current release. |
| [ov25_bugs_and_todo.md](ov25_bugs_and_todo.md) | Historical source backlog and long-form context; not the live release dashboard. |
| `review-diffs/` | Scoped implementation diffs used for review and safe staging evidence. |
| `review-screenshots/` | Before/after visual evidence when a UI change can be reproduced locally. |
| [release-runbook.md](release-runbook.md) | Post-implementation release process, entered only after this cycle is closed. |

`IMPORTANT_BUGS.md` and `bugs-questions-for-user.md` currently contain historical material. After
this proposal is approved, active 0.8.8 questions should be consolidated into
`IMPORTANT_NOTES.md`; the old files should not remain competing user inboxes.

## 4. Active Queue Structure

Every in-scope bug or feature must be added to `bugs-ready-for-review.md` immediately, before or
during investigation. An item must never exist only in chat or in an agent task.

Use these sections:

1. **Inbox** — newly reported; not yet reproduced or scoped.
2. **Investigating** — read-only reproduction/code tracing is active.
3. **Ready For Implementation** — behaviour and acceptance criteria are known; no user decision is
   missing.
4. **In Progress** — a named worker owns the implementation.
5. **Reviewing** — worker is complete; the main thread is reviewing or verifying.
6. **Changes Requested** — review found issues; the same worker normally owns the follow-up.
7. **Ready For User Review** — automated review/verification is complete and the full manual packet
   is available.
8. **Blocked — User Action Required** — retained in the active queue and linked to an unread entry
   in `IMPORTANT_NOTES.md`.

When the user approves an item, archive its complete packet in `bugs-resolved.md`, update its source
backlog status, and remove it from the active queue. Move deliberately deferred work to
`PARKED_BUGS.md`, leaving a short release-scope note or link rather than an apparently active fix.

### Required item header

Each active item should begin with a compact ledger:

```md
### Bug 59 — Product price flashes £0.00

- Release: `0.8.8`
- Status: Reviewing
- Severity: High
- Repositories: `OV25`, `ov25-ui`, `shopify-plugin`
- Owner: `/root/agent-name` (`gpt-5.6-terra`, high)
- Depends on: OV25 message suppression ships first
- Last updated: 2026-08-21
```

For a cross-repository item, list one parent status plus a per-repository checklist. The parent is
not ready or complete until every required repository is reviewed. A safe partial deployment may
be documented, but it does not silently shrink the definition of done.

## 5. Intake And Triage

For each report:

1. Assign the next stable bug or feature ID. Do not renumber later.
2. Record the user's wording and the intended release.
3. Inspect live Git status in every implicated repository before assigning work.
4. Mark all pre-existing modified/untracked files as user-owned unless provenance proves otherwise.
5. Reproduce against current code or record why reproduction needs live data, credentials, a
   product, a browser, or another external dependency.
6. Determine actual versus expected behaviour, affected surfaces, downstream consumers, public API
   impact, compatibility constraints, likely files, test candidates, and blast radius.
7. Write explicit acceptance criteria before implementation begins.
8. If the behaviour is already fixed, record current evidence and do not create a gratuitous code
   change.
9. If a decision would materially change behaviour or scope, create an `IMPORTANT_NOTES.md` entry
   instead of guessing.

A feature follows the same workflow as a bug, but must also record its user outcome, non-goals,
compatibility promise, and acceptance scenarios before implementation.

## 6. Questions And User Notifications

`IMPORTANT_NOTES.md` is the single active user inbox for this cycle. New actionable entries go at
the top under `## ACTION REQUIRED — <release>` using this structure:

```md
### Q-0.8.8-001 — Short decision title

- Added: 2026-08-21
- Blocks: Bug 00 / repository / test
- Status: UNREAD
- Recommendation: one concrete recommended option and why
- Question: the smallest decision the user must make
- Alternatives: materially different choices and their consequences
- Default if unanswered: none; work remains paused at this boundary
```

Immediately after adding an entry, notify the user in chat with a clickable link to the file and a
one-sentence description of what is blocked. Do not bury a blocking question only in commentary or
an agent result.

After the user answers:

1. copy the decision and date into the affected bug/feature packet;
2. mark or move the note to a resolved/history section;
3. resume the blocked worker, preferably the original worker;
4. notify the user again only if another action is genuinely required.

## 7. Model And Agent Policy

The user-specified worker policy is:

- **`gpt-5.6-luna`** — fast read-only reconnaissance, narrow test-gap analysis, simple mechanical
  fixes, or other well-specified low-risk tasks.
- **`gpt-5.6-terra`** — default for implementation, non-trivial investigation, cross-component
  reasoning, test design, and code review.
- **`gpt-5.6-sol`** — only when the orchestrator judges a task sufficiently complex and the user
  explicitly approves Sol for that worker first.

Before requesting Sol, the orchestrator should state why Terra is insufficient, what bounded task
Sol would receive, and the expected benefit. Record the request in `IMPORTANT_NOTES.md` and notify
the user. Do not treat maximum model strength as a substitute for clear scope or verification.

Reasoning effort should also be chosen deliberately:

- low/medium for bounded search or mechanical edits;
- medium/high for normal implementation and review;
- high/xhigh for concurrency, lifecycle, public-contract, or cross-repository work;
- higher effort only when the risk/complexity justifies the added latency.

This tiering matches current official GPT-5.6 guidance: Terra balances capability and cost, Luna is
suited to efficient high-volume work, and multi-agent execution is most useful when the work divides
cleanly into independent streams. See [OpenAI model guidance](https://developers.openai.com/api/docs/guides/latest-model).

## 8. Multi-Agent Operating Procedure

### Agent roles

Use three bounded roles:

- **Investigator** — read-only; locates definitions/callers, reproduces behaviour, maps risk and test
  surfaces. It does not make opportunistic edits.
- **Builder** — exclusive writer for a known scope; implements the agreed behaviour and focused
  tests.
- **Reviewer** — read-only; reports concrete correctness/regression findings against a frozen diff.

The main thread always performs the integration review. An independent reviewer is a second pair
of eyes for high-risk work, not a replacement for the orchestrator's review.

### Concurrency policy

There are four total agent slots including the main thread, so at most three subagents can run at
once.

- Default to no more than **two writer agents** concurrently; keep capacity for read-only discovery
  or review and for the main thread to absorb results.
- Run agents in parallel only when their scopes are genuinely independent and their file ownership
  is disjoint.
- Never give two writers overlapping files or one mutable working tree without an explicit handoff.
- Read-only investigators may run in parallel across different questions.
- A three-repository bug may use one writer per repository only after the main thread freezes the
  shared contract, assigns disjoint repositories, and records dependency/deployment order.
- If investigation can change the contract, finish and synthesize investigation before spawning
  builders.
- Reviewers inspect a stable snapshot. Do not keep writing the same diff while it is being reviewed.

Because all subagents share the filesystem, concurrency is not isolation. Use separate repository
worktrees when writers need different branches in the same repository; otherwise use one writer at
a time for that repository. Prefer worktrees under a repository-writable `.worktrees/` path and
record their branch, base commit, and owner in the queue.

### Assignment contract

Every worker prompt must specify:

1. bug/feature ID and user-visible outcome;
2. exact repository/worktree and allowed file scope;
3. current behaviour, expected behaviour, acceptance criteria, and non-goals;
4. known dirty/user-owned files that must be preserved;
5. public/downstream compatibility constraints;
6. tests and evidence expected;
7. prohibited actions such as docs edits, staging, commits, releases, or dependency churn;
8. a compact return format: files changed, rationale, verification, findings, residual risk.

For follow-up findings, send the task back to the same worker while its context is still useful.
Replace the worker only when it is unavailable, blocked, or the new scope is independent.

### Efficient delegation patterns

Use the smallest pattern that fits:

- **Known one/two-file fix:** builder → main review → same builder follow-up if needed.
- **Unknown location:** investigator → main contract decision → builder → main review.
- **High-risk fix:** investigator(s) → builder → main review → independent reviewer → same builder
  follow-up → final main verification.
- **Cross-repository contract:** parallel read-only repository audits → main freezes payload/ordering
  contract → disjoint repository builders → main cross-repo review and verification.

Compact, path-and-line-oriented investigator/reviewer output is preferred. Long prose from every
agent increases context cost and makes synthesis harder; reserve prose for architecture decisions
where rationale matters.

## 9. Implementation And Review Loop

1. Move the item to **In Progress** and record its worker/model/scope.
2. Delegate all code changes and tests to the worker.
3. Continue orchestrator work that does not overlap: inspect another repository, refine manual
   tests, or triage another independent item.
4. When the worker completes, move the item to **Reviewing**.
5. Inspect the actual Git diff, not only the worker summary.
6. Check acceptance criteria, error paths, message/lifecycle ordering, cleanup/reset behaviour,
   accessibility, public types, downstream adapters, and test quality as applicable.
7. Confirm the diff contains no unrelated user changes, generated-file-only fixes, lockfile churn,
   version bumps, or release actions.
8. Run or repeat proportionate focused checks. A worker's claimed pass is evidence, but the main
   thread must understand what the test covers before accepting it.
9. If findings exist, record them, move the item to **Changes Requested**, and send them to the same
   worker. Do not patch the bug directly in the main thread.
10. Repeat until no blocking review finding remains.
11. Generate/update the scoped diff and full user review packet.

Review severity should distinguish:

- **Blocking:** incorrect behaviour, regression, data/commerce risk, compatibility break, missing
  required repo, or tests that do not exercise the claimed fix.
- **Non-blocking:** maintainability or coverage improvement that does not invalidate the fix.
- **Question:** intent cannot be determined safely; escalate through `IMPORTANT_NOTES.md`.

## 10. Verification And Manual Review Packet

Before moving an item to **Ready For User Review**, include:

- bug/feature summary and root cause;
- exact reproduction and expected result;
- acceptance criteria and non-goals;
- every required repository and deployment dependency/order;
- assigned workers/models and review history;
- changed files with clickable links;
- scoped implementation diff under `review-diffs/`;
- concise diff summary;
- exact automated commands/results from the current cycle;
- focused test coverage and known missing coverage;
- before/after screenshots in `review-screenshots/` when practical;
- an explanation when screenshots are not useful or reproducible;
- manual URLs and numbered verification steps;
- public API, payload, cart/checkout, Shopify, WooCommerce, OV25, React 18/19, setup, and CSS impact
  as applicable;
- residual risk and rollback/partial-deployment notes;
- an explicit approval instruction.

Use port `3008` for current local main. The retained port `3009` baseline is historical commit
`bb56186`, not a current-HEAD baseline. Create or refresh a separate baseline worktree before making
a current-before/current-after claim.

Do not rebuild `ov25-ui` for manual review unless the user asks; the user owns local rebuilds under
the existing workflow. Do not mark an item fixed or stage implementation files until the user
explicitly approves it after review.

After approval, stage only the approved implementation/test files when the user requests staging.
Keep bookkeeping changes separate. Do not commit, push, bump versions, publish, or deploy during
this pre-release cycle.

## 11. Continuous Operation And Stopping Conditions

The orchestrator keeps cycling through intake → investigation → implementation → review → user
review while actionable work exists.

Work is still actionable when any of these is true:

- an untriaged in-scope item can be investigated safely;
- a reproducible item has known acceptance criteria and no missing decision;
- a worker can fix an outstanding review finding;
- focused verification or review evidence is incomplete but locally obtainable;
- another independent item can progress while one item waits on an agent.

Do not declare the cycle finished merely because no agents are currently running or because one
test passed. The orchestrator must audit the active queue, running agents, working-tree diffs,
review findings, required repositories, and verification evidence.

Pause and notify the user when all remaining work requires one of:

- a product/behaviour decision;
- permission to use `gpt-5.6-sol`;
- credentials, access, live product data, or a missing fixture;
- a user-run rebuild/manual visual test;
- explicit approval to stage or move into the release process;
- an external state change that cannot be performed safely in scope.

Record each such gate in `IMPORTANT_NOTES.md`. "No actionable work remains" may mean the active
queue is empty, or that every remaining item is explicitly blocked/parked with its next owner and
action recorded. It never means silently dropping incomplete work.

## 12. Handoff To The Release Runbook

The pre-release cycle is ready to hand off only when:

- every intended item is approved/resolved or explicitly removed from release scope;
- no worker, review, or verification task remains active;
- all cross-repository requirements and deployment dependencies are recorded;
- the active queue contains no unexplained item;
- `IMPORTANT_NOTES.md` contains no unread release-blocking question;
- working-tree changes are understood and ownership is documented;
- the user confirms the intended release scope.

Then follow [release-runbook.md](release-runbook.md). This handoff does not itself authorize a
version bump, release test, commit, tag, push, package publish, or platform deployment.

## 13. Proposed Process Improvements

These recommendations were approved with the runbook on 2026-08-21. Automation suggestions remain
future implementation work rather than prerequisites for Bug 59:

1. **Make the active queue a real lifecycle board.** Keep the required
   `bugs-ready-for-review.md` path, but add the status sections in this document so bugs cannot be
   lost between chat, investigation, implementation, and review.
2. **Use one user inbox.** Move active questions from `IMPORTANT_BUGS.md` and
   `bugs-questions-for-user.md` into a short action-required section at the top of
   `IMPORTANT_NOTES.md`; archive historical notes below it or in a separate archive.
3. **Keep one writer per repository by default.** Parallelize discovery freely, but parallelize
   implementation only across disjoint repositories/files. This prevents shared-worktree races and
   reduces costly diff reconciliation.
4. **Reserve concurrency for the critical path.** With three subagent slots, normally use two
   builders plus one investigator/reviewer rather than filling all slots with writers the main
   thread cannot review promptly.
5. **Freeze cross-repository contracts before coding.** Record payload shapes, message order,
   compatibility, required repositories, and deploy order once; give every repo worker the same
   contract.
6. **Use an ownership table.** Record agent, model, repo, worktree/branch, allowed files, status,
   and last update in each packet. This makes interrupted or resumed work auditable.
7. **Prefer compact agent outputs.** Require path/line findings and exact verification results.
   Preserve detailed prose for architectural rationale and user-facing review packets.
8. **Add a queue validator later.** A small read-only script could fail when an active item lacks an
   ID, release, status, owner, updated date, required repo, review evidence, or user-note link.
9. **Separate focused verification from release testing.** Workers/main run targeted tests during
   development; the full release workflow remains a later user-controlled gate.
10. **Run a short release retrospective.** After each release, record missed regressions, slow tests,
    unnecessary agent turns, model escalations, and stale docs, then adjust this runbook with
    evidence rather than intuition.
