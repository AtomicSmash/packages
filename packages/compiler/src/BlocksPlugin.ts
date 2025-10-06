import type { BlockJson } from "./utils.js";
import type { Compiler, WebpackPluginInstance } from "webpack";
import { readFile, writeFile, unlink as deleteFile } from "node:fs/promises";
import { extname, resolve, relative, sep as pathSeparator } from "node:path";
import glob from "fast-glob";
import json2php from "json2php";
import { getBlockJsonScriptFields, getBlockJsonStyleFields } from "./utils.js";

const printer = json2php.make({ linebreak: "\n", indent: "\t" });

export class BlocksPlugin implements WebpackPluginInstance {
	pluginName = "BlocksPlugin";
	srcFolder: string;

	constructor(srcFolder: string) {
		this.srcFolder = srcFolder;
	}

	apply(compiler: Compiler) {
		const {
			webpack: { Compilation, sources },
		} = compiler;
		compiler.hooks.thisCompilation.tap(this.pluginName, (compilation) => {
			compilation.hooks.processAssets.tapPromise(
				{
					name: "CustomBlocksCSSHandler",
					stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
				},
				async (assets) => {
					const blockJsonFiles = Object.keys(assets).filter((asset) =>
						asset.endsWith("block.json"),
					);
					const PHPFiles = await glob([
						...blockJsonFiles.map((blockJsonPath) => {
							return `${resolve(
								`${this.srcFolder}${pathSeparator}${blockJsonPath}`,
								"..",
								`**${pathSeparator}*.php`,
							)}`;
						}),
					]);
					await Promise.all(
						PHPFiles.map(async (file) => {
							return readFile(file, "utf-8").then((data) => {
								compilation.emitAsset(
									relative(this.srcFolder, file),
									new sources.RawSource(data),
									{
										sourceFilename: file,
									},
								);
							});
						}),
					);
				},
			);
		});
		compiler.hooks.afterEmit.tapPromise(
			this.pluginName,
			async (compilation) => {
				const blockJsonFiles = Object.keys(compilation.assets).filter((asset) =>
					asset.endsWith("block.json"),
				);
				const blocksManifest: Record<string, BlockJson> = {};
				const wordpressAssetsFilePath = `${compilation.outputOptions.path}${pathSeparator}wordpress-assets-info.json`;
				const wordpressAssets = await readFile(
					wordpressAssetsFilePath,
					"utf-8",
				).then((data) => {
					return JSON.parse(data) as Record<string, unknown>;
				});
				for (const blockJsonFile of blockJsonFiles) {
					await readFile(
						`${compilation.outputOptions.path}${pathSeparator}${blockJsonFile}`,
						"utf-8",
					)
						.then((data) => {
							return JSON.parse(data) as BlockJson;
						})
						.then(async (json) => {
							const blockName = blockJsonFile.replace(
								`${pathSeparator}block.json`,
								"",
							);
							for (const fields of [
								getBlockJsonScriptFields(json),
								getBlockJsonStyleFields(json),
							]) {
								if (fields === null) {
									continue;
								}
								for (const [fieldName, value] of Object.entries(fields) as [
									(
										| "viewScript"
										| "script"
										| "editorScript"
										| "viewStyle"
										| "style"
										| "editorStyle"
									),
									string | string[],
								][]) {
									const values = [value].flat(1);
									const newValues = [];
									for (const srcFilePath of values) {
										if (!srcFilePath.startsWith("file:")) {
											newValues.push(srcFilePath);
											continue;
										}
										const fileName = srcFilePath
											.replace("file:./", "")
											.replace(extname(srcFilePath), "");
										const hashedAsset = Object.keys(compilation.assets).find(
											(asset) => {
												return (
													asset.startsWith(
														`${blockName}${pathSeparator}${fileName}`,
													) && !asset.endsWith(".php")
												);
											},
										);
										if (hashedAsset) {
											if (hashedAsset in wordpressAssets) {
												await writeFile(
													`${compilation.outputOptions.path}${pathSeparator}${hashedAsset.replace(
														extname(hashedAsset),
														".asset.php",
													)}`,
													`<?php return ${printer(
														wordpressAssets[hashedAsset],
													)};\n`,
													"utf-8",
												);
											}
											newValues.push(
												`file:./${hashedAsset.replace(`${blockName}${pathSeparator}`, "")}`,
											);
										} else {
											newValues.push(srcFilePath);
										}
									}
									json[fieldName] = newValues;
								}
							}
							return {
								blockName,
								newBlockJson: json,
							};
						})
						.then(async ({ blockName, newBlockJson }) => {
							await writeFile(
								`${compilation.outputOptions.path}${pathSeparator}${blockJsonFile}`,
								JSON.stringify(newBlockJson, undefined, 2),
								"utf-8",
							);
							blocksManifest[blockName] = newBlockJson;
						});
				}
				if (Object.keys(blocksManifest).length > 0) {
					const phpContent = `<?php
	// This file is generated. Do not modify it manually.
	return ${printer(blocksManifest)};
	`;
					await writeFile(
						`${compilation.outputOptions.path}${pathSeparator}blocks${pathSeparator}blocks-manifest.php`,
						phpContent,
					);
				}
				await writeFile(
					`${compilation.outputOptions.path}${pathSeparator}wordpress-assets-info.php`,
					`<?php return ${json2php(wordpressAssets)};\n`,
				);
				await deleteFile(wordpressAssetsFilePath);
			},
		);
	}
}
