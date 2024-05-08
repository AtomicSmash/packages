import type { BlockMetaData } from "@atomicsmash/blocks-helpers";
import type { ObjectPattern } from "copy-webpack-plugin";
import type { AcceptedPlugin } from "postcss";
import type { StringOptions } from "sass";
import type { Compiler, Configuration } from "webpack";
import crypto from "node:crypto";
import { readFileSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
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
import autoprefixer from "autoprefixer";
import CopyWebpackPlugin from "copy-webpack-plugin";
import cssnano from "cssnano";
import glob from "glob-promise";
import postcss from "postcss";
import postcssLoadConfig from "postcss-load-config";
import { compileStringAsync } from "sass";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import { tsImport } from "tsx/esm/api";
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
		--watch                  (optional) Run compiler in watch mode. Default to false.

  Example usage:
    $ smash-cli blocks --watch --in src --out build --tsConfigPath tsconfig.json
`;

export default async function blocks(args: string[]) {
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
	const isWatch = interpretFlag(args, "--watch", "boolean").value;

	await runCommand({
		srcFolder,
		distFolder,
		tsConfigLocation,
		postcssConfigLocation,
		excludeBlocks,
		excludeRootFiles,
		shouldAlwaysCompileRootFiles,
		isWatch,
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
}: {
	srcFolder: string;
	distFolder: string;
	tsConfigLocation: string;
	postcssConfigLocation: string;
	excludeBlocks: string[];
	excludeRootFiles: string[];
	shouldAlwaysCompileRootFiles: boolean;
	isWatch: boolean;
}) {
	const blocks = await getBlockJsonFiles(srcFolder, excludeBlocks);
	const isNoBlocks = Object.keys(blocks).length === 0;

	const compiler = webpack({
		...(defaultConfig as Configuration),
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
			// eslint-disable-next-line no-console
			console.log({ entryPoints });
			return entryPoints;
		},

		context: srcFolder,
		plugins: [
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
				patterns: [...getCopyPatternsForBlocks(blocks, distFolder)],
			}),
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

async function getRootFileJSEntryPoints({
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
			import: `${srcFolder}/${fileNameAndExtension}`,
			filename: `${entryName}${isProduction ? `.[contenthash]` : ""}.js`,
		};
	}
	return entryPoints;
}

function getAllBlocksJSEntryPoints({
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
				filename: `${filepath.replace(`${srcFolder}/`, "").replace(extname(filepath), "")}${
					isProduction ? `.[contenthash]` : ""
				}.js`,
			};
		}
	}

	return entryPoints;
}

type BlockJson = BlockMetaData<never, never>;

async function getBlockJsonFiles(srcFolder: string, excludeBlocks: string[]) {
	const blockJsonFiles = await glob.promise(`${srcFolder}/**/block.json.ts`, {
		ignore: excludeBlocks.map(
			(blockName) => `${srcFolder}/**/${blockName}/block.json.ts`,
		),
	});
	const blocks: Record<string, { blockFolder: string; blockJson: BlockJson }> =
		{};

	for (const blockJsonFile of blockJsonFiles) {
		const blockJson = await tsImport(blockJsonFile, import.meta.url).then(
			(loadedFile) => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				return loadedFile.default as BlockJson;
			},
		);
		const blockName = blockJsonFile
			.replace("/block.json.ts", "")
			.split("/")
			.pop() as string;
		blocks[blockName] = { blockFolder: dirname(blockJsonFile), blockJson };
	}

	return blocks;
}

function getBlockJsonScriptFields(blockJson: BlockJson) {
	const scriptFields = ["viewScript", "script", "editorScript"] as const;
	let result: Partial<Pick<BlockJson, (typeof scriptFields)[number]>> | null =
		null;
	for (const field of scriptFields) {
		if (Object.hasOwn(blockJson, field)) {
			if (result === null) {
				result = {};
			}
			result[field] = blockJson[field];
		}
	}
	return result;
}

function getBlockJsonStyleFields(blockJson: BlockJson) {
	const styleFields = ["viewStyle", "style", "editorStyle"] as const;
	let result: Partial<Pick<BlockJson, (typeof styleFields)[number]>> | null =
		null;
	for (const field of styleFields) {
		if (Object.hasOwn(blockJson, field)) {
			if (result === null) {
				result = {};
			}
			result[field] = blockJson[field];
		}
	}
	return result;
}

function getSassOptions(srcFolder: string) {
	return {
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
	} satisfies StringOptions<"async">;
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
								if (extname(fileNameWithExtension) === ".scss") {
									css = await compileStringAsync(
										css,
										getSassOptions(this.srcFolder),
									).then((result) => result.css);
								}
								let newFileNameWithExtension = fileNameWithExtension;
								let newMatch = filepath.replace(`${this.srcFolder}/`, "");
								if (isProduction) {
									const fileBuffer = readFileSync(filepath);
									const contentHash = crypto.createHash("shake256", {
										outputLength: 10,
									});
									contentHash.update(fileBuffer);
									newFileNameWithExtension = `${fileNameWithExtension.split(".")[0]}.${contentHash.digest("hex")}.css`;
									newMatch = newMatch.replace(
										fileNameWithExtension,
										newFileNameWithExtension,
									);
								}
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
				console.log({ assets: compilation.assets });
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
												return asset.startsWith(`${blockName}/${fileName}`);
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
