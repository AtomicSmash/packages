import type { SCSSAliases, YargsInstance } from "../index.js";
import type { BlockMetaData } from "@atomicsmash/blocks-helpers";
import type { ObjectPattern } from "copy-webpack-plugin";
import type { AcceptedPlugin } from "postcss";
import type { Compiler, Configuration } from "webpack";
import type { ArgumentsCamelCase } from "yargs";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import {
	basename,
	dirname,
	extname,
	join,
	resolve as resolvePath,
	sep as pathSeparator,
} from "node:path";
import { pathToFileURL } from "node:url";
import { DatePHP } from "@atomicsmash/date-php";
import autoprefixer from "autoprefixer";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { cosmiconfig } from "cosmiconfig";
import cssnano from "cssnano";
import glob from "glob-promise";
import postcss from "postcss";
import postcssLoadConfig from "postcss-load-config";
import { compileStringAsync } from "sass";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import { tsImport } from "tsx/esm/api";
import webpack from "webpack";
import defaultConfig from "../external/wordpress.webpack.config.cjs";
import { getSmashConfig, toCamelCase } from "../utils.js";

const isProduction = process.env.NODE_ENV === "production";

export const command = "blocks";
export const describe =
	"A command to generate WordPress blocks from a src folder.";
export const builder = function (yargs: YargsInstance) {
	return yargs
		.options({
			in: {
				demandOption: true,
				string: true,
				normalize: true,
				description:
					"The directory where the WP blocks can be found. Relative to cwd.",
			},
			out: {
				demandOption: true,
				string: true,
				normalize: true,
				description:
					"The directory where the WP blocks will be output. Relative to cwd.",
			},
			tsConfigPath: {
				string: true,
				normalize: true,
				description:
					"The directory where the tsconfig file can be found. Relative to cwd. Defaults to the in folder.",
			},
			postcssConfigPath: {
				string: true,
				normalize: true,
				description:
					"The directory where the postcss config file can be found. Relative to cwd. Defaults to the in folder and then searches up the directory tree.",
			},
			watch: {
				boolean: true,
				default: false,
				description: "Watch the blocks in folder for changes and compile.",
			},
			excludeBlocks: {
				array: true,
				string: true,
				default: ["__TEMPLATE__"],
				description:
					"A list of the folder names of blocks to exclude from compilation.",
			},
			excludeRootFiles: {
				array: true,
				string: true,
				default: [] as string[],
				description:
					"A list of the root file names to exclude from compilation.",
			},
			alwaysCompileRootFiles: {
				boolean: true,
				default: false,
				description:
					"By default, we won't compile root files if no blocks are found, this allows you to override that setting.",
			},
			ignoreWarnings: {
				boolean: true,
				default: false,
				description:
					"If webpack has warnings, don't output them or change error code.",
			},
		})
		.example(
			"$0 blocks --watch --in src --out build --tsConfigPath tsconfig.json",
			"",
		);
};

export async function handler(
	args: ArgumentsCamelCase<Awaited<ReturnType<typeof builder>["argv"]>>,
) {
	const srcFolder = resolvePath(args.in);
	const distFolder = resolvePath(args.out);

	const tsConfigLocation = args.tsConfigPath ?? srcFolder;
	const postcssConfigLocation = args.postcssConfigPath ?? srcFolder;
	const excludeBlocks = args.excludeBlocks;
	const excludeRootFiles = args.excludeRootFiles;
	const shouldAlwaysCompileRootFiles = args.alwaysCompileRootFiles;
	const isWatch = args.watch;
	const shouldIgnoreWarnings = args.ignoreWarnings;

	await runCommand({
		srcFolder,
		distFolder,
		tsConfigLocation,
		postcssConfigLocation,
		excludeBlocks,
		excludeRootFiles,
		shouldAlwaysCompileRootFiles,
		isWatch,
		shouldIgnoreWarnings,
	});
}

async function runCommand({
	srcFolder,
	distFolder,
	tsConfigLocation,
	postcssConfigLocation,
	excludeBlocks,
	excludeRootFiles,
	shouldAlwaysCompileRootFiles,
	isWatch,
	shouldIgnoreWarnings,
}: {
	srcFolder: string;
	distFolder: string;
	tsConfigLocation: string;
	postcssConfigLocation: string;
	excludeBlocks: string[];
	excludeRootFiles: string[];
	shouldAlwaysCompileRootFiles: boolean;
	isWatch: boolean;
	shouldIgnoreWarnings: boolean;
}) {
	const blocks = await getBlockJsonFiles(srcFolder, excludeBlocks);
	const isNoBlocks = Object.keys(blocks).length === 0;

	const compiler = webpack({
		...defaultConfig,
		entry: async () => {
			const entryPoints = {
				...(isNoBlocks && !shouldAlwaysCompileRootFiles
					? {}
					: await getRootFileJSEntryPoints({ srcFolder, excludeRootFiles })),
				...getAllBlocksJSEntryPoints({
					srcFolder,
					blocks,
				}),
			};
			// TODO: improve this console output
			console.log({ entryPoints });
			console.log(
				`EntryPoints set at ${new DatePHP().format("jS F Y \\a\\t H:i:s")}`,
			);

			return entryPoints;
		},

		context: srcFolder,
		plugins: [
			...(defaultConfig.plugins?.filter((plugin) => {
				return ![
					"CopyPlugin", // CopyWebpackPlugin
				].includes(plugin?.constructor.name ?? "");
			}) ?? []),
			...(isNoBlocks
				? []
				: [
						new CopyWebpackPlugin({
							patterns: [...getCopyPatternsForBlocks(blocks, distFolder)],
						}),
					]),
			new CustomBlocksCSSHandler({
				blocks,
				srcFolder,
				distFolder,
				postcssConfigLocation,
			}),
			new BlockJsonAssetTransformer({ distFolder }),
		],
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
		node: { global: false },
	});

	if (isWatch) {
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
					if (stats.hasWarnings() && !shouldIgnoreWarnings) {
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
				if (stats.hasWarnings() && !shouldIgnoreWarnings) {
					console.warn(info.warnings);
					if (!stats.hasErrors()) {
						// Only change exit code if there's no errors.
						process.exitCode = 2;
					}
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

export async function getRootFileJSEntryPoints({
	srcFolder,
	excludeRootFiles,
}: {
	srcFolder: string;
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
			import: [srcFolder, fileNameAndExtension].join(pathSeparator),
			filename: `${entryName}${isProduction ? `.[contenthash]` : ""}.js`,
		};
	}
	return entryPoints;
}

export function getAllBlocksJSEntryPoints({
	srcFolder,
	blocks,
}: {
	srcFolder: string;
	blocks: Record<
		string,
		{
			blockFolder: string;
			blockJson: BlockJson;
		}
	>;
}) {
	const entryPoints: Configuration["entry"] = {};
	const blocksJsonObjects = Object.values(blocks);

	for (const { blockFolder, blockJson } of blocksJsonObjects) {
		const fields = getBlockJsonScriptFields(blockJson);
		if (!fields) {
			continue;
		}
		for (const value of Object.values(fields).flat()) {
			if ("string" !== typeof value || !value.startsWith("file:")) {
				continue;
			}
			// Removes the `file:` prefix.
			const filepath = join(blockFolder, value.replace("file:", ""));

			const entryName = filepath
				.replace(srcFolder, "")
				.replace(extname(filepath), "")
				.replace(/\\/g, "/")
				.split("/")
				.filter((string) => string !== "")
				.join("-");

			entryPoints[toCamelCase(entryName)] = {
				import: filepath,
				filename: `${filepath.replace(`${srcFolder}${pathSeparator}`, "").replace(extname(filepath), "")}${
					isProduction ? `.[contenthash]` : ""
				}.js`,
			};
		}
	}

	return entryPoints;
}

type BlockJson = BlockMetaData<never, never>;

export async function getBlockJsonFiles(
	srcFolder: string,
	excludeBlocks: string[],
) {
	const blockJsonFiles = await glob
		.promise(`${srcFolder.replaceAll(pathSeparator, "/")}/**/block.json.ts`, {
			ignore: excludeBlocks.map(
				(blockName) =>
					`${srcFolder.replaceAll(pathSeparator, "/")}/**/${blockName}/block.json.ts`,
			),
		})
		.then((paths) => paths.map((path) => path.replaceAll("/", pathSeparator)));
	const blocks: Record<string, { blockFolder: string; blockJson: BlockJson }> =
		{};

	for (const blockJsonFile of blockJsonFiles) {
		const blockJson = await tsImport(
			`${blockJsonFile.split(pathSeparator).shift()?.includes(":") ? `file:///` : ""}${blockJsonFile}`,
			import.meta.url,
		).then(
			(loadedFile: {
				blockJson: BlockJson;
				default: BlockJson | { blockJson: BlockJson; default: BlockJson };
			}) => {
				return loadedFile.blockJson;
			},
		);
		const blockName = blockJsonFile
			.replace(`${pathSeparator}block.json.ts`, "")
			.split(pathSeparator)
			.pop() as string;
		blocks[blockName] = { blockFolder: dirname(blockJsonFile), blockJson };
	}

	return blocks;
}

export function getBlockJsonScriptFields(blockJson: BlockJson) {
	const scriptFields = ["viewScript", "script", "editorScript"] as const;
	let result: Partial<Pick<BlockJson, (typeof scriptFields)[number]>> | null =
		null;
	for (const field of scriptFields) {
		if (Object.hasOwn(blockJson, field)) {
			result ??= {};
			result[field] = blockJson[field];
		}
	}
	return result;
}

export function getBlockJsonStyleFields(blockJson: BlockJson) {
	const styleFields = ["viewStyle", "style", "editorStyle"] as const;
	let result: Partial<Pick<BlockJson, (typeof styleFields)[number]>> | null =
		null;
	for (const field of styleFields) {
		if (Object.hasOwn(blockJson, field)) {
			result ??= {};
			result[field] = blockJson[field];
		}
	}
	return result;
}

async function getSassOptions(srcFolder: string) {
	const smashConfig = await getSmashConfig();
	if (smashConfig) {
		return smashConfig.scssAliases;
	}

	// Legacy fallback.
	const explorer = cosmiconfig("scssAliases");
	const config = await explorer
		.load(resolvePath(process.cwd(), "scssAliases.config.ts"))
		.then((result) => {
			if (!result || result.isEmpty) {
				throw new Error("Return default config.");
			}
			const config = result.config as unknown;
			if (
				typeof config === "object" &&
				config !== null &&
				Object.keys(config).length <= 2
			) {
				if (
					Object.keys(config).length === 2 &&
					"importers" in config &&
					"loadPaths" in config
				) {
					return config as SCSSAliases;
				}
				if (
					Object.keys(config).length === 1 &&
					("importers" in config || "loadPaths" in config)
				) {
					return config as SCSSAliases;
				}
			}
			throw new Error("Return default config.");
		})
		.catch(() => {
			const defaultConfig: SCSSAliases = {
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
					{
						findFileUrl(url) {
							if (!url.startsWith("launchpad:")) return null;
							const pathname = url.substring(10);
							return pathToFileURL(
								`${resolvePath(process.cwd(), "public/wp-content/themes/launchpad/src/styles")}${pathname.startsWith("/") ? pathname : `/${pathname}`}`,
							);
						},
					},
				],
			};
			return defaultConfig;
		});
	return config;
}

function getCopyPatternsForBlocks(
	blocks: Record<
		string,
		{
			blockFolder: string;
			blockJson: BlockJson;
		}
	>,
	distFolder: string,
) {
	const blocksCopyPatterns: ObjectPattern[] = [];
	const blocksEntries = Object.entries(blocks);
	for (const [blockName, { blockFolder, blockJson }] of blocksEntries) {
		// Generate block.json file.
		blocksCopyPatterns.push({
			from: `${blockFolder}/block.json.ts`,
			to: `${distFolder}/${blockName}/block.json`,
			noErrorOnMissing: true,
			transform: {
				transformer() {
					return JSON.stringify(blockJson, null, 2);
				},
				cache: true,
			},
		});
		// Copy render.php file
		blocksCopyPatterns.push({
			from: `${blockFolder}/render.php`,
			to: `${distFolder}/${blockName}/render.php`,
			noErrorOnMissing: true,
		});
		// Copy index.php file
		blocksCopyPatterns.push({
			from: `${blockFolder}/index.php`,
			to: `${distFolder}/${blockName}/index.php`,
			noErrorOnMissing: true,
		});
	}

	return blocksCopyPatterns;
}

/**
 * This class handles CSS compilation for blocks.
 */
class CustomBlocksCSSHandler {
	blocks: Record<
		string,
		{
			blockFolder: string;
			blockJson: BlockJson;
		}
	>;
	distFolder: string;
	srcFolder: string;
	postcssConfigLocation: string;

	constructor({
		blocks,
		srcFolder,
		distFolder,
		postcssConfigLocation,
	}: {
		blocks: Record<
			string,
			{
				blockFolder: string;
				blockJson: BlockJson;
			}
		>;
		srcFolder: string;
		distFolder: string;
		postcssConfigLocation: string;
	}) {
		this.blocks = blocks;
		this.srcFolder = srcFolder;
		this.distFolder = distFolder;
		this.postcssConfigLocation = postcssConfigLocation;
	}
	apply(compiler: Compiler) {
		// RawSource is one of the "sources" classes that should be used
		// to represent asset sources in compilation.
		const { RawSource } = webpack.sources;

		compiler.hooks.thisCompilation.tap(
			{
				name: "CustomBlocksCSSHandler",
				stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
			},
			(compilation) => {
				compilation.hooks.processAssets.tapPromise(
					"CustomBlocksCSSHandler",
					async () => {
						const blocksJsonObjects = Object.values(this.blocks);

						for (const { blockFolder, blockJson } of blocksJsonObjects) {
							const fields = getBlockJsonStyleFields(blockJson);
							if (!fields) {
								continue;
							}
							for (const value of Object.values(fields).flat()) {
								if ("string" !== typeof value || !value.startsWith("file:")) {
									continue;
								}
								// Removes the `file:` prefix.
								const filepath = join(blockFolder, value.replace("file:", ""));
								const fileNameWithExtension = basename(filepath);
								let css = readFileSync(filepath, "utf8");
								let newFileNameWithExtension = fileNameWithExtension;
								if (extname(fileNameWithExtension) === ".scss") {
									css = await compileStringAsync(
										css,
										await getSassOptions(this.srcFolder),
									).then((result) => result.css);
									newFileNameWithExtension = newFileNameWithExtension.replace(
										".scss",
										".css",
									);
								}
								let newMatch = filepath.replace(`${this.srcFolder}/`, "");
								if (isProduction) {
									const fileBuffer = readFileSync(filepath);
									const contentHash = crypto.createHash("shake256", {
										outputLength: 10,
									});
									contentHash.update(fileBuffer);
									newFileNameWithExtension = `${fileNameWithExtension.split(".")[0]}.${contentHash.digest("hex")}.css`;
								}
								newMatch = newMatch.replace(
									fileNameWithExtension,
									newFileNameWithExtension,
								);
								const { plugins, options } = await postcssLoadConfig(
									{},
									this.postcssConfigLocation,
								)
									.then(({ plugins, options }) => {
										options.from = filepath;
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
													from: filepath,
													to: newMatch,
												},
											};
										}
										throw error;
									});
								const result = await postcss(plugins).process(css, options);
								compilation.emitAsset(newMatch, new RawSource(result.css));
								if (result.map) {
									compilation.emitAsset(
										`${newMatch}.map`,
										new RawSource(result.map.toString()),
									);
								}
							}
						}
					},
				);
			},
		);
	}
}

class BlockJsonAssetTransformer {
	distFolder: string;
	constructor({ distFolder }: { distFolder: string }) {
		this.distFolder = distFolder;
	}
	apply(compiler: Compiler) {
		compiler.hooks.afterEmit.tapPromise(
			"BlockJsonAssetTransformer",
			async (compilation) => {
				const blockJsonFiles = Object.keys(compilation.assets).filter((asset) =>
					asset.endsWith("block.json"),
				);
				for (const blockJsonFile of blockJsonFiles) {
					await readFile(`${this.distFolder}/${blockJsonFile}`, "utf-8")
						.then((data) => {
							return JSON.parse(data) as BlockJson;
						})
						.then((json) => {
							const blockName = blockJsonFile.replace("/block.json", "");
							[
								getBlockJsonScriptFields(json),
								getBlockJsonStyleFields(json),
							].forEach((fields) => {
								if (fields === null) {
									return;
								}
								(
									Object.entries(fields) as [
										(
											| "viewScript"
											| "script"
											| "editorScript"
											| "viewStyle"
											| "style"
											| "editorStyle"
										),
										string | string[],
									][]
								).forEach(([fieldName, value]) => {
									const values = [value].flat(1);
									json[fieldName] = values.map((srcFilePath) => {
										const fileName = srcFilePath
											.replace("file:./", "")
											.replace(extname(srcFilePath), "");
										const hashedAsset = Object.keys(compilation.assets).find(
											(asset) => {
												return (
													asset.startsWith(`${blockName}/${fileName}`) &&
													!asset.endsWith(".php")
												);
											},
										);
										return hashedAsset
											? `file:./${hashedAsset.replace(`${blockName}/`, "")}`
											: srcFilePath;
									});
								});
							});
							return json;
						})
						.then(async (transformedJson) => {
							await writeFile(
								`${this.distFolder}/${blockJsonFile}`,
								JSON.stringify(transformedJson, undefined, 2),
								"utf-8",
							);
						});
				}
			},
		);
	}
}
