import type { PageList } from "@atomicsmash/test-utils";
import type { WordPressAdminInteraction } from "@atomicsmash/wordpress-tests-helper";
import { test as base } from "@playwright/test";
import { testData } from "./fixtures/testData.mjs";

type CustomFixtures = { testData: typeof testData };

export const test = base.extend<CustomFixtures>({
	testData: async (
		// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Playwright requires destructuring of the page variable even when not used.
		{ page },
		use,
	) => {
		// Use the fixture value in the test.
		await use(testData);
	},
});

export type TestFunctionType = Parameters<typeof base>[2];
export { checkAccessibility } from "@atomicsmash/test-utils";

export const pagesToTest: PageList = [
	// hover over PageList to see the format required for each page
];

// Used to set the WP version for WordPressAdminInteraction. Supports major dot minor syntax, or "latest"
export const CURRENT_WORDPRESS_VERSION: ConstructorParameters<
	typeof WordPressAdminInteraction
>[2] = "6.7";
