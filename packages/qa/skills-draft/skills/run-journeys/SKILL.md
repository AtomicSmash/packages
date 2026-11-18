---
name: run-journeys
description: >-
  Use this skill when the user runs /as-qa:run-journeys or asks to "run the
  QA journeys", "run QA on staging", "check the user journeys still work", or
  "heal the failing QA tests". Runs the project's @atomicsmash/qa journeys on
  local or staging, decides for each failure whether the test drifted or the
  site is broken, proposes minimal fixes to drifted journey files (asking for
  approval before modifying any file) and writes a QA report for real bugs.
argument-hint: "[local|staging] [journey-filter]"
allowed-tools: [Bash, Read, Write, Edit, Grep, Glob, AskUserQuestion]
---

# Run QA journeys

Runs the project's journeys, then splits failures into **drift** (the site changed legitimately and the test should follow) and **bugs** (the site is broken and a person needs to know).

**Healing may change how a step finds things. It must never change what the journey proves.** Never delete, weaken or reword an assertion (`expect.*`, `a11y()`) or remove a step just to make a journey pass. Never edit a journey file without showing the diff and getting explicit approval first.

## Steps

### 1. Check the setup

1. Confirm `smash.config.ts`, `node_modules/@atomicsmash/qa` and `qa/qa.config.ts` exist. If any is missing, stop and point the user to `/as-qa:write-journey`.
   - Don't read `smash.config.ts`, because it can hold credentials.
2. Read `$ARGUMENTS`. The first word is the environment (`local` or `staging`, defaulting to `local`). Anything after it is a journey filter, matched against journey names and files.
3. Read `qa/memory.md`.
4. Run `npx smash-qa list --json`.

### 2. Staging safety check

If the environment is `staging` and any selected journey has `mutates: true`, look in `qa/memory.md` under `## Environments` for a dated staging confirmation. If there isn't one, ask the user to confirm that **all** of these are true:
- Staging is disconnected from live stock, ERP and fulfilment systems.
- Payments are in test or sandbox mode.
- Transactional email is caught or disabled.
- The test products in `qa/qa.config.ts` exist on staging.

If the user can't confirm all four, run only journeys where `mutates` is false (use the filter), and say which ones were skipped. Record a confirmation as `- YYYY-MM-DD: staging confirmed safe for mutating journeys (<what was confirmed>)`.

Also, if the environment is `staging` and any selected journey has an `as` role, tell the user that the run will connect to staging over SSH with WP-CLI and create or reuse a `smash-qa-<role>` user for each role. Get their OK before running.

### 3. Run

```bash
npx smash-qa run <filter> --env <env>
```

- **Exit 0:** everything passed. Go to step 7.
- **Exit 2:** setup problem. Show the message and stop. Don't treat it as a test failure.
- **Exit 1:** read `.qa/latest-report.json` and continue.

### 4. Classify each failure

For each journey with a `failure`, read:
- `failure.step` (and its `location` file:line)
- `failureClass`, `isAssertion`, `message` and `bugSignals`
- `diagnostics`: url, title, documentStatus, consoleErrors, failedRequests, serverErrorMarkers and candidates

Also look at the screenshot in `screenshots`. For extra context, run `git log --oneline -15 -- <theme path>`. Get the theme path with `grep -n themePath smash.config.ts`.

Classify each failure as **bug**, **drift** or **ambiguous**:

**Bug.** Report it and don't heal. Any one of these is enough:
- `bugSignals` includes HTTP 5xx, PHP or WordPress error output, uncaught exceptions, or 5xx API requests
- an **assertion** step failed (`isAssertion: true`) and the page shows the outcome didn't happen, e.g. no order confirmation or a validation error shown
- `locator-not-found` where the target has no candidates **and** the page clearly lacks the feature, e.g. the basket button is missing because the product is out of stock or the plugin is deactivated
- `http-error` with 404 on a page the journey has always visited, where no redirect explains it

**Drift.** Propose a fix:
- `locator-not-found` or `locator-ambiguous` where `candidates` contains an element that does the same job, e.g. "Add to basket" → "Add to cart", or a relabelled field
- `navigation` or `expectUrl` where the page moved and the old URL redirects to an equivalent page
- a timing failure where the element appears later (check with `npx smash-qa inspect <url> --env <env>`)

**Ambiguous.** Ask the user:
- an assertion text changed but the outcome plainly still happened (e.g. "Thank you. Your order has been received." → "Thanks for your order!")
- you can't tell whether a missing element was removed on purpose

Show the user the step, the evidence and the screenshot path, and ask: "Test drift: update the journey" or "Bug: report it". Changing an assertion needs this explicit answer every time.

### 5. Heal drifted journeys

For each drifted journey:

1. Work out the **minimal** edit at `failure.step.location`. Usually this means replacing one target with `candidates[n].suggestion`. Prefer the candidate with the same role and the highest score.
2. Trial the fix without touching the committed journey:
   1. Copy the journey's file (`file` in the report) to `.qa/heal/<area>.journey.ts`. `.qa/` is git-ignored and inside the project, so imports still resolve.
   2. Edit the copy.
   3. Run only that journey from the copy: `npx smash-qa run .qa/heal/<area>.journey.ts "<journey name>" --env <env>`. A `.journey.ts` path runs that file instead of `qa/qa.config.ts`, and the name narrows it to one journey.
   - If it now fails at a later step, repeat for that step, up to 5 rounds.
   - If it still fails, reclassify it.
3. Show the user, per journey file:
   - the path and failing step
   - the evidence: the old target, the chosen candidate with its score, and what changed on the page
   - the `diff -u qa/journeys/<area>.journey.ts .qa/heal/<area>.journey.ts`
   - the rerun result
4. Ask: "Apply this fix", "Skip", or, once the user has seen at least one fix, "Apply all remaining drift fixes".

   Only after approval, apply the same edit to `qa/journeys/<area>.journey.ts`. Leave `.qa/heal/` alone, because it is git-ignored scratch space.

### 6. Write the report

Write `qa/reports/<env>_<YYYY-MM-DD-HHmm>.md`:

```markdown
# QA run — <env> — <date time>

Base URL: <baseURL> · <passed> passed · <healed> healed · <bugs> bugs · <skipped> skipped

## Bugs
### <journey name> — step <n>: <description>
- Page: <url> (HTTP <status>)
- What happened: <one or two plain sentences>
- Evidence: <bugSignals, console errors, failed requests>
- Screenshot: <path> · Trace: <path> (open with `npx playwright show-trace <path>`)
- Likely cause: <only if supported by evidence, e.g. a recent theme commit>

## Healed
| Journey | Step | Old target | New target |

## Needs a decision
<ambiguous failures the user didn't resolve>

## Passed
<list>
```

Only state what the evidence shows. Don't guess at causes. If there are no bugs, say so in one line.

### 7. Finish

1. Summarise the result in a short table (journey, result: passed / healed / bug / skipped).
2. Give the report path.
3. Append stable learnings to `qa/memory.md`, such as recurring flaky areas or renamed sections. Don't log single-run details.
