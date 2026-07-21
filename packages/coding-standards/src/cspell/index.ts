import type { CSpellUserSettings } from "@cspell/cspell-types";
import { existsSync, readFileSync } from "fs";
import { resolve, dirname, join } from "path";

/**
 * Search for `package.json`
 */
function findNearestPackageJson(from: string) {
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
 */
function loadPackageJson(cwd: string) {
	const pkgFile = findNearestPackageJson(cwd);
	if (!pkgFile) return null;
	const packageJson = JSON.parse(readFileSync(pkgFile, "utf-8")) as unknown;
	if (typeof packageJson === "object" && packageJson !== null) {
		return packageJson;
	}
	return null;
}

function determinePackageNamesAndMethods(cwd = process.cwd()) {
	const packageImport = loadPackageJson(cwd) ?? {};
	const packageNames = Object.keys(
		("dependencies" in packageImport && packageImport.dependencies) ?? {},
	).concat(
		Object.keys(
			("devDependencies" in packageImport && packageImport.devDependencies) ??
				{},
		),
	);
	return { packageNames };
}

/**
 * Search for `composer.json`
 */
function findNearestComposerJson(from: string) {
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
 */
function loadComposer(cwd: string) {
	const composerJsonFile = findNearestComposerJson(cwd);
	if (!composerJsonFile) return;
	const composerJson = JSON.parse(
		readFileSync(composerJsonFile, "utf-8"),
	) as unknown;
	if (typeof composerJson === "object" && composerJson !== null) {
		return composerJson;
	}
	return null;
}

function determineComposerPackageNamesAndMethods(cwd = process.cwd()) {
	const packageImport = loadComposer(cwd) ?? {};
	const packageNames = Object.keys(
		("require" in packageImport && packageImport.require) ?? {},
	)
		.concat(
			Object.keys(
				("require-dev" in packageImport && packageImport["require-dev"]) ?? {},
			),
		)
		.reduce<string[]>((allowedWords, packageName) => {
			return [...allowedWords, ...packageName.split("/")];
		}, []);
	return { packageNames };
}

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
} satisfies CSpellUserSettings;
export default config;
