# Atomic Smash CLI

A collection of CLI tools by Atomic Smash.

For help using the cli, use the following command:

```sh
smash-cli --help
```

## Development

To work on this package, navigate to the root of the project and run:

1. `nvm use` - This will set the correct node environment (this is important for permissions for the following step)
2. `npm install`
3. `npm run dev` - To start tracking file changes and will transpile all `.ts` files down into usable `.js` files in dist.

Once these commands are done, you're ready to start working on this project. Check the "CHECKLISTS" file for a checklist of tasks for any development work.

## Run the package locally

Navigate to the project/site you would like to work on, then run your selected command using:

`npx <Absolute path to project>/packages/packages/cli <command>`

Instead of a package name from the npm registry, this points directly to a local directory on disk; npx will look inside that folder's package.json for the bin entry and execute it.
