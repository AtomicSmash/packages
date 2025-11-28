# Migration guides

This document contains information on how to migrate from one version to the next version.

## v16 --> v17

### Removal of commitlint.

We no longer use commitlint after moving to changesets. If your project still uses the commitlint config, you should remove it from the project and uninstall all commitlint dependencies.

### Removal of PHPCS config.

We migrated the PHPCS config to a composer package in v13 of this package, this config was only kept around for legacy projects, but it's now been removed.

To install the new package, use the following instructions:

1. Install the new package

```sh
composer require --dev atomicsmash/php-coding-standards
```

2. Update the existing `phpcs.xml` file to the new package location

```xml
<rule ref="./vendor/atomicsmash/php-coding-standards/phpcs.xml"/>
```

### Migration of coding standards configs to ESM - Part 1

In v13 we added ESM versions of our config scripts with the goal of migrating to modern ESM. This is being done to assist with updating ESLint which is now EOL for the version we're stuck on.

We are now making the next step which is to migrate the plain .js files to point to the new ESM files instead of the old config files. At this point, the old configs are still kept around in case of issues, however it's highly recommended to migrate your configs to the new ESM imports instead.

In a future version, the old CJS files WILL be removed, so if you don't migrate now, you will have to do it later.

Here's some specific examples for the tools you need to update:

#### CSpell

No change needed if using .js extension. If using .mjs or .cjs, migrate to using the .js extension. If you're using the .mjs extension you'll use the right file, but it will still break as the .mjs files will be removed in the future as well to avoid clutter.

```js
{
	"import": ["@atomicsmash/coding-standards/cspell/index.js"]
}
```

#### Prettier

You likely have a `prettier.config.cjs` file which looks like this:

```js
module.exports = {
	...require("@atomicsmash/coding-standards").prettierConfig,
};
```

Rename the file to `prettier.config.mjs` and use this instead:

```js
import { prettierConfig } from "@atomicsmash/coding-standards";
export default prettierConfig;
```

#### Stylelint

You likely have a `.stylelintrc.cjs` file which looks like this:

```js
const stylelintConfig = require("@atomicsmash/coding-standards/stylelint/classic");

/** @type {import('stylelint').Config} */
module.exports = stylelintConfig;
```

OR

```js
module.exports = {
	extends: ["@atomicsmash/coding-standards/stylelint/classic"],
};
```

Rename the file to `.stylelintrc.mjs` and use this instead:

```js
export default {
	extends: ["@atomicsmash/coding-standards/stylelint/classic"],
};
```

## v15 --> v16

Browserslist query has been updated to exclude Chrome versions older than 120.

## v14 --> v15

We recently introduced a change in order which says media queries should come after declarations but before other rules, like so:

Incorrect code:

```scss
.class {
	margin: 0;

	@media (width >= 100px) {
		margin: 1rem;
	}

	.nested-class {
	}
}
```

This leads to a potential issue where the media query is used to nest rules and output styles out of order, like this:

```scss
.class {
	margin: 0;

	@media (width >= 100px) {
		margin: 1rem;

		.nested-class {
			padding: 1rem;
		}
	}

	.nested-class {
	}
}
```

This makes rules harder to read because everything is split up instead of together (which is what we're trying to solve with the order change). To solve this, you now cannot nest rules within media queries unless the media query is at the root.

An example of the correct code for the above would be this:

```scss
.class {
	margin: 0;

	@media (width >= 100px) {
		margin: 1rem;
	}

	.nested-class {
		@media (width >= 100px) {
			padding: 1rem;
		}
	}
}
```

## v13 --> v14

If your project has tailwind, you should now extend a second config file for stylelint.

```ts
/** @type {import('stylelint').Config} */
module.exports = {
	extends: [
		"@atomicsmash/coding-standards/stylelint/classic",
		"@atomicsmash/coding-standards/stylelint/tailwind",
	],
};
```

## v12 --> v13

### Stabilise stylelint config

- If you were previously using the stylelint beta config, this has now been stabilised. You must update the beta file reference to the stable one.

```ts
const stylelintConfig = require("@atomicsmash/coding-standards/beta/stylelint/classic");
// becomes
const stylelintConfig = require("@atomicsmash/coding-standards/stylelint/classic");
// or
const stylelintConfig = require("@atomicsmash/coding-standards").stylelintConfig
	.classic;
```

### PHP coding standards have moved to another package, so the config in this package is deprecated.

- To ensure that all dependencies are managed correctly and efficiently, the php coding standards have been moved to a composer package.
- Keep this package installed unless you are only using it for the PHP standards
- Remove all php coding standards dependencies:

```sh
composer remove --dev squizlabs/php_codesniffer wp-coding-standards/wpcs dealerdirect/phpcodesniffer-composer-installer sirbrillig/phpcs-variable-analysis phpcompatibility/phpcompatibility-wp slevomat/coding-standard
```

- Install the new composer package as a dev dependency `composer require --dev atomicsmash/php-coding-standards`
- Update the import path of the xml file from the node package to the composer package:

```xml
<rule ref="./node_modules/@atomicsmash/coding-standards/phpcs/phpcs.xml"/>
<!-- Becomes -->
<rule ref="./vendor/atomicsmash/php-coding-standards/phpcs.xml"/>
```

### Commitlint config is now deprecated and will be removed in a future version.

- With our move to changesets internally, it's no longer required to lint commits.
- You should remove commitlint from your project, at which point this config is no longer needed.
- The config will be removed in the next version

### ESM versions of all scripts have been added, and CJS versions are now deprecated.

- The scripts will continue to work in this version as is
- In the next version, the .js files will be updated to point to the ESM versions instead of the commonjs version.
- If you can't migrate to ESM, update the imports to pull directly from the cjs versions. This will only be a temporary fix for now, as they will be removed in later versions, but all the packages we export configs for support ESM configs.
- This is done in an effort to make updating ESLint to the new config easier.
- An ESM import of commitlint has not been added because it's planned to be removed.

## v11 --> v12

### Remove usage of vitest typescript config

- This config was only adding vitest global types, however, in practice, this caused more errors in some cases. It’s better to import functions when needed instead of using globals, so this config is removed. If you are using this, simply remove the config from your tsconfig and switch to using imports for your test functions.

### Add comments to your eslint disables

- We added linting for ESLint comments. It helps avoid things like unnecessary disables, and requires every disable to have a message explaining why you’ve disabled the rule.
- Marked as breaking as this will likely add new errors to your code, especially if you have used eslint-disables.

## v10 --> v11

No breaking changes (this shouldn't have been a major release).

## v9 --> v10

### We have stabilised the PHPCS config.

- If you were previously referencing this file, you must target the new stable config.

```
<rule ref="./node_modules/@atomicsmash/coding-standards/beta/phpcs/phpcs.xml"/>
```

becomes:

```
<rule ref="./node_modules/@atomicsmash/coding-standards/phpcs/phpcs.xml"/>
```

## v8 --> v9

### All dependencies were changed to peer dependencies.

- You may need to explicitly install the packages if they are not installed automatically for you:

```sh
npm install --save-dev @atomicsmash/eslint-config @atomicsmash/browserslist-config prettier @commitlint/cli @commitlint/config-conventional
```

Please note that the peer dependency for the ESLint config and Browserslist config is strict. You must install the same version number as the coding standards package.
