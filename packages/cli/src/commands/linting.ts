import type { SmashConfig } from "../index.js";
import type { ESLint } from "eslint";
import { exec } from "node:child_process";
import { performance } from "node:perf_hooks";
import { promisify } from "node:util";
import {
	convertMeasureToPrettyString,
	getSmashConfig,
	startRunningMessage,
} from "../utils.js";

export const command = "lint";
export const describe =
	"Run the lint commands in the project and provide a manageable output and baseline.";
export async function handler() {
	const execute = promisify(exec);
	const smashConfig = await getSmashConfig();
	const { lintingBaseline } = smashConfig ?? {
		lintingBaseline: {} as NonNullable<SmashConfig["lintingBaseline"]>,
	};
	performance.mark("Start");
	const stopRunningMessage = startRunningMessage("Running linting");
	await Promise.allSettled([
		execute("npm run lint:eslint -- --format=json")
			.then(({ stdout }) => {
				const results = JSON.parse(stdout) as unknown as ESLint.LintResult;
				let exitCode = 0;
				const baseline =
					"eslint" in lintingBaseline
						? lintingBaseline.eslint!
						: {
								errors: 0,
								fixableErrors: 0,
								warnings: 0,
								fixableWarnings: 0,
							};
				if (
					baseline.errors > results.errorCount ||
					baseline.fixableErrors > results.fixableErrorCount ||
					baseline.warnings > results.warningCount ||
					baseline.fixableWarnings > results.fixableWarningCount
				) {
					exitCode = 1;
				}
				return {
					tool: "ESLint",
					errors: results.errorCount,
					fixableErrors: results.fixableErrorCount,
					warnings: results.warningCount,
					fixableWarnings: results.fixableWarningCount,
					time: convertMeasureToPrettyString(
						performance.measure("eslint", "Start"),
					),
					exitCode,
				};
			})
			.catch((error) => {
				console.error(error);
				throw new Error(
					"Failed to run the ESLint linter. Please make sure the npm script is `npm run lint:eslint`.",
				);
			}),
	])
		.then(async (results) => {
			await stopRunningMessage();
			if (results.some((result) => result.status === "rejected")) {
				process.exitCode = 1;
				console.error("Setup failed with the following errors:\n");
				console.error(
					results
						.filter((result) => result.status === "rejected")
						.map((result) => {
							return `- ${result.reason}`;
						})
						.join(`\n`),
				);
			} else {
				const successResults = (
					results as PromiseFulfilledResult<{
						tool: string;
						errors: number;
						fixableErrors: number;
						warnings: number;
						fixableWarnings: number;
						time: string;
						exitCode: number;
					}>[]
				).map((result) => result.value);
				const exitCode =
					successResults.find((result) => result.exitCode > 0)?.exitCode ?? 0;
				process.exitCode = exitCode;
				(exitCode > 0 ? console.log : console.error)(
					`Linting result:\n${successResults
						.map((successResult) => {
							return `${successResult.tool}: ${successResult.errors} errors${successResult.fixableErrors ? ` (${successResult.fixableErrors} fixable)` : ""}, ${successResult.warnings} warnings${successResult.fixableWarnings ? ` (${successResult.fixableWarnings} fixable)` : ""}. Completed in ${successResult.time}.`;
						})
						.join(`\n`)}`,
				);
			}
		})
		.catch((error) => {
			console.error(error);
			process.exitCode = 1;
		});
}
