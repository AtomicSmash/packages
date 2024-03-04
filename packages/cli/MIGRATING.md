# Migration guides

This document contains information on how to migrate from one version to the next version.

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
