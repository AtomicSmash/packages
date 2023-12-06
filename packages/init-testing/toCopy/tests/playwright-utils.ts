import type {
  AuthenticatePageFunction,
  PageList,
} from '@atomicsmash/test-utils'
import type { Page } from '@playwright/test'
import { getLighthouseTest } from '@atomicsmash/test-utils'
import { test as base } from '@playwright/test'
import { testData } from './fixtures/testData.js'

/**
 * Fixtures
 */
const logInUser: AuthenticatePageFunction = async function ({ page }, use) {
  // Do any actions here to log a user in so you can access logged in areas of the site.
  // This is useful for testing my account pages, etc.
  await use(page)
}

type CustomFixtures = {
  testData: typeof testData
  authenticatedPage: Page
}

export const test = base.extend<CustomFixtures>({
  testData: async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { page },
    use
  ) => {
    // Use the fixture value in the test.
    await use(testData)
  },
  authenticatedPage: [logInUser, { scope: 'test' }],
})

export const lighthouseTest = getLighthouseTest(logInUser)
export const { expect } = test // re-export expect to cleanup imports in tests
export { checkAccessibility } from '@atomicsmash/test-utils'

export const pagesToTest: PageList = [
  // hover over PageList to see the format required for each page
]
