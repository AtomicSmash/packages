---
name: write-journey
description: >-
  Use this skill when the user runs /as-qa:write-journey or asks to "write a
  QA journey", "add a user journey test", "test the checkout journey", or
  "create an E2E test for this site". Turns a described user journey into a
  declarative @atomicsmash/qa journey in the project's qa/journeys/ folder, using the live page's accessibility tree for real locators, and
  runs it on local until it passes.
argument-hint: "[journey description]"
allowed-tools: [Bash, Read, Write, Edit, Grep, Glob, AskUserQuestion]
---

# Write a QA journey

This skill writes one user journey with `@atomicsmash/qa`, adding it to the journey file for that area of the site (`qa/journeys/<area>.journey.ts`), then runs it on local until it passes.

**Never guess a locator.** Every target comes from `smash-qa inspect` output for the real page. **Never hard-code credentials or personal data.** Use `env("…")`.

Read `references/journey-api.md` (in this skill's folder) before writing any journey.

## Steps

### 1. Check the project is set up

1. Confirm `smash.config.ts` exists in the current directory. If it doesn't, stop and tell the user `smash-qa` needs to run from the project root.
   - Don't read the whole file, because it can hold credentials.
   - To check the version, run only `grep -nE "version|local" smash.config.ts`. If it is not version 2, stop and say it needs upgrading.
2. Confirm `node_modules/@atomicsmash/qa` exists. If it doesn't, ask the user whether to run `npm install --save-dev @atomicsmash/qa @playwright/test`. Do nothing until they answer.
3. If `qa/` doesn't exist, run `npx smash-qa init`.
4. Read `qa/memory.md` and `qa/qa.config.ts` for known test data and project facts.
5. Run `npx smash-qa list` to see existing journeys and their files. If the requested journey already exists, ask whether to extend it or write a new one.

### 2. Pin down the journey

From `$ARGUMENTS` and the conversation, work out:
- the goal (one sentence)
- the start page
- the steps a real user takes
- the **success outcome** the journey must prove, e.g. the order-received page, a success message or a logged-in state
- whether the user is **logged in**, and with which WordPress role. If so, set `as: "<role>"`. Never script the login form or ask for credentials.
- whether it **mutates** data: places an order, submits a form, creates an account or sends an email

Ask the user only for what you can't infer. Always confirm the success outcome, because it becomes the journey's assertions.

If it mutates data:
- Purchases must use a **test product**. Find it in `qa/qa.config.ts` `data`. If it's missing, ask for the product URL for each environment and add it under `data.local` / `data.staging`.
- Other secrets (e.g. card details for a test gateway) go in `.env` as `QA_*` variables, referenced with `env("QA_…")`. Tell the user which variables to add. Never write their values into journey files.

### 3. Inspect each page

For every page the journey touches, run:

```bash
npx smash-qa inspect <path> --env local
```

For a logged-in journey, add `--as <role>`.

Use the aria snapshot to choose targets:
- Prefer `button`, `link` and `heading`, then `field` (label), then `role`, then `text`, then `testId`.
- Only use `css` when nothing else identifies the element, and tell the user why.
- If a page needs earlier steps first (e.g. checkout needs a basket), inspect what you can.
- Note any element you couldn't confirm. You'll confirm it in the run in step 5.
- If the page shows `Server error:` lines or HTTP ≥ 500, stop and report it. The site is broken, so the journey can't be written yet.

If `inspect` fails because Chromium is missing, run `npx playwright install chromium` and retry. If the local site doesn't respond, ask the user to check that Herd is serving it, or to set `local: { url }` in `smash.config.ts`.

### 4. Write the journey

Choose the file by area of the site, e.g. `checkout`, `account`, `blog`, `forms`:
- If `qa/journeys/<area>.journey.ts` exists, add the journey to its default-exported array (turn a single exported journey into an array first).
- Otherwise create `qa/journeys/<area>.journey.ts` exporting an array with the one journey, and add it to `journeys` in `qa/qa.config.ts` with `import <area> from "./journeys/<area>.journey.ts";`. Keep the `.ts` extension.

Follow `references/journey-api.md`:
- Set a `name` that is unique across the project, and `mutates: true` if the journey changes data.
- Set `envs` only when the journey must not run somewhere.
- End with assertions that prove the success outcome. Add `expect.url(...)` when the outcome has a distinctive URL, and `expect.noConsoleErrors()` at the end.
- Keep it to the journey's goal. Don't add incidental assertions about unrelated page content.

### 5. Run it on local until it passes

```bash
npx smash-qa run "<journey name>" --env local
```

- **Exit 0:** passed. Go to step 6.
- **Exit 2:** setup problem (missing `.env` variable, test data, config). Show the message, fix it with the user, and rerun.
- **Exit 1:** read `.qa/latest-report.json`. Look at `failure.description`, `failure.failureClass`, `failure.diagnostics.candidates` and `failure.bugSignals`.
  - If the step's target was wrong, fix it using `candidates` or a fresh `inspect` of `failure.diagnostics.url`, then rerun.
  - If `bugSignals` show a real site problem (5xx, PHP errors, console errors), stop. Report it to the user and don't adjust the journey to work around it.

Stop after 5 attempts and show the user the remaining failure.

### 6. Confirm

Show the user:
- the final journey, and the file and `qa.config.ts` line it was added to
- the command to run it
- any `.env` variables or `qa.config.ts` data it needs on staging

If you learned stable facts (test product slugs, login requirements, flaky areas), append them to `qa/memory.md` under the matching heading.
