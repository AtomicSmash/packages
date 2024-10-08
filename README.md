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
   Following steps are to be rewritten to match process, for now, ask Mikey.

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
