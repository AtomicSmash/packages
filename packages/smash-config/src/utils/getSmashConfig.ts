import type { SCSSAliases, SmashConfig } from "../types.js";

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

export default async function getSmashConfig(): Promise<Required<SmashConfig> | null> {
	const explorer = cosmiconfig("smash");
	const config = await explorer
		.load(resolve(process.cwd(), "smash.config.ts"))
		.then((result) => {
			if (!result || result.isEmpty) {
				throw new Error("Return default config.");
			}
			const config = result.config as unknown;
			if (isValidSmashConfig(config)) {
				const fullConfig: Required<SmashConfig> = {
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
				staging: {
					url: "",
					dbPrefix: "",
					webRoot: "",
					ssh: {
						username: "",
						host: "",
						port: "",
					},
					httpAuth: {
						username: "",
						password: "",
					},
				},
			};
			return defaultConfig;
		});
	return config;
}

function isValidSmashConfig(config: unknown): config is SmashConfig {
	return (
		typeof config === "object" &&
		config !== null &&
		"projectName" in config &&
		typeof config.projectName === "string" &&
		"themePath" in config &&
		typeof config.themePath === "string"
	);
}
