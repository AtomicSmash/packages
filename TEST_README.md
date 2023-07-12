Due to the CLI tests taking a very long time, it is highly recommended that you run the tests for your package on its own.

You can do this by running the command with the workspace flag, like so:

```
npm run test:ui --workspace @atomicsmash/react
```

The CLI test takes a long time because it needs to build and set up a test package so it can be used like a standard package. It must do this both at the start and every time a watch command triggers a test rerun to make sure tests are accurate.
