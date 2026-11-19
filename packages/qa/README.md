# @atomicsmash/qa

Declarative user-journey QA tests on top of Playwright. Environments come from `smash.config.ts`, and every run writes a report the `/as-qa` Claude skills use to fix tests or report real bugs.

## Setup

Needs Node 22.18 or later. Run from the site root (the folder with `smash.config.ts`):

```sh
npm install --save-dev @atomicsmash/qa @playwright/test
npx playwright install chromium
npx smash-qa init
npx smash-qa run --env local
```

`init` creates `qa/qa.config.ts`, a homepage journey in `qa/journeys/`, `qa/memory.md`, and git-ignores `.qa/`.

### Before release

To try unreleased changes, install packed tarballs instead. Don't use `npm link` or `file:`, as Playwright then loads twice and fails.

```sh
# In this repo
npm run build
npm pack -w @atomicsmash/smash-config -w @atomicsmash/qa --pack-destination ~/smash-qa-packs

# In the site
npm install --no-save @playwright/test ~/smash-qa-packs/*.tgz
npx playwright install chromium
npx smash-qa init
```

`--no-save` leaves `package.json` untouched, so a plain `npm install` removes the packages again. After changing the package, repeat both steps.

## Writing journeys

One file per area of the site, default-exporting a journey or an array of them:

```ts
// qa/journeys/account.journey.ts
import {
	button,
	click,
	expect,
	field,
	fill,
	heading,
	journey,
	visit,
} from "@atomicsmash/qa";

export default [
	journey({
		name: "Search finds products",
		steps: [
			visit("/"),
			fill(field("Search"), "shirt"),
			click(button("Search")),
			expect.url("/?s=shirt*"),
		],
	}),
	journey({
		name: "Customer sees their account",
		as: "customer",
		steps: [visit("/my-account/"), expect.visible(heading("My account"))],
	}),
];
```

Then add it to `qa/qa.config.ts`. Only listed journeys run:

```ts
import { defineQaConfig } from "@atomicsmash/qa";
import account from "./journeys/account.journey.ts";
import homepage from "./journeys/homepage.journey.ts";

export default defineQaConfig({
	journeys: [homepage, account],
});
```

Journey names must be unique. Imports between QA files need the `.ts` extension.

### Building blocks

- **Targets:** `button`, `link`, `heading`, `field` (by label), `text`, `role`, `testId`, `css`. Prefer role and label targets.
- **Actions:** `visit`, `click`, `fill`, `select`, `check`, `press`, `waitFor`, `a11y`.
- **Assertions:** `expect.text`, `expect.visible`, `expect.url` (trailing `*` matches any suffix), `expect.title`, `expect.noConsoleErrors`.
- **Values:** `env("NAME")` reads from the environment or `.env`. `data("key")` reads per-environment data from `qa.config.ts`'s `data` option.
- **Options:** `envs: ["local", "staging"]` limits where a journey runs. `mutates: true` marks journeys that change data. `as: "<role>"` runs logged in.

### Logged-in journeys

`as: "customer"` logs in with WP-CLI, so no credentials are needed. It creates (or reuses) a `smash-qa-customer` user and loads a 2-hour session cookie before the first step. On staging, WP-CLI runs over SSH using `staging.ssh` from `smash.config.ts`. If the role doesn't exist, the run stops with a setup error.

## Commands

| Command                                                          | What it does                                                     |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| `smash-qa init`                                                  | Scaffold `qa/` without overwriting anything.                     |
| `smash-qa run [filters..] --env local\|staging [--browsers all]` | Run journeys (optionally filtered by name or file).              |
| `smash-qa inspect <path> --env local\|staging [--as <role>]`     | Print a page's accessibility tree, to find real roles and names. |
| `smash-qa list`                                                  | List configured journeys.                                        |

Add `--json` to any command for machine-readable output. `run` exits `0` if all passed, `1` if any failed, `2` on a setup or config error.

Environments: `local` uses `local.url` (default `https://{projectName}.test`); `staging` uses `staging.url` and `staging.httpAuth`.

## The report

Each run writes `.qa/results/<run>/report.json` and `.qa/latest-report.json`. For each failure it records:

- the failing step and its `file:line`
- a `failureClass`: `locator-not-found`, `locator-ambiguous`, `assertion-mismatch`, `navigation`, `http-error`, `config`, `timeout` or `unknown`
- `bugSignals`: 5xx responses, PHP/WordPress errors, console errors, or a missing element with nothing similar on the page
- `diagnostics`: URL, title, console errors, failed requests, aria snapshot, and `candidates` (likely replacements for a missing target, e.g. `button("Add to cart")`)
- screenshot and trace paths
