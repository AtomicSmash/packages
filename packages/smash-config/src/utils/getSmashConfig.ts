import type {
	SCSSAliases,
	SmashConfigV1,
	SmashConfigV2,
	SmashConfigV1Resolved,
	SmashConfigV2Resolved,
} from "../types.js";
import { normaliseStagingURL } from "./normaliseStagingURL.js";
import { normalize, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { cosmiconfig } from "cosmiconfig";

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

export async function getSmashConfig<MinVersion extends 1 | 2>(
	minVersion?: MinVersion,
) {
	const explorer = cosmiconfig("smash");
	const config = await explorer
		.load(resolve(process.cwd(), "smash.config.ts"))
		.then((result) => {
			if (!result || result.isEmpty) {
				throw new Error(
					"Failed to get config. Please make sure smash.config.ts exists and exports a valid smash config configuration object.",
				);
			}
			const config = result.config as unknown;
			if (isValidSmashConfigV2(config)) {
				const fullConfig: SmashConfigV2Resolved = {
					scssAliases: getDefaultSCSSAliases(config.themePath),
					themeFolderName: config.projectName,
					uploadsPath: `public/wp-content/uploads`,
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
					staging: {
						uploadsPath: config.uploadsPath ?? `public/wp-content/uploads`,
						dbPrefix: "wp_",
						...config.staging,
						url: normaliseStagingURL(config.staging.url),
					},
					cli: {
						...config.cli,
						pullMedia: {
							monthsToPull: -1,
							...config.cli?.pullMedia,
						},
					},
				};
				return fullConfig;
			}
			if (isValidSmashConfigV1(config)) {
				const fullConfig: SmashConfigV1Resolved = {
					version: 1,
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
				};
				return fullConfig;
			}
			throw new Error(
				"Failed to get valid config. Please check that your smash.config.ts exports a valid smash config configuration object.",
			);
		});
	if (minVersion && config.version < minVersion) {
		throw new Error(
			`A smash config was found but it is not up to date. Please update to at least version ${minVersion.toString()}.`,
		);
	}
	return config as MinVersion extends 2
		? SmashConfigV2Resolved
		: SmashConfigV2Resolved | SmashConfigV1Resolved;
}

function isValidSmashConfigV1(config: unknown): config is SmashConfigV1 {
	return (
		typeof config === "object" &&
		config !== null &&
		"projectName" in config &&
		typeof config.projectName === "string" &&
		"themePath" in config &&
		typeof config.themePath === "string"
	);
}
function isValidSmashConfigV2(config: unknown): config is SmashConfigV2 {
	return (
		typeof config === "object" &&
		config !== null &&
		"version" in config &&
		config.version === 2 &&
		"projectName" in config &&
		typeof config.projectName === "string" &&
		"themePath" in config &&
		typeof config.themePath === "string"
	);
}
