# Pre-releases

To publish a beta package version (recommended), follow these steps:

1. Create your branch with your fixes as normal. Test as much as possible, ensure all linting and automated tests pass.
2. Write your changeset release files as normal.
3. Create a pre-release branch based off of main, and merge in your tested branch. If a pre-release branch already exists, be sure to co-ordinate with the creator of the branch to make sure there are no conflicts. Don't create a new branch if one already exists as they will overwrite and cause version release issues.
4. On the pre-release branch, run `npx changeset pre enter beta` to enter pre-release mode with "beta" as the tag.
5. Merge your branch into the pre-release branch.
6. Run `npx changeset version && npm install` to version bump any updated packages and update the lockfile. Commit those files.
7. Run `npm run build && npx changeset publish` to build a fresh build & release these as beta versions.
8. Update the dependency to the beta version on at least 1 project and test thoroughly.
9. If changes are needed, add them to your branch, along with associated changeset files, and merge them into pre-release branch. Run the version and publish commands to bump the version and release again.
10. When ready to release, Run `npx changeset pre exit` to exit pre-release mode, and commit the file change.
11. Merge pre-release branch back into main. The automatic release process will then take place as per the main README.
12. Delete pre-release branch.
