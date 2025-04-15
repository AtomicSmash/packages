import { PlaywrightTestConfig } from "@playwright/test";
import { generateProjectsForAllBrowsers } from "@atomicsmash/test-utils";

export const projects = [
	...generateProjectsForAllBrowsers({
		name: "example_tests",
		testDir: "./tests/e2e/example",
		testMatch: /.*example\.test\.ts/,
	}),
] satisfies PlaywrightTestConfig["projects"];
