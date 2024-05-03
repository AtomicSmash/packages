import type { Compiler, Configuration } from "webpack";
import crypto from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { readdir, mkdir } from "node:fs/promises";
import {
	basename,
	dirname,
	extname,
	join,
	resolve as resolvePath,
} from "node:path";
import { pathToFileURL } from "node:url";
import DependencyExtractionWebpackPlugin from "@wordpress/dependency-extraction-webpack-plugin";
import defaultConfig from "@wordpress/scripts/config/webpack.config.js";
import { getBlockJsonScriptFields } from "@wordpress/scripts/utils/index.js";
import autoprefixer from "autoprefixer";
import CopyWebpackPlugin from "copy-webpack-plugin";
import cssnano from "cssnano";
import { deleteAsync } from "del";
import glob from "glob-promise";
import postcss, { AcceptedPlugin } from "postcss";
import postcssLoadConfig from "postcss-load-config";
import { compileStringAsync } from "sass";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import { register } from "tsx/esm/api";
import webpack from "webpack";
import { hasHelpFlag, interpretFlag, toCamelCase } from "../utils.js";

const isProduction = process.env.NODE_ENV === "production";

export const blocksHelpMessage = `
  Atomic Smash CLI - Blocks command.

  A command to generate WordPress blocks from a src folder.

  Options:
    --in                     The directory where the WP blocks can be found. Relative to cwd.
    --out                    The directory where the WP blocks will be output. Relative to cwd.
    --tsConfigPath           (optional) The directory where the tsconfig file can be found. Relative to cwd. Defaults to the in folder.
    --postcssConfigPath      (optional) The directory where the postcss config file can be found. Relative to cwd. Defaults to the in folder and then searches up the directory tree.
    --watch                  (optional) Watch the blocks in folder for changes and compile.
    --excludeBlocks          (optional) A comma separated list of the folder names of blocks to exclude from compilation. Defaults to "__TEMPLATE__".
    --excludeRootFiles       (optional) A comma separated list of the root file names to exclude from compilation. Nothing is excluded by default.
    --alwaysCompileRootFiles (optional) By default, we won't compile root files if no blocks are found, this allows you to override that setting. Defaults to false.

  Example usage:
    $ smash-cli blocks --watch --in src --out build --tsConfigPath tsconfig.json
`;

export default function blocks(args: string[]) {
	if (hasHelpFlag(args)) {
		console.log(blocksHelpMessage);
		return;
	}
	const inFlag = interpretFlag(args, "--in");
	if (!inFlag.isPresent || inFlag.value === null) {
		throw new Error("You need to provide a value for the --in flag.");
	}
	const outFlag = interpretFlag(args, "--out");
	if (!outFlag.isPresent || outFlag.value === null) {
		throw new Error("You need to provide a value for the --out flag.");
	}
	const srcFolder = resolvePath(inFlag.value);
	const distFolder = resolvePath(outFlag.value);

	const tsConfigLocation =
		interpretFlag(args, "--tsConfigPath").value ?? srcFolder;
	const postcssConfigLocation =
		interpretFlag(args, "--postcssConfigPath").value ?? srcFolder;
	const excludeBlocks = interpretFlag(args, "--excludeBlocks", "list")
		.value ?? ["__TEMPLATE__"];
	const excludeRootFiles =
		interpretFlag(args, "--excludeRootFiles", "list").value ?? [];
	const shouldAlwaysCompileRootFiles = interpretFlag(
		args,
		"--alwaysCompileRootFiles",
		"boolean",
	).value;

	const plugins = [
		...((defaultConfig as Configuration).plugins?.filter((plugin) => {
			return ![
				"DependencyExtractionWebpackPlugin",
				"CopyPlugin", // CopyWebpackPlugin
			].includes(plugin?.constructor.name ?? "");
		}) ?? []),
		new DependencyExtractionWebpackPlugin({
			combineAssets: true,
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: `${srcFolder}/**/block.json.ts`,
					to: "[path]block.json",
					noErrorOnMissing: true,
					globOptions: {
						ignore: excludeBlocks.map(
							(blockName) => `${srcFolder}/${blockName}/**/*`,
						),
					},
					transform: {
						async transformer(_content, path): Promise<string> {
							const loadedFile = (await import(path)) as {
								default: Record<string, unknown>;
							};
							const blockJson = loadedFile.default;
							return JSON.stringify(blockJson, null, 2);
						},
						cache: true,
					},
				},
				{
					from: `${srcFolder}/**/render.php`,
					noErrorOnMissing: true,
					globOptions: {
						ignore: excludeBlocks.map(
							(blockName) => `${srcFolder}/${blockName}/**/*`,
						),
					},
				},
			],
		}),
		{
			apply: (compiler: Compiler) => {
				compiler.hooks.afterEmit.tapPromise(
					"Build CSS and copy to test area",
					async () => {
						await glob
							.promise(`${srcFolder}/**/*.{css,scss}`, {
								ignore: excludeBlocks.map(
									(blockName) => `${srcFolder}/${blockName}/**/*`,
								),
							})
							.then(async (globMatches) => {
								const currentCSSFileNames = [];
								for (const match of globMatches) {
									const fileNameWithExtension = match.split("/").pop();
									if (!fileNameWithExtension) {
										console.error(`Failed to get filename of ${match}`);
										continue;
									}
									let css = readFileSync(match, "utf8");
									if (fileNameWithExtension.split(".").pop() === "scss") {
										css = await compileStringAsync(css, {
											importers: [
												{
													findFileUrl(url) {
														if (!url.startsWith("sitecss:")) return null;
														const pathname = url.substring(8);
														return pathToFileURL(
															`${resolvePath(srcFolder, "../css")}${pathname.startsWith("/") ? pathname : `/${pathname}`}`,
														);
													},
												},
											],
										}).then((result) => result.css);
									}
									let newFileNameWithExtension = fileNameWithExtension;
									let newMatch = match.replace(srcFolder, distFolder);
									if (isProduction) {
										const fileBuffer = readFileSync(match);
										const contentHash = crypto.createHash("shake256", {
											outputLength: 10,
										});
										contentHash.update(fileBuffer);
										newFileNameWithExtension = `${fileNameWithExtension.split(".")[0]}.${contentHash.digest("hex")}.css`;
										newMatch = newMatch.replace(
											fileNameWithExtension,
											newFileNameWithExtension,
										);
										currentCSSFileNames.push(`!${newMatch}`);
									}
									const { plugins, options } = await postcssLoadConfig(
										{},
										postcssConfigLocation,
									)
										.then(({ plugins, options }) => {
											options.from = match;
											options.to = newMatch;
											return { plugins, options };
										})
										.catch((error: unknown) => {
											if (
												error &&
												error instanceof Error &&
												error.message.startsWith("No PostCSS Config found")
											) {
												const postCSSPlugins: AcceptedPlugin[] = [autoprefixer];
												if (isProduction) {
													postCSSPlugins.push(cssnano({ preset: "default" }));
												}
												return {
													plugins: postCSSPlugins,
													options: {
														from: match,
														to: newMatch,
													},
												};
											}
											throw error;
										});
									await postcss(plugins)
										.process(css, options)
										.then(async (result) => {
											await mkdir(newMatch.replace(basename(newMatch), ""), {
												recursive: true,
											}).then(() => {
												writeFileSync(newMatch, result.css);
												if (result.map) {
													writeFileSync(
														`${newMatch}.map`,
														result.map.toString(),
													);
												}
											});
										});
								}
								deleteAsync([
									`${distFolder}/**/*.css`,
									...currentCSSFileNames,
								]).catch((error) => {
									console.log(error);
								});
							})
							.catch((error) => {
								console.error(error);
								throw error;
							});
					},
				);
			},
		},
	] satisfies Configuration["plugins"];

	const compiler = webpack({
		...(defaultConfig as Configuration),
		entry: () =>
			getAllBlocksJSEntryPoints({
				srcFolder,
				shouldAlwaysCompileRootFiles,
				excludeBlocks,
				excludeRootFiles,
			}),
		context: srcFolder,
		plugins: plugins,
		output: {
			path: distFolder,
			clean: true,
		},
		resolve: {
			plugins: [
				new TsconfigPathsPlugin({
					configFile: tsConfigLocation,
				}),
			],
			extensions: [".ts", ".js", ".tsx", ".jsx"],
		},
		mode: isProduction ? "production" : "development",
	});

	if (args.find((value) => value === "--watch")) {
		const watching = compiler.watch(
			{
				// Example
				aggregateTimeout: 300,
				poll: undefined,
			},
			(error, stats) => {
				if (error) {
					console.error(error.stack ?? error);
					process.exitCode = 1;
					watching.close((closeError) => {
						console.error(closeError);
					});
				} else if (stats) {
					const info = stats.toJson();
					if (stats.hasErrors()) {
						console.error(info.errors);
					}
					if (stats.hasWarnings()) {
						console.warn(info.warnings);
					}
				}
			},
		);
		process.on("SIGINT", function () {
			watching.close((closeError) => {
				console.error(closeError);
			});
		});
	} else {
		compiler.run((error, stats) => {
			if (error) {
				console.error(error);
				process.exitCode = 1;
			} else if (stats) {
				const info = stats.toJson();
				if (stats.hasErrors()) {
					console.error(info.errors);
					process.exitCode = 1;
				}
				if (stats.hasWarnings()) {
					console.warn(info.warnings);
					process.exitCode = 2;
				}
			}

			compiler.close((closeError) => {
				if (closeError) {
					process.exitCode = 1;
				}
			});
		});
	}
}

async function getAllBlocksJSEntryPoints({
	srcFolder,
	shouldAlwaysCompileRootFiles,
	excludeBlocks,
	excludeRootFiles,
}: {
	srcFolder: string;
	shouldAlwaysCompileRootFiles: boolean;
	excludeBlocks: string[];
	excludeRootFiles: string[];
}) {
	const entryPoints: Configuration["entry"] = {};
	const rootFiles = await readdir(srcFolder, {
		withFileTypes: true,
	}).then((srcDirFiles) => {
		return srcDirFiles
			.filter((dirent) => dirent.isFile())
			.map((dirent) => dirent.name);
	});
	for (const fileNameAndExtension of rootFiles) {
		const [entryName, extension] = fileNameAndExtension.split(".", 2) as [
			string,
			string,
		];
		if (
			excludeRootFiles.includes(entryName) ||
			excludeRootFiles.includes(fileNameAndExtension)
		) {
			continue;
		}
		if (entryName === undefined || extension === undefined) {
			console.log(
				`Failed to process ${fileNameAndExtension}, continuing anyway.`,
			);
			continue;
		}
		if (!["ts", "js", "tsx", "jsx"].includes(extension)) {
			continue;
		}
		entryPoints[toCamelCase(entryName)] = {
			import: `${srcFolder}/${fileNameAndExtension}`,
			filename: `${entryName}${isProduction ? `.[contenthash]` : ""}.js`,
		};
	}

	const blockJsonFiles = await glob.promise(`${srcFolder}/**/block.json.ts`, {
		ignore: excludeBlocks.map(
			(blockName) => `${srcFolder}/**/${blockName}/block.json.ts`,
		),
	});
	if (blockJsonFiles.length === 0 && !shouldAlwaysCompileRootFiles) {
		// If there are no blocks, don't compile root files, unless the flag is present.
		console.log({ entryPoints: {} });
		return {};
	}
	// Allow imports of Typescript files via tsx.
	const unregister = register();
	for (const blockJsonFile of blockJsonFiles) {
		const blockJson = await import(blockJsonFile).then((loadedFile) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			return loadedFile.default as Record<string, unknown>;
		});
		const fields = getBlockJsonScriptFields(blockJson);
		if (!fields) {
			continue;
		}
		for (const value of Object.values(fields).flat()) {
			if ("string" !== typeof value || !value.startsWith("file:")) {
				continue;
			}
			// Removes the `file:` prefix.
			const filepath = join(dirname(blockJsonFile), value.replace("file:", ""));

			const entryName = filepath
				.replace(srcFolder, "")
				.replace(extname(filepath), "")
				.replace(/\\/g, "/")
				.split("/")
				.filter((string) => string !== "")
				.join("-");

			entryPoints[toCamelCase(entryName)] = {
				import: filepath,
				filename: `${filepath.replace(srcFolder, "").replace(extname(filepath), "")}${
					isProduction ? `.[contenthash]` : ""
				}.js`,
			};
		}
	}
	// Disallow imports of Typescript files via tsx.
	await unregister();

	// eslint-disable-next-line no-console
	console.log({ entryPoints });
	return entryPoints;
}
