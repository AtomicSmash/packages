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
