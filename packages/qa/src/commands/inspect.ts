import type { Environment } from "../types.js";
import type { ArgumentsCamelCase, Argv } from "yargs";
import { getSmashConfig } from "@atomicsmash/smash-config";
import { ENVIRONMENTS, resolveEnvironment } from "../environment.js";
import { findServerErrorMarkers } from "../runtime/classify.js";
import { createSessions } from "../session.js";

type InspectArguments = {
	path: string;
	env: Environment;
	as?: string;
	json: boolean;
};

export const command = "inspect <path>";
export const describe =
	"Print a page's accessibility tree so journeys can target real roles and names.";

/**
 * Define the inspect command's arguments.
 */
export function builder(yargs: Argv) {
	return yargs
		.positional("path", {
			type: "string",
			demandOption: true,
			describe: "Path relative to the environment's base URL, e.g. /checkout",
		})
		.option("env", {
			alias: "e",
			choices: ENVIRONMENTS,
			default: "local",
			describe: "Environment from smash.config.ts to inspect",
		})
		.option("as", {
			type: "string",
			describe:
				"WordPress role to view the page as, logged in as the smash-qa-<role> user",
		})
		.option("json", {
			type: "boolean",
			default: false,
			describe: "Print the result as JSON",
		});
}

/**
 * Open a page in Chromium, logged in as a role if asked, and gather its status, title and aria snapshot.
 */
async function inspectPage(args: InspectArguments) {
	const { chromium } = await import("@playwright/test");
	const smashConfig = await getSmashConfig(2);
	const { baseURL, httpCredentials } = resolveEnvironment(
		args.env,
		smashConfig,
	);
	const cookies = args.as
		? ((await createSessions(args.env, [args.as], smashConfig, baseURL))[
				args.as
			] ?? [])
		: [];
	const browser = await chromium.launch();
	try {
		const page = await browser.newPage({
			baseURL,
			httpCredentials,
			ignoreHTTPSErrors: args.env === "local",
		});
		await page.context().addCookies(cookies);
		const consoleErrors: string[] = [];
		page.on("console", (message) => {
			if (message.type() === "error") consoleErrors.push(message.text());
		});
		const response = await page.goto(args.path);
		return {
			url: page.url(),
			status: response?.status(),
			title: await page.title(),
			consoleErrors,
			serverErrorMarkers: findServerErrorMarkers(await page.content()),
			ariaSnapshot: await page.locator("body").ariaSnapshot(),
		};
	} finally {
		await browser.close();
	}
}

/**
 * Print a page's status, title and aria snapshot, as text or JSON.
 */
export async function handler(args: ArgumentsCamelCase<InspectArguments>) {
	try {
		const result = await inspectPage(args);
		if (args.json) {
			console.log(JSON.stringify(result, null, "\t"));
			return;
		}
		console.log(
			[
				`URL: ${result.url}`,
				`Status: ${String(result.status)}`,
				`Title: ${result.title}`,
				...result.serverErrorMarkers.map((marker) => `Server error: ${marker}`),
				...result.consoleErrors.map((error) => `Console error: ${error}`),
				"",
				result.ariaSnapshot,
			].join("\n"),
		);
	} catch (error) {
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 2;
	}
}
