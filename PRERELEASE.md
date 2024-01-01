# Prereleases

To publish a beta package version (recommended), follow these steps:

1. Create your branch with your fixes as normal. Test as much as possible, ensure all linting and automated tests pass.
2. Write your changeset release files as normal.
3. Create a pre-release branch based off of main, and merge in your tested branch. If a pre-release branch already exists, be sure to co-ordinate with the creator of the branch to make sure there are no conflicts. Don't create a new branch if one already exists as they will overwrite and cause version release issues.
4. Run `npx changeset pre enter beta` to enter pre-release mode with "beta" as the tag.
5. Run `npx changeset version` to version bump all packages as needed.
6. Run `npm install && npm run build && npx changeset publish` to build a fresh build & release these as beta versions.
7. Update the dependency to the beta version on at least 1 project and test thoroughly.
8. If changes are needed, add them to your branch, along with associated changeset files, and merge them into pre-release branch. Run the version and publish commands to bump the version and release again.
9. Run `npx changeset pre exit` to exit pre-release mode.
10. When ready to release, merge pre-release back into main. The automatic release process will then take place as per the main README.
11. Delete pre-release branch.
