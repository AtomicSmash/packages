import { resolve as resolvePath, dirname as pathDirname } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, describe } from "vitest";
import { testCommand, execute } from "../utils.js";
import {
	blocksHelpMessage,
	getRootFileJSEntryPoints,
	getBlockJsonFiles,
	getAllBlocksJSEntryPoints,
	getBlockJsonScriptFields,
	getBlockJsonStyleFields,
} from "./blocks.js";

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = pathDirname(__filename);

describe("Blocks command works as intended", () => {
	test("Blocks command correctly displays help message", async () => {
		await expect(execute(`${testCommand} blocks --help`)).resolves.toEqual({
			error: null,
			stdout: `${blocksHelpMessage}\n`,
			stderr: "",
		});
	});
});

describe("getRootFileJSEntryPoints", () => {
	test("Return all root files if non excluded", async () => {
		await expect(
			getRootFileJSEntryPoints({
				srcFolder: resolvePath(__dirname, "..", "tests", "blocks", "rootFiles"),
				excludeRootFiles: [],
			}),
		).resolves.toEqual({
			rootFileJS: {
				import: resolvePath(
					__dirname,
					"..",
					"tests",
					"blocks",
					"rootFiles",
					"rootFileJS.js",
				),
				filename: "rootFileJS.js",
			},
			rootFileJSX: {
				import: resolvePath(
					__dirname,
					"..",
					"tests",
					"blocks",
					"rootFiles",
					"rootFileJSX.jsx",
				),
				filename: "rootFileJSX.js",
			},
			rootFileTS: {
				import: resolvePath(
					__dirname,
					"..",
					"tests",
					"blocks",
					"rootFiles",
					"rootFileTS.ts",
				),
				filename: "rootFileTS.js",
			},
			rootFileTSX: {
				import: resolvePath(
					__dirname,
					"..",
					"tests",
					"blocks",
					"rootFiles",
					"rootFileTSX.tsx",
				),
				filename: "rootFileTSX.js",
			},
		});
	});
	test("Correctly exclude root files", async () => {
		await expect(
			getRootFileJSEntryPoints({
				srcFolder: resolvePath(__dirname, "..", "tests", "blocks", "rootFiles"),
				excludeRootFiles: ["rootFileJS.js", "rootFileJSX.jsx", "notAFile.ts"],
			}),
		).resolves.toEqual({
			rootFileTS: {
				import: resolvePath(
					__dirname,
					"..",
					"tests",
					"blocks",
					"rootFiles",
					"rootFileTS.ts",
				),
				filename: "rootFileTS.js",
			},
			rootFileTSX: {
				import: resolvePath(
					__dirname,
					"..",
					"tests",
					"blocks",
					"rootFiles",
					"rootFileTSX.tsx",
				),
				filename: "rootFileTSX.js",
			},
		});
	});
});

describe("getBlockJsonFiles", () => {
	test("Return all blocks", async () => {
		const result = await getBlockJsonFiles(
			resolvePath(__dirname, "..", "tests", "blocks", "blockFolders"),
			[],
		);
		expect(result).toHaveProperty("__TEMPLATE__");
		expect(result).toHaveProperty("full-block");
		expect(result).toHaveProperty("minimal-block");
		expect(result.__TEMPLATE__).toEqual({
			blockFolder: resolvePath(
				__dirname,
				"..",
				"tests",
				"blocks",
				"blockFolders",
				"__TEMPLATE__",
			),
			blockJson: {
				apiVersion: 3,
				name: "cloudcall-blocks/block-name",
				version: "",
				title: "Block title",
				category: "theme",
				description: "",
				textdomain: "cloudcall",
				keywords: [],
				editorScript: "file:./index.tsx",
				viewScript: "file:./view.ts",
				style: "file:./style.scss",
				editorStyle: "file:./editor-style.scss",
				render: "file:./render.php",
				attributes: {
					someAttribute: {
						type: "string",
					},
				},
				providesContext: {},
				usesContext: [],
				example: {},
				supports: {},
			},
		});
		expect(result["full-block"]).toEqual({
			blockFolder: resolvePath(
				__dirname,
				"..",
				"tests",
				"blocks",
				"blockFolders",
				"full-block",
			),
			blockJson: {
				apiVersion: 3,
				name: "cloudcall-blocks/full-block",
				version: "",
				title: "Full block",
				category: "theme",
				description:
					"This is a test block with all possible properties set to a value.",
				textdomain: "cloudcall",
				keywords: [],
				editorScript: "file:./index.tsx",
				viewScript: "file:./view.ts",
				style: "file:./style.scss",
				editorStyle: "file:./editor-style.scss",
				viewStyle: "file:./viewStyle.scss",
				render: "file:./render.php",
				allowedBlocks: [],
				ancestor: [],
				parent: [],
				styles: [],
				variations: [],
				attributes: {
					someAttribute: {
						type: "string",
					},
				},
				providesContext: {},
				usesContext: [],
				example: {},
				supports: {},
			},
		});
		expect(result["minimal-block"]).toEqual({
			blockFolder: resolvePath(
				__dirname,
				"..",
				"tests",
				"blocks",
				"blockFolders",
				"minimal-block",
			),
			blockJson: {
				apiVersion: 3,
				name: "cloudcall-blocks/minimal-block",
				title: "Minimal block",
				category: "theme",
				description: "This is a block with a minimal amount of properties set.",
				textdomain: "cloudcall",
				editorScript: "file:./index.tsx",
				attributes: {
					someAttribute: {
						type: "string",
					},
				},
				supports: {},
			},
		});
	});
	test("Exclude blocks", async () => {
		const result = await getBlockJsonFiles(
			resolvePath(__dirname, "..", "tests", "blocks", "blockFolders"),
			// Note: test-block doesn't exist in blocks folder, however this shouldn't throw an error, it should just ignore it.
			["__TEMPLATE__", "full-block", "test-block"],
		);
		expect(result).not.toHaveProperty("__TEMPLATE__");
		expect(result).not.toHaveProperty("full-block");
		expect(result).toHaveProperty("minimal-block");
	});
});

// Uses getBlockJsonFiles output, so fix failures with those tests before this test.
describe("getAllBlocksJSEntryPoints", () => {
	test("Return correct entry points for test blocks", async () => {
		const blocks = await getBlockJsonFiles(
			resolvePath(__dirname, "..", "tests", "blocks", "blockFolders"),
			["__TEMPLATE__"],
		);
		const entryPoints = getAllBlocksJSEntryPoints({
			srcFolder: resolvePath(
				__dirname,
				"..",
				"tests",
				"blocks",
				"blockFolders",
			),
			blocks,
		});
		expect(entryPoints).toEqual({
			fullBlockIndex: {
				filename: "full-block/index.js",
				import: resolvePath(
					__dirname,
					"..",
					"tests",
					"blocks",
					"blockFolders",
					"full-block",
					"index.tsx",
				),
			},
			fullBlockView: {
				filename: "full-block/view.js",
				import: resolvePath(
					__dirname,
					"..",
					"tests",
					"blocks",
					"blockFolders",
					"full-block",
					"view.ts",
				),
			},
			minimalBlockIndex: {
				filename: "minimal-block/index.js",
				import: resolvePath(
					__dirname,
					"..",
					"tests",
					"blocks",
					"blockFolders",
					"minimal-block",
					"index.tsx",
				),
			},
		});
	});
});

test("getBlockJsonScriptFields and getBlockJsonStyleFields", async () => {
	const result = await getBlockJsonFiles(
		resolvePath(__dirname, "..", "tests", "blocks", "blockFolders"),
		// Note: test-block doesn't exist in blocks folder, however this shouldn't throw an error, it should just ignore it.
		["__TEMPLATE__", "minimal-block", "test-block"],
	);
	expect(result).toHaveProperty("full-block");
	expect(getBlockJsonScriptFields(result["full-block"]!.blockJson)).toEqual({
		viewScript: "file:./view.ts",
		editorScript: "file:./index.tsx",
	});
	expect(getBlockJsonStyleFields(result["full-block"]!.blockJson)).toEqual({
		style: "file:./style.scss",
		editorStyle: "file:./editor-style.scss",
		viewStyle: "file:./viewStyle.scss",
	});
});
