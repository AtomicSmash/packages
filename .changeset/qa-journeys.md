---
"@atomicsmash/qa": minor
"@atomicsmash/smash-config": minor
---

Add `@atomicsmash/qa`, a declarative user-journey QA runner on top of Playwright where journey files group related journeys by area and `qa/qa.config.ts` lists which ones run, with a `smash-qa` CLI (`init`, `run`, `inspect`, `list`) a machine-readable report for self-healing, and logged-in journeys (`as: "<role>"`) that mint short-lived WP-CLI sessions instead of storing credentials. Add an optional `local.url` to smash.config v2, defaulting to `https://{projectName}.test`.
