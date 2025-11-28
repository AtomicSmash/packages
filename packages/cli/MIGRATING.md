# Migration guides

This document contains information on how to migrate from one version to the next version.

## v9 --> v10

Removed blocks command. Migrate to using the new compiler package.

## v8 --> v9

Updated sass-loader version to avoid conflict with compiler
Deprecated cli package blocks command. Migrate to using the new compiler package.

## v7 --> v8

Migrated CLI to use yargs package. This means some help messages are different and some flags may be handled differently, however this should be a mostly seemless release.

## v6 --> v7

Delete extra CSS files after compilation
Update blocks compiler to work with new structure

## v5 --> v6

`__Template__` block folder is excluded by default
No longer compiles root files if there are no blocks, unless specifically opted in via flag

## v4 --> v5

### CLI

No changes needed

### Blocks compiler

In v4, we added the ability to search for all root files in the src folder, and then blocks were searched for in a folder called `blocks`. To make it easier to integrate your blocks folder into existing src folders in your project, we now recommend you mark the blocks folder as your input folder, and the compiler will treat any root files in that folder as normal, and any subdirectories of the input folder as individual blocks.

If you have the following structure:

```
├── src
│   ├── css/
│   ├── js/
│   ├── blocks/ (this is the in folder)
│   │   ├── blocks/
│   │   │   ├── block1/
│   │   │   ├── block2/
│   │   ├── rootFile.ts
```

You can now change this to:

```
├── src
│   ├── css/
│   ├── js/
│   ├── blocks/ (this is the in folder)
│   │   ├── block1/
│   │   ├── block2/
│   │   ├── rootFile.ts
```

Or if you prefer, move the root files inside the blocks folder, and update the in folder:

```
├── src
│   ├── css/
│   ├── js/
│   ├── blocks/
│   │   ├── blocks/ (this is the in folder)
│   │   │   ├── block1/
│   │   │   ├── block2/
│   │   │   ├── rootFile.ts
```
