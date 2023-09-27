const fs = require("fs");
const path = require("path");

/**
 * Search for `package.json`
 * @param {string} from - search `from` directory.
 * @returns {string|void} - path to package.json
 */
function findNearestPackageJson(from) {
	from = path.resolve(from);
	const parent = path.dirname(from);
	if (!from || parent === from) {
		return;
	}

	const pkg = path.join(from, "package.json");
	if (fs.existsSync(pkg)) {
		return pkg;
	}
	return findNearestPackageJson(parent);
}

/**
 * Load the nearest package.json
 * @param {string} cwd
 * @returns
 */
function loadPackage(cwd) {
	const pkgFile = findNearestPackageJson(cwd);
	if (!pkgFile) return;
	return JSON.parse(fs.readFileSync(pkgFile, "utf-8"));
}

function determinePackageNamesAndMethods(cwd = process.cwd()) {
	const packageImport = loadPackage(cwd) || {};
	const packageNames = Object.keys(packageImport.dependencies || {}).concat(
		Object.keys(packageImport.devDependencies || {}),
	);
	return { packageNames };
}

/** @type { import("@cspell/cspell-types").CSpellUserSettings } */
const config = {
	language: "en-GB",
	words: [
		...[
			...determinePackageNamesAndMethods().packageNames,
			"commitlint",
			"sass",
			"Userback",
		], // package and language names
		...["tsbuildinfo"], // filenames
		...["combobox", "spinbutton"], // accessible roles
		...["popover", "dialog"], // custom element names
		...["atomicsmash"], // company all lowercase
		...["unstringified", "formattable", "keyof", "nonnullable"], // coding actions
	],
	languageSettings: [
		{
			languageId: "*",
			locale: "en-GB",
		},
		{
			languageId: "css, less, scss, sass",
			locale: "en-US",
			dictionaries: ["css"],
		},
		{
			languageId: "javascript,typescript,javascriptreact,typescriptreact",
			locale: "en-GB",
			dictionaries: ["typescript"],
		},
		{
			languageId: "php",
			locale: "en-GB",
			dictionaries: ["php", "html"],
		},
		{
			languageId: "html,vue-html,javascriptreact,typescriptreact",
			locale: "en-GB",
			dictionaries: ["html"],
		},
	],
};
module.exports = config;
