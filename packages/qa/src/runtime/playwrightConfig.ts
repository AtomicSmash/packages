import type { PlaywrightTestConfig } from "@playwright/test";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { readRunContext } from "./context.js";
import { devices } from "@playwright/test";

/**
 * Build the Playwright config for a smash-qa run from the context the CLI passed in.
 * Projects never hold their own Playwright config; `smash-qa run` generates a file that calls this.
 */
export async function createPlaywrightConfig(): Promise<PlaywrightTestConfig> {
	const context = readRunContext();
	const use = {
		baseURL: context.baseURL,
		httpCredentials: context.httpCredentials,
		ignoreHTTPSErrors: context.env === "local",
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
	} satisfies PlaywrightTestConfig["use"];

	const projects =
		context.browsers === "all"
			? (
					await import("@atomicsmash/test-utils")
				).generateProjectsForAllBrowsers({ name: context.env, use })
			: [
					{
						name: `${context.env}__Chrome`,
						use: { ...devices["Desktop Chrome"], ...use },
					},
				];

	return {
		testDir: join(context.qaDir, "specs"),
		outputDir: join(context.resultsDir, "artifacts"),
		timeout: context.timeout,
		expect: { timeout: 10_000 },
		retries: 0,
		fullyParallel: true,
		forbidOnly: true,
		reporter: [
			[process.env.SMASH_QA_QUIET ? "null" : "list"],
			[fileURLToPath(new URL("./reporter.js", import.meta.url))],
		],
		projects,
	};
}
