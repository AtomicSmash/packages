import { resolve as resolvePath, sep as pathSeparator } from "node:path";
import { expect, test, describe } from "vitest";
import { testCommand, execute } from "../utils.js";
import {
	getRootFileJSEntryPoints,
	getBlockJsonFiles,
	getAllBlocksJSEntryPoints,
	getBlockJsonScriptFields,
	getBlockJsonStyleFields,
} from "./blocks.js";

describe("Blocks command works as intended", () => {
	test("Blocks command correctly displays help message", async () => {
		await expect(execute(`${testCommand} blocks --help`)).resolves
			.toMatchInlineSnapshot(`
			{
			  "error": null,
			  "stderr": "",
			  "stdout": "smash-cli blocks

			A command to generate WordPress blocks from a src folder.

			Options:
			      --in                      The directory where the WP blocks can be found. Relative to cwd.  [string] [required]
			      --out                     The directory where the WP blocks will be output. Relative to cwd.  [string] [required]
			      --tsConfigPath            The directory where the tsconfig file can be found. Relative to cwd. Defaults to the in folder.  [string]
			      --postcssConfigPath       The directory where the postcss config file can be found. Relative to cwd. Defaults to the in folder and then searches up the directory tree.  [string]
			      --watch                   Watch the blocks in folder for changes and compile.  [boolean] [default: false]
			      --excludeBlocks           A list of the folder names of blocks to exclude from compilation.  [array] [default: ["__TEMPLATE__"]]
			      --excludeRootFiles        A list of the root file names to exclude from compilation.  [array] [default: []]
			      --alwaysCompileRootFiles  By default, we won't compile root files if no blocks are found, this allows you to override that setting.  [boolean] [default: false]
			      --ignoreWarnings          If webpack has warnings, don't output them or change error code.  [boolean] [default: false]
			  -h, --help                    Show help  [boolean]
			  -v, --version                 Show version number  [boolean]

			Examples:
			  smash-cli blocks --watch --in src --out build --tsConfigPath tsconfig.json
			",
			}
		`);
	});
});

describe("getRootFileJSEntryPoints", () => {
	test("Return all root files if non excluded", async () => {
		await expect(
			getRootFileJSEntryPoints({
				srcFolder: resolvePath(
					import.meta.dirname,
					"..",
					"tests",
					"blocks",
					"rootFiles",
				),
				excludeRootFiles: [],
			}),
		).resolves.toEqual({
			rootFileJS: {
				import: resolvePath(
					import.meta.dirname,
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
					import.meta.dirname,
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
					import.meta.dirname,
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
					import.meta.dirname,
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
				srcFolder: resolvePath(
					import.meta.dirname,
					"..",
					"tests",
					"blocks",
					"rootFiles",
				),
				excludeRootFiles: ["rootFileJS.js", "rootFileJSX.jsx", "notAFile.ts"],
			}),
		).resolves.toEqual({
			rootFileTS: {
				import: resolvePath(
					import.meta.dirname,
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
					import.meta.dirname,
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
			resolvePath(import.meta.dirname, "..", "tests", "blocks", "blockFolders"),
			[],
		);
		expect(result).toHaveProperty("__TEMPLATE__");
		expect(result).toHaveProperty("full-block");
		expect(result).toHaveProperty("minimal-block");
		expect(result.__TEMPLATE__).toEqual({
			blockFolder: resolvePath(
				import.meta.dirname,
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
				import.meta.dirname,
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
				import.meta.dirname,
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
			resolvePath(import.meta.dirname, "..", "tests", "blocks", "blockFolders"),
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
			resolvePath(import.meta.dirname, "..", "tests", "blocks", "blockFolders"),
			["__TEMPLATE__"],
		);
		const entryPoints = getAllBlocksJSEntryPoints({
			srcFolder: resolvePath(
				import.meta.dirname,
				"..",
				"tests",
				"blocks",
				"blockFolders",
			),
			blocks,
		});
		expect(entryPoints).toEqual({
			fullBlockIndex: {
				filename: ["full-block", "index.js"].join(pathSeparator),
				import: resolvePath(
					import.meta.dirname,
					"..",
					"tests",
					"blocks",
					"blockFolders",
					"full-block",
					"index.tsx",
				),
			},
			fullBlockView: {
				filename: ["full-block", "view.js"].join(pathSeparator),
				import: resolvePath(
					import.meta.dirname,
					"..",
					"tests",
					"blocks",
					"blockFolders",
					"full-block",
					"view.ts",
				),
			},
			minimalBlockIndex: {
				filename: ["minimal-block", "index.js"].join(pathSeparator),
				import: resolvePath(
					import.meta.dirname,
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
		resolvePath(import.meta.dirname, "..", "tests", "blocks", "blockFolders"),
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
