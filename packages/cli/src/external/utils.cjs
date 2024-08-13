// @ts-nocheck
const { existsSync, realpathSync, readFileSync } = require("fs");
const path = require("path");
const chalk = require("chalk");
const { sync: glob } = require("fast-glob");
const { sync: readPkgUp } = require("read-pkg-up");

const { log } = console;
const moduleFields = new Set(["viewScriptModule", "viewModule"]);
const scriptFields = new Set(["viewScript", "script", "editorScript"]);

const { packageJson, path: pkgPath } = readPkgUp({
	cwd: realpathSync(process.cwd()),
});

const getArgsFromCLI = (excludePrefixes) => {
	const args = process.argv.slice(2);
	if (excludePrefixes) {
		return args.filter((arg) => {
			return !excludePrefixes.some((prefix) => arg.startsWith(prefix));
		});
	}
	return args;
};

const getPackagePath = () => pkgPath;

const hasPackageProp = (prop) =>
	// eslint-disable-next-line no-prototype-builtins
	packageJson && packageJson.hasOwnProperty(prop);

const fromProjectRoot = (fileName) =>
	path.join(path.dirname(getPackagePath()), fileName);

const hasProjectFile = (fileName) => existsSync(fromProjectRoot(fileName));

const fromConfigRoot = (fileName) =>
	path.join(path.dirname(__dirname), "config", fileName);

const hasBabelConfig = () =>
	hasProjectFile(".babelrc.js") ||
	hasProjectFile(".babelrc.json") ||
	hasProjectFile("babel.config.js") ||
	hasProjectFile("babel.config.json") ||
	hasProjectFile(".babelrc") ||
	hasPackageProp("babel");

const getArgFromCLI = (arg) => {
	for (const cliArg of getArgsFromCLI()) {
		const [name, value] = cliArg.split("=");
		if (name === arg) {
			return value || null;
		}
	}
};

const hasArgInCLI = (arg) => getArgFromCLI(arg) !== undefined;

const hasCssnanoConfig = () =>
	hasProjectFile(".cssnanorc") ||
	hasProjectFile(".cssnanorc.js") ||
	hasProjectFile(".cssnanorc.json") ||
	hasProjectFile(".cssnanorc.yaml") ||
	hasProjectFile(".cssnanorc.yml") ||
	hasProjectFile("cssnano.config.js") ||
	hasPackageProp("cssnano");

const hasPostCSSConfig = () =>
	hasProjectFile("postcss.config.js") ||
	hasProjectFile(".postcssrc") ||
	hasProjectFile(".postcssrc.json") ||
	hasProjectFile(".postcssrc.yaml") ||
	hasProjectFile(".postcssrc.yml") ||
	hasProjectFile(".postcssrc.js") ||
	hasPackageProp("postcss");
function getWordPressSrcDirectory() {
	return process.env.WP_SRC_DIRECTORY || "src";
}
function getBlockJsonModuleFields(blockJson) {
	let result = null;
	for (const field of moduleFields) {
		if (Object.hasOwn(blockJson, field)) {
			if (!result) {
				result = {};
			}
			result[field] = blockJson[field];
		}
	}
	return result;
}

/**
 * @param {Object} blockJson
 * @return {null|Record<string, unknown>} Fields
 */
function getBlockJsonScriptFields(blockJson) {
	let result = null;
	for (const field of scriptFields) {
		if (Object.hasOwn(blockJson, field)) {
			if (!result) {
				result = {};
			}
			result[field] = blockJson[field];
		}
	}
	return result;
}
function getWebpackEntryPoints(buildType) {
	/**
	 * @return {Object<string,string>} The list of entry points.
	 */
	return () => {
		// 1. Handles the legacy format for entry points when explicitly provided with the `process.env.WP_ENTRY`.
		if (process.env.WP_ENTRY) {
			return buildType === "script" ? JSON.parse(process.env.WP_ENTRY) : {};
		}

		// Continue only if the source directory exists.
		if (!hasProjectFile(getWordPressSrcDirectory())) {
			log(
				chalk.yellow(
					`Source directory "${getWordPressSrcDirectory()}" was not found. Please confirm there is a "src" directory in the root or the value passed to --webpack-src-dir is correct.`,
				),
			);
			return {};
		}

		// 2. Checks whether any block metadata files can be detected in the defined source directory.
		//    It scans all discovered files looking for JavaScript assets and converts them to entry points.
		const blockMetadataFiles = glob("**/block.json", {
			absolute: true,
			cwd: fromProjectRoot(getWordPressSrcDirectory()),
		});

		if (blockMetadataFiles.length > 0) {
			const srcDirectory = fromProjectRoot(
				getWordPressSrcDirectory() + path.sep,
			);

			const entryPoints = {};

			for (const blockMetadataFile of blockMetadataFiles) {
				const fileContents = readFileSync(blockMetadataFile);
				let parsedBlockJson;
				// wrapping in try/catch in case the file is malformed
				// this happens especially when new block.json files are added
				// at which point they are completely empty and therefore not valid JSON
				try {
					parsedBlockJson = JSON.parse(fileContents);
				} catch (error) {
					chalk.yellow(
						`Skipping "${blockMetadataFile.replace(
							fromProjectRoot(path.sep),
							"",
						)}" due to malformed JSON.`,
					);
				}

				const fields =
					buildType === "script"
						? getBlockJsonScriptFields(parsedBlockJson)
						: getBlockJsonModuleFields(parsedBlockJson);

				if (!fields) {
					continue;
				}

				for (const value of Object.values(fields).flat()) {
					if (!value.startsWith("file:")) {
						continue;
					}

					// Removes the `file:` prefix.
					const filepath = path.join(
						path.dirname(blockMetadataFile),
						value.replace("file:", ""),
					);

					// Takes the path without the file extension, and relative to the defined source directory.
					if (!filepath.startsWith(srcDirectory)) {
						log(
							chalk.yellow(
								`Skipping "${value.replace(
									"file:",
									"",
								)}" listed in "${blockMetadataFile.replace(
									fromProjectRoot(path.sep),
									"",
								)}". File is located outside of the "${getWordPressSrcDirectory()}" directory.`,
							),
						);
						return;
					}
					const entryName = filepath
						.replace(path.extname(filepath), "")
						.replace(srcDirectory, "")
						.replace(/\\/g, "/");

					// Detects the proper file extension used in the defined source directory.
					const [entryFilepath] = glob(`${entryName}.?(m)[jt]s?(x)`, {
						absolute: true,
						cwd: fromProjectRoot(getWordPressSrcDirectory()),
					});

					if (!entryFilepath) {
						log(
							chalk.yellow(
								`Skipping "${value.replace(
									"file:",
									"",
								)}" listed in "${blockMetadataFile.replace(
									fromProjectRoot(path.sep),
									"",
								)}". File does not exist in the "${getWordPressSrcDirectory()}" directory.`,
							),
						);
						return;
					}
					entryPoints[entryName] = entryFilepath;
				}
			}

			if (Object.keys(entryPoints).length > 0) {
				return entryPoints;
			}
		}

		// Don't do any further processing if this is a module build.
		// This only respects *module block.json fields.
		if (buildType === "module") {
			return {};
		}

		// 3. Checks whether a standard file name can be detected in the defined source directory,
		//  and converts the discovered file to entry point.
		const [entryFile] = glob("index.[jt]s?(x)", {
			absolute: true,
			cwd: fromProjectRoot(getWordPressSrcDirectory()),
		});

		if (!entryFile) {
			log(
				chalk.yellow(
					`No entry file discovered in the "${getWordPressSrcDirectory()}" directory.`,
				),
			);
			return {};
		}

		return {
			index: entryFile,
		};
	};
}
function getPhpFilePaths(props) {
	// Continue only if the source directory exists.
	if (!hasProjectFile(getWordPressSrcDirectory())) {
		return [];
	}

	// Checks whether any block metadata files can be detected in the defined source directory.
	const blockMetadataFiles = glob("**/block.json", {
		absolute: true,
		cwd: fromProjectRoot(getWordPressSrcDirectory()),
	});

	const srcDirectory = fromProjectRoot(getWordPressSrcDirectory() + path.sep);

	return blockMetadataFiles.flatMap((blockMetadataFile) => {
		const blockJson = JSON.parse(readFileSync(blockMetadataFile));

		const paths = [];
		for (const prop of props) {
			if (
				typeof blockJson?.[prop] !== "string" ||
				!blockJson[prop]?.startsWith("file:")
			) {
				continue;
			}

			// Removes the `file:` prefix.
			const filepath = path.join(
				path.dirname(blockMetadataFile),
				blockJson[prop].replace("file:", ""),
			);

			// Takes the path without the file extension, and relative to the defined source directory.
			if (!filepath.startsWith(srcDirectory)) {
				log(
					chalk.yellow(
						`Skipping "${blockJson[prop].replace(
							"file:",
							"",
						)}" listed in "${blockMetadataFile.replace(
							fromProjectRoot(path.sep),
							"",
						)}". File is located outside of the "${getWordPressSrcDirectory()}" directory.`,
					),
				);
				continue;
			}
			paths.push(filepath.replace(/\\/g, "/"));
		}
		return paths;
	});
}

const getAsBooleanFromENV = (name) => {
	const value = process.env[name];
	return !!value && value !== "false" && value !== "0";
};

module.exports = {
	fromConfigRoot,
	hasBabelConfig,
	hasArgInCLI,
	hasCssnanoConfig,
	hasPostCSSConfig,
	getWordPressSrcDirectory,
	getWebpackEntryPoints,
	getPhpFilePaths,
	getAsBooleanFromENV,
	getBlockJsonModuleFields,
	getBlockJsonScriptFields,
	fromProjectRoot,
};
