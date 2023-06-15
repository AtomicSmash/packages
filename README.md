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
2. Determine if your changes will result in a consumer needing to download an update to the package. If you are simply updating the monorepo setup in a way that doesn't change the code result, or you are only adding or updating tests, this is not necessary and you can just merge your changes into the main branch without doing the following steps. If your code updates the package code (including dependency updates) or any types exported from those packages, continue with this process.
3. Determine what the level of change you have made is, according to SemVer rules. In short, a Major bump is any update with a breaking change, a minor update is any update that only adds new functionality, and a patch update is anything else.
4. Once you're ready to merge into main, Run the following command `npx changeset`. This command will walk you through a process where you can select which packages are affected by your update, set the semver level of the update and write a description of the change for the changelog. Use arrow keys to navigate, Space to select individual packages and Enter once you've selected the relevant packages. This will create a file in the `.changeset` folder with your changes, which you should commit into your branch.
5. Once that file is committed, you can proceed to merge your code into the main branch. To do this, create a pull request on Github with your changes. Once a review is accepted by another member of the team, it can be merged into the main branch and the branch can be deleted.
6. When code with a changeset file is merged into the code, this will trigger an automatic process to create another pull request called Version Packages, which will generate the changelog, delete any changeset files and update any package version numbers. You can review this pull request, and if you're happy with it, merge those changes into main and delete the branch. This will trigger an automatic release to npm and make your package available to the public.
7. Log on to npmjs.com to make sure the update was released successfully.
8. IMPORTANT: Now you've released an update, you must post in the "#our-npm-packages` slack channel, detailing which packages you changed and what changes they have. Use the following message template:

```
{INFORMAL PACKAGE NAME} {NEW PACKAGE VERSION} PUBLISHED :tada:
Changelog:
{LIST OF CHANGES}
{LINK TO PACKAGE NPM}
```

example:

```
CLI v3.1.1 PUBLISHED :tada:
Changelog:
Add blocks command to CLI help message
https://www.npmjs.com/package/@atomicsmash/cli
```
