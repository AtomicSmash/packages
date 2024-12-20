# Migration guides

This document contains information on how to migrate from one version to the next version.

## v8 --> v9

All dependencies were changed to peer dependencies. You may need to explicitly install the packages if they are not installed automatically for you:

```sh
npm install --save-dev @atomicsmash/eslint-config @atomicsmash/browserslist-config prettier @commitlint/cli @commitlint/config-conventional
```

Please note that the peer dependency for the ESLint config and Browserslist config is strict. You must install the same version number as the coding standards package.

## v9 --> v10

We have stabilised the PHPCS config. If you were previously referencing this file, you must target the new stable config.

```
<rule ref="./node_modules/@atomicsmash/coding-standards/beta/phpcs/phpcs.xml"/>
```

becomes:

```
<rule ref="./node_modules/@atomicsmash/coding-standards/phpcs/phpcs.xml"/>
```

## v10 --> v11

No breaking changes (this shouldn't have been a major release).

## v11 --> v12

Remove usage of vitest typescript config

- This config was only adding vitest global types, however, in practice, this caused more errors in some cases. It’s better to import functions when needed instead of using globals, so this config is removed. If you are using this, simply remove the config from your tsconfig and switch to using imports for your test functions.

Add comments to your eslint disables

- We added linting for ESLint comments. It helps avoid things like unnecessary disables, and requires every disable to have a message explaining why you’ve disabled the rule.
- Marked as breaking as this will likely add new errors to your code, especially if you have used eslint-disables.
