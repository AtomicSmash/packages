import { generateProjectsForAllBrowsers } from "@atomicsmash/test-utils";
import { PlaywrightTestConfig } from "@playwright/test";
import { setupName, storageState } from "../../auth/index.mjs";

export const projects = [
	...generateProjectsForAllBrowsers({
		name: "universal_tests_unauthenticated",
		testDir: "./tests/e2e/universal",
		testMatch: /.*\/unauthenticated\.test\.mts/,
	}),
	...generateProjectsForAllBrowsers({
		name: "universal_tests_authenticated",
		testDir: "./tests/e2e/universal",
		testMatch: /.*\/authenticated\.test\.mts/,
		dependencies: [setupName],
		use: { storageState },
	}),
] satisfies PlaywrightTestConfig["projects"];
