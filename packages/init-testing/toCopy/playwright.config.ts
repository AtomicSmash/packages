import { defineConfig } from '@playwright/test'
import { playwrightConfig } from '@atomicsmash/test-utils'

export default defineConfig(playwrightConfig, {
  use: {
    baseURL: `https://atomicsmash.test/`,
  },
})
