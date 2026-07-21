# Migration guides

This document contains information on how to migrate from one version to the next version.

## v5 --> v6

### Accessibility helper no longer contains an expect call

To provide more flexibility in what violations are allowed and also to prevent linting errors with the playwright ESLint rules, the accessibility helper now doesn't contain an expect call and instead returns the violations array.

To restore the old functionality, simply add an expect line afterwards:

From:

```ts
checkAccessibility(page);
```

To:

```ts
const violations = checkAccessibility(page);
expect(violations).toEqual([]);
```
