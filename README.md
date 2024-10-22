# Atomic Smash Packages

This is a monorepo for Atomic Smash packages

## To add a package

1. Add a package based off the template package.
2. Name the folder appropriately
3. Add the folder to the "workspaces" property in the root package.json and run npm install to symlink your new package (this lets you reference the package how you would when you use the published package.)
4. Add the folder to the "references" section in the root tsconfig.json
5. Update the name, description, keywords and repository directory in the package.json file for your new package.

## Releases or updates

1. Commit your changes as normal to a new branch. Make sure you update or add automated tests to handle any changes if applicable.
2. Determine if your changes will result in a consumer needing to download an update to the package. If you are simply updating the monorepo setup in a way that doesn't change the code result, or you are only adding or updating tests, this is not necessary and you can just merge your changes into the main branch without doing the following steps (your branch must start with `tests` or `monorepo` and not contain any changeset changes). If your code updates the package code (including dependency updates) or any types exported from those packages, continue with this process.
3. Next, add a changeset / changesets to your branch. To do that, run `npx changeset`. Determine what packages are affected and what the level of change you have made is, according to SemVer rules. In short, a Major bump is any update with a breaking change, a minor update is any update that only adds new functionality, and a patch update is anything else. Your branch may change or add multiple things, in which case, it is often easier to add multiple changesets than just one. Commit those changesets.
4. If the pre-release branch doesn't exist, you need to create it and add a commit to your PR to enter pre-release mode. You can enter pre-release mode by running `npx changeset pre enter beta`.
5. You can now proceed to merge your code into the pre-release branch. To do this, create a pull request on Github with your changes. You cannot merge directly into the main branch, you must merge into pre-release first. Another member of the team will need to review this PR, and there will also be a number of automated tests run to check it hasn't broken anything.
6. When code with a changeset file is merged into the pre-release branch, this will trigger an automatic process to create another pull request called Version Packages (beta), which will generate the changelog, and update any package version numbers. You can review this pull request, and if you're happy with it, merge those changes into pre-release. This will trigger an automatic release of a beta version to npm and make your package available to the public. Log on to npmjs.com to make sure the update was released successfully.
7. Install the beta version of your package into a project and test it thoroughly. If you if any issues, start this process again, add a new branch, new changesets, merge into pre-release. If you don't add any new changesets, a new package version won't be released and you won't see any changes.
8. When the package is tested and you're ready to release, you can merge pre-release into main. Make sure all packages on pre-release are ready to be merged. The pre-release branch should be short lived, so in most cases there will only be your change, but be wary of others working on it at the same time. Create a release branch e.g. `release/2024-10-18`, run the command to exit pre-release mode `npx changeset pre exit`, commit that change, merge it into pre-release, then merge pre-release into main.
9. When merged into main, you will have another Version Packages PR to merge to actually release packages. Be sure to merge this in and check on npmjs.com again. Also be sure to clean up any branches if you haven't already been doing that to keep the branch count low. This includes the pre-release branch.
10. IMPORTANT: Now you've released an update, you must post in the "#our-npm-packages` slack channel, detailing which packages you changed and what changes they have. Use the following message template:

```
New release:
{SINGLE PACKAGE NAME AND VERSION}
Changelog:
{LIST OF CHANGES TO THAT PACKAGE}
```

example:

```
New release:
@atomicsmash/cli@7.1.1
Changelog:
Fix scss extension in builds when in non-production mode
```
