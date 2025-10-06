import type { SCSSAliases, SmashConfig } from "./index.js";
import type { ExecException } from "node:child_process";
import type { PerformanceMeasure } from "node:perf_hooks";
import type { PackageJson } from "type-fest";
import { exec } from "node:child_process";
import { createRequire } from "node:module";
import { normalize, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { cosmiconfig } from "cosmiconfig";

const require = createRequire(import.meta.url);
export const packageJson = require("../package.json") as PackageJson;
if (packageJson.bin === undefined) {
	throw new Error("Script name is not defined.");
}
export const testCommand = `node ${resolve(`${import.meta.dirname}/../dist/cli.js`)}`;
if (!packageJson.version) {
	throw new Error("Package has no version number set.");
}
export const packageVersion = packageJson.version;

export async function execute(
	command: string,
	options: { debug: boolean } = { debug: false },
) {
	return new Promise<{
		error: ExecException | null;
		stdout: string;
		stderr: string;
	}>((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				if (options.debug) {
					console.error({ error, stdout, stderr });
				}
				// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- This is preferred in this instance
				reject({ error, stdout, stderr });
			}
			resolve({ error, stdout, stderr });
		});
	});
}

export function toCamelCase(text: string) {
	return text.replace(
		/^([A-Z])|[\s-_](\w)/g,
		function (_match, p1: string, p2: string) {
			if (p2) return p2.toUpperCase();
			return p1.toLowerCase();
		},
	);
}

export function convertMeasureToPrettyString(measure: PerformanceMeasure) {
	const duration = Number(measure.duration);
	if (duration < 1) {
		return `${duration * 1000}µs`;
	}
	if (duration < 999) {
		return `${Math.round(duration)}ms`;
	}
	const timeInSeconds = Number((duration / 1000).toFixed(2));
	if (timeInSeconds < 60) {
		return `${timeInSeconds}s`;
	}
	const minutes = Math.floor(timeInSeconds / 60);
	const seconds = Math.ceil(timeInSeconds % 60);
	return `${minutes}m ${seconds}s`;
}

export function startRunningMessage(message: string) {
	let $i = 3;
	process.stdout.write(`${message}${".".repeat($i)}\r`);
	$i++;
	if (typeof process.stdout.clearLine !== "undefined") {
		const interval = setInterval(() => {
			if ($i > 2) {
				$i = 0;
			}
			$i++;
			process.stdout.clearLine(0);
			process.stdout.cursorTo(0);
			process.stdout.write(`${message}${".".repeat($i)}\r`);
		}, 200);
		return async () => {
			if (interval) {
				clearInterval(interval);
				await new Promise<void>((resolve) => {
					process.stdout.clearLine(0, () => {
						resolve();
					});
				});
				await new Promise<void>((resolve) => {
					process.stdout.cursorTo(0, () => {
						resolve();
					});
				});
			}
		};
	}
	return async () => {
		/* do nothing */
	};
}

const getDefaultSCSSAliases = (themePath: string): SCSSAliases => ({
	importers: [
		{
			findFileUrl(url) {
				if (!url.startsWith("sitecss:")) return null;
				const pathname = url.substring(8);
				return pathToFileURL(
					`${resolve(process.cwd(), themePath, "src/styles")}${pathname.startsWith("/") ? pathname : `/${pathname}`}`,
				);
			},
		},
		{
			findFileUrl(url) {
				if (!url.startsWith("launchpad:")) return null;
				const pathname = url.substring(10);
				return pathToFileURL(
					`${resolve(process.cwd(), themePath, "../launchpad/src/styles")}${pathname.startsWith("/") ? pathname : `/${pathname}`}`,
				);
			},
		},
	],
});

export async function getSmashConfig() {
	const explorer = cosmiconfig("smash");
	const config = await explorer
		.load(resolve(process.cwd(), "smash.config.ts"))
		.then((result) => {
			if (!result || result.isEmpty) {
				throw new Error("Return default config.");
			}
			const config = result.config as unknown;
			if (isValidSmashConfig(config)) {
				return {
					scssAliases: getDefaultSCSSAliases(config.themePath),
					themeFolderName: config.projectName,
					...config,
					// Normalize and resolve paths to cwd.
					npmInstallPaths:
						config.npmInstallPaths?.map((path) => {
							return normalize(resolve(process.cwd(), path));
						}) ?? [],
					composerInstallPaths:
						config.composerInstallPaths?.map((path) => {
							return normalize(resolve(process.cwd(), path));
						}) ?? [],
					assetsOutputFolder: config.assetsOutputFolder
						? normalize(config.assetsOutputFolder)
						: "dist",
				} satisfies Required<SmashConfig>;
			}
			throw new Error("Return default config.");
		})
		.catch(async () => {
			const { themeName, themePath } = await import("dotenv")
				.then((dotenv) => {
					dotenv.config();
					const themeName =
						process.env.THEME_NAME ?? process.env.npm_package_config_theme_name;
					const themePath =
						process.env.THEME_PATH ?? process.env.npm_package_config_theme_path;
					return {
						themeName,
						themePath,
					};
				})
				.catch(() => {
					return {
						themeName: false as const,
						themePath: false as const,
					};
				});
			if (!themeName || !themePath) {
				return null;
			}
			console.warn(
				"Using env vars for theme name and path is deprecated and will be removed in a future version. Create a smash.config.ts file with the relevant properties in it instead.",
			);
			const defaultConfig: Required<SmashConfig> = {
				projectName: themeName,
				themePath,
				themeFolderName: themeName,
				assetsOutputFolder: "dist",
				npmInstallPaths: [],
				composerInstallPaths: [],
				scssAliases: getDefaultSCSSAliases(themePath),
			};
			return defaultConfig;
		});
	return config;
}

function isValidSmashConfig(config: unknown): config is SmashConfig {
	return (
		typeof config === "object" &&
		config !== null &&
		"themeName" in config &&
		typeof config.themeName === "string" &&
		"themePath" in config &&
		typeof config.themePath === "string"
	);
}
