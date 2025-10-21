# Migration guides

This document contains information on how to migrate from one version to the next version.

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
