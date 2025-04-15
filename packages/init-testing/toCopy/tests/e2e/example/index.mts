import { generateProjectsForAllBrowsers } from "@atomicsmash/test-utils";
import { PlaywrightTestConfig } from "@playwright/test";

export const projects = [
	...generateProjectsForAllBrowsers({
		name: "example_tests",
		testDir: "./tests/e2e/example",
		testMatch: /.*example\.test\.mts/,
	}),
] satisfies PlaywrightTestConfig["projects"];
