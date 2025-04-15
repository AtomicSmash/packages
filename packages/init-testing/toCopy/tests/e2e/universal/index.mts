import { PlaywrightTestConfig } from "@playwright/test";
import { generateProjectsForAllBrowsers } from "@atomicsmash/test-utils";
import { setupName, storageState } from "../../auth/index.js";

export const projects = [
	...generateProjectsForAllBrowsers({
		name: "universal_tests_unauthenticated",
		testDir: "./tests/e2e/universal",
		testMatch: /.*unauthenticated\.test\.ts/,
	}),
	...generateProjectsForAllBrowsers({
		name: "universal_tests_authenticated",
		testDir: "./tests/e2e/universal",
		testMatch: /.*authenticated\.test\.ts/,
		dependencies: [setupName],
		use: { storageState },
	}),
] satisfies PlaywrightTestConfig["projects"];
