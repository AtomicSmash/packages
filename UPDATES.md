# Updates

When updating these package as part of regular maintenance, follow these steps

1. Run npm update to update all packages within constraints (this shouldn't require any testing as most packages follow SemVer)
2. Run `npm outdated` to see the remaining updates required. These are all breaking changes, so be sure to check each package to see what was updated and make any relevant changes.
3. To update a single package that's a dependency of one of our packages, use `npm install package@latest -w @atomicsmash/package-name` and be sure to match the save or save-dev or save-peer flag.
4. Create a single changeset for dependency updates per package.

Important notes:

1. When updating Faker.js, you must also update the CDN URL to the same version in dev tools helpers.
2. @types/node must match the version of node that's in use in nvmrc. It might say there's a higher version available, but if you're still on an older node version, make sure it matches so types are correct.
