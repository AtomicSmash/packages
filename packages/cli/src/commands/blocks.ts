import type { Compiler, Configuration } from "webpack";
import crypto from "node:crypto";
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { resolve as resolvePath } from "node:path";
import DependencyExtractionWebpackPlugin from "@wordpress/dependency-extraction-webpack-plugin";
import defaultConfig from "@wordpress/scripts/config/webpack.config.js";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import glob from "glob-promise";
import postcss, { AcceptedPlugin } from "postcss";
import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import webpack from "webpack";
import { hasHelpFlag, toCamelCase } from "../utils.js";

const isProduction = process.env.NODE_ENV === "production";

export const blocksHelpMessage = `
  Atomic Smash CLI - Blocks command.

  A command to generate WordPress blocks from a src folder.

  Options:
    --in         The directory where the WP blocks can be found.
    --out        The directory where the WP blocks will be output.
		--watch      Watch the blocks in folder for changes and compile.

  Example usage:
    $ smash-cli blocks --watch --in src --out build
`;

export default function blocks(args: string[]) {
	if (hasHelpFlag(args)) {
		console.log(blocksHelpMessage);
		return;
	}
	const inFlag = args[args.findIndex((arg) => arg === "--in") + 1];
	if (!inFlag || inFlag.startsWith("--")) {
		throw new Error("You need to provide a value for the --in flag.");
	}
	const outFlag = args[args.findIndex((arg) => arg === "--out") + 1];
	if (!outFlag || outFlag.startsWith("--")) {
		throw new Error("You need to provide a value for the --out flag.");
	}
	const srcFolder = resolvePath(inFlag);
	const distFolder = resolvePath(outFlag);

	const compiler = webpack({
		...(defaultConfig as Configuration),
		entry: () => getAllBlocksJSEntryPoints(srcFolder),
		plugins: [
			...((defaultConfig as Configuration).plugins?.filter(
				(plugin) =>
					plugin?.constructor.name !== "DependencyExtractionWebpackPlugin",
			) ?? []),
			new DependencyExtractionWebpackPlugin({
				combineAssets: true,
			}),
			{
				apply: (compiler: Compiler) => {
					compiler.hooks.afterEmit.tapPromise(
						"Build CSS and copy to test area",
						async () => {
							const plugins: AcceptedPlugin[] = [autoprefixer];
							if (isProduction) {
								plugins.push(cssnano({ preset: "default" }));
							}
							await glob
								.promise(`${srcFolder}/blocks/**/*.css`)
								.then(async (matches) => {
									for (const match of matches) {
										const fileName = match.split("/").pop();
										if (!fileName) {
											console.error(`Failed to get filename of ${match}`);
											continue;
										}
										const css = readFileSync(match);
										await postcss(plugins)
											.process(css, {
												from: match,
												to: match.replace(srcFolder, distFolder),
											})
											.then((result) => {
												writeFileSync(
													match.replace(srcFolder, distFolder),
													result.css,
												);
												if (result.map) {
													writeFileSync(
														`${match.replace(srcFolder, distFolder)}.map`,
														result.map.toString(),
													);
												}
											});
									}
								})
								.then(async () => {
									if (!isProduction) {
										return;
									}
									return glob
										.promise(`${distFolder}/**/*.css`)
										.then((matches) => {
											for (const match of matches) {
												const fileBuffer = readFileSync(match);
												const contentHash = crypto.createHash("shake256", {
													outputLength: 10,
												});
												contentHash.update(fileBuffer);
												const fileMatchArray = match.split("/");
												const newFileName = fileMatchArray
													.pop()
													?.replace(
														".css",
														`.${contentHash.digest("hex")}.css`,
													);
												if (!newFileName || newFileName === "") {
													throw new Error("Error getting CSS file name.");
												}
												renameSync(
													match,
													`${fileMatchArray.join("/")}/${newFileName}`,
												);
											}
											return;
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
		],
		output: {
			path: distFolder,
			clean: true,
		},
		resolve: {
			plugins: [new TsconfigPathsPlugin()],
			extensions: [".ts", ".js", ".tsx", ".jsx"],
		},
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
					console.error(error);
					process.exitCode = 1;
					watching.close((closeError) => {
						console.error(closeError);
					});
				}
				if (stats?.hasErrors()) {
					for (const statError of stats.compilation.errors) {
						console.error(statError.message);
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
			}
			if (stats?.hasErrors()) {
				process.exitCode = 1;
			}

			compiler.close((closeError) => {
				if (closeError) {
					process.exitCode = 1;
				}
			});
		});
	}
}

async function getAllBlocksJSEntryPoints(srcFolder: string) {
	const entryPoints: Configuration["entry"] = {
		svgs: {
			import: `${srcFolder}/svgs.tsx`,
			filename: `svgs${isProduction ? `.[contenthash]` : ""}.js`,
		},
	};
	const blockFolders = await readdir(`${srcFolder}/blocks`, {
		withFileTypes: true,
	}).then((srcDirFiles) => {
		return srcDirFiles
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);
	});
	for (const block of blockFolders) {
		const blockFiles = await readdir(`${srcFolder}/blocks/${block}`, {
			withFileTypes: true,
		}).then((blockDirFiles) => {
			return blockDirFiles
				.filter((file) => !file.isDirectory())
				.map((file) => file.name)
				.filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
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
				import: `${srcFolder}/blocks/${block}/${blockJSFile}`,
				filename: `blocks/${block}/${filename}${
					isProduction ? `.[contenthash]` : ""
				}.js`,
			};
		}
	}
	// eslint-disable-next-line no-console
	console.log({ entryPoints });
	return entryPoints;
}
