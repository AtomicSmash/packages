import type { Compiler, Configuration } from "webpack";
import crypto from "node:crypto";
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { resolve as resolvePath } from "node:path";
import DependencyExtractionWebpackPlugin from "@wordpress/dependency-extraction-webpack-plugin";
import defaultConfig from "@wordpress/scripts/config/webpack.config.js";
import autoprefixer from "autoprefixer";
import CopyWebpackPlugin from "copy-webpack-plugin";
import cssnano from "cssnano";
import glob from "glob-promise";
import postcss, { AcceptedPlugin } from "postcss";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
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
	const excludeBlocks = interpretFlag(args, "--excludeBlocks", "list")
		.value ?? ["__TEMPLATE__"];
	const excludeRootFiles =
		interpretFlag(args, "--excludeRootFiles", "list").value ?? [];
	const shouldAlwaysCompileRootFiles = interpretFlag(
		args,
		"--alwaysCompileRootFiles",
		"boolean",
	).value;

	const postCSSPlugins: AcceptedPlugin[] = [autoprefixer];
	if (isProduction) {
		postCSSPlugins.push(cssnano({ preset: "default" }));
	}

	async function processCSSFiles(
		globMatches: Awaited<ReturnType<typeof glob.promise>>,
	) {
		for (const match of globMatches) {
			const fileName = match.split("/").pop();
			if (!fileName) {
				console.error(`Failed to get filename of ${match}`);
				continue;
			}
			const css = readFileSync(match);
			await postcss(postCSSPlugins)
				.process(css, {
					from: match,
					to: match.replace(srcFolder, distFolder),
				})
				.then((result) => {
					writeFileSync(match.replace(srcFolder, distFolder), result.css);
					if (result.map) {
						writeFileSync(
							`${match.replace(srcFolder, distFolder)}.map`,
							result.map.toString(),
						);
					}
				});
		}
	}

	async function fingerprintCSSFilesIfProduction() {
		if (!isProduction) {
			return;
		}
		return glob.promise(`${distFolder}/**/*.css`).then((matches) => {
			for (const match of matches) {
				const fileBuffer = readFileSync(match);
				const contentHash = crypto.createHash("shake256", {
					outputLength: 10,
				});
				contentHash.update(fileBuffer);
				const fileMatchArray = match.split("/");
				const newFileName = fileMatchArray
					.pop()
					?.replace(".css", `.${contentHash.digest("hex")}.css`);
				if (!newFileName || newFileName === "") {
					throw new Error("Error getting CSS file name.");
				}
				renameSync(match, `${fileMatchArray.join("/")}/${newFileName}`);
			}
			return;
		});
	}

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
					from: `**/block.json`,
					noErrorOnMissing: true,
				},
			],
		}),
		{
			apply: (compiler: Compiler) => {
				compiler.hooks.afterEmit.tapPromise(
					"Build CSS and copy to test area",
					async () => {
						await glob
							.promise(`${srcFolder}/**/*.css`)
							.then(processCSSFiles)
							.then(fingerprintCSSFilesIfProduction)
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
	const blockFolders = await readdir(`${srcFolder}`, {
		withFileTypes: true,
	})
		.then((srcDirFiles) => {
			return srcDirFiles
				.filter((dirent) => dirent.isDirectory())
				.map((dirent) => dirent.name);
		})
		.then((blockFolders) => {
			return blockFolders.filter((block) => !excludeBlocks.includes(block));
		});
	if (blockFolders.length === 0 && !shouldAlwaysCompileRootFiles) {
		// If there are no blocks, don't compile root files, unless the flag is present.
		console.log({ entryPoints: {} });
		return {};
	}
	for (const block of blockFolders) {
		const blockFiles = await readdir(`${srcFolder}/${block}`, {
			withFileTypes: true,
		}).then((blockDirFiles) => {
			return blockDirFiles
				.filter((file) => !file.isDirectory())
				.map((file) => file.name)
				.filter(
					(file) =>
						file.endsWith(".js") ||
						file.endsWith(".ts") ||
						file.endsWith(".jsx") ||
						file.endsWith(".tsx"),
				);
		});
		for (const blockJSFile of blockFiles) {
			let blockBonusScriptNumber = 1;
			const [filename] = blockJSFile.split(".");
			let entryName;
			if (filename === "index") {
				entryName = block;
			} else if (filename === "editor") {
				entryName = `${block}-editor`;
			} else if (filename === "view") {
				entryName = `${block}-view`;
			} else {
				entryName = `${block}-bonus${blockBonusScriptNumber}`;
				blockBonusScriptNumber++;
			}
			entryPoints[toCamelCase(entryName)] = {
				import: `${srcFolder}/${block}/${blockJSFile}`,
				filename: `${block}/${filename}${
					isProduction ? `.[contenthash]` : ""
				}.js`,
			};
		}
	}
	// eslint-disable-next-line no-console
	console.log({ entryPoints });
	return entryPoints;
}
