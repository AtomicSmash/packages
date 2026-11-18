# @atomicsmash/qa journey API

One file per area of the site, `qa/journeys/<area>.journey.ts`, default-exporting an array of related journeys.

```ts
import { button, click, data, env, expect, field, fill, journey, link, visit } from "@atomicsmash/qa";

export default [
	journey({
		name: "Guest checkout",          // human-readable, unique across the project
		envs: ["local", "staging"],      // optional; defaults to both
		mutates: true,                   // creates orders, entries, accounts, emails
		tags: ["checkout"],              // optional
		as: "customer",                  // optional WordPress role to run logged in as
		steps: [ /* ... */ ],
	}),
	journey({ name: "Account checkout", steps: [ /* ... */ ] }),
];
```

Only files listed in `qa/qa.config.ts` run. Commenting out a line skips that file:

```ts
import { defineQaConfig } from "@atomicsmash/qa";
import blog from "./journeys/blog.journey.ts";
import checkout from "./journeys/checkout.journey.ts";

export default defineQaConfig({
	journeys: [checkout, blog],
	data: { local: { product: "/product/qa-test-product/" } },
});
```

Imports between QA files keep the `.ts` extension.

## Logged-in journeys

Set `as` to a WordPress role (`customer`, `subscriber`, `administrator`, `shop_manager`…) and the journey starts logged in as the `smash-qa-<role>` user, which smash-qa creates with WP-CLI. Never write login-form steps or put credentials in journeys. Inspect logged-in pages with `npx smash-qa inspect <path> --as <role>`.

## Targets (prefer in this order)

| Builder | Finds |
| --- | --- |
| `button(name)`, `link(name)`, `heading(name)` | Element by role and accessible name |
| `field(label)` | Form control by its label |
| `role(role, name?)` | Any ARIA role, e.g. `role("banner")`, `role("dialog", "Basket")` |
| `text(content)` | Visible text |
| `testId(id)` | `data-testid` attribute |
| `css(selector)` | Last resort; brittle and flagged in reports |

Names match by substring, case-insensitively. Pass `{ exact: true }` when a name is a prefix of another (e.g. `button("Add", { exact: true })`).

## Steps

| Step | Meaning |
| --- | --- |
| `visit(path)` | Go to a path on the environment's base URL. Fails on HTTP ≥ 400. |
| `click(target)` | Click. |
| `fill(target, value)` | Replace a field's value. |
| `select(target, option)` | Choose a `<select>` option by label or value. |
| `check(target, checked = true)` | Tick or untick a checkbox or radio. |
| `press(key, target?)` | Press a key, e.g. `press("Enter", field("Search"))`. |
| `waitFor(target)` | Wait until visible. |
| `a11y()` | axe scan of the current page; fails on violations. |

## Assertions (what the journey proves)

| Assertion | Meaning |
| --- | --- |
| `expect.text(value)` | Text is visible on the page. |
| `expect.visible(target)` | Element is visible. |
| `expect.url(path)` | URL path matches; trailing `*` matches any suffix. |
| `expect.title(value)` | Page title contains the value. |
| `expect.noConsoleErrors()` | No console errors or uncaught exceptions so far. |

## Values

- A plain string is used as-is.
- `env("QA_EMAIL")` is read from the environment or the project's `.env`. Use it for credentials and anything secret, and never hard-code those.
- `data("product")` is read from `qa/qa.config.ts` → `data[env].product`. Use it for anything that differs between local and staging, especially test products.
