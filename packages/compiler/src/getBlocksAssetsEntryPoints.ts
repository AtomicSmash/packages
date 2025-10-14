import type { BlockJson } from "./utils.js";
import type { EntryObject } from "webpack";
import { relative, resolve, extname } from "node:path";
import { tsImport } from "tsx/esm/api";
import { getBlockJsonStyleFields, getBlockJsonScriptFields } from "./utils.js";

export async function getBlocksAssetsEntryPoints(
	paths: string[],
	entryPoints: EntryObject,
	srcFolder: string,
) {
	const restOfPaths: string[] = [];
	for (const path of paths) {
		restOfPaths.push(path);
		if (!path.endsWith("block.json.ts")) {
			continue;
		}
		const blockJson = await tsImport(path, import.meta.url).then(
			(module: { default: BlockJson; blockJson: BlockJson }) =>
				module.blockJson,
		);
		const fields = {
			...getBlockJsonScriptFields(blockJson),
			...getBlockJsonStyleFields(blockJson),
		};
		if (fields) {
			for (const value of Object.values(fields).flat()) {
				if (!value.startsWith("file:")) {
					continue;
				}
				const fileLocation = resolve(path, "../", value.slice(5));
				const entryName = relative(srcFolder, fileLocation);
				const type = extname(fileLocation);
				let fileName = entryName;
				switch (type) {
					case ".ts":
						fileName = fileName.replace(".ts", ".[contenthash].js");
						break;
					case ".tsx":
						fileName = fileName.replace(".tsx", ".[contenthash].js");
						break;
					case ".js":
						fileName = fileName.replace(".js", ".[contenthash].js");
						break;
					case ".css":
						fileName = fileName.replace(".css", ".[contenthash].css");
						break;
					case ".scss":
						fileName = fileName.replace(".scss", ".[contenthash].css");
						break;
				}
				entryPoints[entryName] = {
					import: resolve(path, "../", value.slice(5)),
					filename: fileName,
				};
			}
		}
	}
	return { restOfPaths, entryPoints };
}
