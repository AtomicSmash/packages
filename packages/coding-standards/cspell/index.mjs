import { existsSync, readFileSync } from "fs";
import { resolve, dirname, join } from "path";

/**
 * Search for `package.json`
 * @param {string} from - search `from` directory.
 * @returns {string|void} - path to package.json
 */
function findNearestPackageJson(from) {
	from = resolve(from);
	const parent = dirname(from);
	if (!from || parent === from) {
		return;
	}

	const pkg = join(from, "package.json");
	if (existsSync(pkg)) {
		return pkg;
	}
	return findNearestPackageJson(parent);
}

/**
 * Load the nearest package.json
 * @param {string} cwd
 * @returns
 */
function loadPackageJson(cwd) {
	const pkgFile = findNearestPackageJson(cwd);
	if (!pkgFile) return;
	return JSON.parse(readFileSync(pkgFile, "utf-8"));
}

function determinePackageNamesAndMethods(cwd = process.cwd()) {
	const packageImport = loadPackageJson(cwd) || {};
	const packageNames = Object.keys(packageImport.dependencies || {}).concat(
		Object.keys(packageImport.devDependencies || {}),
	);
	return { packageNames };
}

/**
 * Search for `composer.json`
 * @param {string} from - search `from` directory.
 * @returns {string|void} - path to composer.json
 */
function findNearestComposerJson(from) {
	from = resolve(from);
	const parent = dirname(from);
	if (!from || parent === from) {
		return;
	}

	const composerJsonPath = join(from, "composer.json");
	if (existsSync(composerJsonPath)) {
		return composerJsonPath;
	}
	return findNearestComposerJson(parent);
}

/**
 * Load the nearest composer.json
 * @param {string} cwd
 * @returns
 */
function loadComposer(cwd) {
	const composerJsonFile = findNearestComposerJson(cwd);
	if (!composerJsonFile) return;
	return JSON.parse(readFileSync(composerJsonFile, "utf-8"));
}

function determineComposerPackageNamesAndMethods(cwd = process.cwd()) {
	const packageImport = loadComposer(cwd) || {};
	const packageNames = Object.keys(packageImport.require || {})
		.concat(Object.keys(packageImport["require-dev"] || {}))
		.reduce((allowedWords, packageName) => {
			return [...allowedWords, ...packageName.split("/")];
		}, []);
	return { packageNames };
}

/** @type { import("@cspell/cspell-types").CSpellUserSettings } */
const config = {
	language: "en-GB",
	words: [
		...[
			...determinePackageNamesAndMethods().packageNames,
			...determineComposerPackageNamesAndMethods().packageNames,
			"commitlint",
			"sass",
			"Userback",
			"phpcs",
			"phpcbf",
		], // package and language names
		...["tsbuildinfo", "svgs"], // filenames
		...["combobox", "spinbutton"], // accessible roles
		...["popover", "dialog"], // custom element names
		...["atomicsmash"], // company all lowercase
		...["unstringified", "formattable", "keyof", "nonnullable", "hidable"], // coding actions
		...[
			"alignfull",
			"alignleft",
			"alignright",
			"muplugin",
			"textdomain",
			"color", // For in theme.json
			"gfield", // Gravity Forms field class
			"phpmailer",
			"WPMDB", // WP Migrate DB
			"shortcode",
			"wp_kses",
			"sprintf", // For @wordpress/i18n
		], // WordPress stuff
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
export default config;
