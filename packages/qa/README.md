# @atomicsmash/qa

Declarative user-journey QA tests on top of Playwright. Journeys live in the project, environments come from `smash.config.ts`, and every run writes a machine-readable report that the `/as-qa` Claude skills use to self-heal tests or report real bugs.

## Setup

```sh
npm install --save-dev @atomicsmash/qa @playwright/test
npx playwright install chromium
npx smash-qa init
```

`init` creates `qa/qa.config.ts`, an example `qa/journeys/homepage.journey.ts`, `qa/memory.md`, and git-ignores `.qa/`.

Environments are read from `smash.config.ts` (version 2):

- `local`: `local.url`, defaulting to `https://{projectName}.test`
- `staging`: `staging.url`, using `staging.httpAuth` if set

## Writing journeys

Group related journeys into one file per area of the site, such as `checkout.journey.ts`, `blog.journey.ts` or `spa.journey.ts`. A file default-exports one journey or an array of them. Steps are plain data, so they can be diffed, reported and healed.

```ts
// qa/journeys/checkout.journey.ts
import {
	button,
	click,
	data,
	env,
	expect,
	field,
	fill,
	journey,
	visit,
} from "@atomicsmash/qa";

export default [
	journey({
		name: "Guest checkout",
		envs: ["local", "staging"],
		mutates: true,
		steps: [
			visit(data("product")),
			click(button("Add to basket")),
			visit("/checkout/"),
			fill(field("Email address"), env("QA_EMAIL")),
			click(button("Place order")),
			expect.url("/checkout/order-received/*"),
			expect.text("Thank you. Your order has been received."),
		],
	}),
	journey({
		name: "Empty basket",
		steps: [visit("/basket/"), expect.text("Your basket is currently empty.")],
	}),
];
```

Then list the file in `qa/qa.config.ts`. Only listed journeys run, so commenting out a line is the quick way to exclude a file's journeys:

```ts
// qa/qa.config.ts
import { defineQaConfig } from "@atomicsmash/qa";
import blog from "./journeys/blog.journey.ts";
import checkout from "./journeys/checkout.journey.ts";
// import spa from "./journeys/spa.journey.ts";

export default defineQaConfig({
	journeys: [checkout, blog],
	data: {
		local: { product: "/product/qa-test-product/" },
		staging: { product: "/product/qa-test-product/" },
	},
});
```

Journey names must be unique across the project, because filters and reports identify journeys by name. Imports between QA files need the `.ts` extension (Node 22.18 or later runs them without a build step).

## Logged-in journeys

Add `as` with a WordPress role to run a journey logged in. Credentials never go in the codebase, and none are needed:

```ts
journey({
	name: "My account shows orders",
	as: "customer",
	steps: [visit("/my-account/orders/"), expect.visible(heading("Orders"))],
});
```

At the start of a run, smash-qa uses WP-CLI to log in for each role the selected journeys use:

1. It finds or creates a `smash-qa-<role>` user (random password, email `smash-qa-<role>@example.invalid`). The user stays, so later runs reuse it.
2. It creates a new session for that user and loads its login cookies into the browser before the first step. The cookies expire after 2 hours.

On `local`, WP-CLI runs directly in the project. On `staging`, it runs over SSH with the `staging.ssh` details from `smash.config.ts`, the same way `smash-cli pull-database` does, so your SSH key needs access. The login form is never used, so 2FA and CAPTCHA plugins don't get in the way. If the role doesn't exist on the site (e.g. `customer` without WooCommerce), the run stops with a setup error.

Use `smash-qa inspect <path> --as <role>` to see a page as that user.

- **Targets:** `button`, `link`, `heading`, `field` (by label), `text`, `role`, `testId`, `css`. Prefer role and label targets; `css` is a last resort.
- **Actions:** `visit`, `click`, `fill`, `select`, `check`, `press`, `waitFor`, `a11y`.
- **Assertions:** `expect.text`, `expect.visible`, `expect.url` (a trailing `*` matches any suffix), `expect.title`, `expect.noConsoleErrors`.
- **Values:**
  - `env("NAME")` reads from the environment or `.env`. Use it for credentials.
  - `data("key")` reads per-environment test data from `qa/qa.config.ts`. Purchase journeys must point at test products.

## Commands

| Command                                                                   | What it does                                                                                                                                                     |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `smash-qa init`                                                           | Scaffold the `qa/` folder without overwriting anything.                                                                                                          |
| `smash-qa run [filters..] --env local\|staging [--browsers all] [--json]` | Run the journeys in `qa.config.ts`, or only those whose name or file contains a filter, and write `.qa/results/<run>/report.json` plus `.qa/latest-report.json`. |
| `smash-qa inspect <path> --env local\|staging [--as <role>] [--json]`     | Print a page's status, title and accessibility tree, to pick real roles and names.                                                                               |
| `smash-qa list [--json]`                                                  | List the journeys in `qa.config.ts` with their files, environments and tags.                                                                                     |

`run` exit codes:

- `0`: every journey passed.
- `1`: one or more journeys failed.
- `2`: a setup or config problem stopped the run.

## The report

For each failed journey the report has:

- the failing step (as data, with its `file:line`), and whether that step is an assertion
- a `failureClass`: `locator-not-found`, `locator-ambiguous`, `assertion-mismatch`, `navigation`, `http-error`, `config`, `timeout` or `unknown`
- `bugSignals`, which are facts pointing to a real site problem: 5xx responses, PHP or WordPress error output, console errors, or a missing element with nothing similar on the page
- `diagnostics`: URL, title, document status, console errors, failed requests, the aria snapshot, and `candidates`, meaning elements on the page the missing target most likely became, each with a ready-made replacement target such as `button("Add to cart")`
- screenshot and trace paths

## Trying unreleased changes in a project

You can test changes on a real site before they are merged and published by installing packed tarballs of the packages.

Don't use `npm link` or a `file:` dependency. Those symlink the package, so it loads `@playwright/test` from this monorepo's `node_modules` instead of the project's. Playwright then loads twice and fails with "Requiring @playwright/test second time". A tarball installs as ordinary files, the same way the published package will.

Pack `@atomicsmash/smash-config` as well, because smash-qa needs its unreleased `local.url` support.

### 1. Build and pack (in this repo)

```sh
npm run build
npm pack -w @atomicsmash/smash-config -w @atomicsmash/qa --pack-destination ~/smash-qa-packs
```

### 2. Install in the project

From the site's root, the folder with `smash.config.ts`:

```sh
npm install --no-save @playwright/test \
	~/smash-qa-packs/atomicsmash-smash-config-*.tgz \
	~/smash-qa-packs/atomicsmash-qa-*.tgz
npx playwright install chromium
npx smash-qa init
```

`--no-save` leaves the project's `package.json` and lock file untouched. A later plain `npm install` removes the trial packages, so reinstall them if that happens. You need Node 22.18 or later.

### 3. Add a test case

`init` creates `qa/qa.config.ts` with the homepage journey. To try a logged-in journey on a WooCommerce site, add `qa/journeys/account.journey.ts`:

```ts
import { expect, heading, journey, visit } from "@atomicsmash/qa";

export default [
	journey({
		name: "Customer sees their account",
		as: "customer",
		steps: [
			visit("/my-account/"),
			expect.visible(heading("My account")),
			expect.noConsoleErrors(),
		],
	}),
];
```

Then list it in `qa/qa.config.ts`:

```ts
import { defineQaConfig } from "@atomicsmash/qa";
import account from "./journeys/account.journey.ts";
import homepage from "./journeys/homepage.journey.ts";

export default defineQaConfig({
	journeys: [homepage, account],
});
```

Check the page and the heading's real name before relying on it.

### 4. Run it

```sh
npx smash-qa inspect /my-account/ --as customer   # should show the logged-in dashboard, not the login form
npx smash-qa list
npx smash-qa run --env local
```

Then check:

- `wp user list --role=customer` lists `smash-qa-customer`
- `.qa/latest-report.json` has the full result, with screenshots and traces under `.qa/results/`

To try staging, add `--env staging`. Logged-in journeys then connect to staging over SSH with WP-CLI.

### 5. After changing the package

Repeat steps 1 and 2. If the project still runs the old code, delete `node_modules/@atomicsmash/qa` and install again.

### 6. Clean up

```sh
npm install                                         # restores the project's own dependencies
rm -rf qa .qa                                       # only if you were just trialling
wp user delete smash-qa-customer --yes              # optional; on staging, run it over SSH
```

Also remove the `.qa/` line that `init` added to `.gitignore`.
